#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Cykle — Hostinger VPS bootstrap script
# Run once as root (or sudo) on a fresh Ubuntu 22.04 VPS
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/ws1975dallascrypto/cykle/main/scripts/setup-vps.sh | bash
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

APP_DIR="/var/www/cykle"
DB_NAME="cykle"
DB_USER="cykle"
DB_PASS="$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 32)"

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
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# ── 3. pnpm ──────────────────────────────────────────────────────────────────
echo ""
echo "==> Installing pnpm 9.0.0..."
npm install -g pnpm@9.0.0

# ── 4. PM2 ───────────────────────────────────────────────────────────────────
echo ""
echo "==> Installing PM2..."
npm install -g pm2
pm2 startup systemd -u root --hp /root | tail -1 | bash

# ── 5. PostgreSQL 15 ─────────────────────────────────────────────────────────
echo ""
echo "==> Installing PostgreSQL 15..."
apt-get install -y postgresql postgresql-contrib
systemctl enable postgresql
systemctl start postgresql

echo ""
echo "==> Creating database and user..."
sudo -u postgres psql <<SQL
CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASS}';
CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
SQL

# ── 6. Clone repo ────────────────────────────────────────────────────────────
echo ""
echo "==> Cloning repository to ${APP_DIR}..."
mkdir -p "${APP_DIR}"
git clone https://github.com/ws1975dallascrypto/cykle "${APP_DIR}"
cd "${APP_DIR}"

# ── 7. Create .env ───────────────────────────────────────────────────────────
ACCESS_SECRET="$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 40)"
REFRESH_SECRET="$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 40)"

cat > "${APP_DIR}/apps/api/.env" <<ENV
# ── Database ──────────────────────────────────────────────────────────────────
DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}"

# ── Server ────────────────────────────────────────────────────────────────────
PORT=4000
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

# ── CORS (update with your actual domain) ────────────────────────────────────
CORS_ORIGIN=http://localhost:3000

# ── Optional — add your own keys to enable these features ────────────────────
# PAYMONGO_SECRET_KEY=
# TWILIO_ACCOUNT_SID=
# TWILIO_AUTH_TOKEN=
# CLOUDINARY_CLOUD_NAME=
# NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
ENV

echo ""
echo "==> Installing dependencies..."
pnpm install --frozen-lockfile

echo ""
echo "==> Pushing database schema..."
pnpm --filter @cykle/api exec prisma db push --accept-data-loss

echo ""
echo "==> Seeding demo data..."
pnpm --filter @cykle/api db:seed || true

# ── 8. Summary ───────────────────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  ✅  VPS setup complete!                                 ║"
echo "╠══════════════════════════════════════════════════════════╣"
echo "║  App directory : ${APP_DIR}"
echo "║  Database      : ${DB_NAME} (user: ${DB_USER})"
echo "║  .env saved to : ${APP_DIR}/apps/api/.env"
echo "╠══════════════════════════════════════════════════════════╣"
echo "║  NEXT STEPS:                                             ║"
echo "║                                                          ║"
echo "║  1. Add these GitHub Secrets (repo → Settings →         ║"
echo "║     Secrets and variables → Actions):                   ║"
echo "║                                                          ║"
echo "║     HOSTINGER_SSH_HOST        = <your VPS IP>           ║"
echo "║     HOSTINGER_SSH_USER        = root                    ║"
echo "║     HOSTINGER_SSH_PRIVATE_KEY = <your private key>      ║"
echo "║     HOSTINGER_APP_PATH        = ${APP_DIR}"
echo "║     NEXT_PUBLIC_API_URL       = http://<VPS_IP>:4000    ║"
echo "║                                                          ║"
echo "║  2. Push to main to trigger deploy:                     ║"
echo "║     git push origin main                                 ║"
echo "║                                                          ║"
echo "║  3. Access the app:                                      ║"
echo "║     http://<your-VPS-IP>:3000                           ║"
echo "╚══════════════════════════════════════════════════════════╝"
