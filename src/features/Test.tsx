import Spinner from "ink-spinner"
import { Text, render } from "ink"
import React, { useEffect } from "react"

import useTimeout from "../utils/useTimeout"
import { openVideoInput, hasVideoSources } from "../services/cv"

const Test = () => {
  const timeout = useTimeout(5)

  useEffect(() => {
    async function init() {
      if (await hasVideoSources()) {
        await openVideoInput()
      }
    }

    console.clear()
    init()
  }, [])

  return (
    <Text>
      <Text color="green">
        <Spinner type="bouncingBall" />
      </Text>
      <Text>This should probably be replaced with unit tests ({timeout}s)</Text>
    </Text>
  )
}

render(<Test />)
