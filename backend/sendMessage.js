import mqtt from "mqtt";
import isCoolingDown from "./helpers/isCoolingDown.js";

const token = process.env.TELEGRAM_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;
const MQTT_BROKER = process.env.MQTT_BROKER_URL ?? "mqtt://mosquitto:1883";
const MQTT_TOPIC = process.env.MQTT_TOPIC ?? "zigbee2mqtt/motion-sensor-1";
const SNAPSHOT_URL =
  process.env.SNAPSHOT_URL ?? "http://redeye-cam.local/capture";
const SNAPSHOT_TIMEOUT_MS = 5000;

if (!token || !chatId) {
  console.error("FATAL: TELEGRAM_TOKEN and TELEGRAM_CHAT_ID must be set.");
  process.exit(1);
}

const mqttClient = mqtt.connect(MQTT_BROKER);

process.on("SIGTERM", () => mqttClient.end());
process.on("SIGINT", () => mqttClient.end());

mqttClient.on("connect", () => {
  console.log("Connected to MQTT broker");

  mqttClient.subscribe(MQTT_TOPIC, (err) => {
    if (err) console.error(`Failed to subscribe to ${MQTT_TOPIC}:`, err);
    else console.log(`Subscribed to MQTT topic: ${MQTT_TOPIC}`);
  });
});

mqttClient.on("close", () => {
  console.log("Disconnected from MQTT broker");
});

mqttClient.on("error", (error) => {
  console.error(`MQTT Error: ${error}`);
});

mqttClient.on("reconnect", () => {
  console.log("Reconnecting to MQTT broker...");
});

mqttClient.on("message", async (topic, payload) => {
  let data;

  try {
    data = JSON.parse(payload.toString());
  } catch {
    console.error("Failed to parse MQTT payload:", payload.toString());
    return;
  }

  if (data.occupancy !== true) return;
  if (isCoolingDown()) return;
  const detectionTime = new Date().toLocaleTimeString("nl-BE", {
    timeZone: "Europe/Brussels",
  });
  // TODO: replace with dynamic sensor location lookup
  const message = `Motion detected in Bergkot at ${detectionTime}!`;

  try {
    const sentMessageId = await sendTextMessage(message);
    const photo = await getSnapshot();
    if (photo) await sendPhoto(photo, message, sentMessageId);
  } catch (err) {
    console.error("Error while sending Telegram message:", err);
  }
});

async function getSnapshot() {
  try {
    const res = await fetch(SNAPSHOT_URL, {
      signal: AbortSignal.timeout(SNAPSHOT_TIMEOUT_MS),
    });

    if (!res.ok) throw new Error("Failed to fetch snapshot");

    return new Blob([await res.bytes()], { type: "image/jpeg" });
  } catch (err) {
    if (err.name === "TimeoutError") {
      console.error("Snapshot fetch timed out.");
    } else {
      console.error("Error while trying to fetch snapshot.", err);
    }
  }

  return null;
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

async function sendPhoto(photo, message, replyToMessageId) {
  const form = new FormData();
  form.append("chat_id", chatId);
  form.append("photo", photo);
  form.append("caption", message);

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
