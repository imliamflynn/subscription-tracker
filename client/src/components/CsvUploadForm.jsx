import React, { useState } from "react";

function CsvUploadForm({ onUploadSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);

  // Handles file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Basic validation for CSV type (can be improved)
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        setSelectedFile(file);
      } else {
        setSelectedFile(null); // Reset if not a CSV
        event.target.value = null; // Clear the input
      }
    } else {
      setSelectedFile(null);
    }
  };

  // Handles form submission
  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent default form submission behavior

    if (!selectedFile) {
      return;
    }

    const formData = new FormData();
    formData.append("csvFile", selectedFile);
    console.log("File to process:", selectedFile);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      console.log(result);

      // 🔁 Trigger a re-fetch in the parent dashboard
      if (typeof onUploadSuccess === "function") {
        onUploadSuccess(); // 👈 tell the dashboard to re-fetch
      }
    } catch (err) {
      console.error(err);
    }

    setSelectedFile(null);
    document.getElementById("csv-file-input").value = null;
  };

  return (
    <div className="mb-3 flex justify-center">
      <form
        onSubmit={handleSubmit}
        className="flex w-[60%] flex-col items-center rounded-lg bg-white px-3 py-3 shadow-md"
      >
        <h2 className="mb-1 text-2xl font-medium">Upload a Bank Statement</h2>
        <div className="flex w-full flex-col items-center text-left">
          <label
            htmlFor="csv-file-input"
            className="mb-2 self-start pl-6 text-left font-bold text-[#555]"
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
            className="mb-3 w-[95%] cursor-pointer rounded-md border border-gray-200 p-2 transition-colors duration-200 ease-in-out file:mr-2 file:cursor-pointer file:rounded-sm file:border-none file:bg-[#61dafb] file:p-2 file:transition-colors file:duration-200 file:ease-in-out hover:bg-gray-200 hover:file:bg-[#4cafaf]"
          />
        </div>
        <button
          type="submit"
          disabled={!selectedFile}
          className="w-[30%] cursor-pointer rounded-md border-0 bg-[#61dafb] p-2 font-bold transition-colors duration-200 ease-in-out hover:bg-[#4cafaf] disabled:cursor-not-allowed disabled:bg-[#cccccc] disabled:text-[#666666] disabled:opacity-70"
        >
          Upload and Process
        </button>
      </form>
    </div>
  );
}

export default CsvUploadForm;
