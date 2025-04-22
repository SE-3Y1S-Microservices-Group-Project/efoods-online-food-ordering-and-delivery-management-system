// utils/generatePayHereHash.js
const crypto = require('crypto');

function generatePayHereHash(merchant_id, order_id, amount, currency, secret_key) {
  // PayHere expects:
  // 1. Amount as string with exactly 2 decimal places
  // 2. Secret key AS-IS (already base64 encoded)
  // 3. All values concatenated without any separators
  
  const formattedAmount = parseFloat(amount).toFixed(2);
  const rawString = merchant_id + order_id + formattedAmount + currency + secret_key;
  
  return crypto.createHash('sha256')
             .update(rawString)
             .digest('hex')
             .toLowerCase(); // PayHere expects lowercase
}

module.exports = generatePayHereHash;