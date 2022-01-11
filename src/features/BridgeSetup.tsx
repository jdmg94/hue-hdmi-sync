import { Text } from "ink"
import Spinner from "ink-spinner"
import { useNavigate } from "react-router"
import React, { useEffect, useState } from "react"

import HueBridge, { 
  BridgeClientCredentials,
} from "hue-sync"

import { Status, StatusType } from "../types/Status"
import {
  persistNewCredentials,
  getRegisteredCredentials
} from "../utils/credentialHelpers"
import {
  useBridgeContext,
  SET_CREDENTIALS,
  SET_BRIDGE_DEVICE,
} from "../context/hueBridge"

const isChristmas = () => {
  const today = new Date()

  return today.getMonth() === 11 && today.getDate() === 25
}

const BridgeConfig = () => {
  const navigate = useNavigate()
  const [status, updateStatus] = useState<StatusType>(Status.IDLE)
  const [needsCredentials, updateCredentialNeeds] = useState<boolean>(false)
  const {
    dispatch,
    state: { bridgeNetworkDevice },
  } = useBridgeContext()
  const submitCredentials = async (credentials: BridgeClientCredentials) => {
    await persistNewCredentials(credentials)
    const bridge = new HueBridge({
      credentials,
      url: bridgeNetworkDevice.internalipaddress,
    })

    dispatch({ payload: bridge, type: SET_BRIDGE_DEVICE })
    dispatch({ payload: credentials, type: SET_CREDENTIALS })
    navigate("/entertainment-groups")
  }

  useEffect(() => {
    async function retrieveCredentials() {
      const savedCredentials = await getRegisteredCredentials()

      if (!savedCredentials) {
        updateCredentialNeeds(true)
      } else {
        submitCredentials(savedCredentials)
      }
    }

    retrieveCredentials()
  }, [])

  useEffect(() => {
    if (needsCredentials) {
      const interval = setInterval(() => {
        HueBridge.register(bridgeNetworkDevice.ip)
          .then((response) => {
            clearInterval(interval)
            submitCredentials(response)
          })
          .catch(() => {})
      }, 3000) // #NOTE: check every 3 seconds

      setTimeout(() => {
        clearInterval(interval)
        updateCredentialNeeds(false)
        updateStatus(Status.ERROR)
      }, 30000) // #NOTE: timeout at 30 seconds
    }
  }, [needsCredentials])

  if (status === Status.ERROR)
    return (
      <Text color="red">{"link button not pressed, please try again"}</Text>
    )

  return (
    <Text>
      <Text color="green">
        <Spinner type={isChristmas() ? "christmas" : "dots"} />
      </Text>
      <Text> </Text>
      <Text>
        {!needsCredentials ? "Checking " : "Push the link button on Hue Bridge"}
      </Text>
    </Text>
  )
}

export default BridgeConfig
