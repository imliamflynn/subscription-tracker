// src/App.jsx
import React from 'react';
import CsvUploadForm from './components/CsvUploadForm'; // Import the form component
import './App.css'; // Import basic styling (Vite handles CSS imports)
import DetectedSubscriptions from './components/DetectedSubscriptions'; // Import subscriptions component
import ConfirmedSubscriptions from './components/ConfirmedSubscriptions'; // Import confirmed subscriptions component
import RejectedSubscriptions from './components/RejectedSubscriptions'; // Import rejected subscriptions component
import SubscriptionsDashboard from './components/SubscriptionsDashboard';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Subscription Tracker</h1>
      </header>
      <main>
        <CsvUploadForm /> {/* Render the form component */}
      </main>
      <SubscriptionsDashboard />
      <footer>
        <p>Subscription Tracker by Liam Lennon-Flynn</p>
      </footer>
    </div >
  );
}

export default App;