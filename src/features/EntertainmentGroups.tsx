import { Text } from "ink"
import SelectInput from "ink-select-input"
import { useNavigate } from "react-router"
import React, { useEffect, useState } from "react"

import {
  useBridgeContext,
  SET_lIGHT_GROUP,
  SET_CREDENTIALS,
} from "../context/hueBridge"
import {
  getBridgeGroups,
  setGroupStreamingMode,
  clearPersistedCredentials,
} from "../services/hue"
import { LightGroup } from "../types/Hue"

const EntertainmentGroups = () => {
  const navigate = useNavigate()
  const [lightGroups, setLightGroups] = useState<LightGroup[]>([])
  const {
    dispatch,
    state: { bridgeNetworkDevice, credentials },
  } = useBridgeContext()

  const submitEntertainmentGroup = (lightGroup: LightGroup) => {
    dispatch({ payload: lightGroup, type: SET_lIGHT_GROUP })
    setGroupStreamingMode({
      credentials,
      active: true,
      groupId: Number(lightGroup.name),
      url: bridgeNetworkDevice.internalipaddress,
    }).then(() => navigate("/lights"))
  }

  useEffect(() => {
    async function retrieveBridgeData() {
      const groupsArray = await getBridgeGroups(
        bridgeNetworkDevice.internalipaddress,
        credentials
      )

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
          setLightGroups(entertainmentGroups)
        }
      }
    }

    retrieveBridgeData()
  }, [])

  return (
    <>
      <Text>
        Multiple entertainment groups found! Please select from below:
      </Text>
      <SelectInput
        onSelect={({ value }) => submitEntertainmentGroup(value)}
        items={lightGroups.map((item) => ({
          value: item,
          key: item.name,
          label: item.name,
        }))}
      />
    </>
  )
}

export default EntertainmentGroups
