const pool = require('./db');
const { differenceInDays } = require('date-fns');

async function detectSubscriptions() {
    const res = await pool.query(`
    SELECT
      vendor,
      ROUND(amount::numeric, 2) AS rounded_amount,
      ARRAY_AGG(id ORDER BY date) AS transaction_ids,
      ARRAY_AGG(date ORDER BY date) AS dates
    FROM transactions
    WHERE vendor IS NOT NULL
    GROUP BY vendor, rounded_amount
    HAVING COUNT(*) >= 2
  `);

    for (const row of res.rows) {
        const { vendor, rounded_amount, transaction_ids, dates } = row;

        const intervalType = getIntervalType(dates);

        if (intervalType) {
            console.log(`📅 ${intervalType.toUpperCase()} subscription detected: ${vendor} @ $${rounded_amount}`);

            await pool.query(
                `UPDATE transactions SET is_subscription = true, subscription_interval = $2
                WHERE id = ANY($1::int[])`, [transaction_ids, intervalType]
            );
        }
    }

    console.log('✅ Subscription detection complete.');
}

/**
 * Given a list of dates, returns 'weekly', 'biweekly', 'monthly', 'yearly', or null.
 */
function getIntervalType(dates) {
    if (dates.length < 2) return null;

    const intervals = [];
    for (let i = 1; i < dates.length; i++) {
        const diff = differenceInDays(new Date(dates[i]), new Date(dates[i - 1]));
        intervals.push(diff);
    }

    const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;

    if (avg >= 6 && avg <= 8) return 'weekly';
    if (avg >= 13 && avg <= 15) return 'biweekly';
    if (avg >= 27 && avg <= 33) return 'monthly';
    if (avg >= 360 && avg <= 370) return 'yearly';

    return null;
}

detectSubscriptions().catch(console.error);