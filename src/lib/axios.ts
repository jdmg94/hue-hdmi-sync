import dns from "dns";
import axios from "axios";
import type { AxiosInstance } from "axios";
import type { BridgeClientCredentials } from "./types";

export function createAxiosWithLookup(
	domain: string,
	ip: string,
	credentials: BridgeClientCredentials
): AxiosInstance {
	return axios.create({
		lookup(hostname, _, cb) {
			if (hostname === domain) {
				return cb(null, ip, 4);
			}
			return dns.lookup(hostname, 4, cb);
		},
		baseURL: `https://${domain}/clip/v2/resource`,
		headers: {
			["hue-application-key"]: credentials.username
		}
	});
}
