import { parentPort } from "worker_threads"
import {
  Size,
  VideoCapture,
  CAP_ANY,
  CAP_PROP_FPS,
  CAP_PROP_CONVERT_RGB,
  CAP_PROP_FRAME_WIDTH,
  CAP_PROP_FRAME_HEIGHT,
} from "@u4/opencv4nodejs"

import sleep from "./utils/sleep"
import { bgr2rgb } from "./utils/bgr2rgb"
import splitFrame from "./utils/splitFrame"

let shouldRun = true
const size = new Size(1280, 720)
const regions = splitFrame(size)

const stopVideo = () => {
  shouldRun = false
}

const processVideo = async () => {
  shouldRun = true
  const capture = new VideoCapture(CAP_ANY)

  await sleep(1000)

  if (!capture) {
    return parentPort!.postMessage("error: Could not open video capture device")
  }

  capture.set(CAP_PROP_FPS, 30)
  capture.set(CAP_PROP_CONVERT_RGB, 1)
  capture.set(CAP_PROP_FRAME_WIDTH, size.width)
  capture.set(CAP_PROP_FRAME_HEIGHT, size.height)

  const loop = setInterval(() => {
    if (!shouldRun) {
      capture.release()
      clearInterval(loop)
    }

    const frame = capture.read()

    if (!frame.empty) {
      const buffer = regions.flatMap((area) =>
        bgr2rgb(frame.getRegion(area).mean())
      )
      const value = new Uint32Array(buffer)

      parentPort!.postMessage(value, [value.buffer])
    }
  }, 1)
}

parentPort!.on("message", (message) => {
  if (message === "start") {
    processVideo()
  }

  if (message === "stop") {
    stopVideo()
  }

  if (message === "reset") {
    stopVideo()
    sleep(250).then(() => {
      processVideo()
    })
  }
})
