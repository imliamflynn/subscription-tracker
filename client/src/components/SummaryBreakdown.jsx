import React, { useEffect, useState } from 'react';

const intervalToMonthly = (interval, amount) => {
    const amt = parseFloat(amount);

    switch (interval) {
        case 'Weekly': return amt * 4;
        case 'Fortnightly': return amt * 2;
        case 'Monthly': return amt;
        case 'Yearly': return amt / 12;
        default: return 0;
    }
};

const SummaryBreakdown = ({ refresh }) => {
    const [subs, setSubs] = useState([]);

    useEffect(() => {
        fetch('http://localhost:2000/subscriptions/monthly-summary')
            .then(res => res.json())
            .then(setSubs)
            .catch(console.error);
    }, [refresh]);

    const totalMonthly = subs.reduce((acc, sub) => {
        return acc + intervalToMonthly(sub.subscription_interval, sub.total);
    }, 0);

    return (
        <div>
            <h2>🧾 Subscription Breakdown</h2>
            <table>
                <thead>
                    <tr>
                        <th>Vendor</th>
                        <th>Interval</th>
                        <th>Raw Amount</th>
                        <th>Monthly Equivalent</th>
                    </tr>
                </thead>
                <tbody>
                    {subs.map((sub, idx) => (
                        <tr key={idx}>
                            <td>{sub.vendor}</td>
                            <td>{sub.subscription_interval}</td>
                            <td>${parseFloat(sub.total).toFixed(2)}</td>
                            <td>${intervalToMonthly(sub.subscription_interval, sub.total).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan="3">Total:</td>
                        <td>${totalMonthly.toFixed(2)} / month</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
};

export default SummaryBreakdown;