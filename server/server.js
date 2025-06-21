const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const csv = require('csv-parser');
const pool = require('./db'); // import the db connection
const path = require('path');
const { parse } = require('date-fns');

const app = express();
const port = 2000;

// Enable CORS for frontend requests
app.use(cors());

// Set up file upload handler (files saved in ./uploads)
const upload = multer({ dest: 'uploads/' });

app.get('/subscriptions', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, vendor, amount, date, details, code FROM transactions WHERE is_subscription = true ORDER BY vendor, date`
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

                fs.unlinkSync(filePath); // remove uploaded file after processing
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