import { imwrite } from 'opencv4nodejs'
import { parentPort } from 'worker_threads'
import { openVideoInput, getVideoWriter } from './services/cv'

const processVideo = async () => {
  const capture = await  openVideoInput()
  let frameCount = 0;
  let frame = null;
  
  frame = capture.read();
  
  imwrite('test.jpg', frame);
  
  const [writer, size] = getVideoWriter('worker-video.avi')
  
  for(let i = 0; i < 60; i++) {
  	frame = capture.read()
  	
  	writer.write(frame.resize(size))
  }
  
  writer.release()
  capture.release()
}

processVideo()
