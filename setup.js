// setup.js
import { Client, Wallet } from 'xrpl';
import { Client as XahauClient, Wallet as XahauWallet } from 'xahau';
import fs from 'fs/promises';

const CONFIG_FILE = './config.json';

// ==================== MAIN ====================
async function main() {
  console.log("🚀 Starting Payment Examples Setup for both networks...\n");

  try {
    const xrplData = await setupXRPL();
    const xahauData = await setupXahau();

    await saveGenerationToConfig(xrplData, xahauData);
    await replaceValuesInAllExamples(xrplData, xahauData);

    console.log("\n✅ Setup completed successfully!");
    console.log("You can now run the examples with fresh testnet accounts.");

  } catch (error) {
    console.error("\n❌ Setup failed:", error.message || error);
    process.exit(1);
  }
}

// ==================== IMPROVED TRANSACTION HANDLER ====================
async function submitTransaction(client, wallet, tx, label = "Transaction", ledgerOffset = 30) {
  try {
    console.log(`   → Preparing: ${label}`);
    let prepared = await client.autofill(tx);
    prepared.LastLedgerSequence = prepared.LastLedgerSequence + ledgerOffset;

    const signed = wallet.sign(prepared);
    console.log(`   → Submitting: ${label}`);
    const result = await client.submitAndWait(signed.tx_blob);

    const txResult = result.result.meta.TransactionResult;

    if (txResult === "tesSUCCESS") {
      console.log(`   ✅ ${label} successful`);
      return result;
    } else {
      console.log(`   ⚠️  ${label} result: ${txResult}`);
      return result;
    }
  } catch (error) {
    console.error(`   ❌ ${label} failed:`, error.message);
    throw error;
  }
}

// ==================== XRPL SETUP ====================
async function setupXRPL() {
  console.log("=== Setting up XRPL Testnet ===");
  const client = new Client('wss://s.altnet.rippletest.net:51233');
  await client.connect();

  const issuer = await createFundedAccount(client, 'xrpl');
  const holder1 = await createFundedAccount(client, 'xrpl');
  const holder2 = await createFundedAccount(client, 'xrpl');

  console.log(`Issuer:   ${issuer.address}`);
  console.log(`Holder 1: ${holder1.address}`);
  console.log(`Holder 2: ${holder2.address}`);

  await enableDefaultRipple(client, issuer.seed);
  await createTrustline(client, holder1.seed, issuer.address);
  await createTrustline(client, holder2.seed, issuer.address);
  await sendIssuedCurrency(client, issuer.seed, holder1.address, '1000');
  await sendIssuedCurrency(client, issuer.seed, holder2.address, '1000');
  await createDexOffers(client, holder2.seed, issuer.address, 5);

  await client.disconnect();

  return {
    issuer: { seed: issuer.seed, address: issuer.address },
    holder1: { seed: holder1.seed, address: holder1.address },
    holder2: { seed: holder2.seed, address: holder2.address }
  };
}

// ==================== XAHAU SETUP ====================
async function setupXahau() {
  console.log("\n=== Setting up Xahau Testnet ===");
  const client = new XahauClient('wss://xahau-test.net/');
  await client.connect();

  // Create 1 account via faucet (gets ~1000 XAH)
  const mainAccount = await createFundedAccountXahau();

  // Wait a moment for the account to be fully available on ledger
  console.log("   ⏳ Waiting for Xahau account to activate...");
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Generate two more wallets
  const holder1Wallet = XahauWallet.generate();
  const holder2Wallet = XahauWallet.generate();

  // Split funds (250 / 250 / 500) — use higher ledger offset for safety
  await sendXah(client, mainAccount.seed, holder1Wallet.address, '250', 60);
  await sendXah(client, mainAccount.seed, holder2Wallet.address, '500', 60);

  const issuer = { seed: mainAccount.seed, address: mainAccount.address };
  const holder1 = { seed: holder1Wallet.seed, address: holder1Wallet.address };
  const holder2 = { seed: holder2Wallet.seed, address: holder2Wallet.address };

  console.log(`Issuer:   ${issuer.address}`);
  console.log(`Holder 1: ${holder1.address}`);
  console.log(`Holder 2: ${holder2.address}`);

  await enableDefaultRippleXahau(client, issuer.seed);
  await createTrustlineXahau(client, holder1.seed, issuer.address);
  await createTrustlineXahau(client, holder2.seed, issuer.address);
  await sendIssuedCurrencyXahau(client, issuer.seed, holder1.address, '1000');
  await sendIssuedCurrencyXahau(client, issuer.seed, holder2.address, '1000');
  await createDexOffersXahau(client, holder2.seed, issuer.address, 5);

  await client.disconnect();

  return {
    issuer: { seed: issuer.seed, address: issuer.address },
    holder1: { seed: holder1.seed, address: holder1.address },
    holder2: { seed: holder2.seed, address: holder2.address }
  };
}

// ==================== HELPER FUNCTIONS ====================

async function createFundedAccount(client, network) {
  const wallet = Wallet.generate();
  const faucetUrl = 'https://faucet.altnet.rippletest.net/accounts';

  const response = await fetch(faucetUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ destination: wallet.address })
  });

  if (!response.ok) throw new Error(`XRPL Faucet funding failed`);
  return { seed: wallet.seed, address: wallet.address };
}

async function createFundedAccountXahau() {
  const wallet = XahauWallet.generate();
  const faucetUrl = 'https://xahau-test.net/accounts';

  const response = await fetch(faucetUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ destination: wallet.address })
  });

  if (!response.ok) throw new Error(`Xahau Faucet funding failed`);
  return { seed: wallet.seed, address: wallet.address };
}

async function enableDefaultRipple(client, seed) {
  const wallet = Wallet.fromSeed(seed);
  const tx = { TransactionType: 'AccountSet', Account: wallet.address, SetFlag: 8 };
  await submitTransaction(client, wallet, tx, "Enable Default Ripple");
}

async function enableDefaultRippleXahau(client, seed) {
  const wallet = XahauWallet.fromSeed(seed);
  const tx = { TransactionType: 'AccountSet', Account: wallet.address, SetFlag: 8 };
  await submitTransaction(client, wallet, tx, "Enable Default Ripple (Xahau)", 60);
}

async function createTrustline(client, holderSeed, issuerAddress) {
  const wallet = Wallet.fromSeed(holderSeed);
  const tx = {
    TransactionType: 'TrustSet',
    Account: wallet.address,
    LimitAmount: { currency: 'TST', issuer: issuerAddress, value: '1000000000' }
  };
  await submitTransaction(client, wallet, tx, "Create Trustline");
}

async function createTrustlineXahau(client, holderSeed, issuerAddress) {
  const wallet = XahauWallet.fromSeed(holderSeed);
  const tx = {
    TransactionType: 'TrustSet',
    Account: wallet.address,
    LimitAmount: { currency: 'TST', issuer: issuerAddress, value: '1000000000' }
  };
  await submitTransaction(client, wallet, tx, "Create Trustline (Xahau)", 60);
}

async function sendIssuedCurrency(client, issuerSeed, destination, value) {
  const wallet = Wallet.fromSeed(issuerSeed);
  const tx = {
    TransactionType: 'Payment',
    Account: wallet.address,
    Destination: destination,
    Amount: { currency: 'TST', issuer: wallet.address, value }
  };
  await submitTransaction(client, wallet, tx, `Send ${value} TST`);
}

async function sendIssuedCurrencyXahau(client, issuerSeed, destination, value) {
  const wallet = XahauWallet.fromSeed(issuerSeed);
  const tx = {
    TransactionType: 'Payment',
    Account: wallet.address,
    Destination: destination,
    Amount: { currency: 'TST', issuer: wallet.address, value }
  };
  await submitTransaction(client, wallet, tx, `Send ${value} TST (Xahau)`, 60);
}

// ==================== PARALLEL DEX OFFERS ====================
async function createDexOffers(client, holderSeed, issuerAddress, count = 5) {
  const wallet = Wallet.fromSeed(holderSeed);

  const accountInfo = await client.request({
    command: 'account_info',
    account: wallet.address,
    ledger_index: 'current'
  });
  let currentSequence = accountInfo.result.account_data.Sequence;

  const promises = [];

  for (let i = 0; i < count; i++) {
    const tx = {
      TransactionType: 'OfferCreate',
      Account: wallet.address,
      Sequence: currentSequence + i,
      TakerGets: '100000000',
      TakerPays: {
        currency: 'TST',
        issuer: issuerAddress,
        value: (10 + i).toString()
      }
    };

    const prepared = await client.autofill(tx);
    prepared.Sequence = currentSequence + i;

    const signed = wallet.sign(prepared);

    const promise = client.submitAndWait(signed.tx_blob)
      .then(result => {
        const txResult = result.result.meta.TransactionResult;
        if (txResult === 'tesSUCCESS') {
          console.log(`   ✅ Create DEX Offer #${i + 1} successful`);
        } else {
          console.log(`   ⚠️  Create DEX Offer #${i + 1} result: ${txResult}`);
        }
        return result;
      })
      .catch(err => {
        console.log(`   ❌ Create DEX Offer #${i + 1} failed: ${err.message}`);
        throw err;
      });

    promises.push(promise);
  }

  await Promise.all(promises);
  console.log(`   ✅ Finished creating ${count} DEX offers on XRPL`);
}

async function createDexOffersXahau(client, holderSeed, issuerAddress, count = 5) {
  const wallet = XahauWallet.fromSeed(holderSeed);

  const accountInfo = await client.request({
    command: 'account_info',
    account: wallet.address,
    ledger_index: 'current'
  });
  let currentSequence = accountInfo.result.account_data.Sequence;

  const promises = [];

  for (let i = 0; i < count; i++) {
    const tx = {
      TransactionType: 'OfferCreate',
      Account: wallet.address,
      Sequence: currentSequence + i,
      TakerGets: '100000000',
      TakerPays: {
        currency: 'TST',
        issuer: issuerAddress,
        value: (10 + i).toString()
      }
    };

    const prepared = await client.autofill(tx);
    prepared.Sequence = currentSequence + i;

    const signed = wallet.sign(prepared);

    const promise = client.submitAndWait(signed.tx_blob)
      .then(result => {
        const txResult = result.result.meta.TransactionResult;
        if (txResult === 'tesSUCCESS') {
          console.log(`   ✅ Create DEX Offer #${i + 1} successful`);
        } else {
          console.log(`   ⚠️  Create DEX Offer #${i + 1} result: ${txResult}`);
        }
        return result;
      })
      .catch(err => {
        console.log(`   ❌ Create DEX Offer #${i + 1} failed: ${err.message}`);
        throw err;
      });

    promises.push(promise);
  }

  await Promise.all(promises);
  console.log(`   ✅ Finished creating ${count} DEX offers on Xahau`);
}

async function sendXah(client, fromSeed, toAddress, amountXah, ledgerOffset = 60) {
  const fromWallet = XahauWallet.fromSeed(fromSeed);
  const tx = {
    TransactionType: 'Payment',
    Account: fromWallet.address,
    Destination: toAddress,
    Amount: (parseFloat(amountXah) * 1000000).toString()
  };
  await submitTransaction(client, fromWallet, tx, `Send ${amountXah} XAH`, ledgerOffset);
}

// ==================== CONFIG & REPLACEMENT ====================
async function saveGenerationToConfig(xrplData, xahauData) {
  const timestamp = new Date().toISOString();
  const newGeneration = { timestamp, xrpl: xrplData, xahau: xahauData };

  let config = { generations: [] };
  try {
    const existing = await fs.readFile(CONFIG_FILE, 'utf8');
    config = JSON.parse(existing);
  } catch (e) {
    console.log("📁 Creating new config.json...");
  }

  config.generations.push(newGeneration);
  await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
  console.log("📁 Appended new generation to config.json");
}

async function replaceValuesInAllExamples(xrplData, xahauData) {
  const files = [
    'xrpl/src/nativePayment.js', 'xrpl/src/destinationTagPayment.js', 'xrpl/src/memoPayment.js',
    'xrpl/src/iouPayment.js', 'xrpl/src/partialPayment.js', 'xrpl/src/pathPayment.js',
    'xahau/src/nativePayment.js', 'xahau/src/destinationTagPayment.js', 'xahau/src/memoPayment.js',
    'xahau/src/iouPayment.js', 'xahau/src/partialPayment.js', 'xahau/src/pathPayment.js'
  ];

  for (const file of files) {
    await replaceInFile(file, xrplData, xahauData);
  }
  console.log("🔄 Replaced values in all example files");
}

async function replaceInFile(filePath, xrplData, xahauData) {
  try {
    let content = await fs.readFile(filePath, 'utf8');
    const isXRPL = filePath.startsWith('xrpl/');
    const data = isXRPL ? xrplData : xahauData;

    if (filePath.includes('pathPayment')) {
      // Special case for pathPayment: use holder2 (the one with TST + DEX offers)
      content = content.replace(/const seed = ["'][^"']+["'];/g, `const seed = "${data.holder2.seed}";`);
      content = content.replace(/const destination = ["'][^"']+["'];/g, `const destination = "${data.holder1.address}";`);
      content = content.replace(/issuer: ["'][^"']+["'],/g, `issuer: "${data.issuer.address}",`);
    } else {
      // Normal replacement for all other files
      content = content.replace(/const seed = ["'][^"']+["'];/g, `const seed = "${data.issuer.seed}";`);
      content = content.replace(/const destination = ["'][^"']+["'];/g, `const destination = "${data.holder1.address}";`);

      if (filePath.includes('iou') || filePath.includes('partial') || filePath.includes('path')) {
        content = content.replace(/issuer: ["'][^"']+["'],/g, `issuer: "${data.issuer.address}",`);
      }
    }

    await fs.writeFile(filePath, content);
  } catch (err) {
    console.warn(`⚠️  Skipped updating ${filePath}`);
  }
}

// Run
main();