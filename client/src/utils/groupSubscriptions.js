export default function groupSubscriptions(subs) {
    const groups = {};

    for (const txn of subs) {
        const key = `${txn.vendor}_${parseFloat(txn.amount).toFixed(2)}_${txn.subscription_interval}`;

        if (!groups[key]) {
            groups[key] = {
                vendor: txn.vendor,
                amount: parseFloat(txn.amount).toFixed(2),
                interval: txn.subscription_interval,
                transactions: [],
            };
        }

        groups[key].transactions.push(txn);
    }

    return Object.values(groups).sort((a, b) =>
        a.vendor.localeCompare(b.vendor)
    );
}