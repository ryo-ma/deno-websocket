import { EventEmitter } from "https://deno.land/std/node/events.ts";
import { serve } from "https://deno.land/std/http/server.ts";
import {
  acceptWebSocket,
  isWebSocketCloseEvent,
  isWebSocketPingEvent,
} from "https://deno.land/std/ws/mod.ts";
import {
  MessageWSEvent,
  CloseWSEvent,
  OpenWSEvent,
  ErrorWSEvent,
} from "./event.ts";

export class WebSocket extends EventEmitter {
  constructor() {
    super();
  }
}

export class WebSocketServer extends WebSocket {
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
        this.emit("open", new OpenWSEvent(this));
        try {
          for await (const ev of sock) {
            if (typeof ev === "string") {
              // text message
              this.emit("message", new MessageWSEvent(ev, this));
              await sock.send(ev);
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
      } catch (err) {
        this.emit("close", new ErrorWSEvent(err, this));
        console.error(`failed to accept websocket: ${err}`);
        await req.respond({ status: 400 });
      }
    }
  }
}

export class WebSocketClient extends WebSocket {
  constructor(private endpoint: string) {
    super();
  }
}

new WebSocketServer(8000);