import { Elysia, t } from "elysia";
import {
  getAlerts,
  getOccupancies,
  storeOccupancy,
  deleteOccupancy,
  getCurrentOccupancy,
  getSetting,
  setSetting,
  setOverride,
  clearOverride,
} from "./data/db.js";
import { getArmedState } from "./helpers/getArmedState.js";
import { getToday } from "./helpers/today.js";
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
  .get("/api/status", () => {
    const location = getSetting("location_name") ?? "Unknown location";
    return getArmedState(location, getToday());
  })
  .post(
    "/api/override",
    ({ body }) => {
      const location = getSetting("location_name") ?? "Unknown location";
      const today = getToday();
      const occupancy = getCurrentOccupancy(location, today);
      const calendarState = occupancy === null ? "armed" : "disarmed";

      if (body.state === calendarState) {
        clearOverride(location);
        return { ok: true };
      }

      if (body.state === "disarmed") {
        const minutes = Number(getSetting("force_disarm_minutes")) || 60;
        const expiresAt = new Date(
          Date.now() + minutes * 60_000,
        ).toISOString();
        setOverride(location, "disarmed", expiresAt);
      } else {
        setOverride(location, "armed", null);
      }

      return { ok: true };
    },
    {
      body: t.Object({
        state: t.Union([t.Literal("armed"), t.Literal("disarmed")]),
      }),
    },
  )
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
