import mqtt from "mqtt";
import isCoolingDown from "./helpers/isCoolingDown.js";
import { storeAlert, getSetting } from "./data/db.js";
import { getCameraUrl } from "./server.js";
import { logger } from "./logger.js";
import { getArmedState } from "./helpers/getArmedState.js";

const token = process.env.TELEGRAM_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;
const MQTT_BROKER = process.env.MQTT_BROKER_URL ?? "mqtt://mosquitto:1883";
const MQTT_TOPIC = process.env.MQTT_TOPIC ?? "zigbee2mqtt/motion-sensor-1";
const CAMERA_TIMEOUT = 10000;

if (!token || !chatId) {
  logger.error("FATAL: TELEGRAM_TOKEN and TELEGRAM_CHAT_ID must be set.");
  process.exit(1);
}

const mqttClient = mqtt.connect(MQTT_BROKER);

process.on("SIGTERM", () => mqttClient.end());
process.on("SIGINT", () => mqttClient.end());

mqttClient.on("connect", () => {
  logger.info("Connected to MQTT broker");

  mqttClient.subscribe(MQTT_TOPIC, (err) => {
    if (err) logger.error({ err }, `Failed to subscribe to ${MQTT_TOPIC}:`);
    else logger.info(`Subscribed to MQTT topic: ${MQTT_TOPIC}`);
  });
});

mqttClient.on("close", () => {
  logger.info("Disconnected from MQTT broker");
});

mqttClient.on("error", (error) => {
  logger.error({ err: error }, `MQTT Error: ${error}`);
});

mqttClient.on("reconnect", () => {
  logger.info("Reconnecting to MQTT broker...");
});

mqttClient.on("message", async (topic, payload) => {
  let data;

  try {
    data = JSON.parse(payload.toString());
  } catch {
    logger.error("Failed to parse MQTT payload:", payload.toString());
    return;
  }

  if (data.occupancy !== true) return;

  if (isCoolingDown()) return;

  logger.info("Movement detected");

  const detectionTime = new Date().toLocaleTimeString("nl-BE", {
    timeZone: "Europe/Brussels",
  });
  const sensorLocation = getSetting("location_name") ?? "Unknown location";
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Europe/Brussels",
  });

  const { armed } = getArmedState(sensorLocation, today);

  if (!armed) {
    logger.info("Location is currently occupied. Alert not sent.");
    return;
  }

  const message = `Motion detected in ${sensorLocation} at ${detectionTime}!`;

  try {
    const sentMessageId = await sendTextMessage(message);
    const photo = await getSnapshot();
    const filename = photo ? await saveSnapshot(photo) : null;

    if (photo && filename) await sendPhoto(filename, sentMessageId);

    storeAlert(topic, sensorLocation, filename);
    logger.info({ filename, sentMessageId }, "Alert sent with photo");
  } catch (err) {
    logger.error({ err }, "Error while sending Telegram message:");
  }
});

async function getSnapshot() {
  const cameraUrl = getCameraUrl();

  if (!cameraUrl) {
    logger.error("No camera URL available.");
    return null;
  }

  try {
    const res = await fetch(`${cameraUrl}/capture`, {
      signal: AbortSignal.timeout(CAMERA_TIMEOUT),
    });

    if (!res.ok) throw new Error("Failed to fetch snapshot");

    return new Blob([await res.bytes()], { type: "image/jpeg" });
  } catch (err) {
    if (err.name === "TimeoutError") {
      logger.error("Snapshot fetch timed out.");
    } else {
      logger.error({ err }, "Error while trying to fetch snapshot.");
    }
    return null;
  }
}

async function saveSnapshot(imageBlob) {
  const filename = `${Date.now()}_${MQTT_TOPIC.replace(/\//g, "_")}.jpg`;
  try {
    await Bun.write(`./photos/${filename}`, imageBlob);
  } catch (err) {
    logger.error({ err }, "Failed to save snapshot:");
  }
  return filename;
}

async function sendTextMessage(message) {
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
    }),
  });

  if (!res.ok) {
    throw new Error(`Telegram sendMessage failed: ${await res.text()}`);
  }

  const data = await res.json();
  return data.result.message_id;
}

async function sendPhoto(filename, replyToMessageId) {
  const form = new FormData();
  form.append("chat_id", chatId);
  form.append("photo", Bun.file(`./photos/${filename}`));

  if (replyToMessageId)
    form.append("reply_to_message_id", String(replyToMessageId));

  const res = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    throw new Error(`Telegram sendPhoto failed: ${await res.text()}`);
  }
}
