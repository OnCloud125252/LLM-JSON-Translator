import { Logger } from "modules/logger";
import { createClient, RedisClientType } from "redis";

const logger = new Logger({
  prefix: "web-server",
}).createChild("redis");

const REDIS_KEY_PREFIX = "llm-json-translator";

type CacheBackend = "redis" | "memory";

class RedisClientClass {
  private client: RedisClientType | undefined;
  private memoryCache: Map<string, string> = new Map();
  private cacheBackend: CacheBackend = "memory";

  async init(redisUrl: string): Promise<void> {
    if (this.client) {
      return;
    }

    if (!redisUrl) {
      this.cacheBackend = "memory";
      logger.warn(
        "Redis URL not configured, using in-memory cache (data will be lost on restart)",
      );
      return;
    }

    try {
      this.client = createClient({ url: redisUrl });
      await this.client.connect();
      this.cacheBackend = "redis";
      logger.info("Connected to Redis");
    } catch (error) {
      logger.error("Failed to connect to Redis", error);
      throw new Error("Failed to connect to Redis");
    }
  }

  async get(key: string): Promise<string | null> {
    const prefixedKey = `${REDIS_KEY_PREFIX}:${key}`;

    if (this.cacheBackend === "memory") {
      return this.memoryCache.get(prefixedKey) ?? null;
    }

    if (!this.client) {
      throw new Error("Redis client is not initialized");
    }

    return this.client.get(prefixedKey);
  }

  async set(key: string, value: string, ttlInSeconds = 60 * 60): Promise<void> {
    const prefixedKey = `${REDIS_KEY_PREFIX}:${key}`;

    if (this.cacheBackend === "memory") {
      this.memoryCache.set(prefixedKey, value);
      return;
    }

    if (!this.client) {
      throw new Error("Redis client is not initialized");
    }

    await this.client.set(prefixedKey, value, {
      EX: ttlInSeconds,
    });
  }
}

export const redisClient = new RedisClientClass();
