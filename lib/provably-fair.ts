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
