import React, { useEffect, useState } from 'react';

const Subscriptions = () => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:2000/subscriptions')
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

    if (loading) return <p>Loading subscriptions...</p>;

    return (
        <div>
            <h2>Detected Subscriptions</h2>
            {subscriptions.length === 0 ? (
                <p>No subscriptions found.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Vendor</th>
                            <th>Amount</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subscriptions.map((txn) => ( //txn = transaction
                            <tr key={txn.id}>
                                <td>{txn.vendor}</td>
                                <td>${txn.amount}</td>
                                <td>{new Date(txn.date).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Subscriptions;