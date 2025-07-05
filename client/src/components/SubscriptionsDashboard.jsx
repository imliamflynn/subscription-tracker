import React, { useEffect, useState } from 'react';
import Detected from './DetectedSubscriptions';
import Confirmed from './ConfirmedSubscriptions';
import Rejected from './RejectedSubscriptions';

const SubscriptionsDashboard = () => {
    const [allTransactions, setAllTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:2000/subscriptions/all') // 👈 you'll build this
            .then(res => res.json())
            .then(data => {
                setAllTransactions(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch all subscriptions:', err);
                setLoading(false);
            });
    }, []);

    const updateAfterFeedback = (vendor, amount, interval, isConfirmed) => {
        // Remove reviewed group from detected
        // (optional: add to confirmed/rejected here too if needed)
        setAllTransactions(prev =>
            prev.map((txn) =>
                txn.vendor === vendor &&
                    parseFloat(txn.amount).toFixed(2) === parseFloat(amount).toFixed(2) &&
                    txn.subscription_interval === interval
                    ? { ...txn, is_subscription: isConfirmed, reviewed: true }
                    : txn
            )
        );
    };

    const detected = allTransactions.filter((t) => t.is_subscription && !t.reviewed);
    const confirmed = allTransactions.filter((t) => t.is_subscription && t.reviewed);
    const rejected = allTransactions.filter((t) => !t.is_subscription && t.reviewed);

    return loading ? (
        <p>Loading...</p>
    ) : (
        <>
            <h1>Detected</h1>
            <Detected transactions={detected} onFeedback={updateAfterFeedback} />

            <h1>Confirmed</h1>
            <Confirmed transactions={confirmed} />

            <h1>Rejected</h1>
            <Rejected transactions={rejected} />
        </>
    );
};

export default SubscriptionsDashboard;