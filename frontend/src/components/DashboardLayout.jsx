import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api.js";

export default function DashboardLayout({ pageTitle, children, onUserLoaded }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await api.get("/users/me");
        setUser(data);
        // If a callback is provided, call it with the loaded user data.
        if (onUserLoaded) {
          onUserLoaded(data);
        }
      } catch (err) {
        setError(err?.response?.data?.detail || "Could not fetch user info.");
        if (err?.response?.status === 401) {
          // Token is likely invalid or expired, redirect to login
          handleLogout();
        }
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/");
  };

  const getDisplayName = () => {
    if (error) return <span className="text-red-500 text-sm">Error</span>;
    if (!user) return <span className="text-sm">Loading...</span>;
    return user.user_name || user.email;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side: Logo and Page Title */}
            <div className="flex items-center space-x-4">
              <div className="text-xl font-bold text-blue-800">TruckMitra</div>
              <span className="text-gray-400">/</span>
              <h1 className="text-lg font-semibold text-gray-700">
                {pageTitle}
              </h1>
            </div>

            {/* Right side: User info and Logout */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="font-medium text-gray-800">
                  {getDisplayName()}
                </div>
                {user && <div className="text-xs text-gray-500 capitalize">{user.role}</div>}
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                title="Logout"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}