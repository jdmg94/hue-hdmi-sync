import React from "react"
import { Text } from "ink"
import Spinner from "ink-spinner"
import SelectInput from "ink-select-input"
import { HueBridgeNetworkDevice } from "hue-sync"
import { UncontrolledTextInput as TextInput } from "ink-text-input"

import { STATUS } from "../../types/Status"
import useBridgeDiscovery from "./useBridgeDiscovery"

const DiscoverBridges = () => {
  const { status, bridges, submitSelection } = useBridgeDiscovery()

  if (status === STATUS.LOADING || status === STATUS.IDLE) {
    return (
      <Text>
        <Text color="green">
          <Spinner type="dots" />
        </Text>
        <Text>{" Looking for Hue Bridge(s) on the local network"}</Text>
      </Text>
    )
  }

  if (status == STATUS.DONE && bridges.length > 0) {
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

  return (
    <>
      {status === STATUS.ERROR && (
        <Text color="red">Bridge not found through mDNS!</Text>
      )}
      {status === STATUS.DONE && bridges.length === 0 && (
        <Text color="yellow">No Hue Bridges Found!</Text>
      )}
      <TextInput
        placeholder="Enter Bridge IP Manually: "
        onSubmit={(internalipaddress) =>
          submitSelection({
            internalipaddress,
            id: "manual-entry",
          })
        }
      />
    </>
  )
}

export default DiscoverBridges
