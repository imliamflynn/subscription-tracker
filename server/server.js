//server.js

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const csv = require("csv-parser");
//const pool = require("./utils/db"); // import the db connection
require('dotenv').config();
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});
const path = require("path");
const detectSubscriptions = require("./utils/detectSubscriptions"); // import the subscription detection logic
const detectBank = require("./utils/detectBank"); // import the bank detection utility
const { parseANZRow, parseWestpacRow } = require("./utils/parseCsvRow"); // import the CSV row parsers

const port = 2000;

const app = express();
app.use(express.json()); // Parse JSON request bodies
app.use(cors()); // Enable CORS for frontend requests

// Set up file upload handler (files saved in ./uploads)
const upload = multer({ dest: "uploads/" });

app.get("/api/transactions-by-category/:category", async (req, res) => {
  const { category } = req.params;
  try {
    const result = await pool.query(
      `SELECT id, vendor, amount, date
             FROM transactions
             WHERE category = $1
             ORDER BY date DESC`,
      [category]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

app.post("/api/hide-vendor", async (req, res) => {
  const { vendor } = req.body;

  if (!vendor) {
    return res.status(400).json({ error: "Vendor is required" });
  }

  try {
    await pool.query(
      `INSERT INTO hidden_vendors (vendor)
       VALUES ($1)
       ON CONFLICT (vendor) DO NOTHING`,
      [vendor.toLowerCase()]
    );

    res.json({ message: `Vendor "${vendor}" hidden.` });
  } catch (err) {
    console.error("Error hiding vendor:", err);
    res.status(500).json({ error: "Failed to hide vendor" });
  }
});

app.post("/api/update-category", async (req, res) => {
  const { vendor, category } = req.body;

  if (!vendor || !category) {
    return res.status(400).json({ error: "Vendor and category are required." });
  }

  try {
    // Insert or update the vendor-category map
    await pool.query(
      `
      INSERT INTO vendor_category_map (vendor, category)
      VALUES ($1, $2)
      ON CONFLICT (vendor)
      DO UPDATE SET category = EXCLUDED.category
    `,
      [vendor, category]
    );

    // Update existing transactions for this vendor case-insensitively
    await pool.query(
      `
      UPDATE transactions
      SET category = $1
      WHERE LOWER(vendor) = LOWER($2)
    `,
      [category, vendor]
    );

    res.json({
      message: "Category updated and stored in vendor_category_map.",
    });
  } catch (err) {
    console.error("Failed to update category:", err);
    res.status(500).json({ error: "Failed to update vendor category" });
  }
});

app.get("/api/uncategorised", async (req, res) => {
  try {
    const result = await pool.query(`
            SELECT vendor, SUM(amount) AS total_spent
            FROM transactions
            WHERE (category IS NULL OR category = 'Other')
              AND amount < 0
              AND LOWER(vendor) NOT IN (SELECT LOWER(vendor) FROM hidden_vendors)
            GROUP BY vendor
            ORDER BY total_spent ASC
        `);

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching uncategorised vendors:", err);
    res.status(500).json({ error: "Failed to fetch vendors" });
  }
});

app.get("/api/spending-breakdown", async (req, res) => {
  try {
    const hidden = await pool.query(`SELECT vendor FROM hidden_vendors`);
    const hiddenList = hidden.rows.map((r) => r.vendor);

    const result = await pool.query(`
      SELECT vendor, category, amount
      FROM transactions
      WHERE amount < 0 AND category IS NOT NULL
    `);

    const filtered = result.rows.filter(
      (row) => !hiddenList.includes(row.vendor?.toLowerCase())
    );

    const breakdown = {};
    for (const { category, amount } of filtered) {
      if (!breakdown[category]) breakdown[category] = 0;
      breakdown[category] += Math.abs(Number(amount));
    }

    const summary = Object.entries(breakdown).map(([category, total]) => ({
      category,
      total,
    }));

    summary.sort((a, b) => b.total - a.total);
    res.json(summary);
  } catch (err) {
    console.error("Error generating breakdown:", err);
    res.status(500).json({ error: "Failed to generate breakdown" });
  }
});

// Change intervals once using live data to: 7, 14, 31, 365 respectively.
app.get("/api/subscriptions/monthly-summary", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT vendor, subscription_interval, ROUND(ABS(SUM(amount)), 2) AS total
      FROM transactions
      WHERE is_subscription = true
        AND (
          (subscription_interval = 'Weekly'   AND date >= CURRENT_DATE - INTERVAL '7 days') OR
          (subscription_interval = 'Fortnightly' AND date >= CURRENT_DATE - INTERVAL '14 days') OR
          (subscription_interval = 'Monthly'  AND date >= CURRENT_DATE - INTERVAL '31 days') OR
          (subscription_interval = 'Yearly'   AND date >= CURRENT_DATE - INTERVAL '365 days')
        )
      GROUP BY vendor, subscription_interval
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Error calculating monthly summary:", err);
    res.status(500).json({ error: "Failed to calculate summary" });
  }
});

app.get("/api/subscriptions/all", async (req, res) => {
  const result = await pool.query(`
        SELECT id, vendor, amount, date, details, code, is_subscription, subscription_interval
        FROM transactions
        WHERE subscription_interval IS NOT NULL
    `);
  res.json(result.rows);
});

app.get("/api/incorrect", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, vendor, amount, date, details, code, is_subscription, subscription_interval
            FROM transactions
            WHERE is_subscription = false
            ORDER BY vendor, date`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching subscriptions:", err);
    res.status(500).json({ error: "Failed to fetch rejected subscriptions" });
  }
});

app.post("/api/feedback", async (req, res) => {
  const { vendor, amount, interval, isConfirmed } = req.body;

  if (!vendor || !amount || !interval || typeof isConfirmed !== "boolean") {
    return res.status(400).json({ error: "Invalid input" });
  }

  try {
    await pool.query(
      `UPDATE transactions
            SET is_subscription = $1
            WHERE LOWER(vendor) = LOWER($2)
            AND ROUND(amount::numeric, 2) = ROUND($3::numeric, 2)
            AND subscription_interval = $4`,
      [isConfirmed, vendor, amount, interval]
    );

    res.json({ message: "Feedback applied to all matching rows" });
  } catch (err) {
    console.error("Error applying bulk feedback:", err);
    res.status(500).json({ error: "Bulk feedback failed" });
  }
});

app.get("/api/subscriptions", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, vendor, amount, date, details, code, subscription_interval
            FROM transactions
            WHERE is_subscription = true
            ORDER BY vendor, date`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching subscriptions:", err);
    res.status(500).json({ error: "Failed to fetch subscriptions" });
  }
});

app.post("/api/upload", upload.single("csvFile"), (req, res) => {
  const filePath = path.join(__dirname, req.file.path);
  const transactions = [];
  let detectedFormat;
  let headers = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("headers", (cols) => {
      headers = cols;
      detectedFormat = detectBank(cols);
      console.log("Detected bank:", detectedFormat);
    })
    .on("data", (row) => {
      //transactions.push(row))
      if (!detectedFormat) return;

      let parsed;
      switch (detectedFormat) {
        case "ANZ":
          parsed = parseANZRow(row);
          break;
        case "Westpac":
          parsed = parseWestpacRow(row);
          break;
        default:
          // you could reject here if unknown format
          break;
      }

      // Only include negative transactions
      if (parsed && parsed.amount < 0) {
        transactions.push(parsed);
      }
    })
    .on("end", async () => {
      try {
        for (const row of transactions) {
          const { vendor, code, details, amount, date /*, category*/ } = row;

          // Lookup category for the vendor
          const categoryResult = await pool.query(
            `SELECT category FROM vendor_category_map WHERE LOWER(vendor) = LOWER($1)`,
            [vendor]
          );

          const category = categoryResult.rows[0]?.category || null;

          await pool.query(
            `INSERT INTO transactions (vendor, code, details, amount, date, category, source_file)
                     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              vendor,
              code,
              details,
              amount,
              date,
              category,
              req.file.originalname,
            ]
          );
        }

        fs.unlinkSync(filePath); // NOT WORKING - remove uploaded file after processing

        // 🔁 Run subscription detection automatically
        await detectSubscriptions();

        res.json({
          message: "Transactions inserted into database",
          rowsInserted: transactions.length,
        });
      } catch (err) {
        console.error("Error inserting transactions:", err);
        res.status(500).json({ error: "Failed to insert transactions" });
      }
    });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

// Displays homepage html at root ('/'). Comment out for AWS.
/*
app.get("/", (request, response) => {
  fs.readFile("./index.html", "utf8", (err, html) => {
    if (err) {
      response.status(500).send("Sorry, out of order.");
    }
    response.send(html);
  });
});
*/
