import { useNavigate } from "react-router"
import { useEffect, useState } from "react"
import HueSync, { BridgeClientCredentials } from "hue-sync"

import {
  setBridge,
  setCredentials,
  useBridgeContext,
} from "../../context/hueBridge"

import {
  persistNewCredentials,
  getRegisteredCredentials,
} from "../../utils/credentialHelpers"
import { STATUS } from "../../types/Status"

export enum ExtraStates {
  NEEDS_CREDENTIALS,
}

type StatusType = STATUS | ExtraStates

const useBridgeHandShake = () => {
  const navigate = useNavigate()
  const [status, updateStatus] = useState<StatusType>(STATUS.IDLE)
  const {
    dispatch,
    state: { bridgeNetworkDevice },
  } = useBridgeContext()
  const submitCredentials = async (credentials: BridgeClientCredentials) => {
    await persistNewCredentials(credentials)
    const bridge = new HueSync({
      credentials,
      url: bridgeNetworkDevice.internalipaddress,
    })

    dispatch(setBridge(bridge))
    dispatch(setCredentials(credentials))
    navigate("/entertainment-areas")
  }

  useEffect(() => {
    async function retrieveCredentials() {
      const savedCredentials = await getRegisteredCredentials()

      if (!savedCredentials) {
        updateStatus(ExtraStates.NEEDS_CREDENTIALS)
      } else {
        submitCredentials(savedCredentials)
      }
    }

    retrieveCredentials()
  }, [])

  useEffect(() => {
    let timeout = null
    if (status === ExtraStates.NEEDS_CREDENTIALS) {
      const interval = setInterval(() => {
        HueSync.register(bridgeNetworkDevice.internalipaddress)
          .then((response) => {
            clearInterval(interval)
            submitCredentials(response)
          })
          .catch(() => {})
      }, 3000) // #NOTE: check every 3 seconds

      timeout = setTimeout(() => {
        clearInterval(interval)
        updateStatus(STATUS.ERROR)
      }, 30000) // #NOTE: timeout at 30 seconds
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout)
      }
    }
  }, [status])

  return {
    status,
  }
}

export default useBridgeHandShake
