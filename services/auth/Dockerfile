FROM node:20-alpine AS base

RUN corepack enable && corepack prepare pnpm@9.15.1 --activate
RUN apk add --no-cache wget

FROM base AS builder
WORKDIR /app

# Copy entire workspace for proper pnpm resolution
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages ./packages
COPY services/auth ./services/auth

# Install ALL dependencies with shamefully-hoist for flat node_modules
RUN pnpm install --frozen-lockfile --shamefully-hoist

# Build workspace packages in dependency order
WORKDIR /app/packages/database
RUN npx prisma generate
RUN npx tsc

WORKDIR /app/packages/rabbitmq-client
RUN npx tsc

# Build auth service
WORKDIR /app/services/auth
RUN npx nest build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/services/auth/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/database ./packages/database
COPY --from=builder /app/packages/rabbitmq-client ./packages/rabbitmq-client
COPY services/auth/scripts/start.sh ./scripts/start.sh
RUN chmod +x ./scripts/start.sh

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/auth/health || exit 1

CMD ["./scripts/start.sh"]
