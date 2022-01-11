import { useApp } from "ink"
import { useState, useEffect } from "react"

const useTimeout = (
  initialTimeInSeconds: number,
  stepInMilis: number = 1000
) => {
  const app = useApp()
  const [timeout, updateSeconds] = useState(initialTimeInSeconds)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (timeout > 0) {
        updateSeconds(timeout - 1)
      } else {
        app.exit()
      }
    }, stepInMilis)

    return () => {
      clearTimeout(timer)
    }
  }, [timeout])

  return timeout
}

export default useTimeout
