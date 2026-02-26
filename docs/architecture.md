# Architecture Patterns

## Module Organization

```
├── src/                    # Application entry point and HTTP server
│   ├── main.ts            # HTTP server setup with Bun.serve
│   ├── core/              # Core business logic
│   │   ├── cache/         # L1 cache stats tracking
│   │   ├── redis/         # Redis client with L1/L2 caching
│   │   ├── translate-json/# Core translation logic
│   │   └── logger/        # Structured logging
│   └── server/controller/ # Route controllers
├── modules/               # Shared utilities (legacy)
│   ├── clientError/       # Error handling utilities
│   └── system-prompts/    # LLM system prompts (i18n)
└── examples/              # Usage examples
```

**Key principle**: Business logic lives in `modules/`, HTTP handling in `src/server/`

## Path Mapping

Uses `"baseUrl": "./"` with direct folder imports:

```typescript
// Good
import { Logger } from "modules/logger";
import { ClientError } from "modules/clientError";

// Avoid relative imports like "../../../modules/logger"
```

## Controller Patterns

This codebase supports two controller patterns:

### Pattern 1: Class-Based Controllers (Legacy)

Controllers extend a base class with chainable methods:

```typescript
export class TranslateJson {
  static readonly path = "/translate";
  static readonly method = "POST";

  middleware() { /* validate request */ return this; }
  guard() { /* auth check */ return this; }
  async POST() { /* handle request */ }
}

// Usage
return await new TranslateJson({ request, logger })
  .middleware()
  .guard()
  .POST();
```

### Pattern 2: Functional Handlers (Preferred)

Standalone async functions with validation helpers:

```typescript
// src/server/controller/translateJson.ts
export async function handleTranslateJsonRequest(
  request: Request,
  responseLogger: Logger,
  requestUuid: string,
  batchSize: number,
): Promise<Response> {
  validateContentType(request);
  validateAuthorization(request);
  // ... handler logic
}

// Private validation functions
function validateContentType(request: Request): void {
  if (request.headers.get("Content-Type") !== "application/json") {
    throw new ClientError({ errorMessage: "Invalid content type" }, 400);
  }
}
```

**Prefer the functional pattern for new controllers** - it's simpler and easier to test.

## Error Handling

Use `ClientError` for operational errors (user input, auth failures):

```typescript
import { ClientError } from "modules/clientError";

throw new ClientError(
  {
    errorMessage: "Invalid input",
    errorObject: { field: "name", reason: "required" },
  },
  StatusCodes.BAD_REQUEST,
  requestUuid,
);
```

The `globalErrorHandler` catches all errors and formats responses consistently.

## Logging

Use the `Logger` class with prefixed child loggers:

```typescript
const logger = new Logger({ prefix: "module-name" });

// For request-specific logging
const requestLogger = logger.createChild(requestUuid);
requestLogger.info("Processing request", { extra: "data" });
```

## Code Style

See [docs/agents/code-style.md](docs/agents/code-style.md) for detailed code style conventions.
