# Stage 1: Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package manifests and install dependencies
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

# Copy source code and build
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 2: Production runtime stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install production dependencies only
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --only=production && npx prisma generate

# Copy built application assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/generated ./generated

EXPOSE 3000

USER node

CMD ["node", "dist/main.js"]
