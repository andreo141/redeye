import mqtt from "mqtt";

const client = mqtt.connect("mqtt://mosquitto:1883");
const token = process.env.TELEGRAM_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

client.on("connect", () => {
  console.log("Connected to MQTT broker");
  client.subscribe("zigbee2mqtt/motion-sensor-1");
});

client.on("close", function () {
  console.log("Disconnected from MQTT broker");
});

client.on("error", function (error) {
  console.error(`MQTT Error: ${error}`);
});

client.on("reconnect", function () {
  console.log("Reconnecting to MQTT broker...");
});

client.on("message", async (topic, payload) => {
  const data = JSON.parse(payload.toString());

  if (data.occupancy === true) {
    const photo = await getSnapshot();
    const message = `Motion detected in Bergkot at ${new Date().toLocaleTimeString("nl-BE")}!`;

    await sendTelegramMessageToBot(photo, message);
  }
});

async function getSnapshot() {
  try {
    const res = await fetch("redeye-cam.local/capture");
    const photo = await res.bytes();
    return new Blob([photo], { type: "image/jpeg" });
  } catch {
    console.error("Error while trying to fetch snapshot.");
  }
}

async function sendTextMessage(message) {
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
    }),
  });
  if (!res.ok) console.error("Telegram error:", await res.text());
}

async function sendPhoto(photo, message) {
  const form = new FormData();
  form.append("chat_id", chatId);
  form.append("photo", photo);
  form.append("caption", message);

  const res = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) console.error("Telegram error:", await res.text());
}

async function sendTelegramMessageToBot(photo, message) {
  try {
    if (!photo) {
      console.error("No snapshot available");
      await sendTextMessage(message);
    } else {
      await sendPhoto(photo, message);
    }
  } catch (err) {
    console.error("Failed to send Telegram message.");
  }
}
