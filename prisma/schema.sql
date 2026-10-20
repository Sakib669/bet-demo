-- ==============================================================================
-- BET-DEMO: PostgreSQL Schema for pgAdmin 4
-- Database: bet_demo
-- Description: Provably fair gaming simulation platform tables & relations
-- ==============================================================================

-- 1. Enable UUID Extension (Optional, using text UUIDs natively)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables in reverse dependency order if rebuilding
DROP TABLE IF EXISTS "SimulationRequest" CASCADE;
DROP TABLE IF EXISTS "GameRound" CASCADE;
DROP TABLE IF EXISTS "Transaction" CASCADE;
DROP TABLE IF EXISTS "Wallet" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- 2. Users Table
CREATE TABLE "User" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    "username" TEXT NOT NULL UNIQUE,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Wallets Table (1:1 with User, double-entry audit)
CREATE TABLE "Wallet" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    "userId" TEXT NOT NULL UNIQUE,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 1000.0,
    "lockedBalance" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_wallet_user" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 4. Transactions Ledger Table (Double-entry balance history)
CREATE TABLE "Transaction" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    "walletId" TEXT NOT NULL,
    "type" TEXT NOT NULL, -- 'DAILY_BONUS' | 'ADMIN_GRANT' | 'BET_PLACED' | 'BET_WON' | 'REFUND'
    "amount" DOUBLE PRECISION NOT NULL,
    "balanceBefore" DOUBLE PRECISION NOT NULL,
    "balanceAfter" DOUBLE PRECISION NOT NULL,
    "referenceId" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_transaction_wallet" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 5. GameRounds Table (CSPRNG Provably Fair history)
CREATE TABLE "GameRound" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    "userId" TEXT NOT NULL,
    "gameType" TEXT NOT NULL, -- 'AVIATOR' | 'PENALTY' | 'MINES' | 'COIN_FLIP' | 'DICE'
    "betAmount" DOUBLE PRECISION NOT NULL,
    "multiplier" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "payout" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS', -- 'IN_PROGRESS' | 'WON' | 'LOST' | 'CANCELLED'
    "serverSeed" TEXT NOT NULL,
    "state" TEXT, -- JSON state (crash point, mines revealed, etc.)
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "settledAt" TIMESTAMP(3),
    CONSTRAINT "fk_gameround_user" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 6. SimulationRequests Table (bKash/Nagad top-up submissions)
CREATE TABLE "SimulationRequest" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    "userId" TEXT NOT NULL,
    "requestedAmount" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING' | 'APPROVED' | 'REJECTED'
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_simulation_user" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 7. High-Performance Indexes for pgAdmin queries
CREATE INDEX "idx_user_username" ON "User"("username");
CREATE INDEX "idx_wallet_userId" ON "Wallet"("userId");
CREATE INDEX "idx_transaction_walletId" ON "Transaction"("walletId");
CREATE INDEX "idx_transaction_createdAt" ON "Transaction"("createdAt" DESC);
CREATE INDEX "idx_gameround_userId" ON "GameRound"("userId");
CREATE INDEX "idx_gameround_gameType" ON "GameRound"("gameType");
CREATE INDEX "idx_gameround_status" ON "GameRound"("status");
CREATE INDEX "idx_gameround_createdAt" ON "GameRound"("createdAt" DESC);
CREATE INDEX "idx_simulation_status" ON "SimulationRequest"("status");
CREATE INDEX "idx_simulation_userId" ON "SimulationRequest"("userId");

-- 8. Initial Seed Data (Demo player for immediate gameplay)
INSERT INTO "User" ("id", "username", "role", "createdAt", "updatedAt")
VALUES ('user_demo_001', 'player_one', 'USER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("username") DO NOTHING;

INSERT INTO "Wallet" ("id", "userId", "balance", "lockedBalance", "updatedAt")
VALUES ('wallet_demo_001', 'user_demo_001', 1000.0, 0.0, CURRENT_TIMESTAMP)
ON CONFLICT ("userId") DO NOTHING;

INSERT INTO "Transaction" ("id", "walletId", "type", "amount", "balanceBefore", "balanceAfter", "description", "createdAt")
VALUES ('tx_init_001', 'wallet_demo_001', 'DAILY_BONUS', 1000.0, 0.0, 1000.0, 'Initial Welcome Free Credits (pgAdmin Seed)', CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
