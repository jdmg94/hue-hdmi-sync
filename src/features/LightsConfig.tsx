import { Text } from "ink"
import React, { useState, useEffect } from "react"

import { useBridgeContext, BridgeState } from "../context/hueBridge"
import { getBridgeLights, setGroupStreamingMode } from "../services/hue"

const LightsSetup = () => {
  const { state } = useBridgeContext()
  const [lights, setLights] = useState(null)
  const { entertainmentGroup, credentials, bridgeNetworkDevice } =
    state as BridgeState

  useEffect(() => {
    getBridgeLights(bridgeNetworkDevice.internalipaddress, credentials).then(
      (lights) => {
        const lightsSelection = entertainmentGroup.lights.map(
          (light) => ({ id: light, ...lights[light] })
        )

        setLights(lightsSelection)
      }
    )
  }, [])

  return <Text>Hello from lights setup</Text>
}

export default LightsSetup
