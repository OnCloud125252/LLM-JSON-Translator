import { Logger } from "@core/logger";
import { createClient, RedisClientType } from "redis";

const logger = new Logger({
  prefix: "web-server",
}).createChild("redis");

const REDIS_KEY_PREFIX = "llm-json-translator";

// Cache key version for invalidation on translation logic changes
const CACHE_KEY_VERSION = process.env.CACHE_KEY_VERSION || "v1";

// L1 (in-memory) hot cache configuration
const L1_CACHE_MAX_SIZE = Number(process.env.L1_CACHE_MAX_SIZE) || 1000;
const L1_CACHE_TTL_SECONDS = Number(process.env.L1_CACHE_TTL_SECONDS) || 5 * 60; // 5 minutes

// L2 (Redis) cache configuration
const MEMORY_CACHE_MAX_SIZE =
  Number(process.env.MEMORY_CACHE_MAX_SIZE) || 10000;
const MEMORY_CACHE_TTL_SECONDS =
  Number(process.env.MEMORY_CACHE_TTL_SECONDS) || 60 * 60; // 1 hour

// L1 cache cleanup interval
const L1_CLEANUP_INTERVAL_MS = 60 * 1000; // 60 seconds

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
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor(maxSize: number, ttlSeconds: number, enableCleanup = false) {
    this.maxSize = maxSize;
    this.ttlMs = ttlSeconds * 1000;

    if (enableCleanup) {
      this.startCleanupInterval();
    }
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

  stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Get the number of entries in the cache
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Periodically clean up expired entries to prevent memory bloat
   */
  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      let expiredCount = 0;

      for (const [key, entry] of this.cache.entries()) {
        if (now - entry.lastAccessed > this.ttlMs) {
          this.cache.delete(key);
          expiredCount++;
        }
      }

      if (expiredCount > 0) {
        logger.debug(
          `L1 cache cleanup: removed ${expiredCount} expired entries, ${this.cache.size} remaining`,
        );
      }
    }, L1_CLEANUP_INTERVAL_MS);

    // Ensure the interval doesn't prevent process exit
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }
}

interface CacheEntryInput {
  key: string;
  value: string;
}

class RedisClientClass {
  private client: RedisClientType | undefined;
  private memoryCache: LruCache;
  private cacheBackend: CacheBackend = "memory";

  // L1 hot cache for frequently accessed keys (in-process)
  private l1Cache: LruCache;

  constructor() {
    this.memoryCache = new LruCache(
      MEMORY_CACHE_MAX_SIZE,
      MEMORY_CACHE_TTL_SECONDS,
    );
    // L1 cache with periodic cleanup enabled
    this.l1Cache = new LruCache(L1_CACHE_MAX_SIZE, L1_CACHE_TTL_SECONDS, true);
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
      logger.info(
        `Connected to Redis (L1 hot cache: ${L1_CACHE_MAX_SIZE} items, ` +
          `L2 Redis: ${MEMORY_CACHE_MAX_SIZE} items)`,
      );
    } catch (error) {
      logger.error("Failed to connect to Redis", error);
      throw new Error("Failed to connect to Redis");
    }
  }

  /**
   * Build a prefixed cache key with version
   */
  private buildKey(key: string): string {
    return `${REDIS_KEY_PREFIX}:${CACHE_KEY_VERSION}:${key}`;
  }

  async get(key: string): Promise<string | null> {
    const prefixedKey = this.buildKey(key);

    // Check L1 cache first (hot cache)
    const l1Value = this.l1Cache.get(prefixedKey);
    if (l1Value !== undefined) {
      logger.debug(`L1 cache hit for key: ${key}`);
      return l1Value;
    }

    if (this.cacheBackend === "memory") {
      const value = this.memoryCache.get(prefixedKey);
      return value ?? null;
    }

    if (!this.client) {
      throw new Error("Redis client is not initialized");
    }

    // Check L2 (Redis)
    const value = await this.client.get(prefixedKey);

    // Populate L1 cache on Redis hit
    if (value !== null) {
      this.l1Cache.set(prefixedKey, value);
      logger.debug(`L2 cache hit, populated L1 for key: ${key}`);
    }

    return value;
  }

  /**
   * Get multiple values in a single round-trip (MGET)
   */
  async mget(keys: string[]): Promise<(string | null)[]> {
    const prefixedKeys = keys.map((key) => this.buildKey(key));

    // Check L1 cache first for all keys
    const results: (string | null)[] = new Array(keys.length).fill(null);
    const missingIndices: number[] = [];
    const missingKeys: string[] = [];

    for (let i = 0; i < prefixedKeys.length; i++) {
      const l1Value = this.l1Cache.get(prefixedKeys[i]);
      if (l1Value !== undefined) {
        results[i] = l1Value;
        logger.debug(`L1 cache hit for key: ${keys[i]}`);
      } else {
        missingIndices.push(i);
        missingKeys.push(prefixedKeys[i]);
      }
    }

    // All found in L1
    if (missingKeys.length === 0) {
      return results;
    }

    if (this.cacheBackend === "memory") {
      for (let i = 0; i < missingIndices.length; i++) {
        const idx = missingIndices[i];
        const value = this.memoryCache.get(missingKeys[i]);
        if (value !== undefined) {
          results[idx] = value;
          this.l1Cache.set(missingKeys[i], value);
        }
      }
      return results;
    }

    if (!this.client) {
      throw new Error("Redis client is not initialized");
    }

    // Batch fetch missing keys from Redis
    const redisResults = await this.client.mGet(missingKeys);

    for (let i = 0; i < missingIndices.length; i++) {
      const idx = missingIndices[i];
      const value = redisResults[i];
      results[idx] = value;

      // Populate L1 cache on Redis hit
      if (value !== null) {
        this.l1Cache.set(missingKeys[i], value);
      }
    }

    return results;
  }

  async set(key: string, value: string, ttlInSeconds = 60 * 60): Promise<void> {
    const prefixedKey = this.buildKey(key);

    // Write to L1 cache first
    this.l1Cache.set(prefixedKey, value);

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

  /**
   * Set multiple values using pipelined SET commands
   */
  async mset(
    entries: CacheEntryInput[],
    ttlInSeconds = 60 * 60,
  ): Promise<void> {
    if (entries.length === 0) {
      return;
    }

    // Write to L1 cache first
    for (const { key, value } of entries) {
      const prefixedKey = this.buildKey(key);
      this.l1Cache.set(prefixedKey, value);
    }

    if (this.cacheBackend === "memory") {
      for (const { key, value } of entries) {
        const prefixedKey = this.buildKey(key);
        this.memoryCache.set(prefixedKey, value);
      }
      return;
    }

    if (!this.client) {
      throw new Error("Redis client is not initialized");
    }

    // Use pipeline for batch writes
    const pipeline = this.client.multi();

    for (const { key, value } of entries) {
      const prefixedKey = this.buildKey(key);
      pipeline.set(prefixedKey, value, { EX: ttlInSeconds });
    }

    await pipeline.exec();
  }

  /**
   * Get cache statistics for L1 hot cache
   */
  getL1CacheStats(): { size: number; maxSize: number } {
    return {
      size: this.l1Cache.size(),
      maxSize: L1_CACHE_MAX_SIZE,
    };
  }

  /**
   * Get current cache key version
   */
  getCacheKeyVersion(): string {
    return CACHE_KEY_VERSION;
  }
}

export const redisClient = new RedisClientClass();
