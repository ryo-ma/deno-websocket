import {
  encode,
  BufReader,
  TextProtoReader,
  blue, green, red, yellow
} from "./deps.ts";
import { WebSocket } from "../lib/websocket.ts";

const endpoint = Deno.args[0] || "ws://127.0.0.1:8080";

const ws: WebSocket = new WebSocket(endpoint);
ws.on("open", function() {
  Deno.stdout.write(encode(green("ws connected! (type 'close' to quit)\n")));
  Deno.stdout.write(encode("> "));
});
ws.on("message", function (message: string) {
  Deno.stdout.write(encode(`${message}\n`));
  Deno.stdout.write(encode("> "));
});

/** simple websocket cli */
try {
  const cli = async (): Promise<void> => {
    const tpr = new TextProtoReader(new BufReader(Deno.stdin));
    while (true) {
      const line = await tpr.readLine();
      if (line === null || line === "close") {
        break;
      } else if (line === "ping") {
        await ws.ping();
      } else {
        await ws.send(line);
      }
    }
  };
  await cli().catch(console.error);
  if (!ws.isClosed) {
    await ws.close(1000).catch(console.error);
  }
} catch (err) {
  Deno.stderr.write(encode(red(`Could not connect to WebSocket: '${err}'`)));
}
Deno.exit(0);
