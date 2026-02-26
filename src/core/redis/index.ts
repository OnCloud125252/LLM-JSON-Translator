import { Logger } from "@core/logger";
import { createClient, RedisClientType } from "redis";

const logger = new Logger({
  prefix: "web-server",
}).createChild("redis");

const REDIS_KEY_PREFIX = "llm-json-translator";

const MEMORY_CACHE_MAX_SIZE =
  Number(process.env.MEMORY_CACHE_MAX_SIZE) || 10000;
const MEMORY_CACHE_TTL_SECONDS =
  Number(process.env.MEMORY_CACHE_TTL_SECONDS) || 60 * 60;

type CacheBackend = "redis" | "memory";

interface CacheEntry {
  value: string;
  lastAccessed: number;
}

/**
 * Simple LRU (Least Recently Used) cache implementation with TTL support.
 * Evicts least recently accessed items when max size is reached.
 */
class LruCache {
  private cache: Map<string, CacheEntry> = new Map();
  private maxSize: number;
  private ttlMs: number;

  constructor(maxSize: number, ttlSeconds: number) {
    this.maxSize = maxSize;
    this.ttlMs = ttlSeconds * 1000;
  }

  get(key: string): string | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      return undefined;
    }

    // Check if entry has expired
    if (Date.now() - entry.lastAccessed > this.ttlMs) {
      this.cache.delete(key);
      return undefined;
    }

    // Update last accessed time and move to end (most recently used)
    entry.lastAccessed = Date.now();
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.value;
  }

  set(key: string, value: string): void {
    // If key exists, delete it first to update insertion order
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // Evict oldest entries if we're at capacity
    while (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      value,
      lastAccessed: Date.now(),
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

class RedisClientClass {
  private client: RedisClientType | undefined;
  private memoryCache: LruCache;
  private cacheBackend: CacheBackend = "memory";

  constructor() {
    this.memoryCache = new LruCache(
      MEMORY_CACHE_MAX_SIZE,
      MEMORY_CACHE_TTL_SECONDS,
    );
  }

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

  async set(
    key: string,
    value: string,
    _ttlInSeconds = 60 * 60,
  ): Promise<void> {
    const prefixedKey = `${REDIS_KEY_PREFIX}:${key}`;

    if (this.cacheBackend === "memory") {
      this.memoryCache.set(prefixedKey, value);
      return;
    }

    if (!this.client) {
      throw new Error("Redis client is not initialized");
    }

    await this.client.set(prefixedKey, value, {
      EX: _ttlInSeconds,
    });
  }
}

export const redisClient = new RedisClientClass();
