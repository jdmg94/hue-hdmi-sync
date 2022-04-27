import React from "react"
import { Text } from "ink"
import Spinner from "ink-spinner"
import SelectInput from "ink-select-input"
import { HueBridgeNetworkDevice } from "hue-sync"

import { STATUS } from "../../types/Status"
import useBridgeDiscovery from "./useBridgeDiscovery"

const DiscoverBridges = () => {
  const { errorMessage, status, bridges, submitSelection } =
    useBridgeDiscovery()

  if (status === STATUS.IDLE) {
    return <Text>Loading...</Text>
  }

  if (status === STATUS.LOADING) {
    return (
      <Text>
        <Text color="green">
          <Spinner type="dots" />
        </Text>
        <Text>{" Looking for Hue Bridge(s) on the local network"}</Text>
      </Text>
    )
  }

  if (status === STATUS.ERROR) {
    return <Text color="red">{errorMessage}</Text>
  }

  if (status === STATUS.DONE && bridges.length === 0) {
    return <Text color="yellow">No Hue Bridges Found!</Text>
  }

  return (
    <>
      <Text>Multiple Hue Bridges found! Select one below:</Text>
      <SelectInput<HueBridgeNetworkDevice>
        onSelect={(item) => submitSelection(item.value)}
        items={bridges.map((item) => ({
          value: item,
          label: `${item.id}@${item.internalipaddress}`,
        }))}
      />
    </>
  )
}

export default DiscoverBridges
