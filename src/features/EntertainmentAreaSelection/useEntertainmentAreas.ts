import { useNavigate } from "react-router"
import { useEffect, useState } from "react"
import { EntertainmentArea } from "hue-sync"

import { useBridgeContext, setLightGroup } from "../../context/hueBridge"

const useEntertainmentAreas = () => {
    const navigate = useNavigate()
  const [lightGroups, setLightGroups] = useState<EntertainmentArea[]>([])
  const {
    dispatch,
    state: { bridge },
  } = useBridgeContext()

  const submitSelection = (lightGroup: EntertainmentArea) => {
    dispatch(setLightGroup(lightGroup))
    navigate("/rgb-stream")
  }

  useEffect(() => {
    async function retrieveBridgeData() {
      const groups = await bridge.getEntertainmentAreas()

      if (groups.length === 1) {
        submitSelection(groups[0])
      } else {
        setLightGroups(groups)
      }
    }

    retrieveBridgeData()
  }, [])

  return {
    lightGroups,
    submitSelection
  }
}

export default useEntertainmentAreas
