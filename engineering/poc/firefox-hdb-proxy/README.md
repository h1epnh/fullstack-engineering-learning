# firefox-hdb-proxy (HDB Proxy)

A Firefox add-on plus a small macOS helper. Together they send `*.hdbank.com.vn` through the **wired RJ45 adapter**, and everything else keeps using **Wi-Fi**.

```
Firefox ──proxy.onRequest──┬─ *.hdbank.com.vn (minus excludes) ─► SOCKS5 127.0.0.1:1080 ─► hdb-proxy ─► en10 (RJ45) ─► HDBank LAN
                           ├─ excluded (e.g. grafana.hdbank.com.vn) ─► direct ─────────────────────────► default route (Wi-Fi en0)
                           └─ anything else ──────────────────────► direct ─────────────────────────► default route (Wi-Fi en0)
```

## Why two pieces

Firefox add-ons can't choose a network interface. They can only decide which **proxy** handles each request. So the work is split:

| Piece | Job |
| --- | --- |
| `extension/` | Matches hostnames and sends matches to the local SOCKS5 proxy with `proxyDNS: true`. Polls the helper's `/status` every 5 s, shows a toolbar badge (`LAN` / `!` / `WiFi` / `off`), and has a popup and a settings page. |
| `helper/` (Go, no dependencies) | A SOCKS5 server. Every outgoing socket gets `IP_BOUND_IF` set to the wired interface, so it leaves through RJ45 even though Wi-Fi ranks first in the routing table. Hostnames are resolved with **that interface's DNS servers**, taken from `scutil --dns`. |

DNS matters as much as routing. HDBank's LAN DNS (10.0.26.77/88) gives **internal** addresses for `hdbank.com.vn` (10.x). Google DNS over Wi-Fi gives the public ones (35.71.x / 52.223.x). With `proxyDNS`, Firefox never resolves these names itself.

The helper finds the wired port on its own: the first `Ethernet`/`LAN` hardware port from `networksetup -listallhardwareports` that is up and has an IPv4 address. It re-checks every 5 s, so unplugging the cable, a new DHCP lease, or swapping USB adapters needs no restart.

## Install

### 1. Start the helper (SOCKS5 server)

```bash
cd helper && ./install.sh            # or ./install.sh -iface en10 -dns 10.0.26.77,10.0.26.88
curl -s http://127.0.0.1:1081/status # {"up":true,"interface":"en10","ip":"10.0.117.84","dns":[...]}
```

This installs a launchd agent that starts at login and restarts if it crashes — do this once. The `curl` above should return `"up":true`; if not, run `cd helper && ./install.sh` again and check the wired adapter is actually plugged in and has an IPv4 address.

### 2. Load the add-on into Firefox

**Quick way (temporary — removed when Firefox restarts):**

1. Open Firefox, type `about:debugging#/runtime/this-firefox` in the address bar, press Enter.
2. Click **"Load Temporary Add-on…"**.
3. In the file picker, navigate to this folder's `extension/` subfolder and select **`manifest.json`**.
4. The add-on now appears in the list with a toolbar icon (🔌/badge) — click it to see the popup status.

Repeat step 2-4 every time Firefox restarts (temporary add-ons don't persist).

**Persistent way (survives restarts) — pick one:**

- **Sign it yourself**: `npx web-ext sign --channel unlisted` (needs free AMO API keys from [addons.mozilla.org/developers](https://addons.mozilla.org/developers/)), then double-click the resulting signed `.xpi` to install, or drag it into a Firefox window.
- **Firefox Developer Edition / Nightly only**: set `xpinstall.signatures.required` to `false` in `about:config`, then install the existing `hdb-proxy.xpi` in this folder directly (drag it into the window, or `about:addons` → gear icon → "Install Add-on From File…").

### 3. (Optional) Allow it in Private Windows

Private windows don't run add-ons by default. If you need HDBank sites proxied there too: `about:addons` → **HDB Proxy** → enable **"Run in Private Windows"**.

### 4. Check it's working

Click the toolbar badge — it should read **LAN** (green) once the helper is up and a matching site is open. Open Settings (right-click the icon → *Manage Extension* → *Preferences*, or the gear in the popup) to review/edit the domain lists below.

## Settings

| Setting | Default | Notes |
| --- | --- | --- |
| Enabled | on | ON/OFF switch in the popup header (also in Settings). OFF sends every site direct over Wi-Fi. |
| Domains | `*.hdbank.com.vn` | `*.x` matches `x` and every subdomain. A bare host matches only itself. |
| Excluded domains | `grafana.hdbank.com.vn` | Checked **before** Domains above — a match here always stays on Wi-Fi, even if it also matches a routed pattern. Same `*.x` syntax. |
| Fall back to Wi-Fi | **off** | When off and the cable is unplugged, HDBank requests fail instead of leaving over Wi-Fi. When on, they go direct while the LAN is down. |
| Helper host / port / status URL | `127.0.0.1:1080`, `http://127.0.0.1:1081/status` | Must match the helper's `-listen` / `-status` flags. |

## Helper flags

```
-listen 127.0.0.1:1080   SOCKS5 listen address
-status 127.0.0.1:1081   status endpoint (empty disables)
-iface  ""               force an interface, e.g. en10 (default: auto-detect)
-dns    ""               force DNS servers reached over that interface (default: scutil --dns)
```

## Verify

```bash
cd helper && go test ./... && cd .. && node --test test/*.test.js
# The proxied download should arrive on en10, the direct one on en0:
netstat -I en10 -b; curl -s --socks5-hostname 127.0.0.1:1080 -o /dev/null 'https://speed.cloudflare.com/__down?bytes=3000000'; netstat -I en10 -b
```

## Limits

- macOS only (`IP_BOUND_IF`). On Linux the same idea would use `SO_BINDTODEVICE`.
- Firefox only. Other apps and browsers keep using the OS routing table.
- Only IPv4 TCP is proxied (SOCKS5 CONNECT). WebRTC/UDP from HDBank pages isn't routed.
- The helper accepts connections from any local process on 127.0.0.1, with no auth.

Uninstall: `helper/uninstall.sh`, then remove the add-on.
