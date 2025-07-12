import React, { useEffect, useState } from 'react';
import groupSubscriptions from '../utils/groupSubscriptions';

const ConfirmedSubscriptions = ({ transactions }) => {
    const [confirmed, setConfirmed] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedGroups, setExpandedGroups] = useState({});

    useEffect(() => {
        fetch('http://localhost:2000/confirmed')
            .then(res => res.json())
            .then(data => {
                setConfirmed(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch confirmed subscriptions:', err);
                setLoading(false);
            });
    }, []);

    return (
        <div>
            <h2>Confirmed Subscriptions</h2>
            {loading ? (
                <p>Loading confirmed subscriptions...</p>
            ) : groupSubscriptions(transactions).length === 0 ? (
                <p>No confirmed subscriptions found.</p>
            ) : (
                groupSubscriptions(transactions).map((group) => {
                    const groupKey = `${group.vendor}_${group.amount}_${group.interval}`;
                    const isExpanded = expandedGroups[groupKey] || false;

                    return (
                        <div key={groupKey} style={{ border: '1px solid #ccc', marginBottom: '1rem', padding: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <strong>{group.vendor}</strong>
                                <span>${Math.abs(group.amount).toFixed(2)}</span>
                                <span>{group.interval}</span>
                                <span>{group.transactions.length} transactions</span>
                                <div>
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

export default ConfirmedSubscriptions;