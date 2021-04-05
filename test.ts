import {
  assertEquals,
  assertNotEquals,
  assertThrowsAsync,
} from "./deps.ts";
import { StandardWebSocketClient, WebSocketServer, WebSocketError } from "./mod.ts";
import { on } from "./deps.ts";

const endpoint = "ws://127.0.0.1:8080";

Deno.test(
  {
    name: "Connect to the server",
    async fn(): Promise<void> {
      const wss = new WebSocketServer(8080);
      const connection = on(wss, "connection");

      const ws = new StandardWebSocketClient(endpoint);
      assertEquals(ws.webSocket?.readyState, 0)
      const open = on(ws, "open");
      const event = await connection.next();
      assertNotEquals(event, undefined);

      await open.next();
      assertEquals(ws.webSocket?.readyState, 1)
      await ws.close();
      assertEquals(ws.webSocket?.readyState, 2)
      assertEquals(ws.isClosed, true)

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

      const ws1 = new StandardWebSocketClient(endpoint);
      const ws2 = new StandardWebSocketClient(endpoint);
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
      const ws = new StandardWebSocketClient(endpoint);
      const connection = on(wss, "connection");
      const open = on(ws, "open");
      await assertThrowsAsync(async (): Promise<void> => {
        await ws.send("message");
      }, WebSocketError, "WebSocket is not open: state 0 (CONNECTING)");

      await open.next();
      await connection.next();
      await ws.close();
      await wss.close();
    },
  },
);
