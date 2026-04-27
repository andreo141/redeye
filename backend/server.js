import { Elysia } from "elysia";
import { getAlerts } from "./data/db.js";
import { logger } from "./logger.js";
import { staticPlugin } from '@elysia/static'

export const getCameraUrl = () => cameraUrl;
let cameraUrl = null;
let cameraEnabled = false;

const app = new Elysia()
  .use(staticPlugin({
    assets: './photos',
    prefix: '/photos'
  }))

  .get("/api/alerts", () => getAlerts())

  .post("/api/camera/register", ({ body }) => {
    const ip = body?.ip;

    if (!ip) {
      return { ok: false, error: "IP address is required" };
    }

    cameraUrl = `http://${ip}`;
    logger.info(`Camera registered at ${cameraUrl}`);
    cameraEnabled = true;

    return { ok: true };
  })

  .get("/api/camera/status", () => ({
    online: cameraEnabled,
    url: cameraUrl,
  }))

  .listen({
    port: process.env.API_PORT ?? 3001,
    hostname: "0.0.0.0",
  });

logger.info(`API server running on port ${process.env.API_PORT ?? 3001}`);
