FROM node:20-alpine

RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm@9.0.0

WORKDIR /app

# Copy workspace manifests and lockfile
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/web/package.json ./apps/web/

# Install deps (web has no postinstall, so this is straightforward)
RUN pnpm install --frozen-lockfile

# Copy source
COPY packages/shared ./packages/shared
COPY apps/web ./apps/web

EXPOSE 3000
ENV NEXT_TELEMETRY_DISABLED=1

CMD pnpm --filter @cykle/web dev
