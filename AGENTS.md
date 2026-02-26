# AGENTS.md

> AI agent instructions for the LLM-JSON-Translator project

## Project Overview

A Bun-based HTTP service that translates JSON structures using OpenAI's LLM, with Redis caching for translation results.

## Quick Commands

```bash
# Install dependencies
bun install

# Run type checking
bun run type-check

# Start development server (watch mode)
bun run start:dev

# Start production server
bun start

# Format and lint code
bunx biome check --write .
```

## Tech Stack

- **Runtime**: Bun v1.2.19
- **Language**: TypeScript (ES2021 target)
- **Package Manager**: Bun
- **Lint/Format**: Biome
- **Cache**: Redis
- **AI**: OpenAI API

## Project Structure

```
├── src/                    # Application entry point and HTTP server
│   ├── main.ts            # HTTP server setup with Bun.serve
│   └── server/controller/ # Route controllers
├── modules/               # Shared business logic modules
│   ├── translate-json/    # Core translation logic
│   ├── redis/             # Redis client wrapper
│   ├── logger/            # Structured logging
│   ├── clientError/       # Error handling utilities
│   └── system-prompts/    # LLM system prompts (i18n)
├── examples/              # Usage examples
└── docker-compose.yml     # Redis container setup
```

## Development Setup

1. Copy environment file:
   ```bash
   cp .env.example .env
   # Edit .env and add your OPENAI_API_KEY
   ```

2. Start Redis:
   ```bash
   docker compose up -d
   ```

3. Run the server:
   ```bash
   bun run start:dev
   ```

## Key Patterns

- **Module Organization**: Business logic lives in `modules/`, HTTP handling in `src/server/`
- **Path Mapping**: Uses `"baseUrl": "./"` with direct folder imports (e.g., `import { Logger } from "modules/logger"`)
- **Controller Pattern**: Controllers have `middleware()`, `guard()`, and HTTP method methods (e.g., `POST()`)
- **Error Handling**: Uses `ClientError` class with `globalErrorHandler` for consistent error responses
- **Logging**: Structured logging with `Logger` class using prefixed child loggers

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key |
| `REDIS_URL` | Yes | Redis connection URL |
| `APP_ENVIRONMENT` | Yes | `development` or `production` |
| `HOST` | No | Server host (default: 127.0.0.1) |
| `PORT` | No | Server port (default: 3000) |

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/translate-json` | POST | Translates JSON payload using LLM |

## Code Style (Biome Config)

- 2 spaces indentation
- Double quotes for strings
- Trailing commas enabled
- Semicolons required
- Arrow function parentheses always required
- Block statements required (no single-line if/for)
- No `var`, prefer `const`/`let`

## TypeScript Notes

- `strictNullChecks: false` - Nullable types are not strictly enforced
- `noImplicitAny: false` - Implicit any is allowed
- Includes: `src/**/*.ts`, `modules/**/*.ts`, `examples/**/*.ts`
