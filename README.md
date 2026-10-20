# HERMES // Provably Fair Gaming Simulation Platform

A full-stack, mobile-first e-gaming simulation platform built with **Next.js 15 (App Router)**, **Prisma ORM**, **Tailwind CSS**, and **PostgreSQL/SQLite**.

Designed following the **Hermes Launch Edition** design system: Deep Midnight (`#060814`) background, Electric Cobalt Blue (`#0000F2`) accents, and Electric Cyan (`#00D2FF`) glow highlights.

---

## 🚀 Key Features

1. **Provably Fair Verification (HMAC-SHA256)**:
   - Every round generates a cryptographic server seed and hashes it via SHA-256 before the bet is placed.
   - Players can inspect the verifiable hash directly in the game UI.
2. **Double-Entry Financial Ledger**:
   - Every credit, stake deduction, win payout, and admin adjustment is recorded atomically inside an immutable transaction ledger.
3. **Three Fast, Responsive Mini-Games**:
   - **Coin Flip**: 3D CSS physics coin flip with 1.98x multiplier (50/50 probability).
   - **Dice Over / Under**: Real-time slider (2.00 to 98.00) with dynamic odds and payouts up to 49.50x (99% RTP).
   - **Mines 5x5 Grid**: 25-tile grid with customizable mine density (1 to 24 mines) and dynamic step-by-step cashout multiplier.
4. **Simulation Wallet & Free Refills**:
   - 1,000 free demo credits on signup.
   - 250 PTS daily allowance with automatic 24-hour rate-limiting.
   - User-to-Admin simulated top-up request pipeline.
5. **Admin Control Desk (`/admin`)**:
   - Passcode-protected administrative dashboard (`hermes_admin_secret_9988`).
   - One-click manual approval/rejection for simulation requests.
   - Direct user balance modifier with audit trail.
   - Live platform ledger inspecting round outcomes and server seeds.
6. **Mobile-First UX**:
   - Fixed bottom thumb navigation bar on mobile viewports.
   - Tactile quick-bet presets (10, 50, 100, 500, 2X).

---

## 🛠️ Tech Stack

- **Runtime**: Node.js (strictly enforced)
- **Framework**: Next.js 15 (App Router, Server Actions & API Routes)
- **ORM & Database**: Prisma ORM with SQLite (zero-config local run) / PostgreSQL ready
- **Styling**: Tailwind CSS with custom glassmorphism, cobalt focus rings, and custom scrollbars
- **Icons**: Lucide React

---

## 🏃 Getting Started

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Generate Prisma Client & Database
```bash
npx prisma generate
npx prisma db push
```

### 3. Run the Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Admin Access

- **Path**: [`/admin`](http://localhost:3000/admin)
- **Default Secret Key**: `hermes_admin_secret_9988` (configurable in `.env`)
