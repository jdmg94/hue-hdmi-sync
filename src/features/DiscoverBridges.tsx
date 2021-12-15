import { Text } from "ink"
import Spinner from "ink-spinner"
import SelectInput from "ink-select-input"
import { useNavigate } from "react-router"
import React, { useEffect, useState } from "react"

import { StatusType, Status } from "../types/Status"
import { HueBridgeNetworkDevice } from "../types/Hue"
import { getBridgeConfig, discoverHueBridges } from "../services/hue"
import {
  useBridgeContext,
  SET_BRIDGE,
  SET_BRIDGE_CONFIG,
} from "../context/hueBridge"

const MIN_HUE_API_VERSION = 1.22

const DiscoverBridges = () => {
  const navigate = useNavigate()
  const { dispatch } = useBridgeContext()
  const [status, updateStatus] = useState<StatusType>(Status.IDLE)
  const [bridges, setBridges] = useState<HueBridgeNetworkDevice[]>([])
  const [errorMessage, setErrorMessage] = useState(
    "Something went wrong, please try again later"
  )
  const submitBridgeSelection = async (bridge: HueBridgeNetworkDevice) => {
    const config = await getBridgeConfig(bridge.internalipaddress)
    const currentAPIVersion = Number.parseFloat(config.apiversion)

    if (currentAPIVersion > MIN_HUE_API_VERSION) {
      dispatch({ payload: config, type: SET_BRIDGE_CONFIG })
      dispatch({ type: SET_BRIDGE, payload: bridge })
      navigate("/setup")
    } else {
      setErrorMessage(
        `Bridge API version too old (${currentAPIVersion}), the minimum API version is ${MIN_HUE_API_VERSION}, please update your bridge throught the Hue App`
      )
      updateStatus(Status.ERROR)
    }
  }

  useEffect(() => {
    async function yahoo() {
      try {
        updateStatus(Status.LOADING)
        const buffer = await discoverHueBridges()

        if (buffer?.length === 1) {
          submitBridgeSelection(buffer[0])
        } else {
          setBridges(buffer)
          updateStatus(Status.DONE)
        }
      } catch {
        updateStatus(Status.ERROR)
      }
    }

    yahoo()!
  }, [])

  if (status === Status.IDLE) {
    return <Text>Loading...</Text>
  }

  if (status === Status.LOADING) {
    return (
      <Text>
        <Text color="green">
          <Spinner type="dots" />
        </Text>
        <Text>{" Looking for Hue Bridge(s) on the local network"}</Text>
      </Text>
    )
  }

  if (status === Status.ERROR) {
    return <Text color="red">{errorMessage}</Text>
  }

  if (status === Status.DONE && bridges.length === 0) {
    return <Text color="yellow">No Hue Bridges Found!</Text>
  }

  return (
    <>
      <Text>Multiple Hue Bridges found! Select one below:</Text>
      <SelectInput<HueBridgeNetworkDevice>
        onSelect={(item) => submitBridgeSelection(item.value)}
        items={bridges.map((item) => ({
          value: item,
          label: `${item.id}@${item.internalipaddress}`,
        }))}
      />
    </>
  )
}

export default DiscoverBridges
