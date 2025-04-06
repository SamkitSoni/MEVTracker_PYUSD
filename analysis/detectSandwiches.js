const { fetchPYUSDTransfers } = require('../queries/fetchPyusdTxs');

async function detectSandwiches() {
    try {
    // Fetch transaction data
        const transactions = await fetchPYUSDTransfers();

        // Sort transactions by block number and transaction hash
        transactions.sort((a, b) => {
            if (a.block_number === b.block_number) {
                return a.transaction_hash.localeCompare(b.transaction_hash);
            }
            return a.block_number - b.block_number;
        });

        const sandwiches = [];

        // Iterate through transactions to detect sandwich patterns
        for (let i = 1; i < transactions.length - 1; i++) {
            const prevTx = transactions[i - 1];
            const victimTx = transactions[i];
            const nextTx = transactions[i + 1];

        // Check if the previous and next transactions are from the same address (attacker)
            if (
                prevTx.from_address === nextTx.from_address &&
                prevTx.from_address !== victimTx.from_address &&
                prevTx.to_address === victimTx.to_address &&
                nextTx.to_address === victimTx.to_address &&
                prevTx.block_number === victimTx.block_number &&
                nextTx.block_number === victimTx.block_number &&
                prevTx.gas_price > victimTx.gas_price &&
                nextTx.gas_price > victimTx.gas_price
            ) {
            sandwiches.push({
                attacker: prevTx.from_address,
                victim: victimTx.from_address,
                token: victimTx.to_address,
                block_number: victimTx.block_number,
                victim_tx: victimTx.transaction_hash,
                front_run_tx: prevTx.transaction_hash,
                back_run_tx: nextTx.transaction_hash,
                });
            }
        }

        return sandwiches;
    } catch (error) {
        console.error('Error detecting sandwich attacks:', error);
    throw error;
    }
}

module.exports = { detectSandwiches };