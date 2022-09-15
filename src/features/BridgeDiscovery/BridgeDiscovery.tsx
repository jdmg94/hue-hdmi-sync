import React from "react"
import { Text } from "ink"
import Spinner from "ink-spinner"
import SelectInput from "ink-select-input"
import type { HueBridgeNetworkDevice } from "hue-sync"

import { STATUS } from "../../types/Status"
import useBridgeDiscovery from "./useBridgeDiscovery"

const DiscoverBridges = () => {
  const { status, bridges, submitSelection } = useBridgeDiscovery()

  return (
    <>
      {(status === STATUS.LOADING || status === STATUS.IDLE) && (
        <Text>
          <Text color="green">
            <Spinner type="dots" />
          </Text>
          <Text>{" Looking for Hue Bridge(s) on the local network"}</Text>
        </Text>
      )}
      {status === STATUS.ERROR && (
        <Text color="red">Bridge not found through mDNS!</Text>
      )}
      {status === STATUS.DONE && bridges.length === 0 && (
        <Text color="yellow">No Hue Bridges Found!</Text>
      )}
      {status == STATUS.DONE && bridges.length > 0 && (
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
      )}
    </>
  )
}

export default DiscoverBridges
