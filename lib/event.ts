import { WebSocket } from './websocket.ts'


export class WSEvent {
  constructor(private type: string, private target: WebSocket) {}
}

export class MessageWSEvent extends WSEvent {
  constructor(private data: string | Uint8Array, target: WebSocket) {
    super("message", target);
  }
}

export class CloseWSEvent extends WSEvent {
  constructor(private code: Number, private reason: string, target: WebSocket) {
    super("close", target);
  }
}

export class OpenWSEvent extends WSEvent {
  constructor(target: WebSocket) {
    super("open", target);
  }
}

export class ErrorWSEvent extends WSEvent {
  private message: string;
  constructor(private error: Error, target: WebSocket) {
    super("open", target);
    this.message = this.error.message;
  }
}
