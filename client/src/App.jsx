import SubscriptionsDashboard from "./components/SubscriptionsDashboard";

function App() {
  return (
    <div className="flex min-h-screen flex-col text-center">
      <header className="mb-4 bg-[#333] p-5 text-gray-50">
        <h1 className="text-5xl font-medium">Finance Tracker</h1>
      </header>
      <main className="flex-1">
        <SubscriptionsDashboard />
      </main>
      <footer className="mt-auto flex justify-center bg-[#ececec] p-3.5 text-[#464646]">
        <p>Finance Tracker by Liam Lennon-Flynn</p>
      </footer>
    </div>
  );
}

export default App;
