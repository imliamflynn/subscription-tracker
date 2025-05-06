const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const csv = require('csv-parser');
const pool = require('./db'); // import the db connection
const path = require('path');

const app = express();
const port = 2000;

// Enable CORS for frontend requests
app.use(cors());

// Set up file upload handler (files saved in ./uploads)
const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('csvFile'), (req, res) => {
    const filePath = path.join(__dirname, req.file.path);
    const transactions = [];

    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => transactions.push(row))
        .on('end', async () => {
            try {
                for (const row of transactions) {
                    const {
                        Code: code,
                        Details: details,
                        Amount: amount,
                        PaymentType: payment_type,
                        Date: date
                    } = row;

                    await pool.query(
                        `INSERT INTO transactions (code, details, amount, payment_type, date, source_file)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                        [
                            code,
                            details,
                            parseFloat(amount),
                            payment_type,
                            new Date(date),
                            req.file.originalname
                        ]
                    );
                }

                fs.unlinkSync(filePath); // remove uploaded file after processing
                res.json({ message: 'Transactions inserted into database' });
            } catch (err) {
                console.error('Error inserting transactions:', err);
                res.status(500).json({ error: 'Failed to insert transactions' });
            }
        });
});

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