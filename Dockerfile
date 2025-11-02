# Build stage
FROM node:22-alpine AS builder

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm && pnpm install && npm install -g @nestjs/cli

COPY . .

RUN pnpm run build

# Production stage
FROM node:22-alpine

# Install build dependencies for native modules (needed for bcrypt)
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm && pnpm install --prod

# Clean up build dependencies
RUN apk del python3 make g++

COPY --from=builder /app/dist /app/dist

EXPOSE 3000

# Create entrypoint script to run migrations before starting app
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

CMD ["/app/docker-entrypoint.sh"]
