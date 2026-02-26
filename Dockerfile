# Stage 1: Install all dependencies and copy source code
FROM oven/bun:1 AS all-deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .

# Stage 2: Run type-check
FROM all-deps AS checker
RUN bun run type-check

# Stage 3: Install only production dependencies for the final image
FROM oven/bun:1 AS prod-deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --production --frozen-lockfile

# Stage 4: The final, lean production image
FROM oven/bun:1
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1000 appgroup && \
    adduser -u 1000 -G appgroup -s /bin/sh -D appuser

# Set environment variables
ENV NODE_ENV=production
ENV APP_ENVIRONMENT=production

# Copy production dependencies and source code
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --chown=appuser:appgroup . .

# Switch to non-root user
USER appuser

# Expose the application port
EXPOSE 3000

# Health check for container orchestrators
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Define the command to run the application
CMD [ "bun", "run", "src/main.ts" ]
