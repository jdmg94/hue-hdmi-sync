import React from "react"
import { Text } from "ink"
import Spinner from "ink-spinner"

import { STATUS } from "../../types/Status"
import useBridgeHandShake, { ExtraStates } from "./useBridgeHandShake"

const BridgeConfig = () => {
  const { status } = useBridgeHandShake()

  if (status === STATUS.ERROR)
    return (
      <Text color="red">{"link button not pressed, please try again"}</Text>
    )

  return (
    <Text>
      <Text color="green">
        <Spinner type="dots" />
      </Text>
      <Text>
        {status === ExtraStates.NEEDS_CREDENTIALS
          ? "Checking "
          : "Push the link button on Hue Bridge"}
      </Text>
    </Text>
  )
}

export default BridgeConfig
