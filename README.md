# LLM-JSON-Translator

**Translate JSON structures using large language models with intelligent caching and batch processing.**

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [API Reference](#api-reference)
- [Configuration](#configuration)
- [FAQs](#faqs)
- [Installation](#installation)

## Overview

LLM-JSON-Translator is an HTTP server that translates text values within JSON structures using OpenAI's GPT models. It processes translations in batches, caches results in Redis for efficiency, and preserves your JSON structure.

```bash
curl -X POST http://localhost:3000/translate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{
    "json": {
      "title": "Hello World",
      "description": "Welcome to our application"
    },
    "targetLanguage": "zh-TW"
  }'
```

Response:

```json
{
  "title": "你好，世界",
  "description": "歡迎使用我們的應用程式"
}
```

## Features

### Supported Languages

The following target languages are supported:

| Language | Code |
|----------|------|
| English (US) | `en-US` |
| Chinese (Traditional) | `zh-TW` |

### Batch Processing

Translations are processed in batches (default size: 10) to optimize API usage. The server handles large JSON structures by automatically chunking batches into groups of 50 for parallel processing.

### Redis Caching

Translated text is cached using content-addressable storage (hash of source text + target language). Subsequent requests for the same text return instantly from cache without calling the LLM.

### Field Exclusion

You can exclude specific keys from translation using the `disallowedTranslateKeys` parameter:

```bash
curl -X POST http://localhost:3000/translate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{
    "json": {
      "id": "12345",
      "name": "Product Name",
      "sku": "ABC-123"
    },
    "targetLanguage": "zh-TW",
    "disallowedTranslateKeys": ["id", "sku"]
  }'
```

In this example, only `name` will be translated; `id` and `sku` remain unchanged.

### Retry Logic

The translation service automatically retries failed requests (up to 5 attempts) for transient errors like invalid JSON responses or mismatched result counts.

## API Reference

### POST /translate

Translates text fields within a JSON structure.

**Headers:**

| Header | Value |
|--------|-------|
| `Content-Type` | `application/json` |
| `Authorization` | `Bearer <API_KEY>` |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `json` | `object` | Yes | The JSON structure to translate |
| `targetLanguage` | `string` | Yes | Target language code (`en-US` or `zh-TW`) |
| `disallowedTranslateKeys` | `string[]` | No | Keys to exclude from translation |

**Response:**

Returns the JSON structure with all text values translated to the target language.

**Status Codes:**

| Code | Description |
|------|-------------|
| `200` | Translation successful |
| `400` | Invalid request body or JSON structure |
| `401` | Invalid or missing API key |
| `404` | Invalid endpoint |
| `500` | Internal server error or translation failure |

## Configuration

Create a `.env` file by copying `.env.example`:

```bash
cp .env.example .env
```

**Required environment variables:**

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | Your OpenAI API key |
| `APP_API_KEY` | API key for authenticating requests to this server |

**Optional environment variables:**

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_ENVIRONMENT` | `development` | Environment mode (`development` or `production`) |
| `REDIS_URL` | `redis://default:ABC@localhost:10001` | Redis connection URL |
| `HOST` | `127.0.0.1` | Server bind address |
| `PORT` | `3000` | Server port |

## FAQs

#### What text gets translated?

The translator recursively traverses your JSON structure and translates string values that contain actual text content. It skips:

- Empty strings
- Strings that are only whitespace
- Strings that look like identifiers (no spaces, only alphanumeric)
- Keys listed in `disallowedTranslateKeys`

#### How does caching work?

Each translation is cached using a hash of the source text combined with the target language. If you request the same translation again, it returns immediately from Redis without calling OpenAI.

#### What happens if translation fails?

The service automatically retries up to 5 times for errors like invalid JSON from the LLM. After all retries are exhausted, it returns a `500` error with details about the failure.

#### Can I translate nested JSON structures?

Yes. The translator handles arbitrarily nested objects and arrays. Array indices are preserved in the path notation (e.g., `items[0].name`).

#### Is there a request size limit?

The server accepts request bodies up to 1000 MB by default. Large JSON structures are processed in parallel batches for efficiency.

## Installation

### Prerequisites

- [Bun](https://bun.sh/) 1.2.19 or later
- [Docker](https://www.docker.com/) for Redis
- OpenAI API key

### Setup

1. Install dependencies:

   ```bash
   bun install
   ```

2. Configure environment:

   ```bash
   cp .env.example .env
   # Edit .env with your OPENAI_API_KEY and APP_API_KEY
   ```

3. Start Redis:

   ```bash
   docker compose up -d
   ```

4. Start the server:

   ```bash
   bun start
   ```

For development with auto-reload:

```bash
bun run start:dev
```
