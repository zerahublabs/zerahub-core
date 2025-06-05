# Build stage
FROM oven/bun:1 as builder
WORKDIR /app

# Install OpenSSL and other build dependencies
RUN apt-get update && apt-get install -y \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json bun.lock ./

# Copy Prisma schema
COPY prisma ./prisma/

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma Client
RUN bunx prisma generate

# Production stage
FROM oven/bun:1-slim
WORKDIR /app

# Install OpenSSL for production
RUN apt-get update && apt-get install -y \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# Copy built assets from builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Expose the port your app runs on
EXPOSE 3000

# Start the application
CMD ["bun", "run", "start"]
