const ROUTE_LABELS = { lan: "RJ45", wifi: "Wi-Fi", blocked: "Blocked" };

const $ = (id) => document.getElementById(id);

function chip(route) {
  const span = document.createElement("span");
  span.className = `chip ${route}`;
  span.textContent = ROUTE_LABELS[route];
  return span;
}

// Maps settings + helper status to the status card: [state, title, detail].
function describe(settings, lanStatus) {
  if (!settings.enabled) return ["off", "Paused", "All sites use Wi-Fi"];
  if (lanStatus.up) return ["lan", "Routing over RJ45", `${lanStatus.interface} · ${lanStatus.ip}`];
  return settings.fallbackToWifi
    ? ["fallback", "LAN disconnected", "HDBank sites fall back to Wi-Fi"]
    : ["blocked", "LAN disconnected", "HDBank sites are blocked until the cable is back"];
}

async function render(refresh) {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  let host = null;
  try {
    host = new URL(tab.url).hostname || null;
  } catch {}

  const { settings, lanStatus, route } = await browser.runtime.sendMessage({ type: "getState", host, refresh });

  $("enabled").checked = settings.enabled;
  $("stateLabel").textContent = settings.enabled ? "ON" : "OFF";

  const [state, title, detail] = describe(settings, lanStatus);
  $("status").dataset.state = state;
  $("statusTitle").textContent = title;
  $("statusDetail").textContent = detail;

  if (host) {
    const name = document.createElement("span");
    name.textContent = `${host} `;
    $("tab").replaceChildren(name, chip(route));
  } else {
    $("tab").textContent = "–";
  }
  $("dns").textContent = lanStatus.dns?.length ? lanStatus.dns.join(", ") : "–";
  $("domains").textContent = settings.patterns.join(", ") || "–";

  $("error").hidden = !settings.enabled || lanStatus.up;
  $("error").textContent = lanStatus.error || "";
}

$("enabled").addEventListener("change", async (e) => {
  await browser.storage.local.set({ enabled: e.target.checked });
  render(true);
});
$("refresh").addEventListener("click", () => render(true));
$("options").addEventListener("click", () => {
  browser.runtime.openOptionsPage();
  window.close();
});

render(false);
