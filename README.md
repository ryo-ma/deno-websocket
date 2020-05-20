# Deno WebSocket
🦕A simple WebScoket library like [ws of node.js library](https://github.com/websockets/ws) for deno

# Quick Start

## Example

server

```bash
$ deno run --allow-net https://deno.land/x/websocket/example/server.ts 
```

client

```bash
$ deno run --allow-net https://deno.land/x/websocket/example/client.ts 
> ws connected! (type 'close' to quit)
> something
```

## Usage

server

```typescript
import { WebSocket, WebSocketServer } from "https://deno.land/x/websocket/mod.ts";

const wss = new WebSocketServer(8080);
wss.on("connection", function (ws: WebSocket) {
  ws.on("message", function (message: string) {
    console.log(message);
    ws.send(message)
  });
});

```

client

```typescript
import { WebSocket } from "https://deno.land/x/websocket/mod.ts";
const endpoint = "ws://127.0.0.1:8080";
const ws: WebSocket = new WebSocket(endpoint);
ws.on("open", function() {
  console.log("ws connected!");
});
ws.on("message", function (message: string) {
  console.log(message);
});
ws.send("something");
```

# Documentation

## Event

### WebSocketServer

| event | detail|
| --- | --- |
| connection | Emitted when the handshake is complete |


### WebSocket

| event | detail|
| --- | --- |
| open | Emitted when the connection is established |
| close | Emitted when the connection is closed |
| message | Emitted when a message is received from the server |
| ping | Emitted when a ping is received from the server |
| pong | Emitted when a pong is received from the server |
| error | Emitted when an error occurs |
