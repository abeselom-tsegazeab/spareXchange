import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import IndividualDashboard from "./IndividualDashboard";
import TechnicianDashboard from "./TechnicianDashboard";
import RecyclerDashboard from "./RecyclerDashboard";
import GarageDashboard from "./GarageDashboard";

const DashboardPage = () => {
	const { user, isAuthenticated } = useAuthStore();
	const navigate = useNavigate();

	// Redirect if not authenticated
	useEffect(() => {
		if (!isAuthenticated) {
			navigate("/");
		}
	}, [isAuthenticated, navigate]);

	if (!isAuthenticated || !user) {
		return null;
	}

	// Route to role-specific dashboard based on userType
	const renderDashboard = () => {
		switch (user.userType) {
			case "technician":
			case "repair-shop":
				return <TechnicianDashboard />;
			case "recycler":
				return <RecyclerDashboard />;
			case "garage":
				return <GarageDashboard />;
			case "individual":
			default:
				return <IndividualDashboard />;
		}
	};

	return renderDashboard();
};

export default DashboardPage;
