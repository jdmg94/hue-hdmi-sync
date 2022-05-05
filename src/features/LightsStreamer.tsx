import Spinner from "ink-spinner"
import { Worker } from "worker_threads"
import React, { useEffect } from "react"
import { Text, useInput, useApp } from "ink"

import { useBridgeContext } from "../context/hueBridge"

const worker = new Worker("./build/CVWorker")

const LightsStreaming = () => {
  const app = useApp()
  const {
    state: { bridge, entertainmentGroup },
  } = useBridgeContext()

  useInput((input) => {
    if (input === "q") {
      worker.postMessage("stop")
      app.exit()
      process.exit(0)
    }
  })

  useEffect(() => {
    async function init() {
      await bridge.start(entertainmentGroup.id)

      worker.postMessage("start")
      worker.on("message", (message) => {
        const buffer = message.toString()
        try {
          const gradientData = JSON.parse(buffer)

          bridge.transition(gradientData)
        } catch {} // ignore exit error
      })
    }

    init()

    return () => {
      bridge
        .stop()
        .catch(() => {})
        .finally(() => {
          worker.terminate()
        })
    }
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
