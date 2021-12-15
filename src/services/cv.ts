import { exec } from "child_process"
import * as cv2 from "opencv4nodejs"

export const getVideoSources = (): Promise<string[]> =>
  new Promise((resolve, reject) => {
    const sanitizeOutput = (output: string): string[] => {
      let buffer = null
      const result = []
      const videoDevicesRegex = /\/dev\/video\w/g

      while ((buffer = videoDevicesRegex.exec(output))) {
        result.push(buffer[0])
      }

      return result
    }

    exec("ls -ltrh /dev/video*", (err, stdout) => {
      if (err) {
        reject(err)
      } else {
        resolve(sanitizeOutput(stdout))
      }
    })
  })

export const openVideoInput = () => {
  try {
    const capture = new cv2.VideoCapture(cv2.CAP_ANY)

    const height = capture.get(cv2.CAP_PROP_FRAME_HEIGHT)
    const width = capture.get(cv2.CAP_PROP_FRAME_WIDTH)

    capture.set(cv2.CAP_PROP_BUFFERSIZE, 0)

    capture.release()

    console.log("video capture dimensions", height, width)
  } catch (error) {

    console.log("the fuck man?", error)
  }
}
