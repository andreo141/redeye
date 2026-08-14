import { Elysia, t } from "elysia";
import {
  getAlerts,
  getOccupancies,
  storeOccupancy,
  deleteOccupancy,
  getCurrentOccupancy,
  getSetting,
  setSetting,
  getOverride,
  setOverride,
} from "./data/db.js";
import { getLocation, getToday } from "./helpers/getters";
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
    location: getLocation(),
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
      storeOccupancy(
        getLocation(),
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
  .get("/api/override", () => getOverride(getLocation(), getToday()))
  .post(
    "/api/override",
    ({ body }) => {
      setOverride(getLocation(), body.state, body.set_at, body.expires_at);
      return { ok: true };
    },
    {
      body: t.Object({
        state: t.String("armed") || t.String("disarmed"),
        set_at: t.String(),
        expires_at: t.String(),
      }),
    },
  )
  .post("/api/camera/heartbeat", ({ body }) => {
    const ip = body?.ip;
    if (!ip) return { ok: false };

    cameraUrl = `http://${ip}`;
    cameraEnabled = true;
    lastHeartbeat = Date.now();
    lastRssi = body?.rssi ?? null;

    return { ok: true };
  })
  .get("/api/status", () => {
    const location = getLocation();
    const today = getToday();
    const occupancy = getCurrentOccupancy(location, today);

    return {
      armed: occupancy === null,
      occupancy,
    };
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
