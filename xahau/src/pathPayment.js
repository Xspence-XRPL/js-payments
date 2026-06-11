import { Client, Wallet, PaymentFlags } from "xahau";

async function sendPayment() {

  const client = new Client("wss://xahau-test.net/");
  await client.connect();
  console.log("Connected to Xahau Testnet");

  const seed = "sEd7QBqqRRn5gTDDCPRAbxgwsFttQi2";
  const wallet = Wallet.fromSeed(seed);

  const destination = "rJ1ScrAHHBDv5n9SAsdDnACTz33QbgEgwe";
  const amount = "1000000";

  const sendMax = {
    currency: "TST",
    issuer: "r4M79rRNbRXWUfokjTaLg1XQu1GwMje7fq",
    value: "100",
  };

  const tx = {
    TransactionType: "Payment",
    Account: wallet.address,
    Destination: destination,
    Amount: amount,
    SendMax: sendMax,
    Flags: PaymentFlags.tfPartialPayment,
  };

  const prepared = await client.autofill(tx);
  const signed = wallet.sign(prepared);

  console.log("Submitting path payment...");
  console.log(`From: ${wallet.address}`);
  console.log(`To:   ${destination}`);
  console.log(`Receive: ${amount} drops (native XAH)`);
  console.log(`SendMax: ${sendMax.value} ${sendMax.currency}`);

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
