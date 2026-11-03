// Settings defaults, shared by the background script and the options page.
const DEFAULTS = {
  enabled: true,
  patterns: ["*.hdbank.com.vn"],
  proxyHost: "127.0.0.1",
  proxyPort: 1080,
  statusUrl: "http://127.0.0.1:1081/status",
  // Off by default: when the cable is unplugged, bank traffic fails rather than silently leaving over Wi-Fi.
  fallbackToWifi: false,
};
