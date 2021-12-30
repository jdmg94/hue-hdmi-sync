import { Text } from "ink"
import Spinner from "ink-spinner"
import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { hasVideoSources } from "../services/cv"

const DetectVideoSources = () => {
  const navigate = useNavigate()
  const [doneSearching, setDoneSearching] = useState(false)

  useEffect(() => {
    hasVideoSources().then((result) => {
      if (result) navigate("/discovery")
      else setDoneSearching(true)
    })
  }, [])

  if (doneSearching) return <Text color="red">No Video Capture Card Found!</Text>

  return (
    <Text>
      <Text color="green">
        <Spinner type="dots" />
      </Text>
      Looking for video sources...
    </Text>
  )
}

export default DetectVideoSources
