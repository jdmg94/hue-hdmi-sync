/**
 * DTLS PoC — connects to a Hue bridge Entertainment API and pulses red/blue.
 * Run with: node dtls-poc.mjs
 */

import { dtls } from "node-dtls-client";
import { readFileSync } from "node:fs";

// ── Config ────────────────────────────────────────────────────────────────────
const creds = JSON.parse(readFileSync(new URL("./credentials.json", import.meta.url)));
const BRIDGE_IP        = creds.bridgeIp;
const USERNAME         = creds.username;
const CLIENTKEY        = creds.clientkey;
const ENTERTAINMENT_ID = creds.entertainmentAreaId;

const PORT         = 2100;
const CIPHER_SUITE = "TLS_PSK_WITH_AES_128_GCM_SHA256";
const TIMEOUT_MS   = 5000;

// ── Packet builder ────────────────────────────────────────────────────────────
// Header: "HueStream"(9) + version(2) + seq(1) + reserved(2) + colorMode(1) + reserved(1) = 16 bytes
// Then the entertainment area ID bytes, then per-channel blocks (7 bytes each).
function buildPacket(entertainmentId, channels) {
  const idBytes       = Buffer.from(entertainmentId);
  const headerSize    = 16;
  const channelOffset = headerSize + idBytes.length;
  const buf           = Buffer.alloc(channelOffset + channels.length * 7);

  // Static header
  Buffer.from("HueStream").copy(buf, 0);
  buf[9]  = 0x02; // version major
  buf[10] = 0x00; // version minor
  buf[11] = 0x00; // sequence
  buf[12] = 0x00; // reserved
  buf[13] = 0x00; // reserved
  buf[14] = 0x00; // color mode: RGB
  buf[15] = 0x00; // reserved
  idBytes.copy(buf, headerSize);

  // Per-channel data: [channelId, R_hi, R_lo, G_hi, G_lo, B_hi, B_lo]
  // For 8-bit input duplicate the byte for both hi/lo (scale to 16-bit)
  for (let i = 0; i < channels.length; i++) {
    const off      = channelOffset + i * 7;
    const { id, r, g, b } = channels[i];
    buf[off]     = id;
    buf[off + 1] = r;
    buf[off + 2] = r;
    buf[off + 3] = g;
    buf[off + 4] = g;
    buf[off + 5] = b;
    buf[off + 6] = b;
  }

  return buf;
}

// ── Enable streaming mode via REST API ───────────────────────────────────────
async function enableStreaming() {
  const url  = `https://${BRIDGE_IP}/clip/v2/resource/entertainment_configuration/${ENTERTAINMENT_ID}`;
  const body = JSON.stringify({ action: "start" });

  console.log("[REST] Enabling streaming mode…");
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "hue-application-key": USERNAME,
      "Content-Type": "application/json",
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to enable streaming: ${res.status} ${text}`);
  }

  const json = await res.json();
  console.log("[REST] Streaming enabled:", JSON.stringify(json));
}

async function disableStreaming() {
  const url  = `https://${BRIDGE_IP}/clip/v2/resource/entertainment_configuration/${ENTERTAINMENT_ID}`;
  const body = JSON.stringify({ action: "stop" });

  console.log("[REST] Disabling streaming mode…");
  await fetch(url, {
    method: "PUT",
    headers: {
      "hue-application-key": USERNAME,
      "Content-Type": "application/json",
    },
    body,
  });
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  // Hue v2 API uses self-signed TLS; disable cert validation for the REST call.
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

  await enableStreaming();

  console.log("[DTLS] Creating socket…");
  const ac = new AbortController();

  const socket = dtls.createSocket({
    timeout: TIMEOUT_MS,
    port: PORT,
    type: "udp4",
    address: BRIDGE_IP,
    signal: ac.signal,
    cipherSuites: [CIPHER_SUITE],
    psk: {
      [USERNAME]: Buffer.from(CLIENTKEY, "hex"),
    },
  });

  // Wait for handshake
  await new Promise((resolve, reject) => {
    socket.on("connected", () => {
      console.log("[DTLS] Handshake complete — connection established!");
      resolve();
    });
    socket.on("error", (err) => {
      reject(new Error(`DTLS error: ${err.message}`));
    });
    socket.on("close", () => {
      reject(new Error("Socket closed before handshake completed"));
    });
  });

  // 7 channels (max for most entertainment areas), pulse red → blue → red …
  const NUM_CHANNELS = 7;
  const FRAMES       = 60;   // total frames to send
  const FRAME_MS     = 100;  // ~10 fps for a visible PoC

  console.log(`[DTLS] Sending ${FRAMES} frames…`);

  for (let f = 0; f < FRAMES; f++) {
    const t   = f / FRAMES;
    const r   = Math.round(255 * (1 - t));
    const b   = Math.round(255 * t);

    const channels = Array.from({ length: NUM_CHANNELS }, (_, id) => ({
      id,
      r,
      g: 0,
      b,
    }));

    const packet = buildPacket(ENTERTAINMENT_ID, channels);
    socket.send(packet);

    if (f % 10 === 0) {
      console.log(`[DTLS] Frame ${f + 1}/${FRAMES} — R:${r} G:0 B:${b}`);
    }

    await new Promise(r => setTimeout(r, FRAME_MS));
  }

  console.log("[DTLS] Done. Closing socket…");
  await new Promise(resolve => {
    socket.on("close", resolve);
    ac.abort();
  });

  await disableStreaming();
  console.log("[DTLS] PoC complete.");
}

main().catch((err) => {
  console.error("[ERROR]", err.message);
  process.exit(1);
});
