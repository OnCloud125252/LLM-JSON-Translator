# Translation API Behavior

This document describes how the Translation API processes JSON structures, handles fields, and manages special conditions.

## Overview

The Translation API recursively traverses JSON structures to translate text values while preserving the original structure. The translation process follows a three-stage pipeline:

1. **Extraction** - Identify and collect text fields eligible for translation
2. **Translation** - Process text through LLM with caching and retry logic
3. **Reconstruction** - Merge translations back into the original JSON structure

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Input JSON    │────▶│  Extract Fields  │────▶│  Batched LLM    │
│                 │     │  (with filtering)│     │  Translation    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                          │
┌─────────────────┐     ┌──────────────────┐              │
│  Output JSON    │◄────│  Update Fields   │◄─────────────┘
│  (translated)   │     │  (preserve paths)│
└─────────────────┘     └──────────────────┘
```

## Field Extraction

### Path Notation

The API uses dot-notation paths to identify field locations within nested structures:

| Structure | Example Value | Path |
|-----------|---------------|------|
| Root property | `{"name": "John"}` | `name` |
| Nested object | `{"user": {"name": "John"}}` | `user.name` |
| Array element | `{"items": ["a", "b"]}` | `items[0]` |
| Deep nesting | `{"data": [{"name": "John"}]}` | `data[0].name` |

### Eligible Fields

A field is eligible for translation when all of the following conditions are met:

1. **Type is string** - Only string values are considered
2. **Non-empty content** - The trimmed value must have length > 0
3. **Not explicitly excluded** - The key is not in `disallowedTranslateKeys`
4. **Pure text content** - The value is identified as human-readable text (see [Text Detection](#text-detection))

### Text Detection

The API uses a whitelist approach to determine if a string contains translatable text. A string is considered **pure text** when it does NOT match any of the following patterns:

| Pattern | Description | Example |
|---------|-------------|---------|
| Base64 | Base64 encoded data | `SGVsbG8gV29ybGQ=` |
| Credit Card | Credit card numbers | `4111111111111111` |
| Currency | Currency amounts | `$1,234.56` |
| Email | Email addresses | `user@example.com` |
| FQDN | Fully qualified domain names | `api.example.com` |
| Hexadecimal | Hex-encoded values | `0x1a2b3c` or `1A2B3C` |
| IP Address | IPv4 or IPv6 addresses | `192.168.1.1` or `::1` |
| ISBN | ISBN-10 or ISBN-13 | `978-3-16-148410-0` |
| ISIN | Stock/security identifiers | `US0378331005` |
| ISO 8601 Date | Date/time strings | `2024-01-15T10:30:00Z` |
| Mobile Phone | Phone numbers (115+ locales) | `+1-555-123-4567` |
| MongoDB ObjectId | MongoDB identifiers | `507f1f77bcf86cd799439011` |
| Number String | Numeric-only strings | `12345` or `-999.50` |
| URL | Web addresses | `https://example.com` |
| UUID | UUID v3, v4, or v5 | `550e8400-e29b-41d4-a716-446655440000` |
| Locale | Locale codes | `en-US` or `zh-TW` |

**Important:** Values matching any of these patterns are skipped and returned unchanged in the output.

## Field Exclusion

### Disallowed Keys

Use the `disallowedTranslateKeys` parameter to exclude specific keys from translation. This is useful for:

- **Identifiers**: `id`, `uuid`, `sku`
- **Codes**: `countryCode`, `currency`, `locale`
- **Technical fields**: `slug`, `version`, `checksum`
- **Metadata**: `createdAt`, `updatedAt`

**Example:**

```json
{
  "json": {
    "id": "user-123",
    "name": "John Doe",
    "email": "john@example.com",
    "countryCode": "US"
  },
  "targetLanguage": "zh-TW",
  "disallowedTranslateKeys": ["id", "email", "countryCode"]
}
```

**Output:**

```json
{
  "id": "user-123",
  "name": "約翰·多伊",
  "email": "john@example.com",
  "countryCode": "US"
}
```

### Exclusion Behavior

- Exclusion applies to **all occurrences** of the key, regardless of nesting depth
- Array indices cannot be excluded individually (use parent key exclusion instead)
- Exclusion is checked before text pattern detection

## Batch Processing

### Batch Size Configuration

The API processes translations in configurable batches:

| Parameter | Default | Description |
|-----------|---------|-------------|
| `batchSize` | 10 | Number of text fields per translation request |
| `CONCURRENT_BATCH_CHUNK_SIZE` | 50 | Maximum parallel batches to process |

The batch size is set server-side and cannot be overridden per request.

### Processing Flow

1. All eligible text fields are collected into a flat list
2. The list is split into batches of `batchSize` items
3. Batches are grouped into chunks of 50 for parallel processing
4. Each chunk is processed concurrently via `Promise.all`
5. Results are merged and returned in the original order

**Example with 120 fields and batchSize=10:**

```
120 fields → 12 batches → 3 chunks (50 + 50 + 20) → Parallel execution
```

## Caching

### Cache Key Generation

Translations are cached using content-addressable storage. The cache key is computed as:

```
cacheKey = xxh128(sourceText + targetLanguage)
```

Using XXH3-128 hash for fast, collision-resistant keys.

### Cache Behavior

- **Hit**: Returns cached translation immediately, no LLM call
- **Miss**: Translates via LLM, stores result in cache, returns translation
- **TTL**: Cache entries persist indefinitely (handled by Redis configuration)

### Cache Efficiency

The caching strategy ensures:

- Repeated text across the same JSON is only translated once
- Common phrases across different requests benefit from cache
- Cache warming can be done by submitting representative texts

## Translation Engine

### LLM Configuration

| Parameter | Value | Description |
|-----------|-------|-------------|
| Model | `gpt-4.1-nano` | OpenAI model for translation |
| Max Tokens | 32,768 | Maximum output tokens per request |
| Temperature | 0.8 | Balance between creativity and consistency |

### System Prompts

Each target language has a dedicated system prompt that defines:

- Translation style and tone
- Output format (strict JSON schema)
- Special handling rules (preserving escape sequences, etc.)
- Examples of correct translation

### JSON Schema Enforcement

The API enforces strict JSON schema validation for LLM responses:

```typescript
{
  type: "object",
  properties: {
    results: {
      type: "array",
      items: {
        type: "object",
        properties: {
          path: { type: "string" },
          text: { type: "string" }
        },
        required: ["path", "text"],
        additionalProperties: false
      }
    }
  },
  required: ["results"]
}
```

## Retry and Error Handling

### Retry Logic

The API implements exponential backoff with up to 5 retries for transient failures:

| Attempt | Action |
|---------|--------|
| 1 | Initial attempt |
| 2-5 | Retry on failure |
| 6 | Return error to client |

Retryable errors include:

- Invalid JSON in LLM response
- Mismatched result count (LLM returns wrong number of items)
- Network timeouts
- Rate limit responses (with backoff)

### Error Types

| Error | HTTP Status | Cause |
|-------|-------------|-------|
| `INVALID_CONTENT_TYPE` | 400 | Content-Type header is not `application/json` |
| `INVALID_JSON` | 400 | Request body is not valid JSON |
| `INVALID_FIELD` | 400 | `json` is not an object or `targetLanguage` is invalid |
| `UNAUTHORIZED` | 401 | Missing or invalid `Authorization` header |
| `TRANSLATION_FAILED` | 500 | All retry attempts exhausted |

## Response Reconstruction

After translation, the API reconstructs the JSON structure:

1. Deep clone the original JSON (preserving structure)
2. Use `lodash/set` to update each translated value at its path
3. Return the modified clone

This approach ensures:

- Original object is never mutated
- Array indices remain stable
- Nested structures maintain their shape
- Non-string values pass through unchanged

## Special Conditions

### Empty Strings and Whitespace

| Input | Behavior | Output |
|-------|----------|--------|
| `""` (empty) | Skip translation | `""` |
| `"   "` (whitespace) | Skip translation | `"   "` |
| `"\n\t"` (escape sequences) | Skip translation | `"\n\t"` |

### Null and Undefined Values

| Input | Behavior | Output |
|-------|----------|--------|
| `null` | Pass through unchanged | `null` |
| `undefined` | Pass through unchanged | `undefined` |

### Boolean and Number Values

| Input | Behavior | Output |
|-------|----------|--------|
| `true` / `false` | Pass through unchanged | `true` / `false` |
| `123` / `45.67` | Pass through unchanged | `123` / `45.67` |

### Mixed Arrays

Arrays containing mixed types are handled correctly:

```json
{
  "items": [
    "Text to translate",
    123,
    null,
    { "nested": "More text" }
  ]
}
```

Output paths:
- `items[0]` → Translated text
- `items[1]` → Skipped (number)
- `items[2]` → Skipped (null)
- `items[3].nested` → Translated text

### Circular References

The API does not detect circular references. Passing JSON with circular structures will result in:

- `TypeError` during field extraction (infinite recursion)
- Request failure with 500 status

Ensure all input JSON is serializable before submission.

### Escape Sequences

Escape sequences in strings are preserved:

| Input | Translation | Output |
|-------|-------------|--------|
| `"Line 1\nLine 2"` | Yes | `"行1\n行2"` |
| `"Tab\there"` | Yes | `"タブ\tここ"` |
| `"Quote: \"text\""` | Yes | `"引用: \"テキスト\""` |

The LLM is instructed to preserve escape sequences in system prompts.

## Performance Considerations

### Request Size Limits

- Default body limit: 1000 MB
- Recommended: Keep individual requests under 10 MB for optimal performance

### Optimization Tips

1. **Use `disallowedTranslateKeys`** to exclude non-text fields early
2. **Batch similar texts** across requests to maximize cache hits
3. **Pre-warm cache** by translating common phrases before peak traffic
4. **Monitor batch counts** in logs to tune `batchSize` parameter

### Logging

The API logs key metrics for each request:

```
[controller:translate] Processing translation request { requestUuid }
[function:translate-batch] [Attempt 1/6] Starting translation for 10 items
[function:translate-batch] Translated 10 items in 850 ms
[controller:translate] Translation completed { fieldCount, durationMs, targetLanguage }
```

Use these logs to identify:

- Translation latency patterns
- Cache hit/miss ratios
- Retry frequency
- Request volume
