import { Client, Wallet, PaymentFlags } from "xrpl";

async function sendPayment() {
    
  const client = new Client("wss://s.altnet.rippletest.net:51233");
  await client.connect();
  console.log("Connected to XRPL Testnet");

  const seed = "sEd799xGX2eGZxD7Kr3XsnkRoKsvouJ";
  const wallet = Wallet.fromSeed(seed);

  const destination = "r44DKRARZdd8qPRmERznYt92s57tnVrcjG";

  const amount = {
    currency: "TST",
    issuer: "rP7txEyV4PYkBqtrWJQ9NyvBgQxsAWKTWk",
    value: "1000000000",
  };

  const tx = {
    TransactionType: "Payment",
    Account: wallet.address,
    Destination: destination,
    Amount: amount,
    Flags: PaymentFlags.tfPartialPayment,
  };

  const prepared = await client.autofill(tx);
  const signed = wallet.sign(prepared);

  console.log("Submitting partial IOU payment...");
  console.log(`From: ${wallet.address}`);
  console.log(`To:   ${destination}`);
  console.log(`Amount: ${amount.value} ${amount.currency} (partial payment)`);

  console.log("\nSigned transaction JSON:");
  console.log(JSON.stringify(signed.tx_json || prepared, null, 2));

  const result = await client.submitAndWait(signed.tx_blob);

  console.log("\nTransaction result:", result.result.meta.TransactionResult);
  console.log("Transaction hash:", result.result.hash);

  const txResponse = await client.request({
    command: "tx",
    transaction: result.result.hash,
    binary: false,
  });

  console.log("\nValidated transaction result:");
  console.log(JSON.stringify(txResponse.result, null, 2));

  await client.disconnect();
}

sendPayment().catch(console.error);
