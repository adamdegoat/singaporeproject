// Local WebSocket adapter for the RoomHub — dev servers and the test suite.
// Production is relay/do.js (Cloudflare Durable Objects); this file never
// deploys. The `ws` package is imported by absolute path from a sibling
// project (this repo deliberately has no node_modules), same pattern as the
// Playwright harnesses.
import { RoomHub } from './server.js';
import wsPkg from '/Users/ZY/tradingview-mcp-jackson/node_modules/ws/index.js';
const WebSocketServer = wsPkg.Server;   // older ws exports `Server`

export function startLocal(port = 8935, hubOpts = {}) {
  const hub = new RoomHub(hubOpts);
  const wss = new WebSocketServer({ port });
  wss.on('connection', (sock) => {
    const conn = {
      id: null, room: null,
      send: (obj) => { try { sock.send(JSON.stringify(obj)); } catch {} },
      close: () => { try { sock.close(); } catch {} },
    };
    sock.on('message', (raw) => hub.onMessage(conn, raw.toString()));
    sock.on('close', () => hub.onClose(conn));
  });
  const timer = setInterval(() => hub.tick(), 1000);
  return { hub, wss, stop: () => { clearInterval(timer); wss.close(); } };
}

// `node relay/local.mjs` runs a dev relay on :8935
if (import.meta.url === `file://${process.argv[1]}`) {
  const { } = startLocal(+(process.env.RELAY_PORT || 8935));
  console.log(`relay listening on :${process.env.RELAY_PORT || 8935}`);
}
