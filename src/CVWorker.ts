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

const bgr2rgb = ({ y, x, w }): number[] => [y, x, w]
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
  let shouldRun = true
  const size = new Size(1280, 720)
  const capture = new VideoCapture(CAP_V4L)

  sleep(1000)

  if (!capture) {
    parentPort.postMessage("error: Could not open video capture device")
    return
  }
  try {
    capture.set(CAP_PROP_FPS, 30)
    capture.set(CAP_PROP_CONVERT_RGB, 1)
    capture.set(CAP_PROP_FRAME_WIDTH, size.width)
    capture.set(CAP_PROP_FRAME_HEIGHT, size.height)
    const regions = splitIntoLightstripGradientRegions(size)

    parentPort.once("message", (message) => {
      if (message === "stop") {
        shouldRun = false
        capture.release()
      }
    })

    while (shouldRun) {
      const frame = capture.read()
      if (!frame?.empty) {
        const buffer = regions.flatMap((area) =>
          bgr2rgb(frame.getRegion(area).mean())
        )
        const value = new Uint32Array(buffer).buffer

        parentPort.postMessage({ value }, [value])
      }
    }
  } catch (error) {    
    parentPort.postMessage(error.message)
  }
}

parentPort.once("message", (message) => {
  if (message === "start") {
    processVideo()
  }
})
