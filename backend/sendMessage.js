import mqtt from 'mqtt'

const client = mqtt.connect('mqtt://mosquitto:1883')
const token = process.env.TELEGRAM_TOKEN
const chatId = process.env.TELEGRAM_CHAT_ID

client.on('connect', () => {
  client.subscribe('zigbee2mqtt/Motion Sensor 1')
})

client.on('message', (topic, payload) => {
  const data = JSON.parse(payload.toString())
  
  if (data.occupancy === true) {
    sendTelegram(`Motion detected in Bergkot at ${new Date().toLocaleTimeString('nl-BE')}!`)
  }
})

async function sendTelegram(message) {
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message
    })
  })
}
