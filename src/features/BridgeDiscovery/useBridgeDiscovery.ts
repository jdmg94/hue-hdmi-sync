import { useApp } from "ink"
import { useNavigate } from "react-router"
import { useEffect, useState } from "react"
import HueSync, { HueBridgeNetworkDevice } from "hue-sync"

import { STATUS } from "../../types/Status"
import { useBridgeContext, setBridgeDevice } from "../../context/hueBridge"

const MIN_HUE_API_VERSION = 1.22

const useBridgeDiscovery = () => {
  const app = useApp()
  const navigate = useNavigate()
  const { dispatch } = useBridgeContext()
  const [status, updateStatus] = useState<STATUS>(STATUS.IDLE)
  const [bridges, setBridges] = useState<HueBridgeNetworkDevice[]>([])
  
  const submitSelection = async (bridge: HueBridgeNetworkDevice) => {
    const config = await HueSync.getInfo(bridge.internalipaddress)
    const currentAPIVersion = Number.parseFloat(config.apiversion)

    if (currentAPIVersion > MIN_HUE_API_VERSION) {
      dispatch(setBridgeDevice(bridge))
      navigate("/bridge-handshake")
    } else {
      updateStatus(STATUS.ERROR)
    }
  }

  useEffect(() => {
    async function yahoo() {
      try {
        updateStatus(STATUS.LOADING)
        const buffer = await HueSync.discover()

        if (buffer?.length === 1) {
          submitSelection(buffer[0])
        } else {
          setBridges(buffer)
          updateStatus(STATUS.DONE)
        }
      } catch (err) {
        updateStatus(STATUS.ERROR)        
      }
    }

    yahoo()!
  }, [])

  return {
    status,
    bridges,
    submitSelection,
  }
}

export default useBridgeDiscovery
