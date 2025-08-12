import React, { useEffect, useState } from "react";
import PieChart from "./PieChart";
import { format } from "date-fns";

const SpendingBreakdown = ({ refresh }) => {
  const [data, setData] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    fetch("http://localhost:2000/spending-breakdown")
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.error("Failed to fetch data:", err));
  }, [refresh]);

  const handleCategoryClick = async (categoryName) => {
    // If clicking the same category, toggle off
    if (selectedCategory === categoryName) {
      setSelectedCategory(null);
      setTransactions([]);
      return;
    }

    setSelectedCategory(categoryName);
    const res = await fetch(
      `http://localhost:2000/transactions-by-category/${categoryName}`,
    );
    const txns = await res.json();

    const formattedTxns = txns.map((t) => ({
      ...t,
      date: format(new Date(t.date), "dd/MM/yyyy"), // Format date to dd/MM/yyyy
    }));

    setTransactions(formattedTxns);
  };

  return (
    <div className="m-auto mb-3 flex w-[70%] flex-col items-center overflow-hidden rounded-lg bg-white p-2 shadow-md">
      <h2 className="text-center text-2xl font-medium">Spending Breakdown</h2>
      <PieChart data={data} onCategoryClick={handleCategoryClick} />

      {selectedCategory && (
        <div className="flex w-full flex-col items-center">
          <h2 className="pt-3 text-center text-2xl font-medium">
            {selectedCategory} Transactions
          </h2>
          <table className="w-[80%] divide-y divide-gray-200 overflow-hidden rounded-lg bg-white text-left shadow-md">
            <thead className="bg-[#003459] p-5 text-gray-50">
              <tr>
                <th className="w-1/3 px-6 py-3 text-left text-xs font-bold tracking-wider uppercase">
                  Vendor
                </th>
                <th className="w-1/3 px-6 py-3 text-left text-xs font-bold tracking-wider uppercase">
                  Amount
                </th>
                <th className="w-1/3 px-6 py-3 text-left text-xs font-bold tracking-wider uppercase">
                  Date
                </th>
              </tr>
            </thead>
            {transactions.map((t) => (
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm whitespace-nowrap">
                  {t.vendor}
                </td>
                <td className="px-6 py-4 text-sm whitespace-nowrap">
                  ${Math.abs(t.amount).toFixed(2)}
                </td>
                <td className="px-6 py-4 text-sm whitespace-nowrap">
                  {t.date}
                </td>
              </tr>
            ))}
          </table>
        </div>
      )}
    </div>
  );
};

export default SpendingBreakdown;
