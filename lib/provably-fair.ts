import crypto from "crypto";

export function generateServerSeed(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function hashSeed(seed: string): string {
  return crypto.createHash("sha256").update(seed).digest("hex");
}

/**
 * Resolves a coin flip deterministically from server and client seeds.
 */
export function resolveCoinFlip(serverSeed: string, clientSeed = "client-seed"): "HEADS" | "TAILS" {
  const hash = crypto
    .createHmac("sha256", serverSeed)
    .update(clientSeed)
    .digest("hex");
  const value = parseInt(hash.substring(0, 8), 16);
  return value % 2 === 0 ? "HEADS" : "TAILS";
}

/**
 * Generates a float between 0.00 and 99.99 for dice games.
 */
export function resolveDice(serverSeed: string, clientSeed = "client-seed"): number {
  const hash = crypto
    .createHmac("sha256", serverSeed)
    .update(clientSeed)
    .digest("hex");
  const value = parseInt(hash.substring(0, 8), 16);
  const floatVal = (value % 10000) / 100;
  return parseFloat(floatVal.toFixed(2));
}

/**
 * Deterministically generates distinct mine locations on a 5x5 grid (indices 0 to 24).
 */
export function generateMines(serverSeed: string, mineCount: number, clientSeed = "client-seed"): number[] {
  const positions: number[] = [];
  let counter = 0;

  while (positions.length < mineCount) {
    const hash = crypto
      .createHmac("sha256", serverSeed)
      .update(`${clientSeed}-${counter}`)
      .digest("hex");
    const index = parseInt(hash.substring(0, 4), 16) % 25;
    if (!positions.includes(index)) {
      positions.push(index);
    }
    counter++;
  }

  return positions;
}

/**
 * Calculates current payout multiplier for the Mines game based on grid mathematics.
 * Uses house edge of 1% (0.99 return to player).
 */
export function calculateMinesMultiplier(mineCount: number, gemsRevealed: number): number {
  if (gemsRevealed === 0) return 1.0;
  
  let multiplier = 0.99;
  const totalTiles = 25;
  const safeTiles = totalTiles - mineCount;

  for (let i = 0; i < gemsRevealed; i++) {
    multiplier *= (totalTiles - i) / (safeTiles - i);
  }

  return Math.max(1.01, parseFloat(multiplier.toFixed(2)));
}

/**
 * Deterministically resolves Aviator / Crash crash point from seeds.
 * Returns crash multiplier with 2 decimal precision (e.g. 1.00x - 100.00x+).
 * Uses standard Bustabit / Aviator mathematical algorithm (99% RTP, 1% instant bust).
 */
export function resolveCrashMultiplier(serverSeed: string, clientSeed = "client-seed"): number {
  const hash = crypto
    .createHmac("sha256", serverSeed)
    .update(clientSeed)
    .digest("hex");

  // 1% chance of instant crash at 1.00x
  const instantBust = parseInt(hash.substring(0, 4), 16) % 100 === 0;
  if (instantBust) return 1.00;

  // Standard crash curve: 0.99 / (1 - uniform)
  const hexPart = hash.substring(4, 12);
  const intVal = parseInt(hexPart, 16);
  const uniform = intVal / 0xffffffff;
  
  // Guard against division by zero
  const rawMult = Math.min(100.00, Math.max(1.00, 0.99 / (1 - uniform)));
  return parseFloat(rawMult.toFixed(2));
}

/**
 * Deterministically resolves goalkeeper dive spot for Penalty Shoot-Out.
 * Spot index: 0 = Top-Left, 1 = Top-Right, 2 = Bottom-Left, 3 = Bottom-Right, 4 = Center.
 */
export function resolvePenaltyGoalkeeper(serverSeed: string, shotNumber: number, clientSeed = "client-seed"): number {
  const hash = crypto
    .createHmac("sha256", serverSeed)
    .update(`${clientSeed}-shot-${shotNumber}`)
    .digest("hex");
  const value = parseInt(hash.substring(0, 4), 16);
  return value % 5;
}

export const PENALTY_MULTIPLIERS = [1.92, 3.84, 7.68, 15.36, 30.72];

