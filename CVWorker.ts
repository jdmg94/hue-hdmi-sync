import { parentPort } from "worker_threads"
import { spawn, ChildProcess } from "child_process"

interface Rect {
	x: number
	y: number
	width: number
	height: number
}

interface FrameRegions {
	regions: Rect[]
	indices: number[]
}

const splitFrame = (size: { width: number; height: number }): FrameRegions => {
	const halfHeight = Math.floor(size.height / 2)
	const oneThirdWidth = Math.floor(size.width / 3)

	const regions = [
		{ x: 0, y: halfHeight, width: oneThirdWidth, height: halfHeight },         // 0: bottom-left
		{ x: 0, y: 0, width: oneThirdWidth, height: halfHeight },                  // 1: top-left
		{ x: oneThirdWidth, y: 0, width: oneThirdWidth, height: halfHeight },      // 2: top-center
		{ x: oneThirdWidth * 2, y: 0, width: oneThirdWidth, height: halfHeight },  // 3: top-right
		{ x: oneThirdWidth * 2, y: halfHeight, width: oneThirdWidth, height: halfHeight }, // 4: bottom-right
	]

	// Map 7 lightstrip zones to 5 unique regions (some zones share a region)
	const indices = [0, 1, 1, 2, 3, 3, 4]

	return { regions, indices }
}

const WIDTH = 720
const HEIGHT = 480
const FRAME_SIZE = WIDTH * HEIGHT * 3 // 43,200 bytes at 160x90 RGB24

let shouldRun = false
let videoInput = process.platform === "darwin" ? "0" : "/dev/video0"
let ffmpegProcess: ChildProcess | null = null
let restartCount = 0
let restartTimer: ReturnType<typeof setTimeout> | null = null
let lastSentAt = 0
const FRAME_INTERVAL_MS = 1000 / 30 // throttle to max 30 color updates/sec

const { regions, indices } = splitFrame({ width: WIDTH, height: HEIGHT })

// Pre-allocate reusable buffers — no allocations in the hot path
const colorBuffer = new Uint32Array(21) // 7 zones × 3 channels
const uniqueColors = new Array<[number, number, number]>(regions.length)
const accumBuf = Buffer.allocUnsafe(FRAME_SIZE * 2)
let accumOffset = 0

function extractRegionAvg(frameData: Uint8Array, region: Rect): [number, number, number] {
	let rSum = 0, gSum = 0, bSum = 0
	const rowStride = WIDTH * 3
	const endY = region.y + region.height
	const endX = region.x + region.width

	for (let y = region.y; y < endY; y++) {
		const rowOffset = y * rowStride
		for (let x = region.x; x < endX; x++) {
			const offset = rowOffset + x * 3
			rSum += frameData[offset]
			gSum += frameData[offset + 1]
			bSum += frameData[offset + 2]
		}
	}

	const n = region.width * region.height
	return [Math.round(rSum / n), Math.round(gSum / n), Math.round(bSum / n)]
}

const processFrame = (frameData: Uint8Array): void => {
	for (let i = 0; i < regions.length; i++) {
		uniqueColors[i] = extractRegionAvg(frameData, regions[i])
	}

	let idx = 0
	for (const regionIdx of indices) {
		const [r, g, b] = uniqueColors[regionIdx]
		colorBuffer[idx++] = r
		colorBuffer[idx++] = g
		colorBuffer[idx++] = b
	}

	if (shouldRun) {
		// Structured clone of 84 bytes is negligible; avoids the per-frame slice() allocation.
		parentPort!.postMessage(colorBuffer)
	}
}

const stopCapture = () => {
	shouldRun = false
	if (restartTimer) {
		clearTimeout(restartTimer)
		restartTimer = null
	}
	if (ffmpegProcess) {
		ffmpegProcess.kill("SIGTERM")
		ffmpegProcess = null
	}
	accumOffset = 0
}

const startCapture = () => {
	if (ffmpegProcess) return

	shouldRun = true
	accumOffset = 0

	const isMac = process.platform === "darwin"

	// Let AVFoundation/V4L2 negotiate the pixel format — do not force uyvy422.
	// Downscale to 160x90 in FFmpeg so Node only sees ~648 KB/s instead of 373 MB/s.
	const ffmpegArgs = isMac
		? [
			"-loglevel",    "error",
			"-f",           "avfoundation",
			// Device supports 30.000030fps — must use 30, not the NTSC default 29.97.
			"-framerate",   "30",
			// Reduce probe buffer to 500k — sufficient for AVFoundation format detection.
			// The original 50M caused ~50 frames (~1.67s) of buffering before first output.
			"-probesize",   "500k",
			// Disable FFmpeg's default live-input buffering to minimise capture latency.
			"-fflags",      "nobuffer",
			"-flags",       "low_delay",
			"-avioflags",   "direct",
			"-i",           videoInput,
			"-vf",        `scale=${WIDTH}:${HEIGHT}`,
			// passthrough: emit frames exactly as the device delivers them —
			// no duplication, no dropping. Color analysis doesn't need a fixed rate.
			"-fps_mode",  "passthrough",
			"-f",         "rawvideo",
			"-pix_fmt",   "rgb24",
			"pipe:1",
		  ]
		: [
			"-loglevel",    "error",
			"-f",           "v4l2",
			"-input_format","mjpeg",
			"-framerate",   "30",
			"-probesize",   "500k",
			"-fflags",      "nobuffer",
			"-flags",       "low_delay",
			"-avioflags",   "direct",
			"-i",           videoInput,
			"-vf",          `scale=${WIDTH}:${HEIGHT}`,
			"-fps_mode",    "passthrough",
			"-f",           "rawvideo",
			"-pix_fmt",     "rgb24",
			"pipe:1",
		  ]

	ffmpegProcess = spawn("ffmpeg", ffmpegArgs, {
		stdio: ["ignore", "pipe", "pipe"],
	})

	// Schedule restart counter reset after 10s of stable operation
	const stabilityTimer = setTimeout(() => { restartCount = 0 }, 10_000)

	// Synchronous data handler — no async, no Sharp, no queuing.
	// Natural backpressure keeps the event loop free for parentPort messages.
	ffmpegProcess.stdout?.on("data", (chunk: Buffer) => {
		if (!shouldRun) return

		chunk.copy(accumBuf, accumOffset)
		accumOffset += chunk.length

		let readOffset = 0
		while (accumOffset - readOffset >= FRAME_SIZE) {
			const now = Date.now()
			if (now - lastSentAt >= FRAME_INTERVAL_MS) {
				const view = new Uint8Array(accumBuf.buffer, accumBuf.byteOffset + readOffset, FRAME_SIZE)
				processFrame(view)
				lastSentAt = now
			}
			readOffset += FRAME_SIZE // always drain — never let the pipe backlog
		}

		// Compact: shift unprocessed remainder to front of buffer
		if (readOffset > 0 && readOffset < accumOffset) {
			accumBuf.copyWithin(0, readOffset, accumOffset)
		}
		accumOffset -= readOffset
	})

	ffmpegProcess.stderr?.on("data", (data: Buffer) => {
		const msg = data.toString()
		if (msg.trim()) console.error("[CVWorker] ffmpeg:", msg.trimEnd())
	})

	ffmpegProcess.on("close", (code, signal) => {
		clearTimeout(stabilityTimer)
		ffmpegProcess = null
		accumOffset = 0

		// Intentional stop or we killed it — do not restart
		if (!shouldRun || signal === "SIGTERM" || signal === "SIGKILL") return

		if (restartCount >= 5) {
			parentPort!.postMessage({
				type: "status",
				state: "error",
				message: `FFmpeg failed after 5 restart attempts`,
			})
			shouldRun = false
			return
		}

		restartCount++
		console.error(`[CVWorker] ffmpeg exited (code=${code}), restarting in 2s (attempt ${restartCount}/5)`)
		restartTimer = setTimeout(startCapture, 2_000)
	})

	ffmpegProcess.on("error", (err) => {
		console.error("[CVWorker] ffmpeg spawn error:", err.message)
	})
}

parentPort?.on("message", (message) => {
	switch (message) {
		case "start":
			restartCount = 0
			startCapture()
			break

		case "stop":
			stopCapture()
			break

		case "reset":
			stopCapture()
			restartTimer = setTimeout(startCapture, 250)
			break

		default:
			try {
				const action = JSON.parse(message)
				if (action.type === "updateVideoInput") {
					videoInput = action.payload
					if (shouldRun) {
						stopCapture()
						restartTimer = setTimeout(startCapture, 250)
					}
				}
			} catch {}
	}
})
