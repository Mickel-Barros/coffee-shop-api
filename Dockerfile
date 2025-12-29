# =========================
# Base stage
# =========================
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl bash

# =========================
# Dependencies stage
# =========================
FROM base AS deps
COPY package*.json ./
RUN npm ci
COPY prisma ./prisma
RUN npx prisma generate

# =========================
# Build stage
# =========================
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# =========================
# Production stage
# =========================
FROM node:20-alpine AS production
WORKDIR /app
RUN apk add --no-cache openssl bash
ENV NODE_ENV=development

# Copy build artifacts
COPY --from=build /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma
COPY package*.json ./

# Copy production environment file
COPY .env.development .env

# Expose API port
EXPOSE 3000

# Run migrations and start the server
CMD ["sh", "-c", "npx prisma migrate deploy --dotenv=.env.development && node dist/main.js"]
