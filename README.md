# MOSTBET // Provably Fair Gaming Simulation Platform

A full-stack, mobile-responsive e-gaming simulation platform built with **Next.js 15 (App Router)**, **Prisma ORM**, **Tailwind CSS**, and **PostgreSQL (Local / pgAdmin 4)**.

Designed following the reverse-engineered **Mostbet Official Portal** architecture: Deep Navy (`#08478E`), Base Canvas (`#040F26`), Action Orange (`#FF6B00`), and Star Gold (`#FFC700`).

---

## 🚀 Key Features

1. **Provably Fair Verification (HMAC-SHA256)**:
   - Every round generates a cryptographic server seed and hashes it via SHA-256 before the bet is placed.
   - Verifiable deterministic outcomes for Aviator, Penalty Shoot-Out, Mines, Coin Flip, and Dice.
2. **5 Instant-Win Arcade Games**:
   - **Aviator Crash**: Real-time climbing flight curve, auto-cashout, and multiplier history pills.
   - **Penalty Shoot-Out**: 5-goal progressive ladder (up to 30.72x) with animated goalkeeper saves.
   - **Mines 5x5 Grid**: Step-by-step gem discovery and dynamic risk cashout.
   - **Coin Flip**: 3D physics coin toss with 1.98x payout.
   - **Dice Over / Under**: Real-time slider (2.00 to 98.00) with payouts up to 49.50x (99% RTP).
3. **Bangladeshi Mobile Banking (MFS) Integration**:
   - Live bKash (`01798-234567`), Nagad, and Rocket numbers with one-click copy.
   - Step-by-step cash-in / Send Money instructions and TrxID submission.
4. **Bilingual Localization**:
   - Seamless dynamic toggle between Bangla (`বাংলা`) and English (`ENG`).
5. **Admin Control Desk (`/admin`)**:
   - Passcode-protected administrative dashboard (`hermes_admin_secret_9988`).
   - One-click manual approval/rejection for simulation requests.
   - Direct user balance modifier with audit trail.
   - Live platform ledger inspecting round outcomes and server seeds.

---

## 🐘 Local PostgreSQL & pgAdmin 4 Setup

The project is configured to use your local PostgreSQL database managed via **pgAdmin 4** (no remote/hosted Prisma Postgres required).

### 1. Configure Connection in `.env`
Ensure your local PostgreSQL connection string is set in `.env`:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/bet_demo?schema=public"
ADMIN_SECRET_KEY="hermes_admin_secret_9988"
```

### 2. Setup Database in pgAdmin 4
1. Open **pgAdmin 4** on your machine.
2. Connect to your local PostgreSQL server (`localhost:5432`).
3. Right-click **Databases** > **Create** > **Database...**, name it `bet_demo` and click **Save**.
4. Right-click the newly created `bet_demo` database and select **Query Tool**.
5. Open or paste the contents of [`prisma/schema.sql`](./prisma/schema.sql).
6. Click **Execute / Run (F5)**.
   - This creates all 5 tables (`User`, `Wallet`, `Transaction`, `GameRound`, `SimulationRequest`), creates high-performance indexes, and inserts the default demo player `player_one` with 1,000 PTS balance.

### 3. Generate Prisma Client (Local PostgreSQL)
```bash
npx prisma generate
```

Or push changes directly from schema:
```bash
npx prisma db push
```

---

## 🏃 Running the Application

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Run the Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Admin Access

- **URL**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **Passcode**: `hermes_admin_secret_9988`
