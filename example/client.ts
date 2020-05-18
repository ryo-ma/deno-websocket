import { encode } from "https://deno.land/std/encoding/utf8.ts";
import { BufReader } from "https://deno.land/std/io/bufio.ts";
import { TextProtoReader } from "https://deno.land/std/textproto/mod.ts";
import { blue, green, red, yellow } from "https://deno.land/std/fmt/colors.ts";
import { WebSocket } from "../lib/websocket.ts";

const endpoint = Deno.args[0] || "ws://127.0.0.1:8080";

const ws: WebSocket = new WebSocket(endpoint);
ws.on("open", function() {
  console.log(green("ws connected! (type 'close' to quit)"));
});
ws.on("message", function (message: string) {
  console.log(message);
});

/** simple websocket cli */
try {
  const cli = async (): Promise<void> => {
    const tpr = new TextProtoReader(new BufReader(Deno.stdin));
    while (true) {
      await Deno.stdout.write(encode("> "));
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
  console.error(red(`Could not connect to WebSocket: '${err}'`));
}
Deno.exit(0);
