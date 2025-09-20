import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ShipperDashboard({ userId, onLogout }) {
  const [loads, setLoads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLoads = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await axios.get(`http://127.0.0.1:8000/loads/shipper/${userId}`);
        setLoads(response.data);
      } catch  {
        setError("Failed to fetch loads.");
      } finally {
        setLoading(false);
      }
    };
    fetchLoads();
  }, [userId]);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="flex items-center justify-between bg-white shadow px-8 py-4">
        <h1 className="text-2xl font-bold text-gray-800">Shipper Dashboard</h1>
        <button
          onClick={onLogout}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          Logout
        </button>
      </header>
      <main className="max-w-4xl mx-auto mt-8">
        <div className="flex justify-end mb-4">
          <button className="px-6 py-2 bg-green-500 text-white font-semibold rounded hover:bg-green-600 transition">
            Post a New Load
          </button>
        </div>
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">My Active Loads</h2>
          {loading ? (
            <div className="text-gray-500">Loading...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-4 py-2 text-left">Load ID</th>
                  <th className="px-4 py-2 text-left">Origin</th>
                  <th className="px-4 py-2 text-left">Destination</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {loads.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-4 text-gray-500">No active loads found.</td>
                  </tr>
                ) : (
                  loads.map((load) => (
                    <tr key={load.id} className="border-b">
                      <td className="px-4 py-2">{load.id || "-"}</td>
                      <td className="px-4 py-2">{load.origin}</td>
                      <td className="px-4 py-2">{load.destination}</td>
                      <td className="px-4 py-2">{load.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
