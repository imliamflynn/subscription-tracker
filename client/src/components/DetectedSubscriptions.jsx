import React, { useEffect, useState } from 'react';

const DetectedSubscriptions = ({ transactions, onFeedback }) => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedGroups, setExpandedGroups] = useState({});

    useEffect(() => {
        fetch('http://localhost:2000/detectedsubscriptions')
            .then((res) => res.json())
            .then((data) => {
                setSubscriptions(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Failed to fetch subscriptions:', err);
                setLoading(false);
            });
    }, []);

    const handleFeedback = async (group, isConfirmed) => {
        try {
            const response = await fetch('http://localhost:2000/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    vendor: group.vendor,
                    amount: group.amount,
                    interval: group.interval,
                    isConfirmed
                }),
            });

            const result = await response.json();
            console.log(result.message);

            onFeedback(group.vendor, group.amount, group.interval, isConfirmed);

            // Optionally refresh or filter out updated row
            /*
            setSubscriptions((prev) =>
                prev.filter((txn) =>
                    !(
                        txn.vendor === group.vendor &&
                        parseFloat(txn.amount).toFixed(2) === group.amount &&
                        txn.subscription_interval === group.interval
                    )
                )
            );
            */
        } catch (err) {
            console.error('Feedback failed:', err);
        }
    };

    function groupSubscriptions(subs) {
        //if (!Array.isArray(subs)) return []; // 👈 prevents crash

        const groups = {};

        for (const txn of subs) {
            const key = `${txn.vendor}_${parseFloat(txn.amount).toFixed(2)}_${txn.subscription_interval}`;

            //let vendor;
            //if (!txn.code ? vendor = txn.details : vendor = txn.code);

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

    if (loading) return <p>Loading subscriptions...</p>;

    return (
        <div>
            <h2>Detected Subscriptions</h2>
            {loading ? (
                <p>Loading subscriptions...</p>
            ) : groupSubscriptions(transactions).length === 0 ? (
                <p>No subscriptions found.</p>
            ) : (
                groupSubscriptions(transactions).map((group) => {
                    const groupKey = `${group.vendor}_${group.amount}_${group.interval}`;
                    const isExpanded = expandedGroups[groupKey] || false;

                    return (
                        <div key={groupKey} style={{ border: '1px solid #ccc', marginBottom: '1rem', padding: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <strong>{group.vendor}</strong>
                                <span>${group.amount} — {group.interval}</span>
                                <span>{group.transactions.length} transactions</span>
                                <div>
                                    <button onClick={() => handleFeedback(group, true)}>👍</button>
                                    <button onClick={() => handleFeedback(group, false)}>👎</button>
                                    <button onClick={() =>
                                        setExpandedGroups(prev => ({ ...prev, [groupKey]: !isExpanded }))
                                    }>
                                        {isExpanded ? 'Hide' : 'Show'} details
                                    </button>
                                </div>
                            </div>

                            {isExpanded && (
                                <table style={{ marginTop: '1rem', width: '100%' }}>
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Details</th>
                                            <th>Code</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {group.transactions.map(txn => (
                                            <tr key={txn.id}>
                                                <td>{new Date(txn.date).toLocaleDateString()}</td>
                                                <td>{txn.details}</td>
                                                <td>{txn.code}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default DetectedSubscriptions;