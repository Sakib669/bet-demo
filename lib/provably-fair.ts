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

/**
 * ============================================================================
 * CV666 FLAGSHIP GAMES MATHEMATICS & CSPRNG RESOLUTION
 * ============================================================================
 */

/**
 * 1. WIN GO (Color & Number Trading)
 * Winning Number: 0 to 9
 * Colors:
 * - 0: Red + Violet (half split)
 * - 5: Green + Violet (half split)
 * - 1, 3, 7, 9: Green
 * - 2, 4, 6, 8: Red
 * Big: 5, 6, 7, 8, 9
 * Small: 0, 1, 2, 3, 4
 */
export interface WinGoResult {
  number: number;
  color: "GREEN" | "RED" | "VIOLET" | "GREEN_VIOLET" | "RED_VIOLET";
  size: "BIG" | "SMALL";
}

export function resolveWinGo(serverSeed: string, period: string | number, clientSeed = "client-wingo"): WinGoResult {
  const hash = crypto
    .createHmac("sha256", serverSeed)
    .update(`${clientSeed}-period-${period}`)
    .digest("hex");
  const value = parseInt(hash.substring(0, 8), 16);
  const number = value % 10;

  let color: WinGoResult["color"];
  if (number === 0) color = "RED_VIOLET";
  else if (number === 5) color = "GREEN_VIOLET";
  else if ([1, 3, 7, 9].includes(number)) color = "GREEN";
  else color = "RED";

  const size: "BIG" | "SMALL" = number >= 5 ? "BIG" : "SMALL";

  return { number, color, size };
}

/**
 * Evaluates Win Go bet outcome and returns net payout multiplier.
 * Bet options:
 * - "GREEN": 2x (or 1.5x if 5 hits)
 * - "RED": 2x (or 1.5x if 0 hits)
 * - "VIOLET": 4.5x (if 0 or 5 hits)
 * - "BIG": 2x
 * - "SMALL": 2x
 * - "NUM_0" through "NUM_9": 9x
 */
export function calculateWinGoPayout(betType: string, result: WinGoResult): number {
  const { number, color, size } = result;

  if (betType === "GREEN") {
    if (color === "GREEN") return 2.0;
    if (color === "GREEN_VIOLET") return 1.5;
    return 0;
  }
  if (betType === "RED") {
    if (color === "RED") return 2.0;
    if (color === "RED_VIOLET") return 1.5;
    return 0;
  }
  if (betType === "VIOLET") {
    if (color === "GREEN_VIOLET" || color === "RED_VIOLET") return 4.5;
    return 0;
  }
  if (betType === "BIG") {
    return size === "BIG" ? 2.0 : 0;
  }
  if (betType === "SMALL") {
    return size === "SMALL" ? 2.0 : 0;
  }
  if (betType.startsWith("NUM_")) {
    const chosenNum = parseInt(betType.replace("NUM_", ""), 10);
    return chosenNum === number ? 9.0 : 0;
  }
  return 0;
}

/**
 * 2. DRAGON TIGER
 * Card Rank: 1 (Ace) to 13 (King).
 * Suits: Spades, Hearts, Clubs, Diamonds.
 * Dragon vs Tiger: High card wins. If equal rank, it is a TIE.
 */
export interface Card {
  rank: number; // 1 to 13 (1 = Ace, 11 = J, 12 = Q, 13 = K)
  suit: "♠" | "♥" | "♣" | "♦";
  label: string;
}

export interface DragonTigerResult {
  dragonCard: Card;
  tigerCard: Card;
  winner: "DRAGON" | "TIGER" | "TIE";
}

const SUITS: Array<"♠" | "♥" | "♣" | "♦"> = ["♠", "♥", "♣", "♦"];
const RANK_LABELS: Record<number, string> = {
  1: "A",
  2: "2",
  3: "3",
  4: "4",
  5: "5",
  6: "6",
  7: "7",
  8: "8",
  9: "9",
  10: "10",
  11: "J",
  12: "Q",
  13: "K",
};

export function resolveDragonTiger(serverSeed: string, roundRef: string | number, clientSeed = "client-dt"): DragonTigerResult {
  const hash = crypto
    .createHmac("sha256", serverSeed)
    .update(`${clientSeed}-dt-${roundRef}`)
    .digest("hex");

  const dVal = parseInt(hash.substring(0, 4), 16);
  const tVal = parseInt(hash.substring(4, 8), 16);

  const dRank = (dVal % 13) + 1;
  const dSuit = SUITS[parseInt(hash.substring(8, 10), 16) % 4];

  const tRank = (tVal % 13) + 1;
  const tSuit = SUITS[parseInt(hash.substring(10, 12), 16) % 4];

  const dragonCard: Card = { rank: dRank, suit: dSuit, label: RANK_LABELS[dRank] };
  const tigerCard: Card = { rank: tRank, suit: tSuit, label: RANK_LABELS[tRank] };

  let winner: "DRAGON" | "TIGER" | "TIE" = "TIE";
  if (dRank > tRank) winner = "DRAGON";
  else if (tRank > dRank) winner = "TIGER";

  return { dragonCard, tigerCard, winner };
}

/**
 * 3. CRAZY WHEEL (Money Wheel / Mega Wheel)
 * 12 Wheel Segments with varying multipliers:
 * [1x, 2x, 1x, 5x, 1x, 2x, 10x, 1x, 2x, 20x, 1x, 50x]
 */
export interface WheelSegment {
  index: number;
  multiplier: number;
  color: string;
  label: string;
}

export const CRAZY_WHEEL_SEGMENTS: WheelSegment[] = [
  { index: 0, multiplier: 1, color: "#193e87", label: "1X" },
  { index: 1, multiplier: 2, color: "#0000F2", label: "2X" },
  { index: 2, multiplier: 1, color: "#193e87", label: "1X" },
  { index: 3, multiplier: 5, color: "#10b981", label: "5X" },
  { index: 4, multiplier: 1, color: "#193e87", label: "1X" },
  { index: 5, multiplier: 2, color: "#0000F2", label: "2X" },
  { index: 6, multiplier: 10, color: "#8b5cf6", label: "10X" },
  { index: 7, multiplier: 1, color: "#193e87", label: "1X" },
  { index: 8, multiplier: 2, color: "#0000F2", label: "2X" },
  { index: 9, multiplier: 20, color: "#fc7219", label: "20X" },
  { index: 10, multiplier: 1, color: "#193e87", label: "1X" },
  { index: 11, multiplier: 50, color: "#e11d48", label: "50X" },
];

export function resolveCrazyWheel(serverSeed: string, spinRef: string | number, clientSeed = "client-wheel"): WheelSegment {
  const hash = crypto
    .createHmac("sha256", serverSeed)
    .update(`${clientSeed}-wheel-${spinRef}`)
    .digest("hex");
  const value = parseInt(hash.substring(0, 8), 16);
  const segmentIndex = value % CRAZY_WHEEL_SEGMENTS.length;
  return CRAZY_WHEEL_SEGMENTS[segmentIndex];
}


