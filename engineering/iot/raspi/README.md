# Raspberry Pi 3B — IoT Hub

Source-of-truth backup of everything configured on the Raspberry Pi that
supports the [esp8266-mqtt](../arduino/esp8266-mqtt) project: MQTT broker,
time-series storage, dashboard, and an Alexa voice-announcement integration.

## Hardware / OS

- Raspberry Pi 3B, Debian GNU/Linux 13 (trixie), hostname `hiep`
- Static IP: `192.168.1.10` (gateway `192.168.1.1`, subnet `255.255.255.0`)
- SSH: `ssh admin@192.168.1.10`

> ⚠️ The `admin` account currently uses the password `admin`. Change this
> (`passwd`) before exposing the Pi to anything beyond a trusted home LAN.

## Architecture

```
ESP8266 ──MQTT──▶ Mosquitto (native) ──▶ Telegraf ──▶ InfluxDB ──▶ Grafana :3000
                       │
                       └──▶ alexa-motion-announcer (Node.js) ──▶ Echo Dot
                                                                  (speak, English only)
```

ESP8266 also sends Telegram alerts directly over HTTPS (not via the Pi) — see
the ESP8266 project's own README for that part.

## Static IP

Debian 13 here manages networking through **NetworkManager** with a netplan
backend (connection profiles under `/etc/netplan/90-NM-*.yaml` are
auto-generated snapshots of NetworkManager's state — edit via `nmcli`, not
the YAML directly).

```bash
nmcli connection show                     # find the active Wi-Fi connection name
sudo nmcli connection modify "<connection-name>" \
  ipv4.addresses 192.168.1.10/24 \
  ipv4.gateway 192.168.1.1 \
  ipv4.dns 192.168.1.1 \
  ipv4.method manual
sudo nmcli connection up "<connection-name>"
```

## Mosquitto (MQTT broker)

Installed from Debian's default repo (`sudo apt install mosquitto
mosquitto-clients`). By default it only listens on `127.0.0.1`; the LAN
listener is added via [`mosquitto/local.conf`](mosquitto/local.conf), copied
to `/etc/mosquitto/conf.d/local.conf`:

```bash
sudo cp mosquitto/local.conf /etc/mosquitto/conf.d/local.conf
sudo systemctl restart mosquitto
```

`allow_anonymous true` and plaintext port 1883 are fine for a home LAN lab
only — add `password_file`/`acl_file` and a TLS listener on 8883 for
anything more exposed.

## InfluxDB 2.x

Installed from InfluxData's official apt repo (not yet in Debian trixie's
own repos at time of setup):

```bash
curl -sL https://repos.influxdata.com/influxdata-archive.key | sudo gpg --dearmor -o /usr/share/keyrings/influxdata-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/influxdata-archive-keyring.gpg] https://repos.influxdata.com/debian stable main" | sudo tee /etc/apt/sources.list.d/influxdata.list
sudo apt update && sudo apt install -y influxdb2
sudo systemctl enable --now influxdb
```

Initial org/bucket/token setup:

```bash
influx setup \
  --username admin \
  --password <your-password> \
  --org esp8266-lab \
  --bucket sensors \
  --token <generate-your-own-token> \
  --host http://localhost:8086
```

Use that same org/bucket/token in `telegraf.conf` and the Grafana datasource
below (both files in this repo have the token replaced with
`REPLACE_WITH_YOUR_INFLUXDB_TOKEN` — never commit the real one).

## Telegraf

Installed from the same InfluxData repo as above (`sudo apt install
telegraf`). Config: [`telegraf/telegraf.conf`](telegraf/telegraf.conf) — one
`mqtt_consumer` input per sensor topic (`data_format = "value"`, since the
ESP8266 publishes plain numeric strings, not JSON), one `influxdb_v2` output.

```bash
sudo cp telegraf/telegraf.conf /etc/telegraf/telegraf.conf
# edit the token in place first
sudo systemctl enable --now telegraf
```

## Grafana

Installed from Grafana's official apt repo:

```bash
curl -sL https://apt.grafana.com/gpg.key | sudo gpg --dearmor -o /usr/share/keyrings/grafana.gpg
echo "deb [signed-by=/usr/share/keyrings/grafana.gpg] https://apt.grafana.com stable main" | sudo tee /etc/apt/sources.list.d/grafana.list
sudo apt update && sudo apt install -y grafana
```

Provisioning files (auto-load the datasource + dashboard on startup, no
manual UI clicking needed):

```bash
sudo mkdir -p /etc/grafana/provisioning/datasources /etc/grafana/provisioning/dashboards
sudo cp grafana/provisioning/datasources/influxdb.yaml /etc/grafana/provisioning/datasources/influxdb.yaml
# edit the token in place first
sudo cp grafana/provisioning/dashboards/dashboards.yaml /etc/grafana/provisioning/dashboards/dashboards.yaml
sudo cp grafana/provisioning/dashboards/esp8266-dashboard.json /etc/grafana/provisioning/dashboards/esp8266-dashboard.json
sudo chown -R grafana:grafana /etc/grafana/provisioning
sudo systemctl enable --now grafana-server
```

Dashboard **"ESP8266 Sensors"** (Temperature, Humidity, Motion timeline,
Motion-right-now stat) is then available at **http://192.168.1.10:3000**
(default login `admin`/`admin`, Grafana forces a password change on first
login).

> First boot is slow on a Pi 3B (SQLite migrations, ~1-2 min) — if
> `curl http://localhost:3000/api/health` doesn't return `200` immediately
> after starting the service, that's expected; give it a couple of minutes.

## Alexa Motion Announcer

[`alexa-motion-announcer/`](alexa-motion-announcer) is a small Node.js
service (systemd-managed) that subscribes to `sensors/esp8266/motion` on the
local broker and makes an Echo Dot speak "Motion detected" / "Motion
cleared" in English.

**Vietnamese TTS was attempted and abandoned — see Known limitations for
why**, in case anyone revisits this later.

### Getting Alexa credentials (one-time, do this on a machine with a browser — not the Pi)

Amazon requires a real browser login (captcha/2FA), so this can't be fully
scripted. Uses [`alexa-cookie2`](https://www.npmjs.com/package/alexa-cookie2):

```bash
mkdir alexa-auth && cd alexa-auth
npm init -y && npm install alexa-cookie2
```

```js
// login-proxy.js
const alexaCookie = require('alexa-cookie2');
const fs = require('fs');

alexaCookie.generateAlexaCookie('', '', {
    proxyOnly: true,
    proxyOwnIp: '127.0.0.1',   // must match the IP you open in the browser
    proxyPort: 3001,
    amazonPage: 'amazon.com',
    baseAmazonPage: 'amazon.com',
}, (err, result) => {
    if (result) fs.writeFileSync('./alexa-cookie.json', JSON.stringify(result, null, 2));
});
```

Run it, open `http://127.0.0.1:3001` in a browser, log into Amazon. On
success, `alexa-cookie.json` contains `loginCookie`, `refreshToken`,
`accessToken`, `macDms`, `deviceSerial`, etc.

**This file is a full Amazon account session — treat it like a password.**
Never commit it (already gitignored here), copy it over SSH (not anything
unencrypted), and set restrictive permissions (`chmod 600`).

The `refreshToken` itself doesn't have a fixed expiry (like staying logged
into the Alexa app) and `alexa-remote2` auto-refreshes the short-lived
`accessToken` using it, persisting updates back to the same file via the
`cookie` event. It only goes bad if: the Amazon password changes, Amazon
flags unusual activity, the app is deauthorized in Amazon account security
settings, or it sits unused for a very long time — in which case redo the
browser login.

### Finding your device serial

After `alexa.init(...)` succeeds, `alexa.serialNumbers` lists every device on
the account with `alexa.find(serial).accountName` — find your Echo Dot's
serial there and put it in `ECHO_DOT_SERIAL` in `motion-announcer.js`.

### Deploying to the Pi

```bash
sudo mkdir -p /opt/alexa-motion-announcer
sudo cp alexa-motion-announcer/motion-announcer.js /opt/alexa-motion-announcer/
sudo cp alexa-motion-announcer/package.json /opt/alexa-motion-announcer/
scp alexa-cookie.json admin@192.168.1.10:/tmp/   # from the machine where you logged in
sudo mv /tmp/alexa-cookie.json /opt/alexa-motion-announcer/
sudo chmod 600 /opt/alexa-motion-announcer/alexa-cookie.json
cd /opt/alexa-motion-announcer && sudo npm install
sudo cp alexa-motion-announcer/alexa-motion-announcer.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now alexa-motion-announcer
```

## Known limitations / TODO

- **No Vietnamese TTS on the Echo Dot — confirmed not feasible with this
  library/approach, not just "not yet done".** Alexa has no native
  Vietnamese voice. Three approaches were tried and all failed:
  1. `ssml`/`AlexaAnnouncement` sequence command with `<audio src="...">`
     pointing directly at Google Translate's free TTS endpoint — API
     accepts it (`success: true`) but the Echo plays nothing.
  2. Same, but self-hosting the MP3 via a Cloudflare Quick Tunnel
     (`cloudflared`) instead of linking Google's URL directly, to rule out
     Google blocking Amazon's server-side fetch — same silent failure.
  3. Re-encoding the MP3 to Amazon's documented spec (48kbps/24kHz/mono) in
     case the format itself was rejected — still silent failure.

  Root cause (confirmed by research, see citations): Amazon's
  `AlexaAnnouncement` node **does not support the `<audio>` SSML tag at
  all**, independent of hosting or format — see
  [alandtse/alexa_media_player wiki](https://github.com/alandtse/alexa_media_player/wiki/Configuration:-Notification-Component)
  ("SSML markup is supported (with the exception of the audio tag)") and
  [Apollon77/alexa-remote#17](https://github.com/Apollon77/alexa-remote/issues/17)
  (arbitrary S3-hosted audio also fails, maintainer calls it an unfixable
  limitation). A working alternative exists but wasn't pursued here:
  manually upload the phrase as a **Custom Sound via the Alexa app**, wrap
  it in a Routine, and trigger that Routine with `alexa.executeAutomationRoutine()`
  — reliable because it uses Alexa's own first-party feature instead of the
  audio-tag hack, at the cost of the phrase being fixed (not dynamic TTS)
  and needing one-time manual setup in the Alexa app. `cloudflared` and the
  pre-fetched MP3s were removed from the Pi after this was confirmed dead
  end; **English-only announcements are the current, final state.**
- **DHT22 temperature/humidity sensor** on the ESP8266 side has an
  unresolved intermittent read failure — see the ESP8266 project's README/
  history for the debugging trail. Temperature/humidity panels on the
  Grafana dashboard will stay empty until that's fixed.
- Motion → Telegram alerts are sent **only from the ESP8266 directly**, not
  from this Pi service (an earlier duplicate Telegram path from the Pi was
  intentionally removed to avoid double notifications).
- Resource headroom on this Pi 3B (905MB RAM) is tight with Mosquitto +
  InfluxDB + Telegraf + Grafana + the announcer all running together —
  expect some swap usage; keep future additions lightweight or consider a
  Pi 4/5 if more services are planned.
