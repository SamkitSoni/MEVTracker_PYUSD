const { fetchPYUSDTransfers } = require('./queries/fetchPyusdTxs');

async function main() {
  const txs = await fetchPYUSDTransfers();
  console.log(txs.slice(0, 5));  // Preview first 5
}

main();
