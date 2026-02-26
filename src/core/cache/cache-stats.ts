import { Logger } from "@core/logger";

const logger = new Logger({
  prefix: "cache-stats",
});

const CACHE_STATS_LOG_INTERVAL_MS =
  Number(process.env.CACHE_STATS_LOG_INTERVAL_MS) || 5 * 60 * 1000; // 5 minutes

interface CacheStatsSnapshot {
  hits: number;
  misses: number;
  totalRequests: number;
  hitRate: number;
  missRate: number;
}

/**
 * Tracks cache performance statistics including hit rate, miss rate,
 * and total requests. Provides periodic logging for observability.
 */
export class CacheStats {
  private hits = 0;
  private misses = 0;
  private logInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.startPeriodicLogging();
  }

  /**
   * Record a cache hit
   */
  recordHit(): void {
    this.hits++;
  }

  /**
   * Record a cache miss
   */
  recordMiss(): void {
    this.misses++;
  }

  /**
   * Get current cache statistics
   */
  getStats(): CacheStatsSnapshot {
    const totalRequests = this.hits + this.misses;
    const hitRate = totalRequests > 0 ? this.hits / totalRequests : 0;
    const missRate = totalRequests > 0 ? this.misses / totalRequests : 0;

    return {
      hits: this.hits,
      misses: this.misses,
      totalRequests,
      hitRate: Number(hitRate.toFixed(4)),
      missRate: Number(missRate.toFixed(4)),
    };
  }

  /**
   * Reset all statistics to zero
   */
  reset(): void {
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Stop the periodic logging interval
   */
  stop(): void {
    if (this.logInterval) {
      clearInterval(this.logInterval);
      this.logInterval = null;
    }
  }

  private startPeriodicLogging(): void {
    this.logInterval = setInterval(() => {
      const stats = this.getStats();
      if (stats.totalRequests > 0) {
        logger.info(
          `Cache stats - Hits: ${stats.hits}, Misses: ${stats.misses}, ` +
            `Hit Rate: ${(stats.hitRate * 100).toFixed(2)}%, ` +
            `Miss Rate: ${(stats.missRate * 100).toFixed(2)}%`,
        );
      }
    }, CACHE_STATS_LOG_INTERVAL_MS);

    // Ensure the interval doesn't prevent process exit
    if (this.logInterval.unref) {
      this.logInterval.unref();
    }
  }
}

// Export singleton instance for global cache statistics
export const cacheStats = new CacheStats();
