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

        if (isConsistentlyMonthly(dates)) {
            console.log(`📅 Detected subscription: ${vendor} @ $${rounded_amount}`);

            await pool.query(
                `UPDATE transactions SET is_subscription = true WHERE id = ANY($1::int[])`,
                [transaction_ids]
            );
        }
    }

    console.log('✅ Subscription detection complete.');
}

function isConsistentlyMonthly(dates) {
    if (dates.length < 2) return false;

    const intervals = [];
    for (let i = 1; i < dates.length; i++) {
        const diff = differenceInDays(new Date(dates[i]), new Date(dates[i - 1]));
        intervals.push(diff);
    }

    const average = intervals.reduce((a, b) => a + b, 0) / intervals.length;

    // Allow some tolerance (e.g., 30 ± 3 days)
    return average >= 27 && average <= 33;
}

detectSubscriptions().catch(console.error);