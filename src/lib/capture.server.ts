import { exec } from "node:child_process"
import { promisify } from "node:util"

const execAsync = promisify(exec)

export type VideoInput = {
	id: string // numeric index (macOS) or /dev path (Linux)
	name: string // human-readable label
}

export async function listVideoInputs(): Promise<VideoInput[]> {
	if (process.platform === "darwin") return listMacOS()
	if (process.platform === "linux") return listLinux()
	return []
}

async function listMacOS(): Promise<VideoInput[]> {
	try {
		await execAsync('ffmpeg -f avfoundation -list_devices true -i ""')
	} catch (err) {
		const stderr = (err as { stderr: string }).stderr ?? ""
		const videoSection =
			stderr
				.split("AVFoundation video devices:")[1]
				?.split("AVFoundation audio devices:")[0] ?? ""
		return [...videoSection.matchAll(/\[(\d+)\]\s+(.+)/g)].map(([, id, name]) => ({
			id: id.trim(),
			name: name.trim(),
		}))
	}
	return []
}

async function listLinux(): Promise<VideoInput[]> {
	try {
		const { stdout } = await execAsync("v4l2-ctl --list-devices")
		const devices: VideoInput[] = []
		let currentName = ""
		for (const line of stdout.split("\n")) {
			if (!line.startsWith("\t") && line.trim()) {
				currentName = line
					.split("(")[0]
					.trim()
					.replace(/:$/, "")
			} else if (line.trim().startsWith("/dev/video")) {
				const path = line.trim()
				devices.push({ id: path, name: `${currentName} (${path})` })
			}
		}
		return devices
	} catch {
		try {
			const { stdout } = await execAsync("ls /dev/video* 2>/dev/null")
			return stdout
				.trim()
				.split("\n")
				.filter(Boolean)
				.map((path, i) => ({
					id: path,
					name: `Video Device ${i} (${path})`,
				}))
		} catch {
			return []
		}
	}
}
