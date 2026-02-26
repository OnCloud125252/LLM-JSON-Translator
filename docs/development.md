# Development Setup

## Prerequisites

- Bun v1.2.19
- Docker (for Redis)
- OpenAI API key

## Initial Setup

1. Copy environment file:

   ```bash
   cp .env.example .env
   # Edit .env and add your OPENAI_API_KEY and APP_API_KEY
   ```

2. Install dependencies:

   ```bash
   bun install
   ```

3. Start Redis:

   ```bash
   docker compose up -d
   ```

4. Run the server:

   ```bash
   bun run start:dev
   ```

## Environment Variables

Create a `.env` file with:

```bash
APP_ENVIRONMENT=development
OPENAI_API_KEY=sk-...
APP_API_KEY=your-secure-api-key
REDIS_URL=redis://default:ABC@localhost:10001
HOST=127.0.0.1
PORT=3000
```

## Docker Deployment

Build and run with Docker:

```bash
docker build -t llm-json-translator .
docker run -p 3000:3000 --env-file .env llm-json-translator
```

The Dockerfile uses multi-stage builds:

1. `all-deps` - Install all dependencies
2. `checker` - Run type checking
3. `prod-deps` - Install production dependencies only
4. Final image - Lean production image

## TypeScript Configuration

- Target: ES2021
- `strictNullChecks: false`
- `noImplicitAny: false`
- Includes: `src/**/*.ts`, `modules/**/*.ts`, `examples/**/*.ts`
