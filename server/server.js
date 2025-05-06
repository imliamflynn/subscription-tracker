const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { readFile } = require('fs');
const fs = require('fs');
const csv = require('csv-parser');

const app = express();
const port = 2000;

// Enable CORS for frontend requests
app.use(cors());

// Set up file upload handler (files saved in ./uploads)
const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('csvFile'), (req, res) => {
    const filePath = req.file.path;
    const results = [];

    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            console.log('Parsed CSV data from:', filePath);

            // Optional: delete file after parsing
            fs.unlinkSync(filePath);

            res.json({
                message: 'File uploaded and parsed successfully',
                rowsParsed: results.length,
                preview: results.slice(0, 5), // show just first few rows for now
            });
        })
        .on('error', (err) => {
            console.error('CSV parsing error:', err);
            res.status(500).json({ error: 'Failed to parse CSV file' });
        });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

// Displays homepage html at root ('/').
app.get('/', (request, response) => {
    readFile('./index.html', 'utf8', (err, html) => {
        if (err) {
            response.status(500).send('Sorry, out of order.');
        }
        response.send(html);
    });
});