export { EventEmitter } from "https://deno.land/std@0.88.0/node/events.ts";
export { serve, Server } from "https://deno.land/std@0.88.0/http/server.ts";
export {
  acceptWebSocket,
  isWebSocketCloseEvent,
  isWebSocketPingEvent,
  isWebSocketPongEvent,
} from "https://deno.land/std@0.88.0/ws/mod.ts";

export type { WebSocket } from "https://deno.land/std@0.88.0/ws/mod.ts";
