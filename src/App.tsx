import React from "react"
import { MemoryRouter, Routes, Route } from "react-router"

import Header from "./components/Header"
import BridgeSetup from "./features/BridgeSetup"
import LightsConfig from "./features/LightsStreamer"
import { BridgeProvider } from "./context/hueBridge"
import BridgeDiscovery from "./features/BridgeDiscovery"
import EntertainmentGroups from "./features/EntertainmentGroupSelection"

const App = () => (
  <>
    <Header />
    <BridgeProvider>
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<BridgeDiscovery />} />
          <Route path="/bridge-setup" element={<BridgeSetup />} />
          <Route
            path="/entertainment-groups"
            element={<EntertainmentGroups />}
          />
          <Route path="/lights" element={<LightsConfig />} />
        </Routes>
      </MemoryRouter>
    </BridgeProvider>
  </>
)

export default App
