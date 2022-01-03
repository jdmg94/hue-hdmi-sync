import React from "react"
import { MemoryRouter, Routes, Route } from "react-router"

import Header from "./components/Header"
import BridgeConfig from "./features/BridgeConfig"
import LightsConfig from "./features/LightsConfig"
import { BridgeDataProvider } from "./context/hueBridge"
import DiscoverBridges from "./features/DiscoverBridges"
import EntertainmentGroups from "./features/EntertainmentGroups"

const App = () => (
  <>
    <Header />
    <BridgeDataProvider>
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<DiscoverBridges />} />
          <Route path="/bridge-setup" element={<BridgeConfig />} />
          <Route path="/entertainment-groups" element={<EntertainmentGroups />} />
          <Route path="/lights" element={<LightsConfig />} />
        </Routes>
      </MemoryRouter>
    </BridgeDataProvider>
  </>
)

export default App
