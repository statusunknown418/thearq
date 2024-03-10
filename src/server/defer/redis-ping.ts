import { defer } from "@defer/client";
import { redis } from "../upstash";

export default defer.cron(async () => {
  const pong = await redis.ping();

  return pong;
}, "0 0 * * *");
