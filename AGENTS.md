# AGENTS.md

> AI agent instructions for the LLM-JSON-Translator project

A Bun-based HTTP service that translates JSON structures using OpenAI's LLM, with Redis caching for translation results.

## Quick Commands

```bash
# Install dependencies
bun install

# Type check
bun run type-check

# Development server
bun run start:dev

# Production server
bun start

# Lint and format
bun run check:fix
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key |
| `REDIS_URL` | Yes | Redis connection URL |
| `APP_API_KEY` | Yes | API key for Bearer token authentication |
| `APP_ENVIRONMENT` | Yes | `development` or `production` |
| `HOST` | No | Server host (default: 127.0.0.1) |
| `PORT` | No | Server port (default: 3000) |

## Project Documentation

- [Architecture Patterns](docs/architecture.md) - Module organization and controller patterns
- [Development Setup](docs/development.md) - Local development, Docker, and debugging
- [API Reference](docs/api.md) - Endpoints and request/response formats
- [Examples](docs/examples.md) - Sample data and usage examples

## Tech Stack

- **Runtime**: Bun v1.2.19
- **Language**: TypeScript
- **Package Manager**: Bun
- **Lint/Format**: Biome
- **Cache**: Redis
- **AI**: OpenAI API
