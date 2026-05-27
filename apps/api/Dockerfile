FROM node:20-alpine

RUN apk add --no-cache libc6-compat openssl
RUN npm install -g pnpm@9.0.0

WORKDIR /app

# Copy workspace manifests and lockfile
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

# Copy Prisma schema before install so postinstall can generate client
COPY apps/api/prisma ./apps/api/prisma

# Install all deps (postinstall runs prisma generate automatically)
RUN pnpm install --frozen-lockfile

# Copy remaining source
COPY packages/shared ./packages/shared
COPY apps/api/src ./apps/api/src
COPY apps/api/tsconfig*.json ./apps/api/

EXPOSE 4000

# On start: sync DB schema → seed demo data (ignore errors if already seeded) → start dev server
CMD sh -c "pnpm --filter @cykle/api exec prisma db push --accept-data-loss && \
           (pnpm --filter @cykle/api db:seed || true) && \
           pnpm --filter @cykle/api dev"
