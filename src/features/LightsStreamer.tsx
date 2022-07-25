import Spinner from "ink-spinner"
import { Worker } from "worker_threads"
import React, { useEffect } from "react"
import { Text, useInput, useApp } from "ink"

import { useBridgeContext } from "../context/hueBridge"

const worker = new Worker("./build/CVWorker")

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
        try {
          bridge!.transition(
            JSON.parse(message) as unknown as Array<[number, number, number]>
          )
        } catch {} // ignore exit error
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
