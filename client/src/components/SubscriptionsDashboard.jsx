import React, { useEffect, useState } from 'react';
import CsvUploadForm from './CsvUploadForm';
import Detected from './DetectedSubscriptions';
import Confirmed from './ConfirmedSubscriptions';
import Rejected from './RejectedSubscriptions';
import Summary from './Summary';
import SummaryBreakdown from './SummaryBreakdown';
import SpendingDashboard from './SpendingDashboard';
import VendorCategoriser from './VendorCategoriser';

const SubscriptionsDashboard = () => {
    const [allTransactions, setAllTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshFlag, setRefreshFlag] = useState(false);

    const fetchAllTransactions = () => {
        setRefreshFlag(prev => !prev);

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

            <Summary refresh={refreshFlag} />
            <SummaryBreakdown refresh={refreshFlag} />

            <SpendingDashboard refresh={refreshFlag} />
            <VendorCategoriser refresh={refreshFlag} />

            <Detected transactions={detected} onFeedback={updateAfterFeedback} />
            <Confirmed transactions={confirmed} />
            <Rejected transactions={rejected} />
        </>
    );
};

export default SubscriptionsDashboard;