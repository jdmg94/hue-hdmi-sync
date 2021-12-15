import React from "react"
import { Text } from "ink"
import { ErrorBoundary } from "react-error-boundary"
import { MemoryRouter, Routes, Route } from "react-router"

import Header from "./components/Header"
import BridgeConfig from "./features/BridgeConfig"
import LightsConfig from "./features/LightsConfig"
import { BridgeDataProvider } from "./context/hueBridge"
import DiscoverBridges from "./features/DiscoverBridges"
import EntertainmentGroups from "./features/EntertainmentGroups"

const App = () => {
  return (
    <>
      <Header />
      <BridgeDataProvider>
        <MemoryRouter>
          <Routes>
            <Route path="/" element={<DiscoverBridges />} />
            <Route path="/setup" element={<BridgeConfig />} />
            <Route path="/light-groups" element={<EntertainmentGroups />} />
            <Route path="/lights" element={<LightsConfig />} />
          </Routes>
        </MemoryRouter>
      </BridgeDataProvider>
    </>
  )
}

export default App
