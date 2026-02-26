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

### 4. Token Calculator Optimization

The token calculator avoids redundant `JSON.stringify` calls by reusing the formatted batch string, reducing CPU usage by ~2x for large batches.

**No configuration required** - this optimization is always active.

### 5. Structural Cloning

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

# Shorter TTL to free memory faster
MEMORY_CACHE_TTL_SECONDS=600
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

## Environment Variables Reference

| Variable | Default | Range | Description |
|----------|---------|-------|-------------|
| `BATCH_SIZE` | 10 | 1-100 | Text fields per batch |
| `CONCURRENT_BATCH_CHUNK_SIZE` | 50 | 1+ | Batches processed concurrently |
| `MAX_RETRIES` | 5 | 1-10 | Retry attempts for failed translations |
| `BATCH_TOKEN_SAFETY_RATIO` | 0.6 | 0.1-0.9 | Token limit safety margin |
| `MEMORY_CACHE_MAX_SIZE` | 10000 | 100+ | Max memory cache entries |
| `MEMORY_CACHE_TTL_SECONDS` | 3600 | 60+ | Memory cache TTL (seconds) |
| `CACHE_KEY_MEMOIZATION_LIMIT` | 10000 | 1000+ | Max memoized cache keys |
