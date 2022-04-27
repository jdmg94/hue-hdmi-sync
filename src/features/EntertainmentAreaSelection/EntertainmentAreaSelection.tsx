import React from "react"
import { Text } from "ink"
import SelectInput from "ink-select-input"

import useEntertainmentAreas from "./useEntertainmentAreas"

const EntertainmentGroups = () => {
  const { lightGroups, submitSelection } = useEntertainmentAreas()

  return (
    <>
      <Text>
        Multiple entertainment groups found! Please select from below:
      </Text>
      <SelectInput
        onSelect={({ value }) => submitSelection(value)}
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
