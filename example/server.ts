import { WebSocket, WebSocketServer } from "../lib/websocket.ts";
import { MessageWSEvent } from "../lib/event.ts";

const wss = new WebSocketServer();
wss.on("connection", function (ws: WebSocket) {
  ws.on("message", function (message: MessageWSEvent) {
    console.log(message.data);
    ws.send(message.data)
  });
});