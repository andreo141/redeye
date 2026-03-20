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

client.on("message", (topic, payload) => {
  const data = JSON.parse(payload.toString());

  if (data.occupancy === true) {
    sendTelegram(
      `Motion detected in Bergkot at ${new Date().toLocaleTimeString("nl-BE")}!`,
    );
  }
});

async function sendTelegram(message) {
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
        }),
      },
    );

    if (!res.ok) console.error("Telegram error:", await res.text());
  } catch (err) {
    console.error("Failed to send Telegram message.");
  }
}
