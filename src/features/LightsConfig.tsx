import React, { useState, useEffect } from "react"
import { Text } from "ink"

import { openVideoInput, getVideoSources } from "../services/cv"
import { getBridgeLights } from "../services/hue"
import { useBridgeContext, BridgeState } from "../context/hueBridge"

const LightsSetup = () => {
  const { state } = useBridgeContext()
  const { selectedEntertainmentGroup, credentials, bridgeNetworkDevice } =
    state as BridgeState

  useEffect(() => {
    // console.log("locations", selectedEntertainmentGroup.locations)

    openVideoInput()
    // getVideoSources().then(sources => {
    //   console.log('how many sources', sources.length, sources)
    // })

    // getBridgeLights(bridgeNetworkDevice.internalipaddress, credentials).then(
    // (lights) => {
    // console.log("the lights", lights)
    // }
    // )
  }, [])

  return <Text>Hello from lights setup</Text>
}

export default LightsSetup
