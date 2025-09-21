import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
// TODO: Import api from "../api.js" when ready to fetch data

export default function ShipperDashboard() {
  const [stats, setStats] = useState([
    { label: "Total Orders", value: "...", change: "", icon: "📦" },
    { label: "Active Loads", value: "...", change: "", icon: "🚚" },
    { label: "Delivered Today", value: "...", change: "", icon: "✅" },
    { label: "Revenue", value: "...", change: "", icon: "💰" },
  ]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [analyticsData, setAnalyticsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        // TODO: Replace with actual API calls
        // const statsRes = await api.get('/dashboard/stats');
        // setStats(statsRes.data);
        // const ordersRes = await api.get('/dashboard/recent-orders');
        // setRecentOrders(ordersRes.data);
        // const analyticsRes = await api.get('/dashboard/analytics');
        // setAnalyticsData(analyticsRes.data);

        // Placeholder data for now
        setStats([
          { label: "Total Orders", value: "1,234", change: "+12%", icon: "📦" },
          { label: "Active Loads", value: "45", change: "+3%", icon: "🚚" },
          { label: "Delivered Today", value: "89", change: "+8%", icon: "✅" },
          { label: "Revenue", value: "$12,450", change: "+15%", icon: "💰" },
        ]);
        setRecentOrders([
          { id: "PKG001", customer: "Sanjay kumar", destination: "Delhi", status: "DELIVERED", date: "2025-01-15", driver: "Ajay kumar" },
          { id: "PKG002", customer: "Ravi Yadav", destination: "Kanpur", status: "IN_TRANSIT", date: "2025-01-14", driver: "Zakhir Khan" },
        ]);
        setAnalyticsData([40, 22, 65, 80, 55, 48, 70]);
      } catch (e) {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <DashboardLayout pageTitle="Dashboard Overview">
      <div className="space-y-6">
        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
              <div className="text-3xl">{s.icon}</div>
              <div>
                <div className="text-xs text-gray-500">{s.label}</div>
                <div className="text-xl font-semibold text-gray-800">{s.value}</div>
                {s.change && <div className="text-xs text-green-600">{s.change}</div>}
              </div>
            </div>
          ))}
        </section>

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
            <h2 className="font-semibold text-gray-800 mb-3">Quick Assignment</h2>
            <form className="space-y-3">
              <div>
                <label className="text-xs text-gray-500">Order ID</label>
                <input className="w-full border rounded px-3 py-2" placeholder="Enter order ID" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Select Driver</label>
                <select className="w-full border rounded px-3 py-2">
                  <option>Choose a driver</option>
                  <option>Mike Johnson</option>
                  <option>David Brown</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500">Select Truck</label>
                <select className="w-full border rounded px-3 py-2">
                  <option>Choose a truck</option>
                  <option>MH12 AB 1234</option>
                  <option>DL8C 4567</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500">Priority Level</label>
                <select className="w-full border rounded px-3 py-2">
                  <option>Normal Priority</option>
                  <option>High Priority</option>
                </select>
              </div>
              <button type="button" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded py-2 transition">Assign Driver</button>
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
                  <th className="text-left px-4 py-2">Order ID</th>
                  <th className="text-left px-4 py-2">Customer</th>
                  <th className="text-left px-4 py-2">Destination</th>
                  <th className="text-left px-4 py-2">Status</th>
                  <th className="text-left px-4 py-2">Date</th>
                  <th className="text-left px-4 py-2">Driver</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="px-4 py-2">{r.id}</td>
                    <td className="px-4 py-2"><p>{r.customer}</p></td>
                    <td className="px-4 py-2"><p>{r.destination}</p></td>
                    <td className="px-4 py-2"><StatusBadge status={r.status} /></td>
                    <td className="px-4 py-2"><p>{r.date}</p></td>
                    <td className="px-4 py-2"><p>{r.driver}</p></td>
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
