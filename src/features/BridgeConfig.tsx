import { Text } from "ink"
import Spinner from "ink-spinner"
import { useNavigate } from "react-router"
import React, { useEffect, useState } from "react"

import { BridgeClientCredentials } from "../types/Hue"
import { Status, StatusType } from "../types/Status"
import { useBridgeContext, SET_CREDENTIALS } from "../context/hueBridge"
import {
  getRegisteredCredentials,
  requestAppRegisterOnBridge,
  persistNewCredentials,
} from "../services/hue"

const isChristmas = () => {
  const today = new Date()

  return today.getMonth() === 11 && today.getDate() === 25
}

const BridgeConfig = () => {
  const {
    dispatch,
    state: { bridgeNetworkDevice },
  } = useBridgeContext()
  const navigate = useNavigate()
  const [status, updateStatus] = useState<StatusType>(Status.IDLE)
  const [needsCredentials, updateCredentialNeeds] = useState<boolean>(false)
  const submitCredentials = (credentials: BridgeClientCredentials) => {
    dispatch({ payload: credentials, type: SET_CREDENTIALS })
    navigate("/light-groups")
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
        requestAppRegisterOnBridge(bridgeNetworkDevice.internalipaddress)
          .then(async (response) => {
            clearInterval(interval)
            await persistNewCredentials(response)
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
