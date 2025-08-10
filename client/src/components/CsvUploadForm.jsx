// src/components/CsvUploadForm.jsx
import React, { useState } from "react";

function CsvUploadForm({ onUploadSuccess }) {
  // State to store the selected file
  const [selectedFile, setSelectedFile] = useState(null);
  // State to store feedback message
  const [message, setMessage] = useState("");

  // Handles file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Basic validation for CSV type (can be improved)
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        setSelectedFile(file);
      } else {
        setSelectedFile(null); // Reset if not a CSV
        setMessage("Error: Please select a valid .csv file.");
        event.target.value = null; // Clear the input
      }
    } else {
      setSelectedFile(null);
      setMessage("Error: Please try again.");
    }
  };

  // Handles form submission
  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent default form submission behavior

    if (!selectedFile) {
      setMessage("Error: Please select a file to upload.");
      return;
    }

    setMessage(`Processing file: ${selectedFile.name}...`);

    // --- Placeholder for actual upload/processing logic ---
    // In a real app, you would use FormData and fetch/axios
    const formData = new FormData();
    formData.append("csvFile", selectedFile);
    console.log("File to process:", selectedFile);
    // fetch('/api/upload-csv', { method: 'POST', body: formData }) ...
    try {
      const response = await fetch("http://localhost:2000/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      setMessage(result.message || "Upload complete");
      console.log(result);

      // 🔁 Trigger a re-fetch in the parent dashboard
      if (typeof onUploadSuccess === "function") {
        onUploadSuccess(); // 👈 tell the dashboard to re-fetch
      }
    } catch (err) {
      console.error(err);
      setMessage("Upload failed");
    }

    // Simulate processing delay
    setTimeout(() => {
      setMessage("");
      // Reset after processing simulation (optional for this demo)
      // setSelectedFile(null);
      // document.getElementById('csv-file-input').value = null;
    }, 1500);
  };

  // Helper to determine message type for styling
  const getMessageType = (msg) => {
    if (!msg) return "";
    if (msg.startsWith("Error:")) return "error";
    if (msg.startsWith("Success:")) return "success"; // If you implement success state
    if (msg.startsWith("Processing file:")) return "processing";
    if (msg.startsWith("Selected file:")) return "info";
    // Default type if needed, or leave empty
    return "info"; // Default to info for other messages like the final one
  };

  return (
    <div className="flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="flex w-[60%] flex-col rounded-lg bg-white px-4 py-4 shadow-md"
      >
        <h2 className="mb-2 text-2xl font-medium">
          Upload a Bank Statement to Start
        </h2>
        <div className="flex w-full flex-col items-center text-left">
          <label
            htmlFor="csv-file-input"
            className="self-start pl-7 text-left font-bold text-[#555]"
          >
            Choose a CSV File:
          </label>
          <input
            type="file"
            id="csv-file-input"
            name="csvFile"
            accept=".csv, text/csv"
            onChange={handleFileChange}
            required
            className="w-[95%] cursor-pointer rounded-md border border-gray-200 p-2 file:mr-2 file:cursor-pointer file:rounded-sm file:border-none file:bg-[#61dafb] file:p-2 file:transition-colors file:duration-200 file:ease-in-out hover:file:bg-[#4cafaf] hover:file:text-white"
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
    </div>
  );
}

export default CsvUploadForm;
