import { Text } from "ink"
import SelectInput from "ink-select-input"
import { useNavigate } from "react-router"
import React, { useEffect, useState } from "react"

import { LightGroup } from "../types/Hue"
import { denormalize } from "../utils/normalization"
import { useBridgeContext, SET_lIGHT_GROUP } from "../context/hueBridge"

const EntertainmentGroups = () => {
  const navigate = useNavigate()
  const [lightGroups, setLightGroups] = useState<LightGroup[]>([])
  const {
    dispatch,
    state: { bridge },
  } = useBridgeContext()

  const submitEntertainmentGroup = (lightGroup: LightGroup) => {
    dispatch({ payload: lightGroup, type: SET_lIGHT_GROUP })
    navigate("/lights")
  }

  useEffect(() => {
    async function retrieveBridgeData() {
      const groups = await bridge.getEntertainmentAreas()

      if (groups.length === 1) {
        submitEntertainmentGroup(groups[0])
      } else {
        setLightGroups(groups)
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
