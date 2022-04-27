import { AnyAction, createSlice, PayloadAction } from "@reduxjs/toolkit"
import React, {
  createContext,
  FC,
  useContext,
  useReducer,
  ReactElement,
} from "react"
import HueSync, {
  BridgeConfig,
  EntertainmentArea,
  HueBridgeNetworkDevice,
  BridgeClientCredentials,
} from "hue-sync"

export interface BridgeState {
  bridge: HueSync
  bridgeConfig?: BridgeConfig
  credentials?: BridgeClientCredentials
  bridgeNetworkDevice?: HueBridgeNetworkDevice
  entertainmentGroup?: EntertainmentArea
}

const initialState: BridgeState = {
  bridge: null,
  credentials: null,
  bridgeConfig: null,
  bridgeNetworkDevice: null,
  entertainmentGroup: null,
}

const stateSlice = createSlice({
  name: "hueBridge",
  initialState,
  reducers: {
    setBridge: (state, action: PayloadAction<HueSync>) => {
      state.bridge = action.payload
    },
    setCredentials: (state, action: PayloadAction<BridgeClientCredentials>) => {
      state.credentials = action.payload
    },
    setLightGroup: (state, action: PayloadAction<EntertainmentArea>) => {
      state.entertainmentGroup = action.payload
    },
    setBridgeDevice: (state, action: PayloadAction<HueBridgeNetworkDevice>) => {
      state.bridgeNetworkDevice = action.payload
    },
  },
})

const BridgeDataContext = createContext(null)

export const BridgeProvider: FC<{
  children: ReactElement
}> = ({ children }) => {
  const { reducer } = stateSlice
  const [state, dispatch] = useReducer(reducer, initialState)

  return (
    <BridgeDataContext.Provider value={{ state, dispatch }}>
      {children}
    </BridgeDataContext.Provider>
  )
}

type BridgeContextApi = {
  state: BridgeState
  dispatch: React.Dispatch<AnyAction>
}

export const useBridgeContext = () => {
  const context: BridgeContextApi = useContext(BridgeDataContext)

  if (!context) {
    throw new Error(
      "Bridge Context can only be used within Bridge state provider"
    )
  }

  return context
}

export const { setBridge, setCredentials, setLightGroup, setBridgeDevice } =
  stateSlice.actions
