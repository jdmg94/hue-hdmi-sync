import { createServerFn } from '@tanstack/react-start'
import type { Axios } from 'axios';
import { createAxiosWithLookup } from './axios';
import { discover, register } from "./hue.server"
import type { EntertainmentArea, HueBridgeNetworkDevice, HueBridgeRegistration } from "./types"

let axios: Axios;

export const getAvailableBridges = createServerFn().handler(async () => {
  const devices = await discover();
  console.log("fetched the following bridges: ", devices)
  return devices ?? []
})

export const registerWithBridge = createServerFn()
  .inputValidator((data: HueBridgeNetworkDevice) => data)
  .handler(async ({ data }) => {
    const credentials = await register(data.ip, "hue-hdmi-sync")
    axios = createAxiosWithLookup(data.id, data.ip, credentials)

    return credentials
  })

export const initializeBridge = createServerFn()
  .inputValidator((data: HueBridgeRegistration) => data)
  .handler(async ({ data }) => {
    axios = createAxiosWithLookup(data.id, data.ip, data.credentials)
  })

export const getEntertainmentAreas = createServerFn().handler(async () => {
  const response = await axios.get("/entertainment_configuration")
  const wrapper = await response.data

  return wrapper.data as EntertainmentArea[];
})

export const getEntertainmentArea = createServerFn()
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const response = await axios.get(`/entertainment_configuration/${data.id}`)
    const wrapper = await response.data

    return wrapper.data as EntertainmentArea[];
  })

export const updateEntertainmentArea = createServerFn()
  .inputValidator((data: { id: string, updates: Partial<EntertainmentArea> }) => data)
  .handler(async ({ data }) => {
    const response = await axios.put(`/entertainment_configuration/${data.id}`, data.updates)
    const wrapper = await response.data

    return wrapper.data;
  })