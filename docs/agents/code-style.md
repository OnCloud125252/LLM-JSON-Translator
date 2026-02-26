# Code Style Guidelines

> AI agent code style conventions for this codebase

## Formatting (Biome)

- 2 spaces indentation
- Double quotes for strings
- Trailing commas enabled
- Semicolons required
- Arrow function parentheses always required
- Block statements required (no single-line if/for)

Run checks with: `bun run check:fix`

## Naming Conventions

- `camelCase` for variables and functions
- `PascalCase` for classes and components
- `SCREAMING_SNAKE_CASE` for constants
- Be descriptive, avoid abbreviations
- Ensure names reflect purpose

## JavaScript/TypeScript Style

- Prefer `async/await` over promises
- Always use `const/let`, never `var`
- Use meaningful variable names, avoid single letters except for loop indices
- Avoid using barrel imports

## Path Mapping (Path Aliases)

The project uses TypeScript path aliases defined in `tsconfig.json`:

```typescript
// Good - use path aliases
import { Logger } from "@core/logger";
import { ClientError } from "@core/clientError";
import { translateJson } from "@core/translate-json";

// Avoid relative imports like "../../../modules/logger"
```
