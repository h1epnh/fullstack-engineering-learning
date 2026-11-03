const test = require("node:test");
const assert = require("node:assert");
const { hostMatches, normalizePatterns } = require("../extension/matcher.js");

const patterns = normalizePatterns([" *.HDBank.com.vn ", "", "intranet.local"]);

test("wildcard covers apex and subdomains", () => {
  for (const h of ["hdbank.com.vn", "www.hdbank.com.vn", "ebanking.uat.hdbank.com.vn", "WWW.HDBANK.COM.VN."]) {
    assert.ok(hostMatches(h, patterns), h);
  }
});

test("lookalike hosts do not match", () => {
  for (const h of ["nothdbank.com.vn", "hdbank.com.vn.evil.com", "hdbank.com", "google.com"]) {
    assert.ok(!hostMatches(h, patterns), h);
  }
});

test("bare pattern is exact", () => {
  assert.ok(hostMatches("intranet.local", patterns));
  assert.ok(!hostMatches("a.intranet.local", patterns));
});
