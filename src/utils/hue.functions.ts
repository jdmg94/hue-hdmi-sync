import HueSync, { type BridgeClientCredentials} from "hue-sync";
import { createServerFn } from '@tanstack/react-start'

let selectedBridge = {
  id: null,
  ip: null,
}

let credentials: BridgeClientCredentials;
let bridge: HueSync;

export const getAvailableBridges = createServerFn().handler(async () => {
  const devices = await HueSync.discover();
  return devices.map(item => ({ id: item.id, ip: item.internalipaddress }))
})

export const registerWithBridge = createServerFn().inputValidator((data: { ip: string, id: string }) => data).handler(async ({ data }) => {
  credentials = await HueSync.register(data.ip, "hue-hdmi-sync")
  bridge = new HueSync({
    id: data.id,
    url: data.ip,
    credentials
  });

  return credentials
})

export const getEntertainmentAreas = createServerFn().handler(async () => {
  const areas = await brigde?.getEntertainmentAreas();
  console.log('the areas we found: ', areas)

  return areas
})