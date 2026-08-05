import { Elysia, t } from "elysia";
import {
  getAlerts,
  getOccupancies,
  storeOccupancy,
  deleteOccupancy,
  getSetting,
  setSetting,
} from "./data/db.js";
import { logger } from "./logger.js";
import { staticPlugin } from "@elysiajs/static";

export const getCameraUrl = () => cameraUrl;
let cameraUrl = null;
let cameraEnabled = false;
let lastHeartbeat = null;
let lastRssi = null;

const app = new Elysia()
  .use(
    staticPlugin({
      assets: "./photos",
      prefix: "/api/photos",
    }),
  )

  .get("/api/settings", () => ({
    location: getSetting("location_name") ?? "Unknown location",
  }))
  .post(
    "/api/settings",
    ({ body }) => {
      if (body.location !== undefined) {
        setSetting("location_name", body.location);
      }
      return { ok: true };
    },
    {
      body: t.Object({
        location: t.Optional(t.String()),
      }),
    },
  )
  .get("/api/alerts", () => getAlerts())
  .get("/api/occupancies", () => getOccupancies())
  .post(
    "/api/occupancies",
    ({ body }) => {
      const location = getSetting("location_name") ?? "Unknown location";
      storeOccupancy(
        location,
        body.occupantName,
        body.arrivalDate,
        body.departureDate,
      );
      return { ok: true };
    },
    {
      body: t.Object({
        occupantName: t.String(),
        arrivalDate: t.String({ format: "date" }),
        departureDate: t.String({ format: "date" }),
      }),
    },
  )
  .delete("/api/occupancies/:id", ({ params }) => {
    deleteOccupancy(params.id);
    return { ok: true };
  })
  .post("/api/camera/heartbeat", ({ body }) => {
    const ip = body?.ip;
    if (!ip) return { ok: false };

    cameraUrl = `http://${ip}`;
    cameraEnabled = true;
    lastHeartbeat = Date.now();
    lastRssi = body?.rssi ?? null;

    return { ok: true };
  })
  .get("/api/camera/status", () => ({
    online: cameraEnabled,
    url: cameraUrl,
    lastHeartbeat: lastHeartbeat,
    lastRssi: lastRssi,
  }))
  .listen({
    port: process.env.API_PORT ?? 3001,
    hostname: "0.0.0.0",
  });

logger.info(`API server running on port ${process.env.API_PORT ?? 3001}`);

setInterval(() => {
  if (lastHeartbeat && Date.now() - lastHeartbeat > 60_000) {
    cameraEnabled = false;
    logger.warn("Camera heartbeat timeout — marking offline");
  }
}, 10_000);
