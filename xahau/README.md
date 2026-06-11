# Xahau Payment Examples

A collection of minimal, focused JavaScript examples for sending different types of payments on the Xahau network using the official `xahau` library.

## Overview

These examples are small, readable scripts designed for learning and quick experimentation. Each example demonstrates a specific payment pattern while maintaining a consistent structure and output format.

Running `node setup.js` from the repository root will create fresh Xahau testnet accounts, set up issuance and trustlines, create DEX liquidity, and automatically update all examples with working credentials.

### Examples

- `nativePayment.js` — Send native XAH.
- `iouPayment.js` — Send issued currencies (IOUs).
- `memoPayment.js` — Send a payment with an attached memo.
- `destinationTagPayment.js` — Send a payment with a Destination Tag.
- `partialPayment.js` — Partial IOU payment using `tfPartialPayment`.
- `pathPayment.js` — Path payment (sends native XAH with `SendMax` in TST).

## Usage

Run the examples directly from the repository root:

```bash
node xahau/src/nativePayment.js
node xahau/src/iouPayment.js
node xahau/src/memoPayment.js
node xahau/src/destinationTagPayment.js
node xahau/src/partialPayment.js
node xahau/src/pathPayment.js
```

### Each script will:

- Connect to the Xahau Testnet
- Build and sign a transaction
- Display the signed transaction JSON
- Submit the transaction and show the result
- Fetch and display the full validated transaction details

## Notes

- All examples currently target the Xahau Testnet.
- setup.js (run from the repo root) can be used to generate fresh accounts and liquidity.
- These are educational examples. Add proper error handling and security practices before using in production.
- For IOU payments, the sender must have a trustline to the issuer of the currency.
- Never hard-code real/mainnet seeds in these scripts.

## Resources

- [Xahau HTTP / WebSocket APIs](https://xahau.network/docs/features/http-websocket-apis/public-api-methods/)
- [Payment Transaction Type](https://xahau.network/docs/features/network-features/payments/)
- [Official xahau JavaScript Library](https://www.npmjs.com/package/xahau)

## License
MIT