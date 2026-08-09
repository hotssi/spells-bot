# Base builder
FROM node:20-bookworm-slim AS builder
WORKDIR /app

RUN apt-get update && apt-get install -y python3 build-essential && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY tsconfig.base.json ./
COPY apps/ops-bot/package.json ./apps/ops-bot/
COPY apps/media-bot/package.json ./apps/media-bot/
COPY apps/dev-bot/package.json ./apps/dev-bot/
COPY packages/shared/package.json ./packages/shared/

RUN HUSKY=0 npm ci

COPY . .
RUN npm run build
RUN HUSKY=0 npm prune --omit=dev

# Shared runner base
FROM node:20-bookworm-slim AS runner-base
WORKDIR /app
RUN groupadd -g 1001 nodejs && useradd -r -u 1001 -g nodejs nodejs && chown -R nodejs:nodejs /app
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/packages/shared ./packages/shared

# Ops Bot
FROM runner-base AS ops-bot
COPY --from=builder --chown=nodejs:nodejs /app/apps/ops-bot ./apps/ops-bot
USER nodejs
ENV APP_NAME=ops-bot
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD node -e "console.log('healthy')" || exit 1
CMD ["node", "apps/ops-bot/dist/index.js"]

# Dev Bot
FROM runner-base AS dev-bot
COPY --from=builder --chown=nodejs:nodejs /app/apps/dev-bot ./apps/dev-bot
USER nodejs
ENV APP_NAME=dev-bot
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD node -e "console.log('healthy')" || exit 1
CMD ["node", "apps/dev-bot/dist/index.js"]

# Media Bot
FROM runner-base AS media-bot
USER root
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*
USER nodejs
COPY --from=builder --chown=nodejs:nodejs /app/apps/media-bot ./apps/media-bot
ENV APP_NAME=media-bot
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD node -e "console.log('healthy')" || exit 1
CMD ["node", "apps/media-bot/dist/index.js"]