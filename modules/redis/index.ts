import { createClient, RedisClientType } from "redis";

import { Logger } from "modules/logger";

const logger = new Logger({
  prefix: "web-server",
}).createChild("redis");

export class RedisClient {
  private static redisClient: RedisClientType;
  private static isInitialized = false;
  private static REDIS_KEY_PREFIX = "llm-json-translator";

  public async init(redisUrl: string) {
    try {
      if (!RedisClient.redisClient && !RedisClient.isInitialized) {
        RedisClient.redisClient = createClient({ url: redisUrl });
        await RedisClient.redisClient.connect();
        RedisClient.isInitialized = true;
        logger.info("Connected to Redis");
      }
    } catch (_error) {
      logger.error("Failed to connect to Redis");
      throw new Error("Failed to connect to Redis");
    }
  }

  public static async get(key: string): Promise<string | null> {
    if (!RedisClient.isInitialized) {
      logger.error("Redis client is not initialized");
      throw new Error("Redis client is not initialized");
    }

    return RedisClient.redisClient.get(
      `${RedisClient.REDIS_KEY_PREFIX}:${key}`,
    );
  }

  public static async set(
    key: string,
    value: string,
    ttlInSeconds: number = 60 * 60,
  ): Promise<void> {
    if (!RedisClient.isInitialized) {
      logger.error("Redis client is not initialized");
      throw new Error("Redis client is not initialized");
    }

    await RedisClient.redisClient.set(
      `${RedisClient.REDIS_KEY_PREFIX}:${key}`,
      value,
      { EX: ttlInSeconds },
    );
  }
}
