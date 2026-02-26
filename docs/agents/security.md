# Security Guidelines

> AI agent security conventions for this codebase

## Sensitive Data

- Never commit sensitive information (API keys, passwords, tokens)
- Always use environment variables for configuration

## File Deletion Safety

- **ALWAYS use `trash` instead of `rm`** for file deletion
  - `trash file.txt` - moves to trash (recoverable)
  - `trash -r directory/` - recursively trash directory
  - `trash-list` - view trashed files
  - `trash-restore` - recover deleted files
- Never use `rm -rf` as it permanently deletes files

## Environment Variables

Required environment variables (see `.env.example`):

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key |
| `REDIS_URL` | Yes | Redis connection URL |
| `APP_API_KEY` | Yes | API key for Bearer token authentication |
| `APP_ENVIRONMENT` | Yes | `development` or `production` |
| `HOST` | No | Server host (default: 127.0.0.1) |
| `PORT` | No | Server port (default: 3000) |
