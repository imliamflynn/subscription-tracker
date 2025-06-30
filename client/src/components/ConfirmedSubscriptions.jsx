import React, { useEffect, useState } from 'react';

const ConfirmedSubscriptions = () => {
    const [confirmed, setConfirmed] = useState([]);
    const [loading, setLoading] = useState(true);

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
                <p>Loading...</p>
            ) : confirmed.length === 0 ? (
                <p>No confirmed subscriptions yet.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Vendor</th>
                            <th>Amount</th>
                            <th>Interval</th>
                            <th># of Transactions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {confirmed.map((sub, index) => (
                            <tr key={index}>
                                <td>{sub.vendor}</td>
                                <td>${sub.amount}</td>
                                <td>{sub.subscription_interval}</td>
                                <td>{sub.transaction_count}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ConfirmedSubscriptions;