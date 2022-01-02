import Spinner from "ink-spinner"
import { Text, useInput, useApp } from "ink"
import React, { useRef, useEffect } from "react"

import { useBridgeContext, BridgeState } from "../context/hueBridge"
import { setGroupStreamingMode, startSSLChannel } from "../services/hue"

const LightsSetup = () => {
  const app = useApp()
  const sslChannel = useRef(null)
  const { state } = useBridgeContext()

  const { entertainmentGroup, credentials, bridgeNetworkDevice } =
    state as BridgeState

  useInput((input) => {
    if (input === "q") {
      app.exit()
    }
  })

  useEffect(() => {
    startSSLChannel(bridgeNetworkDevice.internalipaddress, credentials).then(
      (response) => {
        sslChannel.current = response
      }
    )

    return () => {
      sslChannel.current?.close()
      setGroupStreamingMode({
        credentials,
        active: false,
        groupId: Number(entertainmentGroup.name),
        url: bridgeNetworkDevice.internalipaddress,
      })
    }
  }, [])

  return (
    <Text>
      📺{" "}
      <Text color="green">
        <Spinner type="aesthetic" />
      </Text>{" "}
      💡 Streaming openCV video frame interpretation to light(s). Press Q to
      stop
    </Text>
  )
}

export default LightsSetup
