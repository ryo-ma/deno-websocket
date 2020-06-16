import {
  assertEquals,
  assertThrows,
  assertNotEquals,
} from "https://deno.land/std/testing/asserts.ts";
import { WebSocket, WebSocketServer } from "./mod.ts";
import { on } from "https://deno.land/std/node/events.ts";

const endpoint = "ws://127.0.0.1:8080";

Deno.test(
  {
    name: "Connect to server",
    sanitizeOps: true,
    sanitizeResources: true,
    async fn(): Promise<void> {
      const wss = new WebSocketServer(8080);
      const connection = on(wss, "connection");

      const ws = new WebSocket(endpoint);
      const open = on(ws, "open");
      for await (const event of connection) {
        assertNotEquals(event, undefined);
        break;
      }
      for await (const event of open) {
        await wss.close();
        await ws.close();
        break;
      }
    },
  },
);
