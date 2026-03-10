import { parentPort } from "worker_threads"
import { spawn, ChildProcess } from "child_process"
import sharp from "sharp"

import sleep from "./utils/sleep.js"
import splitFrame from "./utils/splitFrame.js"

let shouldRun = true
let ffmpegProcess: ChildProcess | null = null

const WIDTH = 1280
const HEIGHT = 720
const FPS = 30
const FRAME_SIZE = WIDTH * HEIGHT * 3 // RGB24 = 3 bytes per pixel

const { regions, indices } = splitFrame({ width: WIDTH, height: HEIGHT })

// Pre-allocate reusable buffer for color data (7 zones × 3 colors = 21 values)
const colorBuffer = new Uint32Array(21)
// Pre-allocate array to store unique region colors
const uniqueColors: number[][] = new Array(regions.length)

const stopVideo = () => {
  shouldRun = false
  if (ffmpegProcess) {
    ffmpegProcess.kill("SIGTERM")
    ffmpegProcess = null
  }
}

const processFrame = async (frameBuffer: Buffer) => {
  try {
    // Create Sharp instance from raw RGB buffer
    const image = sharp(frameBuffer, {
      raw: {
        width: WIDTH,
        height: HEIGHT,
        channels: 3,
      },
    })

    // Calculate mean color for each unique region (no duplicates)
    for (let i = 0; i < regions.length; i++) {
      const region = regions[i]

      // Extract region and calculate stats
      const regionImage = image.clone().extract({
        left: region.x,
        top: region.y,
        width: region.width,
        height: region.height,
      })

      const stats = await regionImage.stats()

      // Extract mean RGB values (Sharp returns stats per channel)
      const r = Math.round(stats.channels[0].mean)
      const g = Math.round(stats.channels[1].mean)
      const b = Math.round(stats.channels[2].mean)

      uniqueColors[i] = [r, g, b]
    }

    // Map unique colors to 7 lightstrip zones using indices
    let bufferIndex = 0
    for (const idx of indices) {
      const [r, g, b] = uniqueColors[idx]
      colorBuffer[bufferIndex++] = r
      colorBuffer[bufferIndex++] = g
      colorBuffer[bufferIndex++] = b
    }

    // Transfer buffer ownership for zero-copy message passing
    const transferBuffer = colorBuffer.slice()
    parentPort!.postMessage(transferBuffer, [transferBuffer.buffer])
  } catch (error) {
    console.error("Error processing frame:", error)
  }
}

const processVideo = async () => {
  shouldRun = true

  await sleep(1000)

  // Spawn FFmpeg to capture video from /dev/video0
  ffmpegProcess = spawn("ffmpeg", [
    // "-f", "v4l2",                    // Video4Linux2 input
    "-vcodec", "mjpeg",        // MJPEG from capture card
    "-video_size", `${WIDTH}x${HEIGHT}`,
    "-framerate", FPS.toString(),
    "-i", "/dev/video0",             // HDMI capture device
    "-f", "rawvideo",                // Output raw video
    "-pix_fmt", "rgb24",             // RGB format (no BGR conversion needed)
    "-vf", `fps=${FPS}`,             // Ensure consistent framerate
    "pipe:1",                        // Output to stdout
  ], {
    stdio: ["ignore", "pipe", "pipe"],
  })

  let frameBuffer = Buffer.alloc(0)

  // Process stdout data from FFmpeg
  ffmpegProcess.stdout?.on("data", async (chunk: Buffer) => {
    if (!shouldRun) return

    // Append new data to buffer
    frameBuffer = Buffer.concat([frameBuffer, chunk])

    // Process complete frames
    while (frameBuffer.length >= FRAME_SIZE) {
      const frame = frameBuffer.subarray(0, FRAME_SIZE)
      frameBuffer = frameBuffer.subarray(FRAME_SIZE)

      // Process frame asynchronously (don't block receiving more frames)
      processFrame(frame)
    }
  })

  // Handle FFmpeg errors
  ffmpegProcess.stderr?.on("data", (data: Buffer) => {
    // FFmpeg outputs a lot of info to stderr, only log if it looks like an error
    const message = data.toString()
    if (message.includes("error") || message.includes("Error")) {
      console.error("FFmpeg error:", message)
    }
  })

  ffmpegProcess.on("close", (code) => {
    if (code !== 0 && shouldRun) {
      console.error(`FFmpeg process exited with code ${code}`)
    }
  })

  ffmpegProcess.on("error", (error) => {
    console.error("FFmpeg spawn error:", error)
  })
}

parentPort?.on("message", (message) => {
  switch (message) {
    case "start":
      processVideo()
      break

    case "stop":
      stopVideo()
      break

    case "reset":
      stopVideo()
      sleep(250).then(() => {
        processVideo()
      })
      break

    default: // do nothing
  }
})
