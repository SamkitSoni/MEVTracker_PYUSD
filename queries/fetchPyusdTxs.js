const fs = require('fs');
const path = require('path');
const { BigQuery } = require('@google-cloud/bigquery');
require('dotenv').config();

const USE_MOCK = process.env.USE_MOCK === 'true';

const bigquery = new BigQuery({
    projectId: process.env.GOOGLE_PROJECT_ID,
    keyFilename: process.env.GOOGLE_KEY_FILE,
});

async function fetchPYUSDTransfers() {
    if (USE_MOCK) {
        const filePath = path.join(__dirname, 'mockData.json');
        const rawData = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(rawData);
    }

    const query = `
    SELECT
        t.block_number,
        t.transaction_hash,
        t.from_address,
        t.to_address,
        CAST(t.value AS FLOAT64) / 1e6 AS pyusd_amount,
        t.block_timestamp,
        tx.gas_price,
        tx.gas
    FROM
        \`bigquery-public-data.crypto_ethereum.token_transfers\` AS t
    LEFT JOIN
        \`bigquery-public-data.crypto_ethereum.transactions\` AS tx
    ON
        t.transaction_hash = tx.hash
    WHERE
        t.block_timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
        AND LOWER(t.token_address) = '0x6c3ea9036406852006290770bedfcaba0e23a0e8'
    ORDER BY
        t.block_timestamp DESC
    LIMIT 1000
    `;

    try {
        const [rows] = await bigquery.query({ query });
        return rows;
    } catch (error) {
        if (error.code === 403 && error.errors.some(e => e.reason === 'quotaExceeded')) {
            console.error('Quota exceeded.');
        } else {
            console.error('Error fetching data:', error);
        }
        throw error;
    }
}

module.exports = { fetchPYUSDTransfers };

