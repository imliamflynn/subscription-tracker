import React, { useEffect, useState } from "react";
import groupSubscriptions from "../utils/groupSubscriptions";
import handleFeedback from "../utils/handleFeedback";

const Subscriptions = ({ transactions, onFeedback }) => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState({});

  useEffect(() => {
    fetch("http://localhost:2000/subscriptions")
      .then((res) => res.json())
      .then((data) => {
        setSubscriptions(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch subscriptions:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="mb-3 flex flex-col items-center">
      <h2 className="text-center text-2xl font-medium">Subscriptions</h2>
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
              # of Transactions
            </th>
            <th className="w-1/5 px-6 py-3 text-left text-xs font-bold tracking-wider uppercase">
              Details
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td colSpan={5}>Loading subscriptions...</td>
            </tr>
          ) : groupSubscriptions(transactions).length === 0 ? (
            <tr>
              <td colSpan={5}>No subscriptions found.</td>
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
                    <td>
                      <button
                        onClick={() => handleFeedback(group, false, onFeedback)}
                        className="px-6 py-4 text-sm whitespace-nowrap text-gray-500"
                      >
                        🚫
                      </button>
                      <button
                        onClick={() =>
                          setExpandedGroups((prev) => ({
                            ...prev,
                            [groupKey]: !isExpanded,
                          }))
                        }
                      >
                        {isExpanded ? "Hide" : "Show"} details
                      </button>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr>
                      <td colSpan={5} className="bg-gray-50 p-4">
                        <table className="w-full border border-gray-200">
                          <thead>
                            <tr>
                              <th className="border px-2 py-1">Date</th>
                              <th className="border px-2 py-1">Details</th>
                              <th className="border px-2 py-1">Code</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.transactions.map((txn) => (
                              <tr key={txn.id}>
                                <td className="border px-2 py-1">
                                  {new Date(txn.date).toLocaleDateString()}
                                </td>
                                <td className="border px-2 py-1">
                                  {txn.details}
                                </td>
                                <td className="border px-2 py-1">{txn.code}</td>
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
        </tbody>
      </table>
    </div>
  );
};

export default Subscriptions;
