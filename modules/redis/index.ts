import { RedisClientType, createClient } from "redis";

import { Logger } from "modules/logger";

const logger = new Logger({
  prefix: "web-server",
}).createChild("redis");

const REDIS_KEY_PREFIX = "llm-json-translator";

class RedisClientClass {
  private client: RedisClientType | undefined;

  async init(redisUrl: string): Promise<void> {
    if (this.client) {
      return;
    }

    try {
      this.client = createClient({ url: redisUrl });
      await this.client.connect();
      logger.info("Connected to Redis");
    } catch (error) {
      logger.error("Failed to connect to Redis", error);
      throw new Error("Failed to connect to Redis");
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.client) {
      throw new Error("Redis client is not initialized");
    }

    return this.client.get(`${REDIS_KEY_PREFIX}:${key}`);
  }

  async set(key: string, value: string, ttlInSeconds = 60 * 60): Promise<void> {
    if (!this.client) {
      throw new Error("Redis client is not initialized");
    }

    await this.client.set(`${REDIS_KEY_PREFIX}:${key}`, value, {
      EX: ttlInSeconds,
    });
  }
}

export const redisClient = new RedisClientClass();
