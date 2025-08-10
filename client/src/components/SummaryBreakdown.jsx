import React, { useEffect, useState } from "react";

const intervalToMonthly = (interval, amount) => {
  const amt = parseFloat(amount);

  switch (interval) {
    case "Weekly":
      return amt * 4;
    case "Fortnightly":
      return amt * 2;
    case "Monthly":
      return amt;
    case "Yearly":
      return amt / 12;
    default:
      return 0;
  }
};

const SummaryBreakdown = ({ refresh }) => {
  const [subs, setSubs] = useState([]);

  useEffect(() => {
    fetch("http://localhost:2000/subscriptions/monthly-summary")
      .then((res) => res.json())
      .then(setSubs)
      .catch(console.error);
  }, [refresh]);

  const totalMonthly = subs.reduce((acc, sub) => {
    return acc + intervalToMonthly(sub.subscription_interval, sub.total);
  }, 0);

  return (
    <div className="mt-3 flex flex-col items-center">
      <h2 className="text-center text-2xl font-medium">
        Active Subscription Summary
      </h2>
      <table className="w-[70%] divide-y divide-gray-200 overflow-hidden rounded-lg bg-white text-left shadow shadow-md">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-bold tracking-wider uppercase">
              Vendor
            </th>
            <th className="px-6 py-3 text-left text-xs font-bold tracking-wider uppercase">
              Interval
            </th>
            <th className="px-6 py-3 text-left text-xs font-bold tracking-wider uppercase">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-bold tracking-wider uppercase">
              Monthly Equivalent
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {subs.map((sub, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm whitespace-nowrap">
                {sub.vendor}
              </td>
              <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                {sub.subscription_interval}
              </td>
              <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                ${parseFloat(sub.total).toFixed(2)}
              </td>
              <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                $
                {intervalToMonthly(
                  sub.subscription_interval,
                  sub.total,
                ).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="hover:bg-gray-50">
            <td
              colSpan="3"
              className="px-6 py-4 text-sm font-bold whitespace-nowrap"
            >
              Total
            </td>
            <td className="px-6 py-4 text-sm font-bold whitespace-nowrap">
              ${totalMonthly.toFixed(2)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default SummaryBreakdown;
