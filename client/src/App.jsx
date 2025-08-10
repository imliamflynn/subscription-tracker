import SubscriptionsDashboard from "./components/SubscriptionsDashboard";

function App() {
  return (
    <div className="flex flex-col text-center">
      <header className="mb-4 bg-[#282c34] p-5 text-white">
        <h1>Finance Tracker</h1>
      </header>
      <SubscriptionsDashboard />
      <footer className="mt-3 flex justify-center bg-[#e0e0e0] p-3.5 text-[#464646]">
        <p>Finance Tracker by Liam Lennon-Flynn</p>
      </footer>
    </div>
  );
}

export default App;
