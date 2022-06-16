import { parentPort } from "worker_threads"
import {
  Rect,
  Size,
  VideoCapture,
  CAP_V4L,
  CAP_PROP_FPS,
  CAP_PROP_CONVERT_RGB,
  CAP_PROP_FRAME_WIDTH,
  CAP_PROP_FRAME_HEIGHT,
} from "opencv4nodejs"

import sleep from "./utils/sleep"

let videoInput = CAP_V4L
// const bgr2rgb = ({ y, x, w }) => [y, x, w].map(Math.floor)
const bgr2rgb = ({ y, x, w }) => [w, x, y].map(Math.floor)
const splitIntoLightstripGradientRegions = (size: Size): Rect[] => {
  const halfHeight = Math.floor(size.height / 2)
  const oneThirdWidth = Math.floor(size.width / 3)

  const firstQuarter = new Rect(0, halfHeight, oneThirdWidth, halfHeight)
  const secondQuarter = new Rect(0, 0, oneThirdWidth, halfHeight)

  const oneThird = new Rect(oneThirdWidth, 0, oneThirdWidth, halfHeight)

  const thirdQuarter = new Rect(oneThirdWidth * 2, 0, oneThirdWidth, halfHeight)
  const fourthQuarter = new Rect(
    oneThirdWidth * 2,
    halfHeight,
    oneThirdWidth,
    halfHeight
  )

  return [
    firstQuarter,
    secondQuarter,
    secondQuarter,
    oneThird,
    thirdQuarter,
    thirdQuarter,
    fourthQuarter,
  ]
}

const processVideo = async () => {
  try {
    let shouldRun = true
    const size = new Size(1280, 720)
    const capture = new VideoCapture(videoInput)

    sleep(1000)

    if (!capture) {
      parentPort.postMessage("error: Could not open video capture device")
      return
    }
    capture.set(CAP_PROP_FPS, 30)
    capture.set(CAP_PROP_CONVERT_RGB, 1)
    capture.set(CAP_PROP_FRAME_WIDTH, size.width)
    capture.set(CAP_PROP_FRAME_HEIGHT, size.height)

    parentPort.once("message", (message) => {
      if (message === "stop") {
        shouldRun = false
        capture.release()
      }
    })

    const regions = splitIntoLightstripGradientRegions(size)

    while (shouldRun) {
      const frame = capture.read()
      if (!frame?.empty) {
        


        const buffer = regions.map((rect) =>
          bgr2rgb(frame.getRegion(rect).mean())
        )

        parentPort.postMessage(JSON.stringify(buffer))
      }
    }
  } catch {
    parentPort.postMessage("error: Could not open video capture device")
  }
}

parentPort.once("message", (message) => {
  if (message === "start") {
    processVideo()
  }
})
