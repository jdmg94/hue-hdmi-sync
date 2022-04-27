import {
  Size,
  VideoWriter,
  VideoCapture,
  CAP_ANY,
  CAP_PROP_FRAME_WIDTH,
  CAP_PROP_FRAME_HEIGHT,
} from "opencv4nodejs"

import sleep from "../utils/sleep"
// cat /sys/class/video4linux/video0/name
export const openVideoInput = async (): Promise<
  [VideoCapture, Size] | Array<{}>
> => {
  try {
    const videoSize = new Size(1280, 720)
    // #NOTE: CAP_ANY doesn't work all the time 
    // sometimes manual override 1 fixes the issue
    // const capture = new VideoCapture(1)
     const capture = new VideoCapture(CAP_ANY)
    

    capture.set(CAP_PROP_FRAME_WIDTH, videoSize.width)
    capture.set(CAP_PROP_FRAME_HEIGHT, videoSize.height)

    await sleep(1000)

    return [capture, videoSize]
  } catch {
    return []
  }
}

export const getVideoWriter = (
  fileName: string = "./test.avi",
  videoSize: Size = new Size(1280, 720)
): VideoWriter => {
  const format = VideoWriter.fourcc("MJPG")
  const writer = new VideoWriter(fileName, format, 20, videoSize, true)

  return writer
}
