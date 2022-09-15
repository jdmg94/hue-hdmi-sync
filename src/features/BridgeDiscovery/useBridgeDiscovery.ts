import { useNavigate } from "react-router"
import { useEffect, useState } from "react"
import HueSync, { HueBridgeNetworkDevice } from "hue-sync"

import { STATUS } from "../../types/Status"
import { useBridgeContext, setBridgeDevice } from "../../context/hueBridge"

const useBridgeDiscovery = () => {
  const navigate = useNavigate()
  const { dispatch } = useBridgeContext()
  const [status, updateStatus] = useState<STATUS>(STATUS.IDLE)
  const [bridges, setBridges] = useState<HueBridgeNetworkDevice[]>([])

  const submitSelection = async (bridge: HueBridgeNetworkDevice) => {
    dispatch(setBridgeDevice(bridge))
    navigate("/bridge-handshake")
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
