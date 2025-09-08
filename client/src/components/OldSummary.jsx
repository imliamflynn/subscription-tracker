import React, { useEffect, useState } from "react";

const Summary = ({ refresh }) => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [total, setTotal] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/subscriptions/monthly-summary`)
      .then((res) => res.json())
      .then((data) => {
        setSubscriptions(data);
        setTotal(calculateMonthlyTotal(data));
      })
      .catch((err) => console.error("Error fetching summary:", err));
  }, [refresh]);

  const calculateMonthlyTotal = (subs) => {
    let total = 0;

    for (const sub of subs) {
      const amount = parseFloat(sub.total);

      switch (sub.subscription_interval) {
        case "Weekly":
          total += amount * 4;
          break;
        case "Fortnightly":
          total += amount * 2;
          break;
        case "Monthly":
          total += amount;
          break;
        case "Yearly":
          total += amount / 12;
          break;
        default:
          break;
      }
    }

    return total.toFixed(2);
  };

  return (
    <div>
      <h2>Active Subscription Cost Per Month</h2>
      {total !== null ? <p>${total} per month</p> : <p>Loading summary...</p>}
    </div>
  );
};

export default Summary;
