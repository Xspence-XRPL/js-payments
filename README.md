# XRPL & Xahau Payment Examples

[![Node.js](https://img.shields.io/node/v/xrpl.svg)](https://nodejs.org/)
[![XRPL](https://img.shields.io/npm/v/xrpl.svg)](https://www.npmjs.com/package/xrpl)
[![Xahau](https://img.shields.io/npm/v/xahau.svg)](https://www.npmjs.com/package/xahau)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A collection of minimal, focused JavaScript examples for sending different types of payments on the XRPL and Xahau networks.

- `xahau/` — Payment examples using the `xahau` library.
- `xrpl/` — Payment examples using the official `xrpl` library.

Purpose: Provide clean, copy-paste friendly scripts to quickly learn and experiment with native payments, IOU payments, memos, destination tags, partial payments, and path payments across both networks.

## Overview

This repository contains standalone example scripts designed for learning and quick experimentation. Each example is intentionally minimal and runnable directly with Node.js.

A single command (`node setup.js`) creates fresh testnet accounts for both networks, sets up issuance and trustlines, creates DEX liquidity, and automatically updates all example files with working credentials. This means you always start with clean, functional examples and realistic liquidity for path payments.

Supported payment types:

- Native asset payments (XAH / XRP)
- Issued currency / IOU payments
- Payments with memos
- Payments with Destination Tags
- Partial payments (`tfPartialPayment`)
- Path payments

See `xahau/README.md` and `xrpl/README.md` for network-specific details.

## Repository Structure

- `xahau/` — Payment examples using the `xahau` library 
- `xrpl/` — Payment examples using the `xrpl` library
- `setup.js` — One-command setup that creates accounts, liquidity, and updates all examples
- `config.json` — Generated credentials and setup history (created by setup.js)
- `package.json` — Root package metadata and npm scripts

## Prerequisites

- Node.js v18 or later
- npm (comes with Node.js)
- Clone the repository and install dependencies from the repository root

```Bash
git clone https://github.com/Xspence-XRPL/js-payments.git
cd js-payments
npm install
```

## Setup

- One-Command Setup (Recommended)
- Run this once to create fresh accounts, trustlines, and DEX liquidity for both networks:
```bash
node setup.js
```

## Run Individual Examples
 
```bash
# Xahau Examples
node xahau/src/nativePayment.js
node xahau/src/iouPayment.js
node xahau/src/memoPayment.js
node xahau/src/destinationTagPayment.js
node xahau/src/partialPayment.js
node xahau/src/pathPayment.js

# XRPL Examples
node xrpl/src/nativePayment.js
node xrpl/src/iouPayment.js
node xrpl/src/memoPayment.js
node xrpl/src/destinationTagPayment.js
node xrpl/src/partialPayment.js 
node xrpl/src/pathPayment.js
```

Common npm scripts (defined in `package.json`):

```bash
npm run test                # Executes the native payment for both networks concurrently
npm run setup               # Generate and set up testing accounts for both networks
npm run xahau:native        # Send a simple XAH payment
npm run xrpl:native         # Send a simple XRP payment
```

## Notes

- All examples currently target Testnet (Xahau Testnet and XRPL Testnet).
- setup.js can be re-run at any time to generate new accounts and fresh liquidity.
- Partial payments (partialPayment.js) will result in "tecPATH_DRY" after the first run as the trustline limit is at maximum. 
- Path payments (pathPayment.js) can still return tecPATH_DRY depending on current DEX state — this is normal on testnet.
- For IOU payments, the sender must have a trustline to the issuer.
- These examples are educational and intentionally minimal. Add proper error handling and security practices before using in production.
- Never hard-code real/mainnet seeds.

## Contributing

Contributions are welcome. Please open issues for bugs or feature requests, and submit pull requests for enhancements. Use clear commit messages and provide examples when appropriate.

## Resources

### Xahau
- [Payment Transaction Type](https://xahau.network/docs/features/network-features/payments/)
- [Xahau HTTP / WebSocket APIs](https://xahau.network/docs/features/http-websocket-apis/public-api-methods/)
- [Official xahau JavaScript Library](https://www.npmjs.com/package/xahau)

### XRPL
- [XRPL Payment Transaction](https://xrpl.org/docs/references/protocol/transactions/types/payment)
- [XRPL HTTP / WebSocket APIs](https://xrpl.org/docs/references/http-websocket-apis/public-api-methods)
- [Official xrpl JavaScript Library](https://www.npmjs.com/package/xrpl)

## License
MIT
