// src/App.jsx
import React from 'react';
import CsvUploadForm from './components/CsvUploadForm'; // Import the form component
import './App.css'; // Import basic styling (Vite handles CSS imports)
import Subscriptions from './components/Subscriptions'; // Import subscriptions component
import ConfirmedSubscriptions from './components/ConfirmedSubscriptions'; // Import confirmed subscriptions component

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Subscription Tracker</h1>
      </header>
      <main>
        <CsvUploadForm /> {/* Render the form component */}
      </main>
      <Subscriptions />
      <ConfirmedSubscriptions />
      <footer>
        <p>Subscription Tracker by Liam Lennon-Flynn</p>
      </footer>
    </div >
  );
}

export default App;