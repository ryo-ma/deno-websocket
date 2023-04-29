<div align="center">
  <img src="https://raw.githubusercontent.com/ryo-ma/deno-websocket/master/.assets/logo.png" width="200" alt="logo"/>
</div>

# deno websocket

[![deno doc](https://img.shields.io/badge/deno-doc-informational?logo=deno)](https://doc.deno.land/https/deno.land/x/denon/mod.ts)
![GitHub](https://img.shields.io/github/license/ryo-ma/deno-websocket)
[![nest badge](https://nest.land/badge.svg)](https://nest.land/package/deno-websocket)

🦕 A simple WebSocket library like [ws of node.js library](https://github.com/websockets/ws) for deno

This library is wrapping the [ws standard library](https://github.com/denoland/deno_std/tree/main/ws) as a server-side and the [native WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) as a client-side. 
You can receive callbacks at the EventEmitter and can use the same object format on both the server-side and the client-side.


* Deno >= 1.8.3


# Quick Start

## Example Demo

![demo](https://user-images.githubusercontent.com/6661165/84665958-6df6d880-af5b-11ea-91b8-24c5122ddf9a.gif)

Server side

```bash
$ deno run --allow-net https://deno.land/x/websocket@v0.1.4/example/server.ts
```

Client side

```bash
$ deno run --allow-net https://deno.land/x/websocket@v0.1.4/example/client.ts
ws connected! (type 'close' to quit)
> something
```

## Usage

Server side

```typescript
import { WebSocketClient, WebSocketServer } from "https://deno.land/x/websocket@v0.1.4/mod.ts";

const wss = new WebSocketServer(8080);
wss.on("connection", function (ws: WebSocketClient) {
  ws.on("message", function (message: string) {
    console.log(message);
    ws.send(message);
  });
});

```

Client side

```typescript
import { WebSocketClient, StandardWebSocketClient } from "https://deno.land/x/websocket@v0.1.4/mod.ts";
const endpoint = "ws://127.0.0.1:8080";
const ws: WebSocketClient = new StandardWebSocketClient(endpoint);
ws.on("open", function() {
  console.log("ws connected!");
  ws.send("something");
});
ws.on("message", function (message: string) {
  console.log(message);
});
```

# Documentation

## WebSocketServer

### Event

| event | detail|
| --- | --- |
| connection | Emitted when the handshake is complete |
| error | Emitted when an error occurs |

### Field

| field | detail | type |
| --- | --- | --- |
| server.clients | A set that stores all connected clients | Set\<WebSocket\> |

### Method

| method | detail |
| --- | --- |
| close() | Close the server |

## WebSocketClient

### Event

| event | detail|
| --- | --- |
| open | Emitted when the connection is established |
| close | Emitted when the connection is closed |
| message | Emitted when a message is received from the server |
| ping | Emitted when a ping is received from the server |
| pong | Emitted when a pong is received from the server |
| error | Emitted when an error occurs |

### Field

| field | detail | type |
| --- | --- | --- |
| websocket.isClosed | Get the close flag | Boolean \| undefined |

### Method

| method | detail |
| --- | --- |
| send(message:string \| Unit8Array) | Send a message |
| ping(message:string \| Unit8Array) | Send the ping |
| close([code:int[, reason:string]]) | Close the connection with the server |
| forceClose() | Forcibly close the connection with the server |


# LICENSE
[MIT LICENSE](./LICENSE)
