const { fetchPYUSDTransfers } = require('./queries/fetchPyusdTxs');
const { detectSandwiches } = require('./analysis/detectSandwiches');
const fs = require('fs');
const { writeToPath } = require('fast-csv');
require('dotenv').config();

async function main() {
  try {
    const transactions = await fetchPYUSDTransfers();

    if (!transactions || !transactions.length) {
      console.log("No transactions found.");
      return;
    }

    // Pass transactions to detectSandwiches
    const suspiciousTxs = await detectSandwiches(transactions);

    if (!suspiciousTxs || !suspiciousTxs.length) {
      console.log("No sandwich attacks detected.");
      return;
    }

    const outputPath = './exports/suspiciousTxs.csv';

    writeToPath(outputPath, suspiciousTxs, { headers: true })
      .on('finish', () => console.log(`CSV export complete! Saved to: ${outputPath}`));
  } catch (err) {
    console.error("Error running MEV detection:", err);
  }
}

main();