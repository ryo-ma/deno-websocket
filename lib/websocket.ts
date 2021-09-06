import { EventEmitter } from "./../deps.ts";
import { serve, Server } from "./../deps.ts";
import {
  acceptWebSocket,
  isWebSocketCloseEvent,
  isWebSocketPingEvent,
  isWebSocketPongEvent,
  WebSocket as DenoWebSocketType,
} from "./../deps.ts";

import { WebSocketError } from "./errors.ts";

export enum WebSocketState {
  CONNECTING = 0,
  OPEN = 1,
  CLOSING = 2,
  CLOSED = 3,
}

export class WebSocketServer extends EventEmitter {
  clients: Set<WebSocketAcceptedClient> = new Set<WebSocketAcceptedClient>();
  server?: Server = undefined;
  constructor(
    private port: Number = 8080,
    private realIpHeader: string | null = null,
  ) {
    super();
    this.connect();
  }
  async connect() {
    this.server = serve(`:${this.port}`);
    for await (const req of this.server) {
      const { conn, r: bufReader, w: bufWriter, headers } = req;
      try {
        const sock = await acceptWebSocket({
          conn,
          bufReader,
          bufWriter,
          headers,
        });
        if (this.realIpHeader && "hostname" in sock.conn.remoteAddr) {
          if (!req.headers.has(this.realIpHeader)) {
            this.emit(
              "error",
              new Error("specified real ip header does not exist"),
            );
          } else {
            sock.conn.remoteAddr.hostname =
              req.headers.get(this.realIpHeader) ||
              sock.conn.remoteAddr.hostname;
          }
        }
        const ws: WebSocketAcceptedClient = new WebSocketAcceptedClient(sock);
        this.clients.add(ws);
        this.emit("connection", ws, req.url);
      } catch (err) {
        this.emit("error", err);
        await req.respond({ status: 400 });
      }
    }
  }
  async close() {
    this.server?.close();
    this.clients.clear();
  }
}

export interface WebSocketClient extends EventEmitter {
  send(message: string | Uint8Array): void;
  ping(message?: string | Uint8Array): void;
  close(code: number, reason?: string): Promise<void>;
  closeForce(): void;
  isClosed: boolean | undefined;
}

export class WebSocketAcceptedClient extends EventEmitter
 implements WebSocketClient {
  state: WebSocketState = WebSocketState.CONNECTING;
  webSocket: DenoWebSocketType;
  constructor(sock: DenoWebSocketType) {
    super();
    this.webSocket = sock;
    this.open();
  }
  async open() {
    this.state = WebSocketState.OPEN;
    this.emit("open");
    try {
      for await (const ev of this.webSocket) {
        if (typeof ev === "string") {
          // text message
          this.emit("message", ev);
        } else if (ev instanceof Uint8Array) {
          // binary message
          this.emit("message", ev);
        } else if (isWebSocketPingEvent(ev)) {
          const [, body] = ev;
          // ping
          this.emit("ping", body);
        } else if (isWebSocketPongEvent(ev)) {
          const [, body] = ev;
          // pong
          this.emit("pong", body);
        } else if (isWebSocketCloseEvent(ev)) {
          // close
          const { code, reason } = ev;
          this.state = WebSocketState.CLOSED;
          this.emit("close", code);
        }
      }
    } catch (err) {
      this.emit("close", err);
      if (!this.webSocket.isClosed) {
        await this.webSocket.close(1000).catch((e) => {
          // This fixes issue #12 where if sent a null payload, the server would crash.
          if (
            this.state === WebSocketState.CLOSING && this.webSocket.isClosed
          ) {
            this.state = WebSocketState.CLOSED;
            return;
          }
          throw new WebSocketError(e);
        });
      }
    }
  }
  async ping(message?: string | Uint8Array) {
    if (this.state === WebSocketState.CONNECTING) {
      throw new WebSocketError(
        "WebSocket is not open: state 0 (CONNECTING)",
        );
    }
    return this.webSocket!.ping(message);
  }
  async send(message: string | Uint8Array) {
    try {
      if (this.state === WebSocketState.CONNECTING) {
        throw new WebSocketError(
          "WebSocket is not open: state 0 (CONNECTING)",
          );
      }
      return this.webSocket!.send(message);
    } catch (error) {
      this.state = WebSocketState.CLOSED;
      this.emit("close", error.message);
    }
  }
  async close(code = 1000, reason?: string): Promise<void> {
    if (
      this.state === WebSocketState.CLOSING ||
      this.state === WebSocketState.CLOSED
    ) {
      return;
    }
    this.state = WebSocketState.CLOSING;
    return this.webSocket!.close(code, reason!);
  }
  async closeForce() {
    if (
      this.state === WebSocketState.CLOSING ||
      this.state === WebSocketState.CLOSED
    ) {
      return;
    }
    this.state = WebSocketState.CLOSING;
    return this.webSocket!.closeForce();
  }
  get isClosed(): boolean | undefined {
    return this.webSocket!.isClosed;
  }
}

export class StandardWebSocketClient extends EventEmitter
  implements WebSocketClient {
  webSocket?: WebSocket;
  constructor(private endpoint?: string) {
    super();
    if (this.endpoint !== undefined) {
      this.webSocket = new WebSocket(endpoint!);
      this.webSocket.onopen = () => this.emit("open");
      this.webSocket.onmessage = (message) => this.emit("message", message);
      this.webSocket.onclose = () => this.emit("close");
      this.webSocket.onerror = () => this.emit("error");
    }
  }
  async ping(message?: string | Uint8Array) {
    if (this.webSocket?.readyState === WebSocketState.CONNECTING) {
      throw new WebSocketError(
        "WebSocket is not open: state 0 (CONNECTING)",
        );
    }
    return this.webSocket!.send("ping");
  }
  async send(message: string | Uint8Array) {
    if (this.webSocket?.readyState === WebSocketState.CONNECTING) {
      throw new WebSocketError(
        "WebSocket is not open: state 0 (CONNECTING)",
        );
    }
    return this.webSocket!.send(message);
  }
  async close(code = 1000, reason?: string): Promise<void> {
    if (
      this.webSocket!.readyState === WebSocketState.CLOSING ||
      this.webSocket!.readyState === WebSocketState.CLOSED
    ) {
      return;
    }
    return this.webSocket!.close(code, reason!);
  }
  closeForce(): void {
    throw new Error("Method not implemented.");
  }
  get isClosed(): boolean | undefined {
    return this.webSocket!.readyState === WebSocketState.CLOSING ||
      this.webSocket!.readyState === WebSocketState.CLOSED
  }
}
