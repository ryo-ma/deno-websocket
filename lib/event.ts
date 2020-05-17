import { WebSocket } from "./websocket.ts";

export class WSEvent {
  type: string;
  target: WebSocket;

  constructor(type: string, target: WebSocket) {
    this.type = type;
    this.target = target;
  }
}

export class MessageWSEvent extends WSEvent {
  data: string | Uint8Array;
  constructor(data: string | Uint8Array, target: WebSocket) {
    super("message", target);
    this.data = data;
  }
}

export class CloseWSEvent extends WSEvent {
  code: Number;
  reason: string | undefined;
  constructor(
    code: Number,
    reason: string | undefined,
    target: WebSocket,
  ) {
    super("close", target);
    this.code = code;
    this.reason = reason;
  }
}

export class OpenWSEvent extends WSEvent {
  constructor(target: WebSocket) {
    super("open", target);
  }
}

export class ErrorWSEvent extends WSEvent {
  message: string;
  error: Error;
  constructor(error: Error, target: WebSocket) {
    super("open", target);
    this.error = error;
    this.message = this.error.message;
  }
}
