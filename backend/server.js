import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { getAlerts } from "./data/db.js";
import { EventEmitter } from "events";

export const emitter = new EventEmitter();
emitter.setMaxListeners(50); // one per connected dashboard client

export const getCameraUrl = () => cameraUrl;
let cameraUrl = null;

const app = new Elysia()
  .use(cors())

  .get("/api/alerts", () => getAlerts())

  .post("/api/camera/register", ({ body }) => {
    console.log("body", body);
    const ip = body?.ip;
    console.log("ip", ip);
    if (!ip) {
      console.error(
        "Camera registration failed: IP address missing in request body",
      );
      return { ok: false, error: "IP address is required" };
    }

    cameraUrl = `http://${body.ip}`;
    console.log(`Camera registered at ${cameraUrl}`);
    return { ok: true };
  })

  .get("/api/alerts/stream", ({ set }) => {
    set.headers["content-type"] = "text/event-stream";
    set.headers["cache-control"] = "no-cache";
    set.headers["connection"] = "keep-alive";

    return new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();

        const send = (data) => {
          try {
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          } catch (err) {
            emitter.off("alert", onAlert);
            console.error("Error while enqueueing data:", err);
          }
        };

        const onAlert = (alert) => {
          send(JSON.stringify(alert));
        };

        emitter.on("alert", onAlert);
        send("connected");
      },
    });
  })
  .listen(process.env.API_PORT ?? 3001);

console.log(`API server running on port ${process.env.API_PORT ?? 3001}`);
