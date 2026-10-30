# Browser storage scope

The user chose browser `localStorage` for all application records. `lib/browser-db.ts` is the sole data layer for accounts, sessions, wallets, payment claims, settings, operator reviews, game rounds, and activity history. Game and page components use `localFetch` to preserve their existing request/response shape without a server API.

The first registered account in a browser profile is the operator; later accounts are players. A claim requires a configured receiving number, valid sender number, 100–5,000 BDT amount, and unique transaction ID. Operator approval requires explicit confirmation that the bKash statement has a matching transaction. Approval is single-use within that browser profile and creates both a wallet entry and a credit transfer record.

This setup is a local prototype. Data is editable, removable, and unavailable on other devices. It is unsuitable for real payment fulfillment or secure credit accounting. Move accounts, wallet operations, game outcomes, and payment reviews to a shared server before accepting money.
