FROM node:20-alpine AS builder

WORKDIR /app/backend

RUN apk add --no-cache python3 make g++

COPY backend/package*.json ./
RUN npm ci --only=production

COPY backend/ ./
RUN node scripts/build.js

FROM node:20-alpine

RUN apk add --no-cache dumb-init

ENV NODE_ENV=production
WORKDIR /app

COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/public ./public
COPY --from=builder /app/backend/server.js ./
COPY --from=builder /app/backend/routes ./routes
COPY --from=builder /app/backend/models ./models
COPY --from=builder /app/backend/scripts ./scripts

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) })"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
