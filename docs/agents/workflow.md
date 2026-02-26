# Agent Workflow Guidelines

> AI agent workflow conventions for this codebase

## Task Management

- **Always create a todo list** before starting any operation to track tasks and provide visibility
- Read existing code before ANY process with more than one step

## File Operations

- Prefer modifying existing files over creating new ones
- Follow existing patterns and conventions in the codebase
- **Avoid running background tasks** like `bun run dev` - use foreground execution instead for better visibility and control

## Tool Usage

- Use ripgrep (`rg`) instead of grep for searching
- Prefer using Glob and Grep tools over bash find/grep commands
- Always use absolute paths when working with files

## Testing & Validation

- Always run tests after making changes if test scripts exist
- Run linting and type checking before completing tasks: `bun run check:fix && bun run type-check`
