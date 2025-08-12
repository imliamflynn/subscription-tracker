import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = ({ data, onCategoryClick }) => {
  const labels = data.map((entry) => entry.category);

  const chartData = {
    labels,
    datasets: [
      {
        data: data.map((entry) => Math.abs(entry.total)), // use positive values
        backgroundColor: [
          "#36A2EB",
          "#FF6384",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
          "#8AE234",
          "#C9CBCF",
        ],
      },
    ],
  };

  const options = {
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const categoryIndex = elements[0].index;
        const categoryName = labels[categoryIndex];
        if (onCategoryClick) {
          onCategoryClick(categoryName);
        }
      }
    },
  };

  // Calculate total spent (absolute value)
  const totalSpent = data.reduce(
    (sum, entry) => sum + Math.abs(entry.total),
    0,
  );

  return (
    <div className="flex w-full flex-col items-center">
      {chartData.length === 0 ? (
        <p>
          No categorized spending data yet. Try assigning categories to vendors.
        </p>
      ) : (
        <>
          <div className="flex w-[400px] justify-center">
            <Pie data={chartData} options={options} />
          </div>
          <p className="mt-3 font-bold">
            Total Spent: ${totalSpent.toFixed(2)}
          </p>
        </>
      )}
    </div>
  );
};

export default PieChart;
