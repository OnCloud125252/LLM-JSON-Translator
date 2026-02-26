# Examples

This project includes example data and usage patterns to help you understand how the LLM JSON Translator works.

## Sample Data

The `examples/sample-data/` directory contains realistic JSON structures that demonstrate the translator's capabilities with nested objects and arrays.

### Available Sample Data Files

| File | Export Name | Description |
|------|-------------|-------------|
| `data/a.ts` | `SAMPLE_DATA_A` | Travel itinerary with nested points of interest |
| `data/b.ts` | `SAMPLE_DATA_B` | Extended sample data variant |
| `data/c.ts` | `SAMPLE_DATA_C` | Extended sample data variant |
| `data/d.ts` | `SAMPLE_DATA_D` | Extended sample data variant |

### Sample Data A Structure

The `SAMPLE_DATA_A` file demonstrates a travel itinerary with complex nesting:

```typescript
{
  itineraryId: "67a71a7a988cbfc8ba7634e9",
  name: "Japan Tokyo 7-Day Trip",
  duration: { days: 7 },
  days: [
    {
      id: "day-1",
      points: [
        {
          site: {
            name: "TeamLab Planets",
            description: "An immersive digital art museum in Tokyo",
            rating: { average: 4.6, totalReviews: 29616 },
            contact: { website: "https://www.teamlab.art/jp/e/planets/" }
          },
          todosListsId: ["todo-1", "todo-2"]
        }
      ]
    }
  ],
  createdAt: 1739004593156,
  updatedAt: 1739109900132,
  whiteSpace: "   ",           // Whitespace-only (skipped)
  helloWorld: "Hello, World!"
}
```

Notice how the translator handles:

- **Nested objects**: Traverses arbitrarily deep structures
- **Arrays**: Preserves indices in path notation (e.g., `days[0].points[0].site.name`)
- **Mixed data types**: Numbers, booleans, and nulls are preserved unchanged
- **Whitespace-only strings**: The `whiteSpace` field is skipped (contains only spaces)
- **Identifiers**: URLs and IDs without spaces are preserved

## Running the Examples

### Prerequisites

Ensure you have:

1. Redis running (`docker compose up -d`)
2. Environment variables configured in `.env`

### Run the Basic Example

```bash
bun run examples/index.ts
```

This translates `SAMPLE_DATA_A` to Traditional Chinese (`zh-TW`) and outputs the result.

### Example Code

```typescript
import { SAMPLE_DATA_A } from "examples/sample-data/data/a.js";
import { redisClient } from "modules/redis";
import { translateJson } from "modules/translate-json";
import { TargetLanguage } from "modules/translate-json/modules/translate-batch";

async function runExample(): Promise<void> {
  await redisClient.init(process.env.REDIS_URL);

  const translatedJson = await translateJson({
    jsonData: SAMPLE_DATA_A,
    batchSize: 10,
    targetLanguage: TargetLanguage.ZH_TW,
  });

  console.log(JSON.stringify(translatedJson, null, 2));
  process.exit(0);
}

runExample();
```

## Expected Output

When translating `SAMPLE_DATA_A` to `zh-TW`, the output preserves the structure while translating only the text content:

```json
{
  "itineraryId": "67a71a7a988cbfc8ba7634e9",
  "name": "日本東京7日遊",
  "duration": { "days": 7 },
  "days": [
    {
      "id": "day-1",
      "points": [
        {
          "site": {
            "name": "TeamLab Planets",
            "description": "東京的沉浸式數位藝術博物館",
            "rating": { "average": 4.6, "totalReviews": 29616 },
            "contact": {
              "website": "https://www.teamlab.art/jp/e/planets/"
            }
          },
          "todosListsId": ["todo-1", "todo-2"]
        }
      ]
    }
  ],
  "createdAt": 1739004593156,
  "updatedAt": 1739109900132,
  "whiteSpace": "   ",
  "helloWorld": "你好，世界！"
}
```

Note that:

- `itineraryId`, `id`, `todosListsId` remain unchanged (identifiers)
- `website` URL remains unchanged (no spaces, looks like identifier)
- `whiteSpace` remains unchanged (only whitespace)
- `name`, `description`, `helloWorld` are translated
- All numeric values remain unchanged

## Creating Your Own Examples

To create custom sample data:

1. Create a new file in `examples/sample-data/data/`
2. Export a constant with your JSON structure
3. Import and use it in `examples/index.ts`

```typescript
// examples/sample-data/data/my-data.ts
export const MY_DATA = {
  title: "My Custom Data",
  items: [
    { id: "item-1", name: "First Item" },
    { id: "item-2", name: "Second Item" }
  ]
};
```

Then update `examples/index.ts` to import and translate your data.
