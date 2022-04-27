import React from "react"
import { MemoryRouter, Routes, Route } from "react-router"

import Header from "./components/Header"
import { BridgeProvider } from "./context/hueBridge"
import BridgeHandShake from "./features/BridgeHandShake"
import RGBLightStreamer from "./features/LightsStreamer"
import BridgeDiscovery from "./features/BridgeDiscovery"
import EntertainmentAreas from "./features/EntertainmentAreaSelection"

const App = () => (
  <>
    <Header />
    <BridgeProvider>
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<BridgeDiscovery />} />
          <Route path="/bridge-handshake" element={<BridgeHandShake />} />
          <Route path="/entertainment-areas" element={<EntertainmentAreas />} />
          <Route path="/rgb-stream" element={<RGBLightStreamer />} />
        </Routes>
      </MemoryRouter>
    </BridgeProvider>
  </>
)

export default App
