#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Cykle — Hostinger VPS bootstrap script
# Run once as root (or sudo) on a fresh Ubuntu 22.04 VPS
# Uses Hostinger managed MySQL — no local database installation needed.
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/ws1975dallascrypto/cykle/main/scripts/setup-vps.sh | bash
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

APP_DIR="/var/www/cykle"
DOMAIN="orangered-peafowl-333460.hostingersite.com"
API_PORT=4000
WEB_PORT=3000

echo "╔══════════════════════════════════════╗"
echo "║  Cykle VPS Bootstrap                 ║"
echo "╚══════════════════════════════════════╝"

# ── 1. System updates ────────────────────────────────────────────────────────
echo ""
echo "==> Updating system packages..."
apt-get update -qq && apt-get upgrade -y -qq

# ── 2. Node.js 20 ────────────────────────────────────────────────────────────
echo ""
echo "==> Installing Node.js 20..."
if ! command -v node &>/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
else
  echo "    Node.js already installed: $(node -v)"
fi

# ── 3. pnpm ──────────────────────────────────────────────────────────────────
echo ""
echo "==> Installing pnpm 9.0.0..."
if ! command -v pnpm &>/dev/null; then
  npm install -g pnpm@9.0.0
else
  echo "    pnpm already installed: $(pnpm -v)"
fi

# ── 4. PM2 ───────────────────────────────────────────────────────────────────
echo ""
echo "==> Installing PM2..."
if ! command -v pm2 &>/dev/null; then
  npm install -g pm2
  pm2 startup systemd -u root --hp /root | tail -1 | bash
else
  echo "    PM2 already installed: $(pm2 -v)"
fi

# ── 5. Nginx ─────────────────────────────────────────────────────────────────
echo ""
echo "==> Installing Nginx..."
if ! command -v nginx &>/dev/null; then
  apt-get install -y nginx
  systemctl enable nginx
else
  echo "    Nginx already installed"
fi

echo ""
echo "==> Configuring Nginx for ${DOMAIN}..."
cat > /etc/nginx/sites-available/cykle <<NGINX
server {
    listen 80;
    server_name ${DOMAIN};

    # Web app (Next.js on port ${WEB_PORT})
    location / {
        proxy_pass http://localhost:${WEB_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_cache_bypass \$http_upgrade;
    }

    # API (Express on port ${API_PORT}) — proxied at /api
    location /api {
        proxy_pass http://localhost:${API_PORT};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/cykle /etc/nginx/sites-enabled/cykle
nginx -t && systemctl reload nginx
echo "    Nginx configured ✓"

# ── 6. Clone repo ────────────────────────────────────────────────────────────
echo ""
echo "==> Cloning repository to ${APP_DIR}..."
if [ -d "${APP_DIR}/.git" ]; then
  echo "    Repo already cloned — pulling latest..."
  git -C "${APP_DIR}" fetch origin main
  git -C "${APP_DIR}" reset --hard origin/main
else
  mkdir -p "${APP_DIR}"
  git clone https://github.com/ws1975dallascrypto/cykle "${APP_DIR}"
fi
cd "${APP_DIR}"

# ── 7. Create .env ───────────────────────────────────────────────────────────
if [ ! -f "${APP_DIR}/apps/api/.env" ]; then
  echo ""
  echo "==> Creating .env file..."
  ACCESS_SECRET="$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 40)"
  REFRESH_SECRET="$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 40)"

  cat > "${APP_DIR}/apps/api/.env" <<ENV
# ── Database (Hostinger managed MySQL) ───────────────────────────────────────
DATABASE_URL="mysql://u307564296_cyklegit2026:Cykle2026git.@srv1514.hstgr.io:3306/u307564296_cyklegit2026"

# ── Server ────────────────────────────────────────────────────────────────────
PORT=${API_PORT}
NODE_ENV=production

# ── JWT (auto-generated — keep secret!) ───────────────────────────────────────
JWT_ACCESS_SECRET=${ACCESS_SECRET}
JWT_REFRESH_SECRET=${REFRESH_SECRET}
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# ── Philippine locale ─────────────────────────────────────────────────────────
TIMEZONE=Asia/Manila
LOCALE=en-PH
CURRENCY=PHP

# ── CORS ─────────────────────────────────────────────────────────────────────
CORS_ORIGIN=http://${DOMAIN}

# ── Optional — add your own keys to enable these features ────────────────────
# PAYMONGO_SECRET_KEY=
# TWILIO_ACCOUNT_SID=
# TWILIO_AUTH_TOKEN=
# CLOUDINARY_CLOUD_NAME=
ENV
  echo "    .env created."
else
  echo "    .env already exists — updating CORS_ORIGIN..."
  sed -i "s|^CORS_ORIGIN=.*|CORS_ORIGIN=http://${DOMAIN}|" "${APP_DIR}/apps/api/.env"
fi

echo ""
echo "==> Installing dependencies..."
pnpm install --frozen-lockfile

echo ""
echo "==> Pushing database schema to Hostinger MySQL..."
pnpm --filter @cykle/api exec prisma db push --accept-data-loss

echo ""
echo "==> Building API..."
pnpm --filter @cykle/api build

echo ""
echo "==> Building Web (with domain URL)..."
NEXT_PUBLIC_API_URL="http://${DOMAIN}/api" pnpm --filter @cykle/web build

echo ""
echo "==> Seeding demo data..."
pnpm --filter @cykle/api db:seed || true

echo ""
echo "==> Starting services with PM2..."
pm2 restart cykle-api --update-env 2>/dev/null || \
  pm2 start "${APP_DIR}/apps/api/dist/index.js" --name cykle-api

pm2 restart cykle-web --update-env 2>/dev/null || \
  pm2 start "pnpm --filter @cykle/web start" --name cykle-web --cwd "${APP_DIR}"

pm2 save
echo "    PM2 services started ✓"

# ── 8. Summary ───────────────────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  ✅  Cykle is LIVE!                                          ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║  🌐  http://${DOMAIN}"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║  Demo accounts:                                              ║"
echo "║  Customer : juan@example.ph        / Customer@1234!         ║"
echo "║  Vendor   : cleanexpress@example.ph / Vendor@1234!          ║"
echo "║  Driver   : roberto@example.ph     / Driver@1234!           ║"
echo "║  Admin    : admin@cykle.ph         / Admin@1234!            ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║  GitHub Secrets to add for auto-deploy:                      ║"
echo "║  HOSTINGER_SSH_HOST        = 194.164.74.70                  ║"
echo "║  HOSTINGER_SSH_USER        = root                           ║"
echo "║  HOSTINGER_SSH_PRIVATE_KEY = <your private key>             ║"
echo "║  HOSTINGER_APP_PATH        = ${APP_DIR}                     ║"
echo "║  NEXT_PUBLIC_API_URL       = http://${DOMAIN}/api           ║"
echo "║  DATABASE_URL              = (see apps/api/.env)            ║"
echo "╚══════════════════════════════════════════════════════════════╝"
