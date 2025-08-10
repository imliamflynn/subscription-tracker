import SubscriptionsDashboard from './components/SubscriptionsDashboard';
//import './App.css'; // Import basic styling (Vite handles CSS imports)
//import './index.css'; // Import Tailwind CSS styles

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1 className="text-red-500">Finance Tracker</h1>
      </header>
      <SubscriptionsDashboard />
      <footer>
        <p>Finance Tracker by Liam Lennon-Flynn</p>
      </footer>
    </div >
  );
}

export default App;