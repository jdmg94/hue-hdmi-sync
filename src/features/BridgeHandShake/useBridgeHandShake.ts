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
type BridgeHandShakeArgs = {
  poll?: number
  timeout?: number
}

const handShakeDefaults = {
  poll: 3000,
  timeout: 30000,
}

const useBridgeHandShake = ({ poll, timeout}: BridgeHandShakeArgs = handShakeDefaults) => {
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
    let timeoutRef = null
    if (status === ExtraStates.NEEDS_CREDENTIALS) {
      const interval = setInterval(() => {
        HueSync.register(bridgeNetworkDevice.internalipaddress)
          .then((response) => {
            clearInterval(interval)
            submitCredentials(response)
          })
          .catch(() => {})
      }, poll)

      timeoutRef = setTimeout(() => {
        clearInterval(interval)
        updateStatus(STATUS.ERROR)
      }, timeout)
    }

    return () => {
      if (timeoutRef) {
        clearTimeout(timeoutRef)
      }
    }
  }, [status])

  return {
    status,
  }
}

export default useBridgeHandShake
