/**
 * Entertainment API DTLS streaming client
 */

import { dtls } from "node-dtls-client";
import { ENTERTAINMENT_API } from "#/lib/constants";
import { HueBridgeStreamError } from "#/lib/errors";
import type { EntertainmentArea, ResourceNode } from "#/lib/types";

/**
 * Streaming client for high-frequency Entertainment API updates
 */
// Static header size: "HueStream"(9) + version(2) + seq(1) + reserved(2) + colorMode(1) + reserved(1)
const HEADER_SIZE = 16;

export class StreamingClient {
  private socket: dtls.Socket | null = null;
  private abortController: AbortController | null = null;
  private packetBuf: Buffer | null = null;
  private channelDataOffset = 0;
 

  constructor(
    private readonly bridgeUrl: string,
    private readonly entertainmentAreaId: string,
    private readonly credentials: { username: string; clientkey: string },
  ) {
    // Build the pre-allocated packet buffer once per session.
    // Only the 7-byte per-channel blocks change per frame; the header is constant.
    const idBytes = Buffer.from(entertainmentAreaId);
    this.channelDataOffset = HEADER_SIZE + idBytes.length;
    this.packetBuf = Buffer.allocUnsafe(this.channelDataOffset + 7 * 7);

    Buffer.from(ENTERTAINMENT_API.PROTOCOL_NAME).copy(this.packetBuf, 0);
    this.packetBuf[9]  = ENTERTAINMENT_API.PROTOCOL_VERSION[0];
    this.packetBuf[10] = ENTERTAINMENT_API.PROTOCOL_VERSION[1];
    this.packetBuf[11] = ENTERTAINMENT_API.SEQUENCE_NUMBER;
    this.packetBuf[12] = ENTERTAINMENT_API.RESERVED_SPACE;
    this.packetBuf[13] = ENTERTAINMENT_API.RESERVED_SPACE;
    this.packetBuf[14] = ENTERTAINMENT_API.COLOR_MODE.RGB;
    this.packetBuf[15] = ENTERTAINMENT_API.RESERVED_SPACE;
    idBytes.copy(this.packetBuf, HEADER_SIZE);

  }

  /**
   * Check if streaming is currently active
   */
  get isStreaming(): boolean {
    return this.socket !== null;
  }

  /**
   * Starts Entertainment API streaming for high-frequency light updates.
   * Establishes a DTLS connection to the bridge for real-time color streaming.
   *
   * @param selectedArea - The entertainment area to stream to
   * @param timeout - Socket timeout in milliseconds (default: 1000)
   * @returns Promise that resolves when the connection is established
   *
   * @example
   * await streamingClient.start(entertainmentArea);
   * // Now you can call transition() to send color updates
   */
  async start(
    timeout: number = ENTERTAINMENT_API.DEFAULT_TIMEOUT
  ): Promise<void> {
    this.abortController = new AbortController();

    // Build the pre-allocated packet buffer once per session.
    // Only the 7-byte per-channel blocks change per frame; the header is constant.
    this.socket = dtls.createSocket({
      timeout,
      port: ENTERTAINMENT_API.PORT,
      type: "udp4",
      address: this.bridgeUrl,
      signal: this.abortController.signal,
      cipherSuites: [ENTERTAINMENT_API.CIPHER_SUITE],
      psk: {
        [this.credentials.username]: Buffer.from(
          this.credentials.clientkey,
          "hex"
        ),
      },
    } as unknown as dtls.Options);

    return new Promise((resolve, reject) => {
       this.socket?.on("connected", resolve);
       this.socket?.on("error", (err: Error) => reject(new HueBridgeStreamError(`DTLS handshake failed: ${err.message}`)));
       this.socket?.on("close", () => reject(new HueBridgeStreamError("DTLS socket closed before handshake completed")));
    });
  }

  /**
   * Stops Entertainment API streaming and closes the DTLS connection.
   *
   * @throws {HueBridgeStreamError} If no streaming session is active
   *
   * @example
   * await streamingClient.stop();
   */
  stop(): Promise<void> {
    if (!this.socket) {
      throw new HueBridgeStreamError("No active datagram socket!");
    }

    return new Promise(resolve => {
      this.socket.on("close", resolve)
    })
  }

  /**
   * Sends color updates to the entertainment area via DTLS streaming.
   * Accepts a flat Uint32Array of [R, G, B, R, G, B, ...] values (7 zones × 3 channels = 21 values).
   * Uses a pre-allocated packet buffer — zero heap allocations in the hot path.
   *
   * @param colors - Flat Uint32Array: [R0, G0, B0, R1, G1, B1, ...]
   * @throws {HueBridgeStreamError} If no streaming session is active
   */
  transition(colors: Uint32Array): void {
    if (!this.socket || !this.packetBuf) return;

    const buf = this.packetBuf;
    const base = this.channelDataOffset;
    const zones = colors.length / 3;

    for (let i = 0; i < zones; i++) {
      const off = base + i * 7;
      const r = colors[i * 3];
      const g = colors[i * 3 + 1];
      const b = colors[i * 3 + 2];
      buf[off]     = i; // channel id
      buf[off + 1] = r;
      buf[off + 2] = r;
      buf[off + 3] = g;
      buf[off + 4] = g;
      buf[off + 5] = b;
      buf[off + 6] = b;
    }

    this.socket.send(buf); 
  }
}
