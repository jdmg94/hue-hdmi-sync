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

export const hasVideoSources = async (): Promise<boolean> => {
  const videoSources = await getVideoSources()

  return videoSources.length > 0
}

export const openVideoInput = () => {
  try {
    const capture = new cv2.VideoCapture(cv2.CAP_ANY)
    capture.set(cv2.CAP_PROP_BUFFERSIZE, 0)

    const frame = capture.read()
    const channels = cv2.mean(frame)

    cv2.imwrite("./testimage.jpg", frame)

    capture.release()
  } catch (err) {
    console.log(err)
  }
}
