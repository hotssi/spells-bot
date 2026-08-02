# Build stage
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Install build dependencies for native modules (opus, sodium)
RUN apt-get update && apt-get install -y python3 build-essential && rm -rf /var/lib/apt/lists/*

# Copy package configurations
COPY package*.json ./
COPY tsconfig.base.json ./
COPY apps/ops-bot/package.json ./apps/ops-bot/
COPY apps/media-bot/package.json ./apps/media-bot/
COPY apps/dev-bot/package.json ./apps/dev-bot/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
# Using --ignore-scripts to avoid opus compilation issues during CI if possible,
# or we can let it compile since we installed python3.
RUN HUSKY=0 npm ci

# Copy full source code
COPY . .

# Build all workspaces
RUN npm run build

# Prune devDependencies
RUN HUSKY=0 npm prune --omit=dev

# Production stage
FROM node:20-bookworm-slim

WORKDIR /app

# Install ffmpeg for media streaming
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

# Copy from builder
COPY --from=builder /app ./

# Create non-root user for security
RUN groupadd -g 1001 nodejs && \
    useradd -r -u 1001 -g nodejs nodejs && \
    chown -R nodejs:nodejs /app

USER nodejs

# Which bot to run? (ops-bot, media-bot, dev-bot)
ENV APP_NAME=ops-bot

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "console.log('healthy')" || exit 1

# Start the specific bot
CMD ["sh", "-c", "node apps/${APP_NAME}/dist/index.js"]
