import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api.js";

export default function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // 'login' | 'signup'

  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Signup state
  const [role, setRole] = useState("shipper"); // 'loader' | 'shipper'
  const [signupEmail, setSignupEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState("");
  const [signupSuccess, setSignupSuccess] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginError("");
    try {
      const form = new URLSearchParams();
      form.append("username", email); // username = email id
      form.append("password", password);
      const { data } = await api.post("/auth/token", form, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      const token = data?.access_token;
      const userRole = data?.role;
      if (!token) throw new Error("No token returned");
      localStorage.setItem("access_token", token);

      if (userRole === "shipper") {
        navigate("/shipper-dashboard");
      } else if (userRole === "loader") {
        navigate("/driver-dashboard");
      } else {
        setLoginError(`Unknown user role: ${userRole}`);
      }
    } catch (err) {
      setLoginError(err?.response?.data?.detail || err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setSignupLoading(true);
    setSignupError("");
    setSignupSuccess("");
    try {
      await api.post("/auth/register", {
        email: signupEmail,
        password: signupPassword,
        role,
        user_name: userName,
      });
      setSignupSuccess("Account created. Please log in.");
      setMode("login");
      setEmail(signupEmail);
    } catch (err) {
      const detail = err?.response?.data?.detail;
      if (Array.isArray(detail) && detail[0]?.msg) {
        // Handle FastAPI validation errors (422)
        setSignupError(detail[0].msg);
      } else if (typeof detail === "string") {
        // Handle other FastAPI HTTPExceptions (e.g., 400)
        setSignupError(detail);
      } else {
        setSignupError(err?.message || "Signup failed");
      }
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-r from-blue-900 via-blue-700 to-orange-400 p-4">
      <div className="w-full max-w-md bg-white/95 backdrop-blur rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8">
          <div className="text-center text-3xl font-bold text-blue-800">TruckMitra</div>
          {/* Tabs */}
          <div className="mt-6 flex items-center justify-center gap-8 text-gray-500">
            <button
              aria-pressed={mode === "login"}
              className={`pb-2 ${mode === "login" ? "text-gray-900 border-b-2 border-orange-400" : "hover:text-gray-800"}`}
              onClick={() => setMode("login")}
            >
              Login
            </button>
            <button
              aria-pressed={mode === "signup"}
              className={`pb-2 ${mode === "signup" ? "text-gray-900 border-b-2 border-orange-400" : "hover:text-gray-800"}`}
              onClick={() => setMode("signup")}
            >
              Signup
            </button>
          </div>
        </div>

        <div className="px-8 pb-8">
          {mode === "login" ? (
            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs text-gray-500 mb-1">Company Email ID</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">✉️</span>
                  <input id="email" type="email" autoComplete="username" className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="block text-xs text-gray-500 mb-1">Password</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
                  <input id="password" type="password" autoComplete="current-password" className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
              </div>
              {loginError && <div className="text-red-600 text-sm text-center">{loginError}</div>}
              <button type="submit" className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-md transition" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>
              <div className="flex items-center justify-between text-xs text-blue-600">
                <a href="/forgot-password" className="hover:underline">Forgot Password?</a>
                <button type="button" className="hover:underline" onClick={() => setMode("signup")}>Create Account</button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="mt-6 space-y-4">
              {/* Role toggle */}
              <div className="bg-gray-100 rounded-full p-1 flex">
                <button
                  type="button"
                  aria-pressed={role === "loader"}
                  onClick={() => setRole("loader")}
                  className={`flex-1 py-2 text-sm rounded-full transition ${role === "loader" ? "bg-orange-500 text-white shadow" : "text-gray-500 hover:text-gray-700"}`}
                >
                  Loader
                </button>
                <button
                  type="button"
                  aria-pressed={role === "shipper"}
                  onClick={() => setRole("shipper")}
                  className={`flex-1 py-2 text-sm rounded-full transition ${role === "shipper" ? "bg-blue-700 text-white shadow" : "text-gray-500 hover:text-gray-700"}`}
                >
                  Shipper
                </button>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">User Name / Company Name</label>
                <input className="w-full px-3 py-2 rounded-md border border-gray-200" value={userName} onChange={(e) => setUserName(e.target.value)} required/>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Company Email ID</label>
                <input type="email" className="w-full px-3 py-2 rounded-md border border-gray-200" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} required />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Password</label>
                <input type="password" className="w-full px-3 py-2 rounded-md border border-gray-200" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required />
              </div>

              {signupError && <div className="text-red-600 text-sm text-center">{signupError}</div>}
              {signupSuccess && <div className="text-green-600 text-sm text-center">{signupSuccess}</div>}

              <button type="submit" className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-md transition" disabled={signupLoading}>
                {signupLoading ? "Submitting..." : "Next"}
              </button>
            </form>
          )}

          {/* Footer links */}
          <div className="mt-8 text-center text-xs text-gray-500">
            <a href="#" className="mx-2 hover:underline">Terms & Conditions</a>
            <a href="#" className="mx-2 hover:underline">Privacy Policy</a>
          </div>
        </div>
      </div>
    </div>
  );
}
