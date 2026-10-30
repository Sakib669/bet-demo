# Pulse game room

A responsive Next.js 16 game room with eight credit games, two free puzzle games, an operator desk, and a manual bKash review preview. All accounts, wallets, rounds, settings, and payment claims are stored in the current browser's `localStorage`. No database server or environment variables are required.

## Run locally

Use Node.js 22 or newer and pnpm:

```sh
pnpm install
pnpm dev
```

Open `http://localhost:3000`. The first account registered in a browser profile becomes its operator. Register another account in the same profile to create a player. The operator can set a bKash receiving number under **Operations → Settings**. A player can then submit a claim from **Credits**, and the operator can review it under **Payment queue** after checking the bKash statement. Approval adds the same number of points as the claimed BDT amount. The game room also offers 250 free points once every 24 hours for testing.

## Limits of browser storage

This is a single-browser preview. Different devices and browser profiles do not share accounts or payment claims. Clearing site data removes all records, and anyone with browser access can edit balances or approvals using developer tools. Consequently this cannot safely fulfill real customer payments or serve as an authoritative revenue ledger. A shared server database and server-side authorization are required before accepting real money. The interface states this limitation wherever a payment can be submitted or reviewed.

Credit game outcomes are generated in the browser. Their records are useful for trying the interface, but cannot provide independent fairness verification.
