# Performance Tuning Guide

This guide covers configuration options and best practices for optimizing the LLM-JSON-Translator's performance.

## Overview

The translator processes JSON through a multi-stage pipeline: extract → batch → translate (with caching) → update. Performance optimizations are applied at each stage to minimize latency and memory usage.

## Key Optimizations

### 1. Parallel Cache Lookups

Cache lookups for batch items are performed concurrently using `Promise.all()`, providing 5-10x faster cache retrieval for batches with many items.

**No configuration required** - this optimization is always active.

### 2. LRU Memory Cache

When Redis is not configured, the in-memory cache uses an LRU (Least Recently Used) eviction policy to prevent unbounded memory growth.

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `MEMORY_CACHE_MAX_SIZE` | 10000 | Maximum number of entries in memory cache |
| `MEMORY_CACHE_TTL_SECONDS` | 3600 | Time-to-live for cache entries (seconds) |

**When to adjust:**

- Increase `MEMORY_CACHE_MAX_SIZE` if you have high cardinality of unique text fields and available memory
- Decrease `MEMORY_CACHE_TTL_SECONDS` if translations change frequently and stale data is a concern

### 3. Cache Key Memoization

Hash computation for cache keys is memoized to avoid recomputing xxh128 hashes for identical strings.

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `CACHE_KEY_MEMOIZATION_LIMIT` | 10000 | Maximum memoized cache keys |

**When to adjust:**

- Increase if you have many repeated text strings across different requests
- The memoization cache is cleared when the limit is reached (LRU eviction)

### 4. L1 In-Memory Hot Cache

The translator uses a two-tier caching system for optimal performance:

- **L1 Cache**: In-memory hot cache for frequently accessed keys, providing sub-millisecond lookups
- **L2 Cache**: Redis (when configured) or in-memory fallback

The L1 cache is checked first on every lookup, dramatically reducing latency for frequently translated content.

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `L1_CACHE_MAX_SIZE` | 1000 | Maximum entries in L1 hot cache |
| `L1_CACHE_TTL_SECONDS` | 300 | Time-to-live for L1 cache entries (seconds) |

**When to adjust:**

- Increase `L1_CACHE_MAX_SIZE` if you have high traffic patterns with recurring translations
- The L1 cache operates independently of Redis - it's always active for hot key optimization

### 5. Schema Caching

Translation schemas are cached per target language. When translating JSON, the system creates a schema that describes the structure and fields to translate. This schema is now computed once and cached, avoiding redundant schema generation for the same target language.

**No configuration required** - this optimization is always active.

### 6. Token Calculator Optimization

The token calculator avoids redundant `JSON.stringify` calls by reusing the formatted batch string, reducing CPU usage by ~2x for large batches.

**No configuration required** - this optimization is always active.

### 7. Structural Cloning

JSON updates use structural cloning instead of `JSON.parse(JSON.stringify())`, reducing memory allocation by 50-70% for large objects.

**No configuration required** - this optimization is always active.

## General Tuning Recommendations

### For High-Throughput Workloads

```bash
# Increase batch size to reduce API calls (up to 100)
BATCH_SIZE=50

# Increase concurrent processing
CONCURRENT_BATCH_CHUNK_SIZE=100

# Larger memory cache for high cardinality data
MEMORY_CACHE_MAX_SIZE=50000

# Higher memoization for repeated content
CACHE_KEY_MEMOIZATION_LIMIT=50000

# Larger L1 hot cache for frequently accessed keys
L1_CACHE_MAX_SIZE=5000
```

### For Memory-Constrained Environments

```bash
# Smaller batches reduce peak memory usage
BATCH_SIZE=5

# Limit concurrent processing
CONCURRENT_BATCH_CHUNK_SIZE=10

# Strict memory cache limits
MEMORY_CACHE_MAX_SIZE=1000
CACHE_KEY_MEMOIZATION_LIMIT=1000

# Smaller L1 cache
L1_CACHE_MAX_SIZE=100

# Shorter TTL to free memory faster
MEMORY_CACHE_TTL_SECONDS=600
L1_CACHE_TTL_SECONDS=60
```

### For Cache-Heavy Workloads

If most of your translations are already cached:

```bash
# Larger batches are fine since cache lookups are parallelized
BATCH_SIZE=100

# Higher concurrency since cache hits are fast
CONCURRENT_BATCH_CHUNK_SIZE=100

# Maximize cache effectiveness
MEMORY_CACHE_MAX_SIZE=100000
CACHE_KEY_MEMOIZATION_LIMIT=100000
L1_CACHE_MAX_SIZE=10000
```

## Monitoring Performance

Enable debug logging to monitor performance:

```bash
LOG_LEVEL=0  # DEBUG
```

Look for these log messages:

- `Token estimate for batch of X items` - Shows batch processing
- `Using cached translation` - Cache hit
- `Translating` - Cache miss, API call required
- `L1 cache hit` - Hot cache hit
- `L2 cache hit, populated L1` - Cold cache hit that warmed L1

### Cache Statistics

The translator logs cache performance statistics periodically (default: every 5 minutes). This helps you understand cache effectiveness and tune settings accordingly.

**Example log output:**

```
[cache-stats] Cache stats - Hits: 1523, Misses: 277, Hit Rate: 84.61%, Miss Rate: 15.39%
```

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `CACHE_STATS_LOG_INTERVAL_MS` | 300000 | Interval for cache stats logging (milliseconds) |

Set to `0` to disable periodic logging.

## Environment Variables Reference

| Variable | Default | Range | Description |
|----------|---------|-------|-------------|
| `BATCH_SIZE` | 10 | 1-100 | Text fields per batch |
| `CONCURRENT_BATCH_CHUNK_SIZE` | 50 | 1+ | Batches processed concurrently |
| `MAX_RETRIES` | 5 | 1-10 | Retry attempts for failed translations |
| `BATCH_TOKEN_SAFETY_RATIO` | 0.6 | 0.1-0.9 | Token limit safety margin |
| `MEMORY_CACHE_MAX_SIZE` | 10000 | 100+ | Max memory cache entries (L2) |
| `MEMORY_CACHE_TTL_SECONDS` | 3600 | 60+ | Memory cache TTL (seconds) |
| `CACHE_KEY_MEMOIZATION_LIMIT` | 10000 | 1000+ | Max memoized cache keys |
| `L1_CACHE_MAX_SIZE` | 1000 | 100+ | Max L1 hot cache entries |
| `L1_CACHE_TTL_SECONDS` | 300 | 60+ | L1 hot cache TTL (seconds) |
| `CACHE_STATS_LOG_INTERVAL_MS` | 300000 | 0+ | Cache stats logging interval (ms) |
| `CACHE_KEY_VERSION` | v1 | - | Cache key version for invalidation |
