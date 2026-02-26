# AGENTS.md

> AI agent instructions for the LLM-JSON-Translator project

A Bun-based HTTP service that translates JSON structures using OpenAI's LLM, with Redis caching for translation results.

## Tech Stack

- **Runtime**: Bun v1.2.19
- **Language**: TypeScript
- **Package Manager**: Bun
- **Lint/Format**: Biome
- **Cache**: Redis (with in-memory fallback)
- **AI**: OpenAI API

## Quick Commands

```bash
# Install dependencies
bun install

# Type check
bun run type-check

# Run tests
bun test

# Development server
bun run start:dev

# Production server
bun start

# Lint and format
bun run check:fix
bun run lint:md
```

## Essential Reading

| Topic | File |
|-------|------|
| Setup & Environment | [docs/development.md](docs/development.md) |
| Architecture Patterns | [docs/architecture.md](docs/architecture.md) |
| API Reference | [docs/api.md](docs/api.md) |
| Code Style | [docs/agents/code-style.md](docs/agents/code-style.md) |
| Agent Workflow | [docs/agents/workflow.md](docs/agents/workflow.md) |
| Security Guidelines | [docs/agents/security.md](docs/agents/security.md) |

## Import Conventions

- **Always use path aliases** instead of relative paths (e.g., `@core/json-compare` instead of `../core/json-compare`)
- This keeps imports clean and prevents breakages when files are reorganized

## Documentation Guidelines

- **Documentation is part of the feature**: New environment variables must be documented in `.env.example` so users know they exist and how to use them
- Update relevant docs in the `docs/` folder when adding new features or changing behavior
