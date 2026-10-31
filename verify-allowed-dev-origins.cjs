// Temporary verification of allowedDevOrigins matching against Next.js' own matcher.
const { isCsrfOriginAllowed } = require("next/dist/server/app-render/csrf-protection.js");
const { blockCrossSiteDEV } = require("next/dist/server/lib/router-utils/block-cross-site-dev.js");

const OLD = ["https://star-courier.space-z.ai", "https://*.space-z.ai"];
const NEW = ["star-courier.space-z.ai", "**.space-z.ai", "192.168.56.1", "192.168.31.77", "172.30.0.1"];

const hosts = [
  "star-courier.space-z.ai",
  "preview.space-z.ai",
  "a.b.space-z.ai",
  "192.168.56.1",
  "192.168.31.77",
  "172.30.0.1",
  "localhost",
  "space-z.ai",
  "evil.com",
];

const allowed = (list, host) => list.some((p) => isCsrfOriginAllowed(host, [p]));

console.log("host".padEnd(28) + "OLD".padEnd(8) + "NEW");
for (const h of hosts) {
  console.log(h.padEnd(28) + (allowed(OLD, h) ? "allow" : "BLOCK").padEnd(8) + (allowed(NEW, h) ? "allow" : "BLOCK"));
}

// End-to-end through the real middleware for the origin that was failing in dev.log.
function check(list, origin) {
  let status = 0;
  let ended = "";
  const req = { url: "/_next/hmr", headers: { origin } };
  const res = { set statusCode(v) { status = v; }, end(body) { ended = body; } };
  const blocked = blockCrossSiteDEV(req, res, list, undefined);
  return blocked ? `BLOCKED ${status}` : `passed (status=${status || "none"}) ${ended}`;
}

console.log("\nblockCrossSiteDEV('/_next/hmr', Origin: http://192.168.56.1:3000)");
console.log("  old config ->", check(OLD, "http://192.168.56.1:3000"));
console.log("  new config ->", check(NEW, "http://192.168.56.1:3000"));
console.log("  new config ->", check(NEW, "https://star-courier.space-z.ai"));
console.log("  new config ->", check(NEW, "https://evil.com"));
