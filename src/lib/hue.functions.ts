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

const _getEntertainmentArea = async (id: string) => {
  const response = await axios.get(`/entertainment_configuration/${id}`)
  const wrapper = await response.data

  return wrapper.data[0] as EntertainmentArea;
}

export const getEntertainmentArea = createServerFn()
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    return _getEntertainmentArea(data.id)
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
    console.log("starting the stream..")
    if (!streamer) {
      streamer = new StreamingClient(bridgeData.ip, bridgeData.credentials, _updateEntertainmentArea)
      console.log("initialized streaming client")
    }
    
    console.log("retrieving the entertainment area config..")
    const selectedArea = await _getEntertainmentArea(data.id)
    console.log("fethed the entertainment area: ", selectedArea)
    
    streamer.start(selectedArea)
    console.log("enabled stream mode on the entertainment area")
    // start the CVWorker or something
  })

export const stopStreaming = createServerFn()
  .handler(async () => {
    if (streamer?.isStreaming) {
      console.log("stopping the stream!")
      streamer.stop();
    }
  })