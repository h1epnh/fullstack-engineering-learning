// Host pattern matching shared by the background script, the options page and the Node tests.
// "*.example.com" matches example.com itself and every subdomain; "example.com" matches only that host.

function normalizePatterns(patterns) {
  return patterns.map((p) => p.trim().toLowerCase()).filter(Boolean);
}

function hostMatches(host, patterns) {
  const h = host.toLowerCase().replace(/\.$/, "");
  return patterns.some((p) => {
    if (p.startsWith("*.")) {
      const base = p.slice(2);
      return h === base || h.endsWith("." + base);
    }
    return h === p;
  });
}

if (typeof module !== "undefined") {
  module.exports = { normalizePatterns, hostMatches };
}
