import React, { useEffect, useState } from "react";
import axios from "axios";

export default function LoaderDashboard({ loaderId }) {
  const [loads, setLoads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [accepting, setAccepting] = useState("");

  useEffect(() => {
    const fetchLoads = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await axios.get("http://127.0.0.1:8000/loads/available");
        setLoads(response.data);
      } catch {
        setError("Failed to fetch available loads.");
      } finally {
        setLoading(false);
      }
    };
    fetchLoads();
  }, []);

  const handleAccept = async (loadId) => {
    setAccepting(loadId);
    setError("");
    try {
      await axios.put(`http://127.0.0.1:8000/loads/${loadId}/accept`, null, {
        params: { loader_id: loaderId },
      });
      setLoads((prev) => prev.filter((l) => l.id !== loadId));
    } catch {
      setError("Failed to accept load.");
    } finally {
      setAccepting("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow px-8 py-4 mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Live Load Board</h1>
      </header>
      <main className="max-w-4xl mx-auto">
        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : error ? (
          <div className="text-red-500 mb-4">{error}</div>
        ) : loads.length === 0 ? (
          <div className="text-gray-500">No available loads.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loads.map((load) => (
              <div key={load.id} className="bg-white rounded-lg shadow p-6 flex flex-col justify-between">
                <div>
                  <div className="text-lg font-semibold text-gray-700 mb-2">Origin: <span className="font-normal">{load.origin}</span></div>
                  <div className="text-lg font-semibold text-gray-700 mb-2">Destination: <span className="font-normal">{load.destination}</span></div>
                  <div className="text-lg text-gray-600 mb-2">Weight: {load.weight} kg</div>
                  <div className="text-lg text-gray-600 mb-4">Payout: ₹{load.payout || "N/A"}</div>
                </div>
                <button
                  className="mt-4 py-2 px-4 bg-green-500 text-white font-semibold rounded hover:bg-green-600 transition"
                  onClick={() => handleAccept(load.id)}
                  disabled={accepting === load.id}
                >
                  {accepting === load.id ? "Accepting..." : "Accept Load"}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
