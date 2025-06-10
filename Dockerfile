# Stage 1: Install dependencies
FROM node:20-slim AS deps
WORKDIR /app
RUN npm install -g pnpm
COPY pnpm-lock.yaml ./
RUN pnpm fetch
COPY package.json ./
# Install ALL dependencies for the build stage
RUN pnpm install --no-optional

# Stage 2: Build the application
FROM node:20-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm install -g pnpm
RUN pnpm build

# Stage 3: Production runner
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV DOCKER_CONTAINER_NAME=default_container

# Prune dev dependencies for the final image
COPY --from=builder /app/ .
RUN npm install -g pnpm && pnpm install --prod --no-optional

EXPOSE 3000
CMD ["pnpm", "start"]
