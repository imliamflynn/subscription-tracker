import React, { useEffect, useState } from "react";
import groupSubscriptions from "../utils/groupSubscriptions";
import handleFeedback from "../utils/handleFeedback";

const IncorrectSubscriptions = ({ transactions, onFeedback }) => {
  const [confirmed, setConfirmed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState({});

  useEffect(() => {
    fetch("http://localhost:2000/incorrect")
      .then((res) => res.json())
      .then((data) => {
        setConfirmed(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch confirmed subscriptions:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="mb-3 flex flex-col items-center">
      <h2 className="text-center text-2xl font-medium">
        Incorrect Subscriptions
      </h2>
      <table className="w-[70%] divide-y divide-gray-200 overflow-hidden rounded-lg bg-white text-left shadow-md">
        <thead className="bg-gray-50">
          <tr>
            <th className="w-1/5 px-6 py-3 text-left text-xs font-bold tracking-wider uppercase">
              Vendor
            </th>
            <th className="w-1/5 px-6 py-3 text-left text-xs font-bold tracking-wider uppercase">
              Amount
            </th>
            <th className="w-1/5 px-6 py-3 text-left text-xs font-bold tracking-wider uppercase">
              Interval
            </th>
            <th className="w-1/5 px-6 py-3 text-left text-xs font-bold tracking-wider uppercase">
              Transactions
            </th>
            <th className="w-1/5 px-6 py-3 text-left text-xs font-bold tracking-wider uppercase">
              Details
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200"></tbody>
        {loading ? (
          <tr>
            <td colSpan={5} className="p-4 text-center align-middle text-sm">
              Loading incorrect subscriptions...
            </td>
          </tr>
        ) : groupSubscriptions(transactions).length === 0 ? (
          <tr>
            <td colSpan={5} className="p-4 text-center align-middle text-sm">
              No subscriptions have been marked as incorrect.
            </td>
          </tr>
        ) : (
          groupSubscriptions(transactions).map((group) => {
            const groupKey = `${group.vendor}_${group.amount}_${group.interval}`;
            const isExpanded = expandedGroups[groupKey] || false;

            return (
              <React.Fragment key={groupKey}>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm whitespace-nowrap">
                    {group.vendor}
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                    ${Math.abs(group.amount).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                    {group.interval}
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                    {group.transactions.length} transactions
                  </td>
                  <td className="flex items-center p-2">
                    <button
                      onClick={() => handleFeedback(group, true, onFeedback)}
                      className="w-2/8 cursor-pointer rounded-md p-2 text-sm font-medium hover:bg-gray-200"
                    >
                      ✅
                    </button>
                    <button
                      onClick={() =>
                        setExpandedGroups((prev) => ({
                          ...prev,
                          [groupKey]: !isExpanded,
                        }))
                      }
                      className="ml-2 w-5/8 cursor-pointer rounded-md border-0 bg-[#61dafb] p-2 text-sm font-medium transition-colors duration-200 ease-in-out hover:bg-[#4cafaf]"
                    >
                      {isExpanded ? "Hide" : "Show"} details
                    </button>
                  </td>
                </tr>

                {isExpanded && (
                  <tr>
                    <td colSpan={5} className="bg-gray-50 p-4">
                      <table className="w-full divide-y divide-gray-200 overflow-hidden rounded-lg bg-white ring ring-gray-200">
                        <thead>
                          <tr className="hover:bg-gray-50">
                            <th className="w-1/3 px-2 py-1 text-sm">Date</th>
                            <th className="w-1/3 px-2 py-1 text-sm">Details</th>
                            <th className="w-1/3 px-2 py-1 text-sm">Code</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {group.transactions.map((txn) => (
                            <tr key={txn.id} className="hover:bg-gray-50">
                              <td className="px-2 py-1 text-sm">
                                {new Date(txn.date).toLocaleDateString()}
                              </td>
                              <td className="px-2 py-1 text-sm">
                                {txn.details}
                              </td>
                              <td className="px-2 py-1 text-sm">{txn.code}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })
        )}
      </table>
    </div>
  );
};

export default IncorrectSubscriptions;
