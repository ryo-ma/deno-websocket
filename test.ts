import {
  assertEquals,
  assertThrows,
  assertNotEquals,
  assertThrowsAsync,
} from "https://deno.land/std/testing/asserts.ts";
import { WebSocket, WebSocketServer, WebSocketError } from "./mod.ts";
import { on } from "https://deno.land/std/node/events.ts";

const endpoint = "ws://127.0.0.1:8080";

Deno.test(
  {
    name: "Connect to the server",
    async fn(): Promise<void> {
      const wss = new WebSocketServer(8080);
      const connection = on(wss, "connection");

      const ws = new WebSocket(endpoint);
      const open = on(ws, "open");
      const event = await connection.next();
      assertNotEquals(event, undefined);

      await open.next();
      await ws.close();
      assertEquals(ws.isClosed, true);

      await wss.close();
    },
  },
);

Deno.test(
  {
    name: "Connect to the server from the two clients",
    async fn(): Promise<void> {
      const wss = new WebSocketServer(8080);
      const connection = on(wss, "connection");

      const ws1 = new WebSocket(endpoint);
      const ws2 = new WebSocket(endpoint);
      const open1 = on(ws1, "open");
      const open2 = on(ws2, "open");

      let event = await connection.next();
      assertNotEquals(event, undefined);
      event = await connection.next();
      assertNotEquals(event, undefined);

      await open1.next();
      await ws1.close();
      assertEquals(ws1.isClosed, true);

      await open2.next();
      await ws2.close();
      assertEquals(ws2.isClosed, true);

      await wss.close();
    },
  },
);
Deno.test(
  {
    name: "Fails connection to the server",
    async fn(): Promise<void> {
      const wss = new WebSocketServer(8080);
      const ws1 = new WebSocket(endpoint);
      const connection = on(wss, "connection");
      await assertThrowsAsync(async (): Promise<void> => {
        await ws1.send("message");
      }, WebSocketError, "WebSocket is not open: state 0 (CONNECTING)");

      await connection.next();
      await wss.close();
    },
  },
);
