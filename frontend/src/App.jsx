import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage.jsx";
import ShipperDashboard from "./pages/ShipperDashboard.jsx";
import LoaderDashboard from "./pages/LoaderDashboard.jsx";

export default function App() {
	// For demo, use hardcoded userId and loaderId. Replace with real auth logic.

	return (
		<Router>
			<Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/shipper" element={<ShipperDashboard userIdccccc="demo-shipper" onLogout={() => {}} />} />
            <Route path="/loader" element={<LoaderDashboard loaderId="demo-loader" />} />
			</Routes>
		</Router>
	);
}
