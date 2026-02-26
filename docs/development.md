# Development Setup

## Prerequisites

- Bun v1.2.19
- OpenAI API key
- Redis (optional - see [Cache Configuration](#cache-configuration))

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

3. (Optional) Start Redis if you want persistent caching:

   ```bash
   docker compose up -d
   ```

4. Run the server:

   ```bash
   bun run start:dev
   ```

## Cache Configuration

The translator supports two cache backends:

| Backend | Persistence | Configuration |
|---------|-------------|---------------|
| Redis (recommended) | Persistent across restarts | Set `REDIS_URL` environment variable |
| In-memory | Lost on restart | Leave `REDIS_URL` empty or unset |

### Using Redis (Recommended)

Set the `REDIS_URL` in your `.env` file:

```bash
REDIS_URL=redis://default:ABC@localhost:10001
```

### Using In-Memory Cache (Development)

If you don't configure `REDIS_URL`, the server automatically uses an in-memory cache:

```bash
# Either don't set REDIS_URL, or leave it empty
# REDIS_URL=
```

The server logs a warning on startup:

```
[web-server:redis] Redis URL not configured, using in-memory cache (data will be lost on restart)
```

**Trade-offs:**

- **In-memory**: Simple setup, no Docker required, but translations are not cached across restarts
- **Redis**: Requires Docker, but caching persists across server restarts

## Environment Variables

See [docs/agents/security.md](docs/agents/security.md) for environment variable requirements and security guidelines.

Quick setup for development:

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

### Security Features

The production image includes several security enhancements:

| Feature | Description |
|---------|-------------|
| Non-root user | Runs as `appuser` (UID 1000) instead of root |
| Read-only root filesystem | Recommended for production |
| Health checks | Built-in Docker health check using `/health` endpoint |
| Minimal image | Only production dependencies included |

### Docker Compose

The project includes a `docker-compose.yml` for running the full stack:

```bash
docker compose up -d
```

This starts:

- **app** - The translation API service
- **redis** - Cache backend (optional)

The compose file includes:

- Health checks for both services
- Resource limits (memory reservations/limits)
- Log rotation (10MB max, 3 files)
- Persistent Redis volume
- Restart policies

## TypeScript Configuration

- Target: ES2021
- `strictNullChecks: false`
- `noImplicitAny: false`
- Includes: `src/**/*.ts`, `modules/**/*.ts`, `examples/**/*.ts`

## Testing

### Unit Tests

Run unit tests with:

```bash
bun test
```

### API Behavior Tests

Run manual API behavior tests (requires running server):

```bash
# Start the server in one terminal
bun run start:dev

# Run the API behavior tests in another terminal
bun run test:api-behavior
```

This test script verifies:

- Server availability and health endpoint
- Translation functionality
- Authentication requirements
- Error handling
