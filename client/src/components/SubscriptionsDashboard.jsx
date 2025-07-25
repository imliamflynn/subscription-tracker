import React, { useEffect, useState } from 'react';
import CsvUploadForm from './CsvUploadForm';
import Detected from './DetectedSubscriptions';
import Confirmed from './ConfirmedSubscriptions';
import Rejected from './RejectedSubscriptions';
import SubscriptionSummary from './SubscriptionSummary';
import SummaryBreakdown from './SummaryBreakdown';

const SubscriptionsDashboard = () => {
    const [allTransactions, setAllTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAllTransactions = () => {
        fetch('http://localhost:2000/subscriptions/all')
            .then((res) => res.json())
            .then((data) => {
                setAllTransactions(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Failed to fetch transactions:', err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchAllTransactions();
    }, []);

    const updateAfterFeedback = (vendor, amount, interval, isConfirmed) => {
        // Remove reviewed group from detected
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
            <main>
                <CsvUploadForm onUploadSuccess={fetchAllTransactions} /> {/* Fetch transactions on upload. */}
            </main>

            <SubscriptionSummary />
            <SummaryBreakdown />

            <Detected transactions={detected} onFeedback={updateAfterFeedback} />
            <Confirmed transactions={confirmed} />
            <Rejected transactions={rejected} />
        </>
    );
};

export default SubscriptionsDashboard;