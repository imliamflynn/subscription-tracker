import React, { useEffect, useState } from 'react';

const SubscriptionSummary = () => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [total, setTotal] = useState(null);

    useEffect(() => {
        fetch('http://localhost:2000/subscriptions/monthly-summary')
            .then(res => res.json())
            .then(data => {
                setSubscriptions(data);
                setTotal(calculateMonthlyTotal(data));
            })
            .catch(err => console.error('Error fetching summary:', err));
    }, []);

    const calculateMonthlyTotal = (subs) => {
        let total = 0;

        for (const sub of subs) {
            const amount = parseFloat(sub.total);

            switch (sub.subscription_interval) {
                case 'Weekly':
                    total += amount * 4;
                    break;
                case 'Fortnightly':
                    total += amount * 2;
                    break;
                case 'Monthly':
                    total += amount;
                    break;
                case 'Yearly':
                    total += amount / 12;
                    break;
                default:
                    break;
            }
        }

        return total.toFixed(2);
    };

    return (
        <div className="bg-green-50 border border-green-200 rounded p-4 mb-4 shadow-sm">
            <h2 className="text-lg font-semibold mb-2">📊 Monthly Subscription Cost</h2>
            {total !== null ? (
                <p className="text-xl font-bold text-green-700">${total} per month</p>
            ) : (
                <p>Loading summary...</p>
            )}
        </div>
    );
};

export default SubscriptionSummary;