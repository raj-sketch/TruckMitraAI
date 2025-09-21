import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage.jsx";
import ShipperDashboard from "./pages/ShipperDashboard.jsx";
import DriverDashboard from "./pages/DriverDashboard.jsx";

export default function App() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<LoginPage />} />
				<Route path="/shipper-dashboard" element={<ShipperDashboard />} />
				<Route path="/driver-dashboard" element={<DriverDashboard />} />
			</Routes>
		</Router>
	);
}
