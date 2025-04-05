const { BigQuery } = require('@google-cloud/bigquery');
require('dotenv').config();

const bigquery = new BigQuery({
  projectId: process.env.GOOGLE_PROJECT_ID,
  keyFilename: process.env.GOOGLE_KEY_FILE,
});

async function fetchPYUSDTransfers() {
  const query = `
    SELECT
      block_number,
      transaction_hash,
      from_address,
      to_address,
      CAST(value AS FLOAT64) / 1e6 AS pyusd_amount,
      block_timestamp
    FROM
      \`bigquery-public-data.crypto_ethereum.token_transfers\`
    WHERE
      block_timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
      AND LOWER(token_address) = '0x6c3ea9036406852006290770bedfcaba0e23a0e8'
    ORDER BY block_timestamp DESC
    LIMIT 1000
  `;

  const [rows] = await bigquery.query({ query });
  return rows;
}

module.exports = { fetchPYUSDTransfers };
