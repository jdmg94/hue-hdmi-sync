import path from 'path'
import * as cv2 from "opencv4nodejs"

import sleep from '../utils/sleep'

export const openVideoInput = async () => {
  try {
    const capture = new cv2.VideoCapture(0)

    capture.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
    capture.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)

    await sleep(500)
    
    return capture    
  } catch {
    return null
  }
}

export const getVideoWriter = (fileName: string = './test.avi'): VideoWriter => {
  const videoSize = new cv2.Size(1280, 720)
  const format = cv2.VideoWriter.fourcc('XVID')
  const writer = new cv2.VideoWriter(fileName, format, 20, videoSize, true)
	
  return [writer, videoSize]
}