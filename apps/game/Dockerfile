# Multi-stage build for game server (monorepo-aware)
FROM node:20-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

# Copy workspace root files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY turbo.json ./

# Copy all packages (needed for workspace dependencies)
COPY packages/ ./packages/

# Copy app
COPY apps/game/ ./apps/game/

# Install all dependencies (including dev for build)
RUN pnpm install --frozen-lockfile

# Development stage (for hot-reload with volumes)
FROM base AS development

WORKDIR /app/apps/game

# Expose app port and debug port
EXPOSE 3001 9229

# Run dev command (will be overridden by docker-compose)
CMD ["pnpm", "run", "dev"]

# Build stage
FROM base AS build


WORKDIR /app/apps/game

# Build the app
RUN pnpm build

# Production stage
FROM node:20-alpine AS production

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

# Copy workspace root files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY turbo.json ./

# Copy only package.json files for production install
COPY packages/engine/package.json ./packages/engine/
COPY packages/logger/package.json ./packages/logger/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY apps/game/package.json ./apps/game/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built app
COPY --from=build /app/apps/game/dist ./apps/game/dist

# Copy runtime packages (minimal - only what's needed at runtime)
# Note: engine package needs Lua scripts, logger needs built files
COPY --from=build /app/packages/engine/src ./packages/engine/src
COPY --from=build /app/packages/engine/package.json ./packages/engine/
COPY --from=build /app/packages/logger/dist ./packages/logger/dist
COPY --from=build /app/packages/logger/package.json ./packages/logger/
COPY --from=build /app/packages/typescript-config ./packages/typescript-config

WORKDIR /app/apps/game

# Expose port
EXPOSE 3001

# Run the app
CMD ["node", "dist/index.js"]
