import React, { useEffect, useState } from 'react';
import CategoryChart from './CategoryChart';

const SpendingDashboard = ({ refresh }) => {
    const [breakdown, setBreakdown] = useState([]);

    useEffect(() => {
        fetch('http://localhost:2000/spending-breakdown')
            .then((res) => res.json())
            .then((data) => setBreakdown(data))
            .catch((err) => console.error('Failed to fetch breakdown:', err));
    }, [refresh]);

    return (
        <div>
            <h2>Spending Breakdown</h2>
            <CategoryChart data={breakdown} />
        </div>
    );
};

export default SpendingDashboard;