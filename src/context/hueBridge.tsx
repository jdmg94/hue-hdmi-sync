import { AnyAction, createSlice, PayloadAction } from "@reduxjs/toolkit"
import React, {
  createContext,
  FC,
  useContext,
  useReducer,
  ReactElement,
  Dispatch,
} from "react"
import HueSync, {
  BridgeConfig,
  EntertainmentArea,
  HueBridgeNetworkDevice,
  BridgeClientCredentials,
} from "hue-sync"

export interface BridgeState {
  bridge?: HueSync
  bridgeConfig?: BridgeConfig
  credentials?: BridgeClientCredentials
  bridgeNetworkDevice?: HueBridgeNetworkDevice
  entertainmentGroup?: EntertainmentArea
}

const initialState: BridgeState = {
  bridge: undefined,
  credentials: undefined,
  bridgeConfig: undefined,
  bridgeNetworkDevice: undefined,
  entertainmentGroup: undefined,
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

const BridgeDataContext = createContext<
  | {
      state: BridgeState
      dispatch: Dispatch<AnyAction>
    }
  | undefined
>(undefined)

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

export const useBridgeContext = () => {
  const context = useContext(BridgeDataContext)

  if (!context) {
    throw new Error(
      "Bridge Context can only be used within Bridge state provider"
    )
  }

  return context
}

export const { setBridge, setCredentials, setLightGroup, setBridgeDevice } =
  stateSlice.actions
