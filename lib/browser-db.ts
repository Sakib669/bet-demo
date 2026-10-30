"use client";

// This is a single-browser prototype store. Anyone with access to this browser
// can inspect or change it; it must never be treated as a payment authority.
const KEY = "pulse:database:v1";
const SESSION = "pulse:session:v1";
type User = { id: string; name: string; mobile: string; email?: string; passwordHash: string; salt: string; role: "ADMIN" | "CUSTOMER"; isActive: boolean; balance: number; createdAt: string; lastLoginAt?: string };
type Deposit = { id: string; userId: string; amount: number; bkashTrxId: string; senderNumber: string; status: "PENDING" | "APPROVED" | "REJECTED"; createdAt: string; reviewedAt?: string; reviewedById?: string; adminNote?: string };
type Round = { id: string; userId: string; gameType: string; betAmount: number; multiplier: number; payout: number; status: string; createdAt: string; serverSeed: string; state: Record<string, any>; settledAt?: string };
type Transfer = { id: string; userId: string; adminId: string; amount: number; reason: string; depositRequestId?: string; createdAt: string };
type Ledger = { id: string; userId: string; type: string; amount: number; balanceBefore: number; balanceAfter: number; description: string; createdAt: string };
type Database = { users: User[]; deposits: Deposit[]; rounds: Round[]; transfers: Transfer[]; ledger: Ledger[]; settings: { bkash_number: string; bkash_type: string } };

const blank = (): Database => ({ users: [], deposits: [], rounds: [], transfers: [], ledger: [], settings: { bkash_number: "", bkash_type: "Personal (Send Money)" } });
function read(): Database { try { const value = localStorage.getItem(KEY); return value ? { ...blank(), ...JSON.parse(value) } : blank(); } catch { return blank(); } }
function save(db: Database) { localStorage.setItem(KEY, JSON.stringify(db)); window.dispatchEvent(new Event("pulse:db-change")); }
const id = () => crypto.randomUUID();
const now = () => new Date().toISOString();
const money = (n: number) => Math.round(n * 100) / 100;
const random = (max: number) => { const values = new Uint32Array(1); crypto.getRandomValues(values); return values[0] % max; };
const error = (message: string) => ({ success: false, message });
function current(db: Database) { return db.users.find((user) => user.id === localStorage.getItem(SESSION) && user.isActive); }
function admin(db: Database) { const user = current(db); return user?.role === "ADMIN" ? user : null; }
function publicUser(user: User) { const { passwordHash, salt, ...rest } = user; void passwordHash; void salt; return { ...rest, wallet: { balance: user.balance } }; }
async function hashPassword(password: string, salt: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: new TextEncoder().encode(salt), iterations: 120000, hash: "SHA-256" }, key, 256);
  return Array.from(new Uint8Array(bits), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
function changeBalance(db: Database, user: User, amount: number, type: string, description: string) {
  const before = user.balance;
  user.balance = money(before + amount);
  db.ledger.unshift({ id: id(), userId: user.id, type, amount, balanceBefore: before, balanceAfter: user.balance, description, createdAt: now() });
}
function startRound(db: Database, user: User, gameType: string, amount: number, state: Record<string, any> = {}) {
  if (!Number.isFinite(amount) || amount < 1 || amount > 5000 || money(amount) !== amount) return error("Enter a stake from 1 to 5,000 points.");
  if (user.balance < amount) return error("Insufficient balance.");
  changeBalance(db, user, -amount, "BET_PLACED", `${gameType} stake`);
  const round: Round = { id: id(), userId: user.id, gameType, betAmount: amount, multiplier: 0, payout: 0, status: "IN_PROGRESS", createdAt: now(), serverSeed: id(), state };
  db.rounds.unshift(round);
  save(db);
  return round;
}
function settle(db: Database, user: User, round: Round, multiplier: number) {
  if (round.status !== "IN_PROGRESS") return error("Round already settled.");
  round.multiplier = multiplier;
  round.payout = money(round.betAmount * multiplier);
  round.status = round.payout > 0 ? "WON" : "LOST";
  round.settledAt = now();
  if (round.payout) changeBalance(db, user, round.payout, "BET_WON", `${round.gameType} payout`);
  save(db);
  return { success: true, won: round.payout > 0, payout: round.payout, multiplier, newBalance: user.balance, serverSeed: round.serverSeed };
}
function activeRound(db: Database, user: User, roundId: string, gameType: string) {
  return db.rounds.find((round) => round.id === roundId && round.userId === user.id && round.gameType === gameType && round.status === "IN_PROGRESS");
}
function game(db: Database, user: User, slug: string, body: any): any {
  const amount = Number(body.betAmount);
  if (slug === "coin-flip" || slug === "dice" || slug === "dragon-tiger" || slug === "wheel") {
    const round = startRound(db, user, slug.toUpperCase().replace("-", "_"), amount);
    if (!("id" in round)) return round;
    let multiplier = 0; let result: Record<string, any> = {};
    if (slug === "coin-flip") { const outcome = random(2) ? "HEADS" : "TAILS"; multiplier = body.choice === outcome ? 1.98 : 0; result = { outcome, seedHash: round.serverSeed }; }
    if (slug === "dice") { const roll = random(10000) / 100; const target = Number(body.target); const condition = String(body.condition).toUpperCase(); const chance = condition === "OVER" ? 100 - target : target; multiplier = Number.isFinite(chance) && chance >= 1 && chance <= 98 && (condition === "OVER" ? roll > target : roll < target) ? money(99 / chance) : 0; result = { roll, seedHash: round.serverSeed }; }
    if (slug === "dragon-tiger") { const card = () => { const rank = random(13) + 1; return { rank, suit: ["♠", "♥", "♣", "♦"][random(4)], label: ({ 1: "A", 11: "J", 12: "Q", 13: "K" } as Record<number,string>)[rank] || String(rank) }; }; const dragonCard = card(), tigerCard = card(); const winner = dragonCard.rank === tigerCard.rank ? "TIE" : dragonCard.rank > tigerCard.rank ? "DRAGON" : "TIGER"; multiplier = body.betSide === winner ? (winner === "TIE" ? 9 : 2) : winner === "TIE" ? .5 : 0; result = { outcome: { dragonCard, tigerCard, winner } }; }
    if (slug === "wheel") { const multiples = [1,2,1,5,1,2,10,1,2,20,1,50]; const index = random(12); const winning = multiples[index]; multiplier = Number(body.selectedMultiplier) === winning ? winning + 1 : 0; result = { winningSegment: { index, multiplier: winning, label: `${winning}X` } }; }
    return { ...settle(db, user, round, multiplier), roundId: round.id, ...result };
  }
  if (slug === "wingo") {
    if (body.action === "BET") { const round = startRound(db, user, "WIN_GO", amount, { betType: body.betType, period: body.period }); return "id" in round ? { success: true, roundId: round.id, seedHash: round.serverSeed, period: body.period, newBalance: user.balance } : round; }
    const round = activeRound(db, user, body.roundId, "WIN_GO"); if (!round) return error("Round not found or already settled.");
    const number = random(10); const color = number === 0 ? "RED_VIOLET" : number === 5 ? "GREEN_VIOLET" : number % 2 ? "GREEN" : "RED"; const size = number >= 5 ? "BIG" : "SMALL"; const bet = String(round.state.betType); const multiplier = bet === `NUM_${number}` ? 9 : bet === size ? 2 : bet === "VIOLET" && (number === 0 || number === 5) ? 4.5 : bet === color ? 2 : (bet === "GREEN" && number === 5) || (bet === "RED" && number === 0) ? 1.5 : 0;
    const outcome = { number, color, size }; round.state.outcome = outcome; return { ...settle(db, user, round, multiplier), outcome };
  }
  if (slug === "aviator") {
    if (body.action === "START") { const crashMultiplier = Math.min(100, Math.max(1, money(.99 / (1 - random(10000) / 10000)))); const round = startRound(db, user, "AVIATOR", amount, { crashMultiplier }); return "id" in round ? { success: true, roundId: round.id, seedHash: round.serverSeed, crashMultiplier, newBalance: user.balance } : round; }
    const round = activeRound(db, user, body.roundId, "AVIATOR"); if (!round) return error("Round not found or already settled.");
    const crashMultiplier = round.state.crashMultiplier; if (body.action === "CRASH") { settle(db, user, round, 0); return { success: true, won: false, crashMultiplier, serverSeed: round.serverSeed }; }
    const claim = Number(body.claimedMultiplier); const won = Number.isFinite(claim) && claim >= 1 && claim < crashMultiplier; return { ...settle(db, user, round, won ? Math.min(claim, 100) : 0), crashMultiplier };
  }
  if (slug === "mines") {
    if (body.action === "START") { const mineCount = Math.max(1, Math.min(24, Number(body.mineCount) || 3)); const mines = new Set<number>(); while (mines.size < mineCount) mines.add(random(25)); const round = startRound(db, user, "MINES", amount, { mineCount, mines: [...mines], revealedGems: [], currentMultiplier: 1 }); return "id" in round ? { success: true, roundId: round.id, currentMultiplier: 1, nextMultiplier: minesMultiplier(mineCount, 1), seedHash: round.serverSeed, newBalance: user.balance } : round; }
    const round = activeRound(db, user, body.roundId, "MINES"); if (!round) return error("Round not found or already settled."); const state = round.state;
    if (body.action === "REVEAL") { const tile = Number(body.tileIndex); if (!Number.isInteger(tile) || tile < 0 || tile > 24 || state.revealedGems.includes(tile)) return error("Invalid tile selection."); if (state.mines.includes(tile)) { settle(db, user, round, 0); return { success: true, status: "LOST", explodedTile: tile, allMines: state.mines, revealedGems: state.revealedGems, payout: 0, newBalance: user.balance }; } state.revealedGems.push(tile); state.currentMultiplier = minesMultiplier(state.mineCount, state.revealedGems.length); if (state.revealedGems.length === 25 - state.mineCount) return { ...settle(db, user, round, state.currentMultiplier), status: "WON", isAutoWin: true, revealedGems: state.revealedGems, allMines: state.mines }; save(db); return { success: true, status: "IN_PROGRESS", revealedGems: state.revealedGems, currentMultiplier: state.currentMultiplier, nextMultiplier: minesMultiplier(state.mineCount, state.revealedGems.length + 1) }; }
    if (!state.revealedGems.length) return error("Reveal a safe tile before cashing out."); return { ...settle(db, user, round, state.currentMultiplier), status: "WON", currentMultiplier: state.currentMultiplier, revealedGems: state.revealedGems, allMines: state.mines };
  }
  if (slug === "penalty") {
    if (body.action === "START") { const round = startRound(db, user, "PENALTY", amount, { goals: 0, currentShot: 0 }); return "id" in round ? { success: true, roundId: round.id, seedHash: round.serverSeed, multipliers: [1.92,3.84,7.68,15.36,30.72], newBalance: user.balance } : round; }
    const round = activeRound(db, user, body.roundId, "PENALTY"); if (!round) return error("Round not found or already settled."); const state = round.state; const multipliers = [1.92,3.84,7.68,15.36,30.72];
    if (body.action === "SHOOT") { const target = Number(body.targetSpot); if (!Number.isInteger(target) || target < 0 || target > 4) return error("Choose a valid target."); const goalkeeperSpot = random(5); const isGoal = target !== goalkeeperSpot; state.currentShot++; if (!isGoal) return { ...settle(db, user, round, 0), isGoal, goalkeeperSpot, roundFinished: true, status: "LOST" }; state.goals++; if (state.goals === 5) return { ...settle(db, user, round, multipliers[4]), isGoal, goalkeeperSpot, goals: 5, roundFinished: true, status: "WON" }; save(db); return { success: true, isGoal, goalkeeperSpot, goals: state.goals, multiplier: multipliers[state.goals - 1], currentMultiplier: multipliers[state.goals - 1], nextMultiplier: multipliers[state.goals], roundFinished: false }; }
    if (!state.goals) return error("Score a goal first."); return { ...settle(db, user, round, multipliers[state.goals - 1]), status: "WON", goals: state.goals };
  }
  return error("Unknown game.");
}
function minesMultiplier(mines: number, gems: number) { let value = .99; for (let i = 0; i < gems; i++) value *= (25 - i) / (25 - mines - i); return Math.max(1.01, money(value)); }

export function signOutLocal() { localStorage.removeItem(SESSION); window.dispatchEvent(new Event("pulse:db-change")); }
export async function registerLocal(body: any) { const db = read(); const mobile = String(body.mobile || "").replace(/[-\s]/g, ""); const password = String(body.password || ""); if (!/^01\d{9}$/.test(mobile)) return error("Enter a valid 11-digit mobile number."); if (password.length < 6) return error("Password must have at least six characters."); if (!String(body.name || "").trim()) return error("Enter your name."); if (db.users.some((user) => user.mobile === mobile)) return error("This mobile number is already registered."); const salt = id(); const user: User = { id: id(), name: String(body.name).trim(), mobile, email: body.email || undefined, passwordHash: await hashPassword(password, salt), salt, role: db.users.some((item) => item.role === "ADMIN") ? "CUSTOMER" : "ADMIN", isActive: true, balance: 0, createdAt: now() }; db.users.push(user); save(db); localStorage.setItem(SESSION, user.id); return { success: true, user: publicUser(user) }; }
export async function signInLocal(mobile: string, password: string) { const db = read(); const user = db.users.find((item) => item.mobile === mobile.replace(/[-\s]/g, "") && item.isActive); if (!user || await hashPassword(password, user.salt) !== user.passwordHash) return error("Invalid mobile number or password."); user.lastLoginAt = now(); save(db); localStorage.setItem(SESSION, user.id); return { success: true, user: publicUser(user) }; }

export async function localFetch(input: string, init?: RequestInit): Promise<Response> {
  const db = read(); const url = new URL(input, window.location.origin); const path = url.pathname; const method = init?.method || "GET"; const body = init?.body ? JSON.parse(String(init.body)) : {}; const user = current(db); let result: any = error("Unknown request.");
  if (path === "/api/wallet") { if (method === "GET") result = { success: true, isAuthenticated: !!user, user: user ? publicUser(user) : null }; else if (!user) result = error("Sign in to access your wallet."); else if (body.action === "CLAIM_DAILY") { const last = db.ledger.find((item) => item.userId === user.id && item.type === "DAILY_BONUS"); if (last && Date.now() - Date.parse(last.createdAt) < 86400000) result = error("Daily reward already claimed. Try again after 24 hours."); else { changeBalance(db, user, 250, "DAILY_BONUS", "Daily free points"); save(db); result = { success: true, message: "250 daily points added.", balance: user.balance }; } } }
  else if (path === "/api/settings/bkash") result = { success: true, data: { number: db.settings.bkash_number, type: db.settings.bkash_type } };
  else if (path === "/api/deposit/request") { if (!user) result = error("Sign in first."); else if (!/^01\d{9}$/.test(String(body.senderNumber || "").replace(/[-\s]/g, ""))) result = error("Enter a valid sender number."); else if (!/^[a-zA-Z0-9]{8,20}$/.test(String(body.bkashTrxId || "").trim())) result = error("Enter a valid transaction ID."); else if (!Number.isInteger(body.amount) || body.amount < 100 || body.amount > 5000) result = error("Choose an amount from 100 to 5,000 BDT."); else if (!db.settings.bkash_number) result = error("The receiving bKash number is not set."); else if (db.deposits.some((item) => item.bkashTrxId.toLowerCase() === body.bkashTrxId.trim().toLowerCase())) result = error("That transaction ID has already been submitted."); else { const deposit: Deposit = { id: id(), userId: user.id, amount: body.amount, senderNumber: body.senderNumber.replace(/[-\s]/g, ""), bkashTrxId: body.bkashTrxId.trim(), status: "PENDING", createdAt: now() }; db.deposits.unshift(deposit); save(db); result = { success: true, deposit }; } }
  else if (path === "/api/deposit/history") result = user ? { success: true, deposits: db.deposits.filter((item) => item.userId === user.id) } : error("Sign in first.");
  else if (path.startsWith("/api/games/")) result = user ? game(db, user, path.split("/").pop() || "", body) : error("Sign in to play credit games.");
  else if (path.startsWith("/api/admin/")) {
    const operator = admin(db); if (!operator) result = error("Operator account required.");
    else if (path === "/api/admin/settings") { if (method === "GET") result = { success: true, settings: db.settings }; else { const number = String(body.bkash_number || "").replace(/[-\s]/g, ""); if (!/^01\d{9}$/.test(number) || number === "01798234567") result = error("Enter a real 11-digit bKash number."); else { db.settings = { bkash_number: number, bkash_type: String(body.bkash_type || "Personal (Send Money)") }; save(db); result = { success: true, settings: db.settings }; } } }
    else if (path === "/api/admin/deposits") { const status = url.searchParams.get("status") || "ALL"; const deposits = db.deposits.filter((item) => status === "ALL" || item.status === status).map((item) => ({ ...item, user: publicUser(db.users.find((u) => u.id === item.userId)!), reviewedBy: item.reviewedById ? publicUser(db.users.find((u) => u.id === item.reviewedById)!) : null })); result = { success: true, deposits, pendingCount: db.deposits.filter((item) => item.status === "PENDING").length }; }
    else if (/^\/api\/admin\/deposits\/[^/]+\/review$/.test(path)) { const deposit = db.deposits.find((item) => item.id === path.split("/")[4]); if (!deposit || deposit.status !== "PENDING") result = error("Payment is no longer pending."); else if (body.action === "APPROVE" && body.verifiedOnStatement !== true) result = error("Confirm the payment in your bKash statement first."); else if (!["APPROVE", "REJECT"].includes(body.action)) result = error("Choose approve or reject."); else { deposit.status = body.action === "APPROVE" ? "APPROVED" : "REJECTED"; deposit.reviewedAt = now(); deposit.reviewedById = operator.id; deposit.adminNote = String(body.adminNote || (deposit.status === "APPROVED" ? "Matched in bKash statement" : "Payment could not be verified")).slice(0, 500); if (deposit.status === "APPROVED") { const customer = db.users.find((item) => item.id === deposit.userId)!; changeBalance(db, customer, deposit.amount, "ADMIN_GRANT", `bKash payment ${deposit.bkashTrxId}`); db.transfers.unshift({ id: id(), userId: customer.id, adminId: operator.id, amount: deposit.amount, reason: "DEPOSIT_APPROVED", depositRequestId: deposit.id, createdAt: now() }); } save(db); result = { success: true, message: deposit.status === "APPROVED" ? "Payment approved and points added." : "Payment rejected.", result: { deposit } }; } }
    else if (path === "/api/admin/transactions") { const incomeLedger = db.deposits.filter((item) => item.status === "APPROVED").map((item) => ({ ...item, user: publicUser(db.users.find((u) => u.id === item.userId)!), reviewedBy: publicUser(db.users.find((u) => u.id === item.reviewedById)!) })); const creditLedger = db.transfers.map((item) => ({ ...item, user: publicUser(db.users.find((u) => u.id === item.userId)!), admin: publicUser(db.users.find((u) => u.id === item.adminId)!), depositRequest: item.depositRequestId ? db.deposits.find((d) => d.id === item.depositRequestId) : null })); result = { success: true, incomeLedger, creditLedger, totals: { totalIncomeBDT: incomeLedger.reduce((sum, item) => sum + item.amount, 0), totalCreditsIssuedPTS: creditLedger.reduce((sum, item) => sum + item.amount, 0), incomeCount: incomeLedger.length, creditCount: creditLedger.length } }; }
    else if (path === "/api/admin/users") { const role = url.searchParams.get("role") || "ALL", search = (url.searchParams.get("search") || "").toLowerCase(); result = { success: true, users: db.users.filter((item) => (role === "ALL" || item.role === role) && `${item.name} ${item.mobile} ${item.email || ""}`.toLowerCase().includes(search)).map((item) => ({ ...publicUser(item), _count: { gameRounds: db.rounds.filter((r) => r.userId === item.id).length, depositRequests: db.deposits.filter((d) => d.userId === item.id).length } })) }; }
    else if (/^\/api\/admin\/users\/[^/]+\/promote$/.test(path)) { const target = db.users.find((item) => item.id === path.split("/")[4]); if (!target) result = error("Member not found."); else if (target.id === operator.id) result = error("You cannot change your own operator role."); else { target.role = target.role === "ADMIN" ? "CUSTOMER" : "ADMIN"; save(db); result = { success: true, message: `${target.name} is now ${target.role.toLowerCase()}.` }; } }
    else if (/^\/api\/admin\/users\/[^/]+\/credit$/.test(path)) { const target = db.users.find((item) => item.id === path.split("/")[4]); const amount = Number(body.amount); if (!target) result = error("Member not found."); else if (!Number.isFinite(amount) || amount === 0 || money(amount) !== amount || amount < -5000 || amount > 5000 || target.balance + amount < 0) result = error("Enter a valid adjustment within the available balance."); else { changeBalance(db, target, amount, "ADMIN_GRANT", String(body.reason || "Manual adjustment")); db.transfers.unshift({ id: id(), userId: target.id, adminId: operator.id, amount, reason: String(body.reason || "MANUAL_GRANT"), createdAt: now() }); save(db); result = { success: true, message: `Balance adjusted by ${amount} PTS.` }; } }
    else if (/^\/api\/admin\/users\/[^/]+$/.test(path)) { const target = db.users.find((item) => item.id === path.split("/")[4]); result = target ? userDetail(db, target) : error("Member not found."); }
  }
  return new Response(JSON.stringify(result), { status: result.success ? 200 : 400, headers: { "Content-Type": "application/json" } });
}

function userDetail(db: Database, user: User) { const rounds = db.rounds.filter((item) => item.userId === user.id); const deposits = db.deposits.filter((item) => item.userId === user.id); const credits = db.transfers.filter((item) => item.userId === user.id); const totalWagered = rounds.reduce((sum, item) => sum + item.betAmount, 0), totalPayout = rounds.reduce((sum, item) => sum + item.payout, 0), wonRounds = rounds.filter((item) => item.status === "WON").length, lostRounds = rounds.filter((item) => item.status === "LOST").length; const gameTypeBreakdown: Record<string,{count:number;wagered:number;won:number}> = {}; for (const round of rounds) { const entry = gameTypeBreakdown[round.gameType] ||= { count: 0, wagered: 0, won: 0 }; entry.count++; entry.wagered += round.betAmount; entry.won += round.payout; } return { success: true, user: publicUser(user), analytics: { totalRounds: rounds.length, wonRounds, lostRounds, winRate: rounds.length ? money(wonRounds / rounds.length * 100) : 0, totalWagered, totalPayout, playerNetProfit: money(totalPayout - totalWagered), totalDeposited: deposits.filter((item) => item.status === "APPROVED").reduce((sum, item) => sum + item.amount, 0), approvedDepositsCount: deposits.filter((item) => item.status === "APPROVED").length, totalCreditsReceived: credits.reduce((sum, item) => sum + item.amount, 0), gameTypeBreakdown, firstGameDate: rounds.at(-1)?.createdAt || null, lastGameDate: rounds[0]?.createdAt || null }, recentGameRounds: rounds.slice(0, 50), depositHistory: deposits.slice(0, 30), creditHistory: credits.slice(0, 30).map((item) => ({ ...item, admin: publicUser(db.users.find((u) => u.id === item.adminId)!) })) }; }
