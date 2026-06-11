import { Client, Wallet } from 'xrpl';

async function sendPayment() {
  
  const client = new Client('wss://s.altnet.rippletest.net:51233');
  await client.connect();
  console.log('Connected to XRPL Testnet');

  const seed = "sEd799xGX2eGZxD7Kr3XsnkRoKsvouJ";
  const wallet = Wallet.fromSeed(seed);

  const destination = "r44DKRARZdd8qPRmERznYt92s57tnVrcjG";
  const amountDrops = '1000000';
  const destinationTag = 12345;

  const tx = {
    TransactionType: 'Payment',
    Account: wallet.address,
    Destination: destination,
    Amount: amountDrops,
    DestinationTag: destinationTag,
  };

  const prepared = await client.autofill(tx);
  const signed = wallet.sign(prepared);

  console.log('Submitting payment with destination tag...');
  console.log(`From: ${wallet.address}`);
  console.log(`To:   ${destination}`);
  console.log(`Amount: ${amountDrops} drops`);
  console.log(`Destination Tag: ${destinationTag}`);

  console.log('\nSigned transaction JSON:');
  console.log(JSON.stringify(signed.tx_json || prepared, null, 2));

  const result = await client.submitAndWait(signed.tx_blob);

  console.log('\nTransaction result:', result.result.meta.TransactionResult);
  console.log('Transaction hash:', result.result.hash);

  const txResponse = await client.request({
    command: 'tx',
    transaction: result.result.hash,
    binary: false
  });

  console.log('\nValidated transaction result:');
  console.log(JSON.stringify(txResponse.result, null, 2));

  await client.disconnect();
}

sendPayment().catch(console.error);