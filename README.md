# 🌿 AI-Powered Campus Environmental & Sustainability Intelligence System (CampusEco)

An enterprise-grade, real-time IoT monitoring and autonomous sustainability platform unifying seven distinct campus environmental systems into a cohesive dashboard powered by **Google Gemini 2.5 (`@google/genai`)**, **React 18 + Vite**, **Express (Node.js 20+)**, and **Supabase PostgreSQL** with Row Level Security (RLS).

---

## 🌟 The 7 Core Sustainability Intelligence Domains

```
                  ┌──────────────────────────────────────────────┐
                  │ Campus Sustainability Intelligence Platform  │
                  └──────────────────────┬───────────────────────┘
                                         │
 ┌───────────────┬───────────────┬───────┴───────┬───────────────┬───────────────┬──────────────┐
 │               │               │               │               │               │              │
 ▼               ▼               ▼               ▼               ▼               ▼              ▼
[DUSTBIN]     [FOOD]          [WATER]         [ENERGY]       [REWARDS]       [RAINWATER]      [AQI]
Waste Mgmt    Cafeteria Ops   Plumbing/Leaks  Power Grids    Recycling Incent Tank Hydrology  Air/Safety
```

1. **Smart Dustbin Monitoring** (`/dustbins`)
   - Real-time volumetric bin fill-level tracking (0–100%) with status color-coding.
   - Threshold-based critical alert dispatch (>85% fill) and battery drain sensors.
   - Dynamic route optimization for custodial waste sweeps.
   - Interactive cleaning action and live telemetry simulator.

2. **Food Waste Reduction System** (`/food-waste`)
   - Cafeteria meal prep estimation powered by Gemini 2.5 (`POST /api/v1/food-waste/predict`).
   - Weather, headcount, and leftover correlation engine with 3-phase staggered batch cooking schedules.
   - Post-meal edible vs. inedible waste logging and compost diversion tracking.

3. **Smart Water Leak Detector** (`/water`)
   - Continuous water flow metering (L/min) across campus distribution manifolds and building risers.
   - Automated baseline deviation calculation and pipe burst identification.
   - Interactive Recharts real-time hydraulic flow comparison graph.
   - Emergency valve isolation actuators (`OPEN`, `THROTTLED`, `ISOLATED`).
   - Gemini hydraulic diagnostic engine (`POST /api/v1/water/analyze`).

4. **Campus Energy Monitoring** (`/energy`)
   - Building-level electricity consumption tracking (kWh, power factor, peak demand in kW).
   - Off-hour anomaly detection and substation capacity utilization heatmaps.
   - AI-driven peak-shaving recommendations and chiller/HVAC schedule optimizer (`POST /api/v1/energy/optimize`).

5. **Plastic Collection Reward System** (`/rewards`)
   - Student recycling wallet balance and transaction ledger.
   - Automated optical sorting kiosk deposit simulator (PET / HDPE bottles).
   - Reward catalog (campus bookstore vouchers, cafeteria combo meals, bike-share passes).
   - Voucher code generator with real-time confetti celebration.
   - Campus recycling leaderboard.

6. **Rainwater Harvesting Monitor** (`/rainwater`)
   - Storage tank capacity monitoring (% full, current liters, buffer days).
   - Inflow/outflow metering and filtration membrane health indicators.
   - Precipitation forecast integration with AI-calculated storm runoff yield estimates (`POST /api/v1/rainwater/forecast`).

7. **Air Quality Monitoring System (AQI)** (`/air-quality`)
   - Multi-zone ambient and indoor micro-climate monitoring (AQI, PM2.5, PM10, CO₂, VOCs, Temperature, Humidity).
   - US EPA color-coded AQI classification.
   - Automated clinical health advisory notifications and economizer ventilation triggers.

8. **Master AI Advisory Engine** (`CampusEco-Brain`)
   - Autonomous synthesis of all 7 IoT streams into a unified executive action plan (`POST /api/v1/ai/master-advisory`).
   - Composite Campus Sustainability Health Score (0–100).
   - Prioritized operational mitigations and projected daily CO₂ reduction estimates.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, TanStack React Query v5, Recharts, Lucide React, Canvas Confetti |
| **Backend** | Node.js 20+, Express.js, TypeScript, REST API architecture (`/api/v1`) |
| **AI Orchestration** | `@google/genai` official SDK (Gemini 2.5 Flash & Gemini 2.5 Pro) |
| **Database & Auth** | Supabase PostgreSQL with Row Level Security (RLS) & Supabase Auth JWT |
| **Validation** | Zod schemas shared across client & server (`shared/schemas.ts`) |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v20.0.0 or higher
- **npm**: v9.0.0 or higher

### 2. Environment Setup
Create or copy the environment configuration:
```bash
# Server configuration
cp .env.example server/.env
```
Populate `server/.env`:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
GEMINI_API_KEY=your-production-gemini-api-key
```

### 3. Database Migration (Supabase SQL Editor)
Execute `supabase/schema.sql` directly in your Supabase SQL Editor. This script creates:
- UUID extension and all 10 domain tables
- Row Level Security (RLS) policies with the `is_staff_or_admin()` security definer function
- Pre-seeded realistic demo data across all 7 environmental modules

### 4. Running the Application

In Terminal 1 (Backend Express Server):
```bash
cd server
npm install
npm run dev
# Server boots at http://localhost:5000 (API at /api/v1)
```

In Terminal 2 (Frontend Client):
```bash
cd client
npm install
npm run dev
# Vite runs at http://localhost:5173 with proxy to port 5000
```

---

## 🔒 Security & Role-Based Access Control (RBAC)

The application enforces strict data isolation and permission boundaries:
- **`admin`**: Full operational privileges, user access management (`/admin/users`), AI master advisories, manual sensor overrides.
- **`staff`**: Access to facility operations (dustbin collection route optimizer, cafeteria prep logger, water valve actuators, rainwater telemetry).
- **`student`**: Student wallet (`/rewards`), voucher redemption store, recycling leaderboard, and public air quality views.

---

## 📡 API Reference (`/api/v1`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/telemetry/overview` | Unified overview across all 7 domains & health score |
| `POST` | `/api/v1/telemetry/resolve-alert/:id` | Acknowledge & resolve an active system alert |
| `GET` | `/api/v1/dustbins` | Query all smart bins and fill metrics |
| `POST` | `/api/v1/dustbins/telemetry` | Record bin fill level & battery status |
| `POST` | `/api/v1/dustbins/:code/clean` | Empty bin and reset fill status |
| `GET` | `/api/v1/dustbins/route-plan` | Generate optimized custodial collection route |
| `GET` | `/api/v1/food-waste` | Historical cafeteria waste logs & statistics |
| `POST` | `/api/v1/food-waste/log` | Submit post-service food waste log |
| `POST` | `/api/v1/food-waste/predict` | **Gemini AI** meal prep estimation & batch schedule |
| `GET` | `/api/v1/water/sensors` | Real-time hydraulic flow telemetry |
| `POST` | `/api/v1/water/analyze` | **Gemini AI** pipe burst diagnostics & isolation directives |
| `POST` | `/api/v1/water/valve/:code` | Toggle valve state (`OPEN`, `THROTTLED`, `ISOLATED`) |
| `GET` | `/api/v1/energy/buildings` | Campus electrical demand & carbon index |
| `POST` | `/api/v1/energy/optimize` | **Gemini AI** building HVAC peak-shaving plan |
| `GET` | `/api/v1/rewards/balance/:id` | Student points balance & active vouchers |
| `POST` | `/api/v1/rewards/deposit` | Log plastic deposit & credit student points |
| `POST` | `/api/v1/rewards/redeem` | Redeem voucher from rewards catalog |
| `GET` | `/api/v1/rainwater/status` | Cistern storage volumes & weather forecast |
| `POST` | `/api/v1/rainwater/forecast` | Storm runoff harvest yield calculation |
| `GET` | `/api/v1/air-quality/zones` | Multi-zone AQI telemetry & health advisories |
| `POST` | `/api/v1/ai/master-advisory` | **Gemini AI** cross-domain campus sustainability plan |
