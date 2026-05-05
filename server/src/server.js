import http from "http";
import dotenv from "dotenv";

import { buildApp } from "./app/buildApp.js";
import { connectMongo, disconnectMongo } from "./Common/Infrastructure/db/connectMongo.js";
import { connectRedis, disconnectRedis } from "./Common/Infrastructure/redis.js";

dotenv.config();

const PORT = Number(process.env.PORT || 5007);
const MONGO_URI = "mongodb://mongoAdmin:ofoaOFFO8282c@185.237.204.185:27017/woh?authSource=admin" ;

async function start() {
  // =========================
  // 1️⃣ Connect Mongo FIRST
  // =========================
  await connectMongo(MONGO_URI);

  // Redis is optional: startup must continue even if unavailable
  // await connectRedis();

  // =========================
  // 2️⃣ Build Express app
  // =========================
  const { app } = buildApp();

  const server = http.createServer(app);

  server.listen(PORT, () => {
    console.log(`🚀 API running on http://localhost:${PORT}`);
    console.log(`📘 Swagger UI: http://localhost:${PORT}/v1/docs`);
    console.log(`📘 Swagger Admin UI: http://localhost:${PORT}/v1/admin/docs`);
  });

  // =========================
  // 3️⃣ Graceful shutdown
  // =========================
  const shutdown = async (signal) => {
    console.log(`\n${signal} received. Shutting down...`);
    server.close(async () => {
      await disconnectRedis();
      await disconnectMongo();
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

start().catch((err) => {
  console.error("❌ Failed to start server", err);
  process.exit(1);
});
