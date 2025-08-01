# Use the official Bun image.
FROM oven/bun:1 AS base

# Set the working directory.
WORKDIR /app

# A multi-stage build to handle dependencies and the final image.
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

FROM base AS build
COPY . .
COPY --from=install /temp/dev/node_modules node_modules
RUN bun run build

FROM base
COPY --from=build /app/dist .
COPY package.json .
COPY bun.lock .

# Set environment variables.
ENV NODE_ENV=production
ENV APP_ENVIRONMENT=production

# Expose the application port.
EXPOSE 3000

# Define the command to run the application.
CMD [ "bun", "run", "src/main.ts" ]
