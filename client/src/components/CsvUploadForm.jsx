// src/components/CsvUploadForm.jsx
import React, { useState } from 'react';

function CsvUploadForm({ onUploadSuccess }) {
    // State to store the selected file
    const [selectedFile, setSelectedFile] = useState(null);
    // State to store feedback message
    const [message, setMessage] = useState('');

    // Handles file selection
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Basic validation for CSV type (can be improved)
            if (file.type === "text/csv" || file.name.endsWith('.csv')) {
                setSelectedFile(file);
            } else {
                setSelectedFile(null); // Reset if not a CSV
                setMessage('Error: Please select a valid .csv file.');
                event.target.value = null; // Clear the input
            }
        } else {
            setSelectedFile(null);
            setMessage('Error: Please try again.');
        }
    };

    // Handles form submission
    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevent default form submission behavior

        if (!selectedFile) {
            setMessage('Error: Please select a file to upload.');
            return;
        }

        setMessage(`Processing file: ${selectedFile.name}...`);

        // --- Placeholder for actual upload/processing logic ---
        // In a real app, you would use FormData and fetch/axios
        const formData = new FormData();
        formData.append('csvFile', selectedFile);
        console.log("File to process:", selectedFile);
        // fetch('/api/upload-csv', { method: 'POST', body: formData }) ...
        try {
            const response = await fetch('http://localhost:2000/upload', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            setMessage(result.message || 'Upload complete');
            console.log(result);

            // 🔁 Trigger a re-fetch in the parent dashboard
            if (typeof onUploadSuccess === 'function') {
                onUploadSuccess(); // 👈 tell the dashboard to re-fetch
            }
        } catch (err) {
            console.error(err);
            setMessage('Upload failed');
        }

        // Simulate processing delay
        setTimeout(() => {
            setMessage('');
            // Reset after processing simulation (optional for this demo)
            // setSelectedFile(null);
            // document.getElementById('csv-file-input').value = null;
        }, 1500);
    };

    // Helper to determine message type for styling
    const getMessageType = (msg) => {
        if (!msg) return '';
        if (msg.startsWith('Error:')) return 'error';
        if (msg.startsWith('Success:')) return 'success'; // If you implement success state
        if (msg.startsWith('Processing file:')) return 'processing';
        if (msg.startsWith('Selected file:')) return 'info';
        // Default type if needed, or leave empty
        return 'info'; // Default to info for other messages like the final one
    }

    return (
        <form onSubmit={handleSubmit} className="csv-form">
            <h2>Upload a Bank Statement to Start</h2>
            <div className="form-group">
                <label htmlFor="csv-file-input">Choose a CSV File:</label>
                <input
                    type="file"
                    id="csv-file-input"
                    name="csvFile"
                    accept=".csv, text/csv"
                    onChange={handleFileChange}
                    required
                />
            </div>
            <button type="submit" disabled={!selectedFile}>
                Upload and Process
            </button>
            {message && (
                <p
                    className="message"
                    data-message-type={getMessageType(message)} // Add data attribute
                >
                    {message}
                </p>
            )}
        </form>
    );
}

export default CsvUploadForm;