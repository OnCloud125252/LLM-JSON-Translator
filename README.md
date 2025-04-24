# LLM-JSON-Translator

A utility for translating JSON structures using large language models.

## Prerequisites

- [Bun](https://bun.sh/) runtime environment
- [Docker](https://www.docker.com/) for Redis containerization
- OpenAI API key

## Getting Started

### Environment Configuration

1. Copy the environment template to create your configuration:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your OpenAI API key. The Redis URL (`REDIS_URL`) and application environment (`APP_ENVIRONMENT`) are preconfigured.

### Installation

Install project dependencies:

```bash
bun install
```

### Redis Setup

Start the Redis server in a Docker container:

```bash
docker compose up -d
```

This will launch Redis on port 10001 with the following credentials:
- Username: `default`
- Password: `ABC`

### Running the Sample Application

Start the sample application with the following command:

```bash
bun start
```

### Customizing JSON Input

To modify the sample data for translation, edit line 13 in `src/main.ts`:

```typescript
const translatedJson = await translateJson(sampleData.a, 10);
//                                                    ^ adjust which sample json data to translate here
```

The number `10` represents the batch size for processing, not recommended to change.