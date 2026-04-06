import { Elysia } from "elysia";
import { getAlerts } from "./data/db.js";

const app = new Elysia()
  .get("/api/alerts", () => getAlerts())
  .listen(process.env.API_PORT ?? 3001);

console.log(`API server running on port ${process.env.API_PORT ?? 3001}`);
