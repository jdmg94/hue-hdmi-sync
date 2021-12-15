import React, { createContext, FC, useContext, useReducer } from "react"
import {
  HueBridgeNetworkDevice,
  LightGroup,
  BridgeConfig,
  BridgeClientCredentials,
} from "../types/Hue"

export interface BridgeState {
  bridgeConfig?: BridgeConfig
  credentials?: BridgeClientCredentials
  bridgeNetworkDevice?: HueBridgeNetworkDevice
  selectedEntertainmentGroup?: LightGroup
}

const initialState: BridgeState = {
  credentials: null,
  bridgeConfig: null,
  bridgeNetworkDevice: null,
  selectedEntertainmentGroup: null,
}

type Action<T = {}> = {
  payload?: T
  type: string
}

export const SET_BRIDGE = "SET_BRIDGE"
export const SET_CREDENTIALS = "SET_CREDENTIALS"
export const SET_lIGHT_GROUP = "SET_lIGHT_GROUP"
export const SET_BRIDGE_CONFIG = "SET_BRIDGE_CONFIG"

const reducer = (
  state: BridgeState = initialState,
  action: Action
): BridgeState => {
  const nextState = {
    [SET_CREDENTIALS]: () => {
      const { payload } = action as Action<BridgeClientCredentials>

      return {
        ...state,
        credentials: payload,
      }
    },
    [SET_lIGHT_GROUP]: () => {
      const { payload } = action as Action<LightGroup>

      return {
        ...state,
        selectedEntertainmentGroup: payload,
      }
    },
    [SET_BRIDGE]: () => {
      const { payload } = action as Action<HueBridgeNetworkDevice>

      return {
        ...state,
        bridgeNetworkDevice: payload,
      }
    },
    [SET_BRIDGE_CONFIG]: () => {
      const { payload } = action as Action<BridgeConfig>

      return {
        ...state,
        bridgeConfig: payload,
      }
    },
  }[action.type]

  return nextState?.() || state
}

const BridgeDataContext = createContext(null)

export const BridgeDataProvider: FC = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  return (
    <BridgeDataContext.Provider value={{ state, dispatch }}>
      {children}
    </BridgeDataContext.Provider>
  )
}

export const useBridgeContext = () => useContext(BridgeDataContext)
