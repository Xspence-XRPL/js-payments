# XRPL Payment Examples

A collection of minimal, focused JavaScript examples for sending different types of payments on the XRP Ledger using the official `xrpl` library.

## Overview

These examples are small, readable scripts designed for learning and quick experimentation. Each example demonstrates a specific payment pattern while maintaining a consistent structure and output format.

Running `node setup.js` from the repository root will create fresh XRP testnet accounts, set up issuance and trustlines, create DEX liquidity, and automatically update all examples with working credentials.

### Examples

- `nativePayment.js` — Send native XRP.
- `iouPayment.js` — Send issued currencies (IOUs).
- `memoPayment.js` — Send a payment with an attached memo.
- `destinationTagPayment.js` — Send a payment with a Destination Tag.
- `partialPayment.js` — Partial IOU payment using `tfPartialPayment`.
- `pathPayment.js` — Path payment (sends native XRP with `SendMax` in TST).

## Usage

Run the examples directly from the repository root:

```bash
node xrpl/src/nativePayment.js
node xrpl/src/iouPayment.js
node xrpl/src/memoPayment.js
node xrpl/src/destinationTagPayment.js
node xrpl/src/partialPayment.js
node xrpl/src/pathPayment.js
```

### Each script will:

- Connect to the XRPL Testnet
- Build and sign a transaction
- Display the signed transaction JSON
- Submit the transaction and show the result
- Fetch and display the full validated transaction details

## Notes

- All examples currently target the XRPL Testnet.
- setup.js (run from the repo root) can be used to generate fresh accounts and liquidity.
- These are educational examples. Add proper error handling and security practices before using in production.
- For IOU payments, the sender must have a trustline to the issuer of the currency.
- Never hard-code real/mainnet seeds in these scripts.

## Resources

- [XRPL Payment Transaction](https://xrpl.org/docs/references/protocol/transactions/types/payment)
- [XRPL HTTP / WebSocket APIs](https://xrpl.org/docs/references/http-websocket-apis/public-api-methods)
- [Official xrpl JavaScript Library](https://www.npmjs.com/package/xrpl)

## License
MIT