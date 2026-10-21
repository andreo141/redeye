## Getting started

Redeye runs as a set of Docker containers: Mosquitto (MQTT broker), Zigbee2MQTT, the backend, and the dashboard.

### Requirements

- Docker Compose
- A Zigbee USB dongle (tested with the Sonoff Zigbee 3.0 USB Dongle Plus V2)
- A Zigbee motion sensor
- A Telegram bot token and your Telegram chat ID
- A ESP32CAM (optional)

### 1. Create your `.env` files


```bash
cp .env.example .env
cp backend/.env.example backend/.env
```


### 2. Find your Zigbee dongle

```bash
ls -l /dev/serial/by-id/
```

Put the full path in the root `.env`:

```
ZIGBEE_GATEWAY_PATH=/dev/serial/by-id/usb-...-if00-port0
```

The by-id path is stable across reboots and USB ports, so prefer it. The same value is used for the container's device mapping and for Zigbee2MQTT's serial port, so there is only one place to set it.

**Where are you running Docker?** The right value depends on that:

| Setup | What to do |
|-------|-----------|
| Bare metal / Raspberry Pi | Plug in the dongle, use the by-id path above. |
| Proxmox VM | Add the dongle as a USB device on the VM first (Hardware → Add → USB Device), then follow the bare-metal steps inside the VM. |
| Proxmox LXC container | See below. By-id paths do **not** work here. |

#### Proxmox LXC

A container only sees devices the host hands to it.

1. On the Proxmox host, check that the dongle shows up: `ls -l /dev/serial/by-id/` (it points to `/dev/ttyUSB0`).
2. In the web UI: container → Resources → Add → Device Passthrough. Use `/dev/ttyUSB0` as the path (not the by-id path), and set the group ID to `20` (dialout) if the container is unprivileged. Or add `dev0: /dev/ttyUSB0,gid=20` to `/etc/pve/lxc/<CTID>.conf`.
3. Reboot the container, then check that `ls -l /dev/ttyUSB0` inside it starts with `c` (a real device). A line starting with `.` means an empty file, and the passthrough isn't working.
4. Set `ZIGBEE_GATEWAY_PATH=/dev/ttyUSB0` in the root `.env`.

> The compose file maps the device to the **same name** inside the container (`${ZIGBEE_GATEWAY_PATH}:${ZIGBEE_GATEWAY_PATH}`). Renaming it (for example to `/dev/ttyACM0`) fails inside an LXC.

### 3. Adapter type

Zigbee2MQTT can't auto-detect the adapter in every environment, so the type is set explicitly in the root compose file (`ZIGBEE2MQTT_CONFIG_SERIAL_ADAPTER`). The default is `ember`, which matches the Sonoff Dongle Plus V2 (ZBDongle-E). Other dongles may need another value such as `zstack`; check the [Zigbee2MQTT supported adapters](https://www.zigbee2mqtt.io/guide/adapters/) page for yours.

### 4. Telegram

- **Bot token:** create a bot with `@BotFather`.
- **Chat ID:** send your bot a message, then open `https://api.telegram.org/bot<TOKEN>/getUpdates` and look for `"chat":{"id":...}`. Or message `@userinfobot`.

Put both in `backend/.env`.

### 5. ESP32CAM
Working on the documentation. Coming soon!

### 5. Start

From the repo root:

```bash
docker compose up -d --build
```

Containers pick up `.env` changes when they are **recreated**, so use `up -d` after editing, not `restart`.

### 6. Pair your motion sensor

1. Open Zigbee2MQTT at `http://<host>:8080` and enable **Permit join (All)**.
2. Put the sensor in pairing mode (usually hold the button about 5 seconds).
3. Make sure its friendly name is exactly `motion-sensor-1`. The backend subscribes to `zigbee2mqtt/motion-sensor-1`.

### Back up these files

If these are lost, you have to redo the setup and re-pair every sensor:

- `zigbee2mqtt/data/` (especially `database.db` and `coordinator_backup.json`)
- Your `.env` files (they are not in git)

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `error gathering device information ... no such file or directory` | The dongle path in `.env` doesn't exist on this machine | Re-check `ls -l /dev/serial/by-id/`. On Proxmox, check the passthrough. |
| `mount src=/dev/ttyACM0 ... no such file or directory` | LXC can't rename the device | Use the same name on both sides of the device mapping (see above). |
| `USB adapter discovery error (No valid USB adapter found)` | Zigbee2MQTT needs an explicit port and adapter | Check `ZIGBEE2MQTT_CONFIG_SERIAL_PORT` and `_ADAPTER` in the compose file. |
| Backend restarts with `TELEGRAM_TOKEN and TELEGRAM_CHAT_ID must be set` | Missing values in `backend/.env` | Fill them in, then `docker compose up -d`. |
| Dashboard shows `502 Bad Gateway` on `/api/...` | Dashboard can't reach the backend | The proxy target defaults to `http://backend:3001`. Check that no stale `dashboard/.env` overrides `API_PROXY_TARGET`, then rebuild: `docker compose up -d --build dashboard`. |
| Alerts arrive but the dashboard shows "disarmed" or settings won't save | Same cause as the 502 above | See the previous row. |


## Development

For `bun run dev` in `dashboard/`, set `API_PROXY_TARGET` (for example `http://localhost:3001`) in `dashboard/.env`. In Docker it defaults to `http://backend:3001` and needs no setting.



## Screenshots
### Overview:
<img width="1470" height="812" alt="image" src="https://github.com/user-attachments/assets/7bdd4b13-d2ce-464b-82ac-0d8737030f92" />

### Occupancies
#### Selecting occupancy date
Select period when property will be  occupied
<img width="911" height="420" alt="image" src="https://github.com/user-attachments/assets/d38e55b8-51f6-478f-948c-ae70e300978c" />

#### Occupancy table populated
<img width="1470" height="807" alt="image" src="https://github.com/user-attachments/assets/ff9854fb-3009-44f6-920f-a8066d25d980" />

Redeye will not be functional during these periods.

It will also be reflected in the status pill and the overview

<img width="1247" height="166" alt="image" src="https://github.com/user-attachments/assets/7d665259-5e8b-4003-afa5-129968cb8a93" />



### Telegram Message:
<img width="590" height="1278" alt="F40FDE5F-6F55-411D-83D0-5ED3DB28EF4F" src="https://github.com/user-attachments/assets/2de21c7a-107a-46b7-ae66-91b7a9683562" />
