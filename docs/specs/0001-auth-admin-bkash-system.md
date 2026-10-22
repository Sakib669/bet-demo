# 0001 · Authentication, Role Based Isolation, bKash Payment Approval, and Admin Audit Ledgers

**Status**: In Progress
**Date**: 2026-10-23
**Decision**: Adopt NextAuth.js v5 with Credentials Provider, bcryptjs hashing, JWT sessions, Next.js Edge Middleware for strict route isolation, atomic Prisma bKash payment verification, dual audit ledgers, and deep user analytics.

## Summary
Build a complete authentication and authorization system with two distinct user roles (CUSTOMER and ADMIN). Protect routes at the edge using Next.js middleware so that admins cannot access customer game surfaces and customers cannot access admin panels. Provide a bKash deposit verification workflow where users submit payment claims and admins review and approve them atomically, updating wallet balances, logging game credit transfers and incoming income records. Provide an exhaustive analytics dashboard per user showing game frequency, win loss ratio, wagered amounts, provably fair seed histories, and deposit records.

## Requirements
- AC-1: Customer registration with Name, Mobile (11 digit Bangladesh format 013 to 019), optional Email, and Password.
- AC-2: Login using Mobile number and Password via NextAuth.js v5 Credentials provider with bcryptjs password comparison.
- AC-3: Next.js middleware enforces strict role based access control. Customers visiting /admin/* are redirected to /. Admins visiting / are redirected to /admin/dashboard. Unauthenticated users visiting protected pages are redirected to /login.
- AC-4: Customer can view active bKash deposit number, copy it, and submit a deposit request with amount, sender mobile number, and bKash TrxID.
- AC-5: Deposit requests enforce unique bKash TrxID to prevent duplicate submissions.
- AC-6: Admin can view all deposit requests filtered by PENDING, APPROVED, REJECTED.
- AC-7: Admin can approve a pending deposit inside an atomic database transaction that updates deposit status, credits customer wallet, creates a CreditTransfer record, and logs double entry transactions.
- AC-8: Admin can reject a pending deposit with an optional administrative reason note.
- AC-9: Admin panel provides dual transaction audit ledgers: (1) Game Credit Ledger and (2) bKash Income Ledger.
- AC-10: Admin panel provides user listing and deep user detail page (/admin/users/[id]) with comprehensive game usage metrics, win loss ratio, total wagered vs won, provably fair seed logs, deposit history, and manual credit adjustment tool.
- AC-11: Admin can update the active bKash payment number and instructions from /admin/settings.
- AC-12: Existing game endpoints use authenticated session user instead of hardcoded demo user.

## Data Model
- User: id, name, mobile (unique), email (nullable, unique), passwordHash, role (CUSTOMER, ADMIN), isActive, lastLoginAt, createdAt, updatedAt
- Wallet: id, userId, balance, lockedBalance, updatedAt
- Transaction: id, walletId, type, amount, balanceBefore, balanceAfter, referenceId, description, createdAt
- DepositRequest: id, userId, amount, bkashTrxId (unique), senderNumber, status (PENDING, APPROVED, REJECTED), adminNote, reviewedById, reviewedAt, createdAt, updatedAt
- CreditTransfer: id, userId, adminId, amount, reason, depositRequestId (unique, nullable), createdAt
- SiteSetting: id, key (unique), value, updatedAt
- GameRound: existing, tied to User

## Build Plan
1. Schema update and migrations with Prisma.
2. Install next-auth, bcryptjs, and type definitions.
3. Auth configuration (lib/auth.ts) and Next.js middleware (middleware.ts).
4. Auth API routes and register endpoint.
5. Deposit and settings API routes.
6. Admin API routes (deposits, users, analytics, transactions, settings).
7. Seed initial admin account and default settings.
8. Customer UI: Login, Register, TopUpModal integration with bKash API, Navbar session state.
9. Admin UI: Layout, Dashboard, Payments queue, Users list, User detail analytics, Transaction ledgers, Settings.
10. Update game API routes to bind to session user.
11. Build verification and testing.
