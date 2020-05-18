import { EventEmitter } from "https://deno.land/std/node/events.ts";
import { serve } from "https://deno.land/std/http/server.ts";
import {
  acceptWebSocket,
  isWebSocketCloseEvent,
  isWebSocketPingEvent,
  connectWebSocket,
  WebSocket as STDWebSocket,
} from "https://deno.land/std/ws/mod.ts";
import {
  MessageWSEvent,
  CloseWSEvent,
  OpenWSEvent,
  ErrorWSEvent,
} from "./event.ts";

export class WebSocketServer extends EventEmitter {
  constructor(private port: Number = 8080) {
    super();
    this.connect();
  }
  async connect() {
    for await (const req of serve(`:${this.port}`)) {
      const { conn, r: bufReader, w: bufWriter, headers } = req;
      try {
        const sock = await acceptWebSocket({
          conn,
          bufReader,
          bufWriter,
          headers,
        });
        console.log("socket connected!");
        const ws: WebSocket = new WebSocket();
        ws.open(sock);
        this.emit("connection", ws);
        
      } catch (err) {
        console.error(`failed to accept websocket: ${err}`);
        await req.respond({ status: 400 });
      }
    }
  }
}

export class WebSocket extends EventEmitter {
  webSocket?: STDWebSocket;
  constructor(private endpoint?: string) {
    super();
    if (this.endpoint !== undefined) {
      this.createSocket(endpoint);
    }
  }
  async createSocket(endpoint?: string) {
    const webSocket = await connectWebSocket(this.endpoint!);
    this.open(webSocket);
  }
  async open(sock: STDWebSocket) {
    this.webSocket = sock;
    this.emit("open");
    try {
      for await (const ev of sock) {
        if (typeof ev === "string") {
          // text message
          this.emit("message", new MessageWSEvent(ev, this));
        } else if (ev instanceof Uint8Array) {
          // binary message
          this.emit("message", new MessageWSEvent(ev, this));
        } else if (isWebSocketPingEvent(ev)) {
          const [, body] = ev;
          // ping
          this.emit("ping", new MessageWSEvent(body, this));
        } else if (isWebSocketCloseEvent(ev)) {
          // close
          const { code, reason } = ev;
          this.emit("close", new CloseWSEvent(code, reason, this));
        }
      }
    } catch (err) {
      this.emit("close", new ErrorWSEvent(err, this));
      if (!sock.isClosed) {
        await sock.close(1000).catch(console.error);
      }
    }
  }
  async ping(message?: string | Uint8Array){
    return this.webSocket?.ping(message);
  }
  async send(message: string | Uint8Array) {
    return this.webSocket?.send(message)
  }
  async close(code: number): Promise<void> {
    return this.webSocket?.close(code);
  }
  get isClosed(): boolean | undefined {
    return this.webSocket?.isClosed;
  }
}
