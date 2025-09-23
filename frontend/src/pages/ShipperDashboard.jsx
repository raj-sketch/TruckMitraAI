import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import StatCard from "../components/StatCard.jsx";
import api from "../api.js";

export default function ShipperDashboard() {
  const [stats, setStats] = useState({});
  const [loads, setLoads] = useState([]);
  const [analyticsData, setAnalyticsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State for the new "Create Load" form
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [materialType, setMaterialType] = useState("");
  const [weight, setWeight] = useState("");
  const [orderDescription, setOrderDescription] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  useEffect(() => {
    // Fetches all loads for the current shipper and calculates stats.
    const fetchShipperData = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/loads/shipper/me");
        const shipperLoads = res.data || [];
        setLoads(shipperLoads);

        // Calculate stats from the fetched data
        const total = shipperLoads.length;
        const inTransit = shipperLoads.filter(l => l.status === 'transit').length;
        const delivered = shipperLoads.filter(l => l.status === 'delivered').length;
        const standBy = shipperLoads.filter(l => l.status === 'stand by').length;

        setStats({ total, inTransit, delivered, standBy });

        // Placeholder for analytics data
        // const analyticsRes = await api.get('/dashboard/analytics');
        // setAnalyticsData(analyticsRes.data);
        setAnalyticsData([40, 22, 65, 80, 55, 48, 70]);
      } catch (e) {
        setError(e?.response?.data?.detail || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchShipperData();
  }, []);

  // Handles the submission of the "Create Load" form.
  const handleCreateLoad = async (e) => {
    e.preventDefault();

    setFormLoading(true);
    setFormError("");
    setFormSuccess("");

    try {
      const payload = {
        origin,
        destination,
        material_type: materialType,
        weight: parseInt(weight, 10),
        order_description: orderDescription,
      };

      const res = await api.post("/loads/", payload);
      setFormSuccess(`Load created successfully!`);

      // Optimistic UI Update: Add the new load to the top of the list
      // This makes the UI feel faster as we don't need to re-fetch all data.
      const newLoad = { ...payload, id: res.data.load_id, status: 'stand by', posted_date: new Date().toISOString() };
      setLoads(prevLoads => [newLoad, ...prevLoads]);

      // Reset form fields
      setOrigin("");
      setDestination("");
      setMaterialType("");
      setWeight("");
      setOrderDescription("");

      // Hide success message after a few seconds
      setTimeout(() => setFormSuccess(""), 3000);
    } catch (err) {
      setFormError(err?.response?.data?.detail || "Failed to create load.");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <DashboardLayout pageTitle="Dashboard Overview">
      <div className="space-y-6">
        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Orders" value={loading ? '...' : stats.total} change="0" />
          <StatCard title="In Transit" value={loading ? '...' : stats.inTransit} change="0" />
          <StatCard title="Delivered" value={loading ? '...' : stats.delivered} change="0" />
          <StatCard title="Stand By" value={loading ? '...' : stats.standBy} change="0" />
        </section>

        {/* Error Display */}
        {error && !formError && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Analytics + Recent */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-gray-800">Delivery Analytics</h2>
              <select className="text-sm border rounded px-2 py-1">
                <option>This Week</option>
                <option>Last Week</option>
              </select>
            </div>
            {/* Simple bar chart */}
            <div className="grid grid-cols-7 gap-3 h-56 items-end">
              {analyticsData.map((h, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="w-full bg-orange-400 rounded-t" style={{ height: `${h}%` }} />
                  <div className="text-xs text-gray-500">{["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i]}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="font-semibold text-gray-800 mb-3">Create a New Load</h2>
            <form onSubmit={handleCreateLoad} className="space-y-4">
              <div>
                <label htmlFor="origin" className="text-xs text-gray-500">Origin</label>
                <input id="origin" type="text" value={origin} onChange={(e) => setOrigin(e.target.value)} className="w-full border rounded px-3 py-2 mt-1" placeholder="e.g., Mumbai, India" required />
              </div>
              <div>
                <label htmlFor="destination" className="text-xs text-gray-500">Destination</label>
                <input id="destination" type="text" value={destination} onChange={(e) => setDestination(e.target.value)} className="w-full border rounded px-3 py-2 mt-1" placeholder="e.g., Delhi, India" required />
              </div>
              <div>
                <label htmlFor="materialType" className="text-xs text-gray-500">Material Type</label>
                <input id="materialType" type="text" value={materialType} onChange={(e) => setMaterialType(e.target.value)} className="w-full border rounded px-3 py-2 mt-1" placeholder="e.g., Steel Coils, Grain" required />
              </div>
              <div>
                <label htmlFor="weight" className="text-xs text-gray-500">Weight (kg)</label>
                <input id="weight" type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full border rounded px-3 py-2 mt-1" placeholder="e.g., 10000" required />
              </div>
              <div>
                <label htmlFor="orderDescription" className="text-xs text-gray-500">Order Description</label>
                <textarea id="orderDescription" value={orderDescription} onChange={(e) => setOrderDescription(e.target.value)} className="w-full border rounded px-3 py-2 mt-1" placeholder="Optional: e.g., Fragile items, handle with care." rows="2"></textarea>
              </div>

              {formError && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{formError}</div>}
              {formSuccess && <div className="text-sm text-green-600 bg-green-50 p-2 rounded">{formSuccess}</div>}

               <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded py-2 transition disabled:opacity-50"
                disabled={formLoading}
              >
                {formLoading ? "Creating..." : "Create Load"}
              </button>
            </form>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-800">Recent Orders</h2>
            <button className="text-sm text-blue-600 hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="text-left px-4 py-2">Origin</th>
                  <th className="text-left px-4 py-2">Destination</th>
                  <th className="text-left px-4 py-2">Status</th>
                  <th className="text-left px-4 py-2">Date</th>
                  <th className="text-left px-4 py-2">Driver</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading && <tr><td colSpan="5" className="text-center py-4 text-gray-500">Loading orders...</td></tr>}
                {!loading && loads.length === 0 && <tr><td colSpan="5" className="text-center py-4 text-gray-500">No orders found. Create a new load to get started.</td></tr>}
                {loads.map((load) => (
                  <tr key={load.id}>
                    <td className="px-4 py-2 font-medium text-gray-800">{load.origin}</td>
                    <td className="px-4 py-2 text-gray-600">{load.destination}</td>
                    <td className="px-4 py-2"><StatusBadge status={load.status} /></td>
                    <td className="px-4 py-2 text-gray-600">{new Date(load.posted_date).toLocaleDateString()}</td>
                    {/* Display loader's email or 'None' if not assigned */}
                    <td className="px-4 py-2 text-gray-600">{load.loader_id || 'None'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

