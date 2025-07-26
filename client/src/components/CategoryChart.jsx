import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const CategoryChart = ({ data }) => {
    const chartData = {
        labels: data.map((entry) => entry.category),
        datasets: [
            {
                data: data.map((entry) => Math.abs(entry.total)), // use positive values
                backgroundColor: [
                    '#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0',
                    '#9966FF', '#FF9F40', '#C9CBCF', '#8AE234'
                ],
            },
        ],
    };

    return (
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
            <Pie data={chartData} />
        </div>
    );
};

export default CategoryChart;