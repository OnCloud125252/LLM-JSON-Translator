# 1. Install all dependencies and copy source code
FROM oven/bun:1 AS all-deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .

# 2. Run type-check. This is a separate stage to ensure the code is valid before proceeding.
FROM all-deps AS checker
RUN bun run type-check

# 3. Install only production dependencies for the final image
FROM oven/bun:1 AS prod-deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --production --frozen-lockfile

# 4. The final, lean production image
FROM oven/bun:1
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV APP_ENVIRONMENT=production

# Copy production dependencies and source code
COPY --from=prod-deps /app/node_modules ./node_modules
COPY . .

# Expose the application port
EXPOSE 3000

# Define the command to run the application
CMD [ "bun", "run", "src/main.ts" ]
