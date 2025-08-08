import React, { useEffect, useState } from 'react';
import PieChart from './PieChart';
import { format } from 'date-fns';

const SpendingBreakdown = ({ refresh }) => {
    const [data, setData] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);

    useEffect(() => {
        fetch('http://localhost:2000/spending-breakdown')
            .then((res) => res.json())
            .then((data) => setData(data))
            .catch((err) => console.error('Failed to fetch data:', err));
    }, [refresh]);

    const handleCategoryClick = async (categoryName) => {
        // If clicking the same category, toggle off
        if (selectedCategory === categoryName) {
            setSelectedCategory(null);
            setTransactions([]);
            return;
        }

        setSelectedCategory(categoryName);
        const res = await fetch(`http://localhost:2000/transactions-by-category/${categoryName}`);
        const txns = await res.json();

        const formattedTxns = txns.map((t) => ({
            ...t,
            date: format(new Date(t.date), 'dd/MM/yyyy') // Format date to dd/MM/yyyy
        }));

        setTransactions(formattedTxns);
    };

    return (
        <div>
            <h2>Spending Breakdown</h2>
            <PieChart data={data} onCategoryClick={handleCategoryClick} />

            {selectedCategory && (
                <div>
                    <h3>{selectedCategory} Transactions</h3>
                    <ul>
                        {transactions.map((t) => (
                            <li key={t.id} style={{ listStyleType: 'none' }}>
                                {t.vendor} — ${Math.abs(t.amount).toFixed(2)} - {t.date}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default SpendingBreakdown;