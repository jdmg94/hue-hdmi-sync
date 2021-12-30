import { Text } from "ink"
import SelectInput from "ink-select-input"
import { useNavigate } from "react-router"
import React, { useEffect, useState } from "react"

import { LightGroup } from "../types/Hue"
import {
  useBridgeContext,
  SET_lIGHT_GROUP,
  SET_CREDENTIALS,
} from "../context/hueBridge"
import { getBridgeGroups, clearPersistedCredentials } from "../services/hue"

const BridgeConfig = () => {
  const navigate = useNavigate()
  const [lightGroups, setLightGroups] = useState<LightGroup[]>([])
  const {
    dispatch,
    state: { bridgeNetworkDevice, credentials },
  } = useBridgeContext()
  const submitEntertainmentGroup = (lightGroup: LightGroup) => {
    dispatch({ payload: lightGroup, type: SET_lIGHT_GROUP })
    navigate("/lights")
  }

  useEffect(() => {
    async function retrieveBridgeData() {
      const groupsNormalized = await getBridgeGroups(
        bridgeNetworkDevice.internalipaddress,
        credentials
      )

      const groupsArray: LightGroup[] = Object.values(groupsNormalized)

      if (groupsArray.length === 0) {
        // #NOTE: stale credentials
        await clearPersistedCredentials()
        dispatch({ payload: null, type: SET_CREDENTIALS })
        navigate("/bridge-setup")
      } else {
        const entertainmentGroups = groupsArray.filter(
          (item) => item.type === "Entertainment"
        )

        if (entertainmentGroups.length === 1) {
          submitEntertainmentGroup(entertainmentGroups[0])
        } else {
          setLightGroups(entertainmentGroups as LightGroup[])
        }
      }
    }

    retrieveBridgeData()
  }, [])

  return (
    <>
      <Text>
        Multiple entertainment groups found! Please select one of the following
        options:
      </Text>
      <SelectInput
        onSelect={(item) => submitEntertainmentGroup(item.value)}
        items={lightGroups.map((item) => ({
          value: item,
          key: item.name,
          label: item.name,
        }))}
      />
    </>
  )
}

export default BridgeConfig
