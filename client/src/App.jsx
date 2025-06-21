// src/App.jsx
import React from 'react';
import CsvUploadForm from './components/CsvUploadForm'; // Import the form component
import './App.css'; // Import basic styling (Vite handles CSS imports)
import Subscriptions from './components/Subscriptions';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Subscription Tracker</h1>
      </header>
      <main>
        <CsvUploadForm /> {/* Render the form component */}
        <Subscriptions />
      </main>
      <footer>
        <p>Subscription Tracker by Liam Lennon-Flynn</p>
      </footer>
    </div >
  );
}

export default App;