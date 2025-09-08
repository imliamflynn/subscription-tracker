//VendorCategoriser.jsx

import React, { useEffect, useState } from "react";

const VendorCategoriser = ({ refresh, onChange }) => {
  const [vendors, setVendors] = useState([]);
  const [categories] = useState([
    "Groceries",
    "Petrol",
    "Bills",
    "Services",
    "Entertainment",
    "Retail",
    "Flights",
    "ATM",
    "Mechanic",
    "Insurance",
    "Food and Drink",
    "Rent",
    "Friends and Family",
    "Other",
  ]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/uncategorised`)
      .then((res) => res.json())
      .then(setVendors);
  }, [refresh]);

  const handleCategoryChange = async (vendor, category) => {
    await fetch(`${import.meta.env.VITE_API_URL}/update-category`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vendor, category }),
    });

    setVendors((prev) => prev.filter((v) => v.vendor !== vendor));

    // 🔄 Tell parent dashboard to refresh charts & breakdowns
    if (onChange) onChange();
  };

  const handleHideVendor = async (vendor) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/hide-vendor`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vendor }),
        },
      );

      const result = await response.json();
      console.log(result.message);

      // Remove hidden vendor from local state
      setVendors((prev) => prev.filter((v) => v.vendor !== vendor));

      // 🔄 Trigger refresh too
      if (onChange) onChange();
    } catch (err) {
      console.error("Failed to hide vendor:", err);
    }
  };

  return (
    vendors.length > 0 && (
      <div className="mb-4 flex flex-col items-center">
        <h2 className="text-center text-2xl font-medium">
          Uncategorised Vendors
        </h2>
        <table className="w-[70%] divide-y divide-gray-200 overflow-hidden rounded-lg bg-white text-left shadow-md">
          <thead className="bg-[#003459] p-5 text-gray-50">
            <tr>
              <th className="w-1/4 px-6 py-3 text-left text-xs font-bold tracking-wider uppercase">
                Vendor
              </th>
              <th className="w-1/4 px-6 py-3 text-left text-xs font-bold tracking-wider uppercase">
                Amount
              </th>
              <th className="w-1/4 px-6 py-3 text-left text-xs font-bold tracking-wider uppercase">
                Category
              </th>
              <th className="w-1/4 px-6 py-3 text-center text-xs font-bold tracking-wider uppercase">
                Hide
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {vendors.map(({ vendor, total_spent }) => (
              <tr key={vendor} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm whitespace-nowrap">
                  {vendor}
                </td>
                <td className="px-6 py-4 text-sm whitespace-nowrap">
                  ${Math.abs(parseFloat(total_spent).toFixed(2))}
                </td>
                <td className="px-6 py-4 text-sm whitespace-nowrap">
                  <select
                    onChange={(e) =>
                      handleCategoryChange(vendor, e.target.value)
                    }
                    className="cursor-pointer rounded-md border-0 bg-gray-200 p-2 text-sm transition-colors duration-200 ease-in-out hover:bg-gray-300"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="flex justify-center px-6 py-4 text-sm whitespace-nowrap">
                  <button
                    onClick={() => handleHideVendor(vendor)}
                    className="cursor-pointer rounded-md border-0 bg-[#61dafb] p-2 px-5 text-sm transition-colors duration-200 ease-in-out hover:bg-[#4cafaf]"
                  >
                    Hide
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  );
};

export default VendorCategoriser;
