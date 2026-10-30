# Pulse game room

A responsive game room built with **Next.js 16**, **Prisma ORM 7**, **Tailwind CSS 4**, and a local PostgreSQL database. The site includes eight credit games, two free skill games, account and wallet records, and a manual bKash credit purchase queue.

Pulse uses a dark pine palette, a restrained lime accent, and a single game catalogue across desktop and mobile.

---

## What is in the app

1. **Credit games:** Win Go, Aviator, Mines, Dragon Tiger, Crazy Wheel, Coin Flip, Dice, and Penalty.
2. **Free skill games:** Memory Match and Pattern Recall. Their best scores stay in this browser.
3. **Manual bKash review:** an operator configures the receiving number, checks the transaction ID, sender, and amount against the bKash statement, then approves or rejects the claim. Only approval credits the wallet.
4. **Operations desk:** payment queue, member records, wallet adjustments, and transaction history.
5. **Language choice:** Bangla and English.

---

## Local setup

Use Node.js 22 or newer, pnpm, and a local PostgreSQL database. Create an empty `bet_demo` database with pgAdmin or `createdb`.

1. Install dependencies: `pnpm install`.
2. Copy `.env.example` to `.env` and set your own values:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/bet_demo?schema=public"
AUTH_SECRET="a-long-random-secret"
ADMIN_MOBILE="your-11-digit-mobile-number"
ADMIN_PASSWORD="a-unique-password-with-at-least-12-characters"
```

3. Apply the current schema: `pnpm db:push`.
4. Create or update the operator account: `pnpm exec prisma db seed`. This also disables the old sample accounts if they exist.
5. Start the app: `pnpm dev` and open [http://localhost:3000](http://localhost:3000).
6. Sign in with `ADMIN_MOBILE` and `ADMIN_PASSWORD`, then set your **real** receiving bKash number in `/admin/settings`. The purchase form stays disabled until that number is configured.

Prisma Client is generated during `pnpm install` and `pnpm build`. The current database structure is defined in `prisma/schema.prisma`.

## Payment review

Customers submit the amount, sender mobile, and bKash transaction ID. The operator checks those details against the receiving bKash statement and confirms the match in the payment queue. Approval adds the same number of points as the BDT amount and writes a wallet and credit transfer record. Rejecting a claim does not add points. Claims are never verified automatically.

Credits are for this site's games. The app has no cash withdrawal or credit redemption feature.
