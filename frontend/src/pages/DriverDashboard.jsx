import React, { useEffect, useState } from "react";
import DashboardLayout from "/src/components/DashboardLayout.jsx";
import StatusBadge from "/src/components/StatusBadge.jsx";
import api from "../api.js";

export default function DriverDashboard() {
  const [available, setAvailable] = useState([]);
  const [activeLoads, setActiveLoads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeLoading, setActiveLoading] = useState(true);
  const [error, setError] = useState("");
  const [accepting, setAccepting] = useState("");

  const fetchAvailable = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/loads/available");
      setAvailable(res.data || []);
    } catch (e) {
      setError(e?.response?.data?.detail || e.message || "Failed to load live board.");
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveLoads = async () => {
    setActiveLoading(true);
    try {
      const res = await api.get("/loads/my-active");
      setActiveLoads(res.data || []);
    } catch (e) {
      setError(e?.response?.data?.detail || "Failed to load active loads.");
    } finally {
      setActiveLoading(false);
    }
  };

  useEffect(() => {
    // Fetch both in parallel
    fetchAvailable();
    fetchActiveLoads();
  }, []);

  const handleAccept = async (id) => {
    setAccepting(id);
    setError("");
    try {
      await api.put(`/loads/${id}/accept`);
      const accepted = available.find((l) => l.id === id);
      // Optimistically update UI
      if (accepted) {
        setActiveLoads((prev) => [{ ...accepted, status: "active" }, ...prev]);
        setAvailable((prev) => prev.filter((l) => l.id !== id));
      } else {
        // If the load wasn't in the available list, something is out of sync. Refetch.
        fetchAvailable();
        fetchActiveLoads();
      }
    } catch (e) {
      setError(e?.response?.data?.detail || "Failed to accept load.");
    } finally {
      setAccepting("");
    }
  };

  return (
    <DashboardLayout pageTitle="Driver Dashboard">
      <div className="space-y-6">
        {/* My Active Loads */}
        <section className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            My Active Loads
          </h2>
          {activeLoading ? (
            <div className="text-sm text-gray-500">Loading active loads...</div>
          ) : activeLoads.length === 0 ? (
            <div className="text-sm text-gray-500">No active loads yet. Accept a job from the Live Load Board below.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeLoads.map((load) => (
                <div key={load.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-gray-800">
                      {load.origin} → {load.destination}
                    </p>
                    <StatusBadge status={load.status} />
                  </div>
                  {/* Future actions can go here */}
                </div>
                  ))}
            </div>
          )}
        </section>

        {/* Live Load Board */}
        <section className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-800">
              Live Load Board
            </h2>
            <button
              onClick={fetchAvailable}
              disabled={loading}
              className="text-sm px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50"
            >
              {loading && available.length === 0 ? 'Loading...' : 'Refresh'}
            </button>
          </div>
          {loading && available.length === 0 ? (
            <div className="text-sm text-gray-500">Loading...</div>
          ) : error ? (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>
          ) : available.length === 0 ? (
            <div className="text-sm text-gray-500">
              No available loads right now.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {available.map((load) => (
                <div key={load.id} className="border rounded-lg p-4 shadow-sm flex flex-col">
                  <div className="flex-grow">
                    <div className="font-semibold text-gray-800 mb-1">{load.origin} → {load.destination}</div>
                    <div className="text-xs text-gray-500 mb-2">Weight: {load.weight ?? "-"} lbs</div>
                  </div>
                  <button
                    className="mt-2 w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded disabled:opacity-60 transition-colors"
                    onClick={() => handleAccept(load.id)}
                    disabled={accepting === load.id || loading}
                  >
                    {accepting === load.id
                      ? "Accepting..."
                      : "Accept Load"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
