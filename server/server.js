const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const csv = require('csv-parser');
const pool = require('./db'); // import the db connection
const path = require('path');
const { parse } = require('date-fns');
const detectSubscriptions = require('./detectSubscriptions'); // import the subscription detection logic

const app = express();
app.use(express.json()); // Parse JSON request bodies
app.use(cors());// Enable CORS for frontend requests

const port = 2000;

// Set up file upload handler (files saved in ./uploads)
const upload = multer({ dest: 'uploads/' });

app.get('/subscriptions/all', async (req, res) => {
    const result = await pool.query(`
        SELECT id, vendor, amount, date, details, code, is_subscription, reviewed, subscription_interval
        FROM transactions
        WHERE subscription_interval IS NOT NULL
    `);
    res.json(result.rows);
});

app.get('/rejected', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, vendor, amount, date, details, code, subscription_interval
            FROM transactions
            WHERE is_subscription = false AND reviewed = true
            ORDER BY vendor, date`
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching subscriptions:', err);
        res.status(500).json({ error: 'Failed to fetch rejected subscriptions' });
    }
});

app.get('/confirmed', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, vendor, amount, date, details, code, subscription_interval
            FROM transactions
            WHERE is_subscription = true AND reviewed = true
            ORDER BY vendor, date`
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching subscriptions:', err);
        res.status(500).json({ error: 'Failed to fetch subscriptions' });
    }
});

app.post('/feedback', async (req, res) => {
    const { vendor, amount, interval, isConfirmed } = req.body;

    if (!vendor || !amount || !interval || typeof isConfirmed !== 'boolean') {
        return res.status(400).json({ error: 'Invalid input' });
    }

    try {
        await pool.query(
            `UPDATE transactions
            SET is_subscription = $1,
                subscription_interval = CASE WHEN $1 THEN subscription_interval ELSE NULL END,
                reviewed = true
            WHERE LOWER(vendor) = LOWER($2)
                AND ROUND(amount::numeric, 2) = ROUND($3::numeric, 2)
                AND subscription_interval = $4`,
            [isConfirmed, vendor, amount, interval]
        );

        res.json({ message: 'Feedback applied to all matching rows' });
    } catch (err) {
        console.error('Error applying bulk feedback:', err);
        res.status(500).json({ error: 'Bulk feedback failed' });
    }
});

app.get('/detectedsubscriptions', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, vendor, amount, date, details, code, subscription_interval
            FROM transactions
            WHERE is_subscription = true AND reviewed = false
            ORDER BY vendor, date`
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching subscriptions:', err);
        res.status(500).json({ error: 'Failed to fetch subscriptions' });
    }
});

app.post('/upload', upload.single('csvFile'), (req, res) => {
    const filePath = path.join(__dirname, req.file.path);
    const transactions = [];

    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => transactions.push(row))
        .on('end', async () => {
            try {
                for (const row of transactions) {

                    //console.log('Raw date:', row.Date);
                    //console.log('Parsed date:', new Date(row.Date));
                    //const parsedDate = parse(row.Date, 'dd/MM/yyyy', new Date());
                    //console.log(parsedDate);

                    const {
                        Code: code,
                        Details: details,
                        Amount: amount,
                        Type: payment_type,
                        Date: date
                    } = row;

                    const vendor = getVendor(code, details);

                    await pool.query(
                        `INSERT INTO transactions (vendor, code, details, amount, payment_type, date, source_file)
                     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                        [
                            vendor,
                            code,
                            details,
                            parseFloat(amount),
                            payment_type,
                            parse(date, 'dd/MM/yyyy', new Date()),
                            req.file.originalname
                        ]
                    );
                }

                fs.unlinkSync(filePath); // NOT WORKING - remove uploaded file after processing

                // 🔁 Run subscription detection automatically
                await detectSubscriptions();

                res.json({
                    message: 'Transactions inserted into database',
                    rowsInserted: transactions.length
                });
            } catch (err) {
                console.error('Error inserting transactions:', err);
                res.status(500).json({ error: 'Failed to insert transactions' });
            }
        });
});

function getVendor(code, details) {
    // Remove card number garbage
    const cardPattern = /^(\d{4}-\*{4}-\*{4}-\d{4})/;
    const knownJunk = ['df', 'if', 'c']; // anything else you want to filter

    const clean = (str) =>
        str
            ?.toLowerCase()
            .replace(cardPattern, '') // remove card number pattern
            .replace(/[^a-z0-9\s]/gi, '') // remove punctuation
            .replace(/\s+/g, ' ') // collapse whitespace
            .trim();

    const cleanedCode = clean(code);
    const cleanedDetails = clean(details);

    if (cleanedCode == "transfer") return cleanedCode;

    // If details is cleaner (longer and non-junk), prefer it
    if (cleanedDetails && cleanedDetails.length > 3 && !knownJunk.includes(cleanedDetails)) {
        return cleanedDetails;
    }

    // Otherwise fallback to code
    return cleanedCode;
}

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

// Displays homepage html at root ('/').
app.get('/', (request, response) => {
    fs.readFile('./index.html', 'utf8', (err, html) => {
        if (err) {
            response.status(500).send('Sorry, out of order.');
        }
        response.send(html);
    });
});