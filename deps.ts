export { EventEmitter } from "https://deno.land/std@0.65.0/node/events.ts";
export { Server, serve } from "https://deno.land/std@0.65.0/http/server.ts";
export {
  acceptWebSocket,
  isWebSocketCloseEvent,
  isWebSocketPingEvent,
  isWebSocketPongEvent,
  connectWebSocket,
} from "https://deno.land/std@0.65.0/ws/mod.ts";

export type {
  WebSocket,
} from "https://deno.land/std@0.65.0/ws/mod.ts";