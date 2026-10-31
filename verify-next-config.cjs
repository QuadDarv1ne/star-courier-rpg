// Temporary: make Next.js load and schema-validate the real next.config.ts.
const loadConfig = require("next/dist/server/config").default;

(async () => {
  const dir = process.cwd();
  const config = await loadConfig("development", dir, { dev: true });
  console.log("allowedDevOrigins:", JSON.stringify(config.allowedDevOrigins));
  console.log("output:", config.output, "| strictMode:", config.reactStrictMode);
})().catch((err) => {
  console.error("CONFIG LOAD FAILED:", err.message);
  process.exitCode = 1;
});
