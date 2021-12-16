import fetch from "unfetch"
import { spawn } from 'child_process'
import { access, readFile, writeFile, removeFile } from "./filesystem"
import {
  HueBridgeNetworkDevice,
  BridgeClientCredentials,
  BridgeConfig,
  Normalized,
  LightGroup,
  Light,
} from "../types/Hue"

const BridgeClientCredentialsPath = "./client.json"

export const discoverHueBridges = async (): Promise<
  HueBridgeNetworkDevice[]
> => {
  const response = await fetch("https://discovery.meethue.com/")
  const data = (await response.json()) as HueBridgeNetworkDevice[]

  return data || []
}

export const requestAppRegisterOnBridge = async (
  url: string
): Promise<BridgeClientCredentials> => {
  const endpoint = `http://${url}/api`
  const body = JSON.stringify({
    devicetype: "huehdmisync",
    generateclientkey: true,
  })

  const response = await fetch(endpoint, {
    body,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })

  const [{ error, success }] = await response.json()

  if (error) throw error

  return success as BridgeClientCredentials
}

export const persistNewCredentials = async (data: BridgeClientCredentials) => {
  try {
    await writeFile(BridgeClientCredentialsPath, JSON.stringify(data))
    return true
  } catch {
    return false
  }
}

export const getRegisteredCredentials =
  async (): Promise<BridgeClientCredentials> => {
    try {
      await access(BridgeClientCredentialsPath)

      const clientData = await readFile(BridgeClientCredentialsPath, {
        encoding: "utf8",
      })

      return JSON.parse(clientData) as BridgeClientCredentials
    } catch {
      return null
    }
  }

export const clearPersistedCredentials = async () => {
  try {
    await access(BridgeClientCredentialsPath)
    await removeFile(BridgeClientCredentialsPath, {})
  } catch {}
}

export const getBridgeConfig = async (url: string): Promise<BridgeConfig> => {
  const endpoint = `http://${url}/api/config`
  const response = await fetch(endpoint)

  if (response.status === 200) {
    const data = await response.json()

    return data as BridgeConfig
  }

  return null
}

export const getBridgeGroups = async (
  url: string,
  credentials: BridgeClientCredentials
): Promise<Normalized<LightGroup>> => {
  const endpoint = `http://${url}/api/${credentials.username}/groups`
  const response = await fetch(endpoint)
  const data = await response.json()

  return data
}

export const getBridgeLights = async (
  url: string,
  credentials: BridgeClientCredentials
): Promise<Normalized<Light>> => {
  const endpoint = `http://${url}/api/${credentials.username}/lights`
  const response = await fetch(endpoint)
  const data = await response.json()

  return data
}

export const getBridgeState = async (
  url: string,
  credentials: BridgeClientCredentials
) => {
  const endpoint = `http://${url}/api/${credentials.username}`
  const response = await fetch(endpoint)
  const data = await response.json()

  console.log(await getBridgeLights(url, credentials))

  return data
}

export const setGroupStreamingMode = async (
  url: string,
  credentials: BridgeClientCredentials,
  groupId: number,
  active: boolean = true
) => {
  const body = JSON.stringify({ stream: { active } })
  const endpoint = `http://${url}/api/${credentials.username}/groups/${groupId}`
  const response = await fetch(endpoint, {
    body,
    method: "PUT",
  })

  const data = await response.json()

  console.log("data")
}
