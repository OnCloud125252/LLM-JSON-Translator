# API Reference

## Endpoints

### POST /translate

Translates JSON payload using LLM.

#### Authentication

Requires Bearer token authentication:

```
Authorization: Bearer <APP_API_KEY>
```

#### Request

**Headers:**

- `Content-Type: application/json` (required)
- `Authorization: Bearer <token>` (required)

**Body:**

```typescript
{
  json: object;                    // JSON object to translate
  targetLanguage: TargetLanguage;  // Target language (see supported values below)
  disallowedTranslateKeys?: string[];  // Keys to exclude from translation
}
```

**Example:**

```json
{
  "json": {
    "title": "Hello World",
    "description": "Welcome to our app"
  },
  "targetLanguage": "zh-TW",
  "disallowedTranslateKeys": ["id", "slug"]
}
```

#### Response

**Success (200 OK):**

```json
{
  "title": "你好世界",
  "description": "歡迎使用我們的應用"
}
```

**Error (400 Bad Request):**

```json
{
  "errorMessage": "Body didn't meet requirements",
  "errorObject": {
    "invalidField": [
      { "fieldName": "json", "validFieldValue": "object-like value" }
    ]
  }
}
```

**Error (401 Unauthorized):**

```json
{
  "errorMessage": "Invalid API key",
  "errorObject": { "apiKey": "..." }
}
```

#### Supported Target Languages

The following target languages are supported:

| Language | Enum Value | Code |
|----------|------------|------|
| English (US) | `TargetLanguage.EN_US` | `en-US` |
| Chinese (Traditional) | `TargetLanguage.ZH_TW` | `zh-TW` |

The `targetLanguage` field accepts these enum values as strings.

## Error Response Format

All errors follow this structure:

```typescript
{
  errorMessage: string;      // Human-readable error description
  errorObject?: any;         // Additional error details (optional)
}
```

HTTP status codes:

- `400` - Bad Request (invalid input, JSON parse error)
- `401` - Unauthorized (invalid API key)
- `404` - Not Found (invalid endpoint)
- `500` - Internal Server Error (unexpected errors)
