import fetch from "unfetch"
import { Vec4 } from "opencv4nodejs"
import { spawn } from "child_process"
import { access, readFile, writeFile, removeFile } from "./filesystem"
import { denormalize, Normalized } from "../utils/normalization"
import {
  HueBridgeNetworkDevice,
  BridgeClientCredentials,
  BridgeConfig,
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
): Promise<Array<LightGroup>> => {
  const endpoint = `http://${url}/api/${credentials.username}/groups`
  const response = await fetch(endpoint)
  const data = await response.json()

  return denormalize(data)
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

type StreamingModeArgs = {
  url: string
  credentials: BridgeClientCredentials
  groupId: number
  active: boolean
}

export const setGroupStreamingMode = async ({
  url,
  active,
  credentials,
  groupId,
}: StreamingModeArgs) => {
  const body = JSON.stringify({ stream: { active } })
  const endpoint = `http://${url}/api/${credentials.username}/groups/${groupId}`
  const response = await fetch(endpoint, {
    body,
    method: "PUT",
  })

  const data = await response.json()

  return data
}

type SSLChannel = {
  registerListener: (listener: (message: string) => void) => void
  sendMessage: (message: string) => void
  close: () => void
}

export const startSSLChannel = (
  url: string,
  credentials: BridgeClientCredentials
) =>
  new Promise<SSLChannel>((resolve, reject) => {
    const process = spawn("openssl", [
      "s_client",
      "-dtls1_2",
      "-cipher",
      "PSK-AES128-GCM-SHA256",
      "-psk_identity",
      credentials.username,
      "-psk",
      credentials.clientkey,
      "-connect",
      `${url}:2100`,
    ])

    process.stdin.setDefaultEncoding("utf-8")

    process.stdout.once("data", (data) => {
      const message = data.toString()
      if (message.includes("CONNECTED")) {
        resolve({
          registerListener: (listener) => {
            process.stdout.on("message", (data: Buffer) =>
              listener(data.toString())
            )
          },
          sendMessage: (message) => {
            process.stdin.write(Buffer.from(message))
            process.stdin.end()
          },
          close: () => {
            process.stdout.removeAllListeners()
            process.kill()
          },
        })
      } else {
        reject(message)
      }
    })
  })

export const prepareBufferForStreaming = (channels: Vec4) => {
  const channeldata = [channels.x, channels.y, channels.z].map((channel) =>
    Math.floor(channel / 2)
  )

  return Buffer.concat([
    Buffer.from("HueStream"),
    Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01]),
    Buffer.from(channeldata),
  ]).toString("utf-8")
}
