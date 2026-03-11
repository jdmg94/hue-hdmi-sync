import { Worker } from "node:worker_threads";
import mdns from "node-dns-sd";
import { DISCOVERY } from "./constants";
import { StreamingClient } from './StreamingClient.server'
import type { BridgeClientCredentials, HueBridgeNetworkDevice } from "./types"

let streamer: StreamingClient;
const cvWorker = new Worker(new URL("../../CVWorker.ts", import.meta.url), {
    execArgv: ["--experimental-strip-types"],
})


cvWorker.on("message", (msg: Uint32Array | { type: string; state: string; message?: string }) => {
    if (msg instanceof Uint32Array) {
        streamer.transition(msg)
    } else if (msg.type === "status") {
        console.error(`[CVWorker] ${msg.state}: ${msg.message ?? ""}`)
    }
})

export const startStream = async (entertainmentAreaId: string, ip: string, credentials: BridgeClientCredentials, updateEntertainmentArea) => {
    if (!streamer) {
        streamer = new StreamingClient(ip, credentials, updateEntertainmentArea)
    }

    await streamer.start(entertainmentAreaId)
    cvWorker.postMessage("start")
}

export const stopStream = async () => {
    cvWorker.postMessage("stop")
    if (streamer?.isStreaming) {
        streamer.stop();
    }
}

export const updateVideoInput = (payload: string) => {
    const message = JSON.stringify({ type: "updateVideoInput", payload })
    cvWorker.postMessage(message)
}

/**
 * Discovers Philips Hue Bridges on the local network using mDNS.
 * Falls back to Philips cloud discovery API if mDNS fails.
 *
 * @returns Array of discovered bridge devices
 * @throws {HueBridgeDiscoveryError} If both mDNS and cloud API discovery fail
 *
 * @example
 * const bridges = await discover();
 * console.log(`Found ${bridges.length} bridge(s)`);
 */
export async function discover(): Promise<HueBridgeNetworkDevice[]> {
    try {
        const localSearch = await mdns.discover({
            name: DISCOVERY.MDNS_SERVICE,
        });


        const results = localSearch.map((item) => {
            const ip = item.address;
            const [buffer] = item.packet.additionals;
            const id = buffer.rdata.bridgeid;
            const name = item.modelName

            return {
                id,
                name,
                ip,
            };
        });

        return results
    } catch (mdnsError) {
        try {
            const response = await fetch(DISCOVERY.CLOUD_API);

            if (!response.ok) {
                throw new Error(
                    `Failed to discover bridges via cloud API: ${response.statusText}`,
                );
            }

            return response.json();
        } catch (fetchError) {
            throw new Error(
                "Failed to discover Hue Bridges via both mDNS and cloud API",
            );
        }
    }
}

/**
 * Registers the application with a Hue Bridge to obtain credentials.
 * The physical button on the bridge must be pressed before calling this method.
 *
 * @param url - The IP address of the bridge
 * @param devicetype - The application identifier (default: "hue-sync")
 * @returns Bridge client credentials (username and clientkey)
 * @throws {Error} If the link button was not pressed or registration fails
 *
 * @example
 * const credentials = await register("192.168.1.100");
 * // Save credentials for future use
 */
export async function register(
    url: string,
    devicetype: string = "hue-sync"
): Promise<BridgeClientCredentials> {
    const endpoint = `http://${url}/api`;
    const body = JSON.stringify({
        devicetype,
        generateclientkey: true,
    });

    const response = await fetch(endpoint, {
        body,
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    });

    type CredentialsResponse = {
        error: Error[];
        success: BridgeClientCredentials;
    };

    const [{ error, success }]: CredentialsResponse[] = await response.json();

    if (error) throw error;

    return success;
}