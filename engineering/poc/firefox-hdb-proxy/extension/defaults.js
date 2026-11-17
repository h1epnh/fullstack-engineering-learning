// Settings defaults, shared by the background script and the options page.
const DEFAULTS = {
  enabled: true,
  patterns: ["*.hdbank.com.vn"],
  // Checked before `patterns` — a match here always stays on Wi-Fi even if it
  // also matches a routed pattern (e.g. grafana.hdbank.com.vn is reachable
  // fine over Wi-Fi and doesn't need the LAN hop).
  excludePatterns: ["grafana.hdbank.com.vn"],
  proxyHost: "127.0.0.1",
  proxyPort: 1080,
  statusUrl: "http://127.0.0.1:1081/status",
  // Off by default: when the cable is unplugged, bank traffic fails rather than silently leaving over Wi-Fi.
  fallbackToWifi: false,
};
