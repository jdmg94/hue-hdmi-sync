
import type { Axios } from 'axios';
import { createAxiosWithLookup } from './axios';
import { createServerFn } from '@tanstack/react-start'
import { discover, register, type BridgeClientCredentials, type HueBridgeNetworkDevice } from "./hue.server"

let bridgeInfo: HueBridgeNetworkDevice;
let credentials: BridgeClientCredentials;
let axios: Axios;

export const getAvailableBridges = createServerFn().handler(async () => {
  const devices = await discover();
  return devices ?? []
})

export const registerWithBridge = createServerFn().inputValidator((data: { ip: string, id: string }) => data).handler(async ({ data }) => {
  credentials = await register(data.ip, "hue-hdmi-sync")
  axios = createAxiosWithLookup(data.id, data.ip, credentials)
})

export const initializeBridge = createServerFn()
  .inputValidator((data: { ip: string, id: string, credentials: BridgeClientCredentials }) => data)
  .handler(async ({ data }) => {
    credentials = data.credentials;
    bridgeInfo = {
      id: data.id,
      ip: data.ip,
    }

    axios = createAxiosWithLookup(data.id, data.ip, credentials)
  })

export const getEntertainmentAreas = createServerFn().handler(async () => {  
  const response = await axios.get("/resource/entertainment_configuration")
  const wrapper = await response.data

  return wrapper.data;
})