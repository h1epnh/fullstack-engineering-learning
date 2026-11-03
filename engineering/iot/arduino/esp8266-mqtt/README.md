# ESP8266 Sensor + Relay → MQTT

Reads temperature/humidity from a DHT22 sensor and motion from a PIR (HC-SR501)
sensor on an ESP8266 board (NodeMCU v2 pinout), publishing to an MQTT broker.
Temperature/humidity publish every `PUBLISH_INTERVAL_MS`; motion publishes
immediately on state change (detected/cleared), not on the timer. A relay
switches ON when motion is detected and automatically switches OFF after
`RELAY_HOLD_MS` of no further motion (like a PIR-triggered light).

## Wiring

| DHT22 pin | ESP8266 pin |
|-----------|-------------|
| VCC       | 3V3         |
| DATA      | D2 (configurable via `DHT_PIN`) |
| GND       | GND         |

A 10kΩ pull-up resistor between VCC and DATA is recommended if your DHT22 module
doesn't already have one built in.

| HC-SR501 pin | ESP8266 pin |
|--------------|-------------|
| VCC          | 3V3 (see note below) |
| OUT          | D5 (configurable via `PIR_PIN`) |
| GND          | GND         |

> HC-SR501 is spec'd for 4.5–20V, but most clones work fine off 3.3V with a
> slightly shorter detection range. 3V3 is used here deliberately instead of
> VIN/5V to keep the OUT signal within the ESP8266 GPIO's safe voltage range —
> some clones pass VCC-level voltage straight through to OUT, which would be
> out of spec for a GPIO if powered from 5V.

| Relay module pin | ESP8266 pin |
|-------------------|-------------|
| S (signal)        | D1 (configurable via `RELAY_PIN`) |
| +                  | VIN (5V) |
| -                  | GND         |

This is for a 3-pin S/+/- transistor-driven relay module (not an
optocoupler-isolated board). The `+`/`-` power pins are safe to power from
VIN/5V regardless of the signal pin's voltage — the risk of exceeding a GPIO's
safe voltage only applies to a sensor's *output* feeding back into the ESP8266
(as with the PIR above), not to a relay's power input, since the ESP8266 only
drives `S` as an output here. Most of these modules are active HIGH
(`RELAY_ACTIVE_LOW 0`, the default) — if your relay clicks ON at boot instead
of OFF, flip it to `1` in `config.h`.

| 16x2 I2C LCD pin | ESP8266 pin |
|-------------------|-------------|
| VCC                | VIN (5V)    |
| GND                | GND         |
| SDA                | D6 (configurable via `LCD_SDA_PIN`) |
| SCL                | D7 (configurable via `LCD_SCL_PIN`) |

D6/D7 are used instead of the ESP8266's usual default I2C pins (D1/D2)
because those are already taken by the relay and DHT22. If nothing shows up,
most of these backpacks use I2C address `0x27` or `0x3F` — try the other one
in `config.h` if the default doesn't work.

**Layout:** two pages, plus a motion overlay:
- **Date/time page** (default) — row 2 is a live clock (`HH:MM:SS`, synced via
  NTP, ticks every second — shows "Syncing time..." until the first NTP
  response comes back). Row 1 alternates every `DATE_SUB_INTERVAL_MS` (4s, in
  `main.cpp`) between the solar date (`DD/MM/YYYY DL`) and the Vietnamese
  lunar date (`DD/MM/YYYY AL`) — see "Lunar calendar" below. Shown for
  `LCD_DATETIME_DURATION_MS` (10s) before rotating to the sensor page.
- **Sensor page** — row 1 temperature, row 2 humidity. Shown for
  `LCD_SENSOR_DURATION_MS` (3s), then back to the date/time page.
- **Motion overlay** — not part of the rotation. The instant motion is
  detected or cleared, both rows switch to "Motion" / "DETECTED" or
  "CLEARED" for `MOTION_ALERT_MS` (3s, in `main.cpp`), then whichever page
  was showing before resumes exactly where it left off.

**Lunar calendar:** `VnLunar::convertSolar2Lunar()` in `main.cpp` is the
standard Hồ Ngọc Đức astronomical algorithm (new-moon/sun-longitude based,
widely used in Vietnamese calendar tools) — not a lookup table, so it's
correct for any year, not just a hardcoded range. It's astronomy-math-heavy
(several `sin()`/`floor()` calls, one loop up to 14 iterations), so it's only
recomputed once per calendar day (cached against the last solar date it ran
for) rather than every time the display switches to the lunar sub-page.

Each row is rewritten independently (padded to 16 chars, no full
`lcd.clear()`) so the per-second clock tick never makes the other row
flicker.

If the display is on (backlight lit, I2C address found via a scan) but no
text ever appears regardless of contrast or timing, suspect a solder bridge
between adjacent pins on the header connecting the I2C backpack to the LCD's
16-pin interface — check with a multimeter's continuity mode. This turned out
to be the actual cause during this project's own LCD bring-up.

## Setup

1. Install [PlatformIO](https://platformio.org/) (CLI or the VSCode extension).
2. Copy the config template and fill in your Wi-Fi/MQTT details:
   ```bash
   cp include/config.h.example include/config.h
   ```
3. Build and flash:
   ```bash
   pio run -t upload
   ```
4. Watch logs:
   ```bash
   pio device monitor -b 115200
   ```

## Static IP

The device sets a static IP on boot (`USE_STATIC_IP 1` in `config.h`) so its
address doesn't change across restarts — useful for MQTT broker ACLs, port
forwarding, or bookmarking the device. Defaults to `192.168.1.184` with gateway
`192.168.1.1` / subnet `255.255.255.0`; adjust `STATIC_IP`/`STATIC_GATEWAY`/
`STATIC_SUBNET`/`STATIC_DNS` in `config.h` to match your network, and make sure
the chosen IP is outside your router's DHCP range to avoid conflicts. Set
`USE_STATIC_IP` to `0` to fall back to DHCP.

## MQTT broker on Raspberry Pi 3B

The Pi acts as the local MQTT broker so the ESP8266 doesn't depend on the
internet or a laptop being on. Steps below (Raspberry Pi OS Bookworm/Bullseye).

**1. Find the Pi and get a shell**
```bash
ssh pi@raspberrypi.local   # or ssh pi@<current-dhcp-ip>
```

**2. Give the Pi a static IP**

Bookworm and newer (uses NetworkManager):
```bash
nmcli connection show                                  # find connection name, e.g. "Wired connection 1"
sudo nmcli connection modify "Wired connection 1" \
  ipv4.addresses 192.168.1.10/24 \
  ipv4.gateway 192.168.1.1 \
  ipv4.dns 192.168.1.1 \
  ipv4.method manual
sudo nmcli connection up "Wired connection 1"
```

Bullseye and older (uses dhcpcd), append to `/etc/dhcpcd.conf`:
```
interface eth0
static ip_address=192.168.1.10/24
static routers=192.168.1.1
static domain_name_servers=192.168.1.1
```
then `sudo reboot`.

**3. Install and configure Mosquitto**
```bash
sudo apt update
sudo apt install -y mosquitto mosquitto-clients
```
Create `/etc/mosquitto/conf.d/local.conf`:
```
listener 1883
allow_anonymous true
```
```bash
sudo systemctl enable mosquitto
sudo systemctl restart mosquitto
```

**4. Test the broker**

On the Pi itself:
```bash
mosquitto_sub -h localhost -t 'sensors/#' -v &
mosquitto_pub -h localhost -t sensors/test -m hello
```
From the Mac (same LAN):
```bash
mosquitto_sub -h 192.168.1.10 -t 'sensors/#' -v
```

**5. Point the ESP8266 at it**

Set `MQTT_BROKER_HOST` in `include/config.h` to the Pi's static IP
(`192.168.1.10` above), then `pio run -t upload`.

> `allow_anonymous true` and plaintext port 1883 are fine for a home LAN lab.
> For anything internet-facing, add `password_file`/`acl_file` and a TLS
> listener on 8883 instead.

## Telegram alerts

The ESP8266 calls the Telegram Bot API directly (HTTPS, `WiFiClientSecure` with
`setInsecure()` — no cert pinning, fine for a hobby alert bot) whenever motion
is detected or cleared, independent of MQTT/the Pi stack.

1. Message **@BotFather** on Telegram, `/newbot`, follow the prompts to get a
   bot token.
2. Message your new bot once (e.g. `/start`), then GET
   `https://api.telegram.org/bot<TOKEN>/getUpdates` and read the chat id from
   `"chat":{"id":...}` in the response.
3. Set `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` in `config.h`.

## Checking the board is alive

- `pio device list` — confirms the OS sees the USB-serial adapter and lets you
  identify which `/dev/cu.*` port the board is on.
- `pio device monitor -b 115200` after flashing — the sketch logs Wi-Fi connect,
  MQTT connect, and each published reading.
- Subscribe to the MQTT topics (`sensors/esp8266/temperature` and
  `.../humidity` by default) with `mosquitto_sub -h <broker> -t 'sensors/#' -v`
  to confirm data is actually arriving.

## Topics published

- `sensors/esp8266/temperature` — °C, one decimal place, every `PUBLISH_INTERVAL_MS`
- `sensors/esp8266/humidity` — %RH, one decimal place, every `PUBLISH_INTERVAL_MS`
- `sensors/esp8266/motion` — `1` (motion detected) / `0` (cleared), published
  immediately on state change

Topic names, pins, and the publish interval are all configurable in `config.h`.
