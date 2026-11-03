/* global DEFAULTS, normalizePatterns */

const $ = (id) => document.getElementById(id);

async function load() {
  const s = await browser.storage.local.get(DEFAULTS);
  $("enabled").checked = s.enabled;
  $("patterns").value = s.patterns.join("\n");
  $("proxyHost").value = s.proxyHost;
  $("proxyPort").value = s.proxyPort;
  $("statusUrl").value = s.statusUrl;
  $("fallbackToWifi").checked = s.fallbackToWifi;
  testHelper();
}

// Checks the status URL currently typed in, so a new port can be tried before saving.
async function testHelper() {
  const box = $("helperStatus");
  const url = $("statusUrl").value.trim() || DEFAULTS.statusUrl;
  delete box.dataset.up;
  $("helperText").textContent = "Checking helper…";
  try {
    const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(2000) });
    const s = await res.json();
    box.dataset.up = String(Boolean(s.up));
    $("helperText").textContent = s.up
      ? `Helper running · ${s.interface} (${s.ip}) · DNS ${s.dns?.join(", ") || "system"}`
      : `Helper running, but ${s.error}`;
  } catch (e) {
    box.dataset.up = "false";
    $("helperText").textContent = `Helper not reachable (${e.message}). Run helper/install.sh.`;
  }
}

$("test").addEventListener("click", testHelper);

$("save").addEventListener("click", async () => {
  await browser.storage.local.set({
    enabled: $("enabled").checked,
    patterns: normalizePatterns($("patterns").value.split("\n")),
    proxyHost: $("proxyHost").value.trim() || DEFAULTS.proxyHost,
    proxyPort: Number($("proxyPort").value) || DEFAULTS.proxyPort,
    statusUrl: $("statusUrl").value.trim() || DEFAULTS.statusUrl,
    fallbackToWifi: $("fallbackToWifi").checked,
  });
  $("saved").hidden = false;
  setTimeout(() => ($("saved").hidden = true), 1500);
  testHelper();
});

// Keep the page in sync when the popup toggle flips the add-on on or off.
browser.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && "enabled" in changes) $("enabled").checked = changes.enabled.newValue;
});

load();
