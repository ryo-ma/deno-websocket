# Deno WebSocket
🦕A simple WebScoket library like ws of node.js library

# Quick Start

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

## Example of cli

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