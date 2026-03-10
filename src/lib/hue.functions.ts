import { createServerFn } from '@tanstack/react-start'
import type { Axios } from 'axios';
import { createAxiosWithLookup } from './axios';
import { listVideoInputs } from './capture.server';
import { discover, register } from "./hue.server"
import { StreamingClient } from './StreamingClient.server';
import type { EntertainmentArea, HueBridgeNetworkDevice, HueBridgeRegistration } from "./types"

let axios: Axios;
let streamer: StreamingClient;
let bridgeData: HueBridgeRegistration;

export const getAvailableBridges = createServerFn().handler(async () => {
  const devices = await discover();
  return devices ?? []
})

export const registerWithBridge = createServerFn()
  .inputValidator((data: HueBridgeNetworkDevice) => data)
  .handler(async ({ data }) => {
    const credentials = await register(data.ip, "hue-hdmi-sync")
    axios = createAxiosWithLookup(data.id, data.ip, credentials)
    bridgeData = {
      id: data.id,
      ip: data.ip,
      name: data.name,
      credentials,
    }

    return credentials
  })

export const initializeBridge = createServerFn()
  .inputValidator((data: HueBridgeRegistration) => data)
  .handler(async ({ data }) => {
    axios = createAxiosWithLookup(data.id, data.ip, data.credentials)
    bridgeData = { ...data }
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

  return wrapper.data[0] as EntertainmentArea;
  })

const _updateEntertainmentArea = async (id: string, updates: Partial<EntertainmentArea>) => {
  const response = await axios.put(`/entertainment_configuration/${id}`, updates)
  const wrapper = await response.data

  return wrapper.data;
}

export const updateEntertainmentArea = createServerFn()
  .inputValidator((data: { id: string, updates: Partial<EntertainmentArea> }) => data)
  .handler(async ({ data }) => {
    return _updateEntertainmentArea(data.id, data.updates)
  })

export const getVideoInputs = createServerFn().handler(() => {
  return listVideoInputs()
})

export const startStreaming = createServerFn()
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    if (!streamer) {
      streamer = new StreamingClient(bridgeData.ip, bridgeData.credentials, _updateEntertainmentArea)
    }

    await streamer.start(data.id)

    streamer.transition([
      [217, 237, 146],
      [181, 228, 140],
      [153, 217, 140],
      [118, 200, 147],
      [82, 182, 154],
      [52, 160, 164],
      [22, 138, 173],
    ])
    console.log("sent test color update")
  })

export const stopStreaming = createServerFn()
  .handler(async () => {
    if (streamer?.isStreaming) {
      streamer.stop();
    }
  })