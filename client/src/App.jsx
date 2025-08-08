import './App.css'; // Import basic styling (Vite handles CSS imports)
import SubscriptionsDashboard from './components/SubscriptionsDashboard';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Finance Tracker</h1>
      </header>
      <SubscriptionsDashboard />
      <footer>
        <p>Finance Tracker by Liam Lennon-Flynn</p>
      </footer>
    </div >
  );
}

export default App;