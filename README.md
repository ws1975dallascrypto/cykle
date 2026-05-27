# Cykle — On-demand Laundry Marketplace (Philippines)

## Quick Start (Docker)

Requires [Docker Desktop](https://docs.docker.com/get-docker/) — no other local setup needed.

```bash
git clone https://github.com/ws1975dallascrypto/cykle
cd cykle
docker compose up --build
```

First boot takes ~3 min to build the images. On subsequent runs it's ~20 seconds.

| Service | URL |
|---------|-----|
| Web app | http://localhost:3000 |
| API     | http://localhost:4000 |

### Demo accounts

| Portal | Email | Password |
|--------|-------|----------|
| Customer | `juan@example.ph` | `Customer@1234!` |
| Vendor (BGC) | `cleanexpress@example.ph` | `Vendor@1234!` |
| Driver | `roberto@example.ph` | `Driver@1234!` |
| Admin | `admin@cykle.ph` | `Admin@1234!` |

### Tear down

```bash
docker compose down          # stop containers, keep DB data
docker compose down -v       # stop containers + wipe DB
```

---

## Local Dev (without Docker)

**Prerequisites:** Node ≥ 20, pnpm 9, PostgreSQL 15+

```bash
pnpm install
cp .env.example apps/api/.env   # then fill in DATABASE_URL + JWT secrets
pnpm --filter @cykle/api exec prisma db push
pnpm --filter @cykle/api db:seed
pnpm dev                         # starts API :4000 + Web :3000 concurrently
```

---

## Architecture

```
cykle/
├── apps/
│   ├── api/      # Express + Prisma + PostgreSQL (port 4000)
│   └── web/      # Next.js 14 App Router (port 3000)
└── packages/
    └── shared/   # Shared types, constants, utilities
```

### Portals

- `/customer` — browse vendors, build cart, schedule pickup/delivery, track orders
- `/vendor` — manage orders, confirm weights, update service catalog
- `/driver` — accept legs, GPS heartbeat, proof-of-pickup/delivery
- `/admin` — analytics, user management, commission overrides, platform config

### Two-leg logistics

Every order creates two `OrderLeg` rows:
1. **PICKUP** — driver collects dirty laundry from customer → drops at vendor
2. **DELIVERY** — driver collects clean laundry from vendor → delivers to customer
