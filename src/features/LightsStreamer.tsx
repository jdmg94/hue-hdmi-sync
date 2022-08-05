import Spinner from "ink-spinner"
import { Worker } from "worker_threads"
import React, { useEffect } from "react"
import { Text, useInput, useApp } from "ink"

import { useBridgeContext } from "../context/hueBridge"

const worker = new Worker("./build/CVWorker")

const bufferToRGB = (data: { value: Buffer }) => {
  let counter = 0
  let chunk: Array<number> = []
  const buffer = new Uint32Array(data.value)
  const result: Array<[number, number, number]> = []

  for (let value of buffer) {
    counter++
    chunk.push(value)

    if (counter === 3) {
      result.push(chunk as [number, number, number])
      chunk = []
      counter = 0
    }
  }
  return result
}

const LightsStreaming = () => {
  const app = useApp()
  const { state } = useBridgeContext()
  const { bridge, entertainmentGroup } = state!

  useInput((input) => {
    if (input === "q") {
      worker.postMessage("stop")
      bridge!.stop()
      app.exit()
      process.exit(0)
    }
  })

  useEffect(() => {
    async function init() {
      await bridge!.start(entertainmentGroup!)

      worker.postMessage("start")
      worker.on("message", (message) => {
        const colorData = bufferToRGB(message)

        bridge!.transition(colorData)
      })
    }

    init()
  }, [])

  return (
    <Text>
      {" 📺 "}
      <Text color="green">
        <Spinner type="aesthetic" />
      </Text>
      {
        " 💡 Streaming openCV video frame interpretation to light(s). Press Q to stop"
      }
    </Text>
  )
}

export default LightsStreaming
