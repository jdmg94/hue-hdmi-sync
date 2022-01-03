import Spinner from "ink-spinner"
import { Text, Newline, render } from "ink"
import React, { useEffect } from "react"
import { Worker } from "worker_threads"

import useTimeout from "../utils/useTimeout"
import { openVideoInput, getVideoWriter } from "../services/cv"

const Test = () => {
  const timeout = useTimeout(3)

  useEffect(() => {
    console.clear()
    const worker = new Worker('./build/CVWorker')
	
	worker.on('message', (message) => {
	})    
    
    return () => {
      worker.terminate()
    }
  }, [])

  return (
    <>
      <Newline />
      <Text>
        <Text color="green">
          <Spinner type="bouncingBall" />
        </Text>
        <Text>This should probably be replaced with unit tests ({timeout}s)</Text>
      </Text>
    </>
  )
}

render(<Test />)
