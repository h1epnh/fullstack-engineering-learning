/* global DEFAULTS, hostMatches */

const POLL_MS = 5000;

let settings = { ...DEFAULTS };
let lanStatus = { up: false, error: "not checked yet", checkedAt: 0 };

// Returns "lan", "wifi", or "blocked" (matched, LAN down, no fallback).
function routeFor(host) {
  if (!settings.enabled || !hostMatches(host, settings.patterns)) return "wifi";
  if (lanStatus.up) return "lan";
  return settings.fallbackToWifi ? "wifi" : "blocked";
}

// Registered synchronously so no request slips through before settings finish loading.
browser.proxy.onRequest.addListener(
  (details) => {
    let host;
    try {
      host = new URL(details.url).hostname;
    } catch {
      return { type: "direct" };
    }
    const route = routeFor(host);
    if (route === "wifi") return { type: "direct" };

    const socks = {
      type: "socks",
      host: settings.proxyHost,
      port: settings.proxyPort,
      proxyDNS: true, // hostname goes to the helper, which resolves it with the LAN's DNS servers
      failoverTimeout: 3,
    };
    // "blocked" still points at the helper: the request errors out instead of leaking over Wi-Fi.
    return route === "lan" && settings.fallbackToWifi ? [socks, { type: "direct" }] : socks;
  },
  { urls: ["<all_urls>"] }
);

browser.proxy.onError.addListener((error) => {
  console.warn("proxy error:", error.message);
  refreshStatus();
});

async function loadSettings() {
  settings = await browser.storage.local.get(DEFAULTS);
}

async function refreshStatus() {
  try {
    const res = await fetch(settings.statusUrl, { cache: "no-store", signal: AbortSignal.timeout(2000) });
    const body = await res.json();
    lanStatus = { ...body, up: Boolean(body.up), checkedAt: Date.now() };
  } catch (e) {
    lanStatus = { up: false, error: `helper unreachable (${e.message})`, checkedAt: Date.now() };
  }
  updateBadge();
}

function updateBadge() {
  let text, color, title;
  if (!settings.enabled) {
    [text, color, title] = ["off", "#8a8a8a", "Disabled: everything uses the default route (Wi-Fi)"];
  } else if (lanStatus.up) {
    [text, color, title] = ["LAN", "#1a7f37", `HDBank → ${lanStatus.interface} (${lanStatus.ip})`];
  } else {
    [text, color, title] = [
      settings.fallbackToWifi ? "WiFi" : "!",
      settings.fallbackToWifi ? "#bf8700" : "#cf222e",
      `LAN down: ${lanStatus.error}`,
    ];
  }
  browser.browserAction.setBadgeText({ text });
  browser.browserAction.setBadgeBackgroundColor({ color });
  browser.browserAction.setTitle({ title: `HDB Proxy: ${title}` });
}

browser.runtime.onMessage.addListener(async (msg) => {
  if (msg?.type === "getState") {
    // Reload first: the popup may have just flipped the toggle, racing storage.onChanged.
    await loadSettings();
    if (msg.refresh) await refreshStatus();
    else updateBadge();
    return { settings, lanStatus, route: msg.host ? routeFor(msg.host) : null };
  }
});

browser.storage.onChanged.addListener(async (_changes, area) => {
  if (area !== "local") return;
  await loadSettings();
  await refreshStatus();
});

loadSettings().then(refreshStatus);
setInterval(refreshStatus, POLL_MS);
