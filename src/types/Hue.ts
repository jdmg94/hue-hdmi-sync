import type { Normalized } from '../utils/normalization'

interface LightStatus {
  on: boolean
  bri: number
  hue: number
  sat: number
  effect: string
  xy: [number, number]
  ct: number
  alert: string
  colormode: string
  mode?: string
  reachable?: boolean
}

interface SoftwareUpdateState {
  state: string
  lastinstall: string
}

export interface LightGroup {
  name: string
  lights: string[]
  sensors: string[]
  type: string
  state: { all_on: boolean; any_on: boolean }
  recycle: boolean
  class: string
  stream?: {
    proxymode: string
    proxynode: string
    active: string
    owner?: string
  }
  locations?: Normalized<[number, number, number]>
  action: LightStatus
}

interface LightConfig {
  archetype: string
  function: string
  direction: string
  startup: {
    mode: string
    configured: boolean
  }
}

interface LightCapabilities {
  certified: boolean
  streaming: {
    renderer: boolean
    proxy: boolean
  }
  control: {
    maxlumen: number
    mindimlevel: number
    colorgamuttype: string
    ct: { min: number; max: number }
    colorgamut: [[number, number], [number, number], [number, number]]
  }
}

export interface Light {
  state: LightStatus
  swupdate: SoftwareUpdateState
  type: string
  name: string
  modelid: string
  manufacturername: string
  productname: string
  capabilities: LightCapabilities
  config: LightConfig
  uniqueid: string
  swversion: string
  swconfigid: string
  productid: string
}

export interface HueBridgeNetworkDevice {
  id: string
  internalipaddress: string
}

export interface BridgeClientCredentials {
  username: string
  clientkey: string
}

export interface BridgeConfig {
  name: string
  datastoreversion: string
  swversion: string
  apiversion: string
  mac: string
  bridgeid: string
  factorynew: boolean
  replacesbridgeid?: string
  modelid: string
  starterkitid?: string
}
