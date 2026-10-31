// Temporary: removes the last smoke-test row.
const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

(async () => {
  const removed = await db.analyticsEvent.deleteMany({ where: { sessionId: "verify-final" } });
  console.log("removed rows:", removed.count, "| total now:", await db.analyticsEvent.count());
  await db.$disconnect();
})().catch(async (e) => {
  console.error("CLEANUP FAILED:", e.message);
  await db.$disconnect();
  process.exitCode = 1;
});
