import mdns from "node-dns-sd";
import { dtls } from "node-dtls-client";

import { DISCOVERY } from "./constants";


export interface BridgeClientCredentials {
    username: string;
    clientkey: string;
}

/**
 * Bridge network device information
 */
export interface HueBridgeNetworkDevice {
    id: string;
    port?: number;
    ip?: string;
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


        return localSearch.map((item) => {
            const port = item.service.port;
            const ip = item.address;
            const [buffer] = item.packet.additionals;
            const id = buffer.rdata.bridgeid;
            // const name = item.model_name

            return {
                id,
                port,
                ip,
            };
        });
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