import app from "./app";
import { config } from "./config/env";
import { prisma } from "./config/database";

const server = app.listen(config.port, () => {
  console.log("\n🚀 Portfolio Backend");
  console.log(`   Env:  ${config.nodeEnv}`);
  console.log(`   Port: ${config.port}`);
  console.log(`   URL:  http://localhost:${config.port}`);
  console.log(`   DB:   connected\n`);
});

// ── Graceful shutdown ─────────────────────────────────────────────
const shutdown = async (signal: string) => {
  console.log(`\n${signal} received — shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    console.log("✓ Server closed");
    console.log("✓ Database disconnected");
    process.exit(0);
  });

  // Force exit after 10s
  setTimeout(() => {
    console.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10_000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT",  () => shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Promise Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});
