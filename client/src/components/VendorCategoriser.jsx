import React, { useEffect, useState } from "react";

const VendorCategoriser = ({ refresh }) => {
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
    fetch("http://localhost:2000/uncategorised")
      .then((res) => res.json())
      .then(setVendors);
  }, [refresh]);

  const handleCategoryChange = async (vendor, category) => {
    await fetch("http://localhost:2000/update-category", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vendor, category }),
    });

    setVendors((prev) => prev.filter((v) => v.vendor !== vendor));
  };

  const handleHideVendor = async (vendor) => {
    try {
      const response = await fetch("http://localhost:2000/hide-vendor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendor }),
      });

      const result = await response.json();
      console.log(result.message);

      // Remove hidden vendor from local state
      setVendors((prev) => prev.filter((v) => v.vendor !== vendor));
    } catch (err) {
      console.error("Failed to hide vendor:", err);
    }
  };

  return (
    vendors.length > 0 && (
      <div>
        <h3 className="text-center text-lg font-medium">
          Uncategorised Vendors (Highest Spending First)
        </h3>
        {vendors.map(({ vendor, total_spent }) => (
          <div key={vendor}>
            <span>
              {vendor} — ${parseFloat(total_spent).toFixed(2)}
            </span>
            <select
              onChange={(e) => handleCategoryChange(vendor, e.target.value)}
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <button onClick={() => handleHideVendor(vendor)}>Hide</button>
          </div>
        ))}
      </div>
    )
  );
};

export default VendorCategoriser;
