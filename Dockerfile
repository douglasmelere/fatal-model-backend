# Build stage
FROM node:22-alpine AS builder

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm && pnpm install --frozen-lockfile && npm install -g @nestjs/cli

COPY . .

RUN pnpm run build

# Production stage
FROM node:22-alpine

# Install build dependencies for native modules (needed for bcrypt)
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm && pnpm install --prod --frozen-lockfile

# Clean up build dependencies
RUN apk del python3 make g++

COPY --from=builder /app/dist /app/dist

EXPOSE 3000

CMD ["node", "dist/main.js"]
