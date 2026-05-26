import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNotificationStore } from "../store/notificationStore";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";
import {
	Smartphone,
	Tablet,
	Monitor,
	Trash2,
	ToggleLeft,
	ToggleRight,
	Plus,
	CheckCircle
} from "lucide-react";

const PushNotificationSettings = () => {
	const { 
		devices, loading, 
		getRegisteredDevices, registerDeviceToken, 
		toggleDeviceToken, removeDeviceToken
	} = useNotificationStore();
	
	const [showAddDevice, setShowAddDevice] = useState(false);
	const [newDevice, setNewDevice] = useState({
		token: "",
		deviceType: "web",
		deviceName: ""
	});
	const [registering, setRegistering] = useState(false);

	useEffect(() => {
		loadDevices();
	}, []);

	const loadDevices = async () => {
		try {
			await getRegisteredDevices();
		} catch (error) {
			toast.error("Failed to load devices");
		}
	};

	const handleRegisterDevice = async () => {
		if (!newDevice.token || !newDevice.deviceType) {
			toast.error("Token and device type are required");
			return;
		}

		setRegistering(true);
		try {
			await registerDeviceToken(
				newDevice.token,
				newDevice.deviceType,
				newDevice.deviceName || "Unknown Device"
			);
			toast.success("Device registered successfully");
			setShowAddDevice(false);
			setNewDevice({ token: "", deviceType: "web", deviceName: "" });
		} catch (error) {
			toast.error("Failed to register device");
		} finally {
			setRegistering(false);
		}
	};

	const handleToggleDevice = async (token) => {
		try {
			await toggleDeviceToken(token);
			toast.success("Device status updated");
		} catch (error) {
			toast.error("Failed to update device");
		}
	};

	const handleRemoveDevice = async (token) => {
		if (window.confirm("Are you sure you want to remove this device?")) {
			try {
				await removeDeviceToken(token);
				toast.success("Device removed");
			} catch (error) {
				toast.error("Failed to remove device");
			}
		}
	};

	const getDeviceIcon = (deviceType) => {
		switch (deviceType) {
			case "android":
				return <Smartphone className="w-6 h-6" />;
			case "ios":
				return <Tablet className="w-6 h-6" />;
			case "web":
				return <Monitor className="w-6 h-6" />;
			default:
				return <Smartphone className="w-6 h-6" />;
		}
	};

	const formatLastUsed = (date) => {
		if (!date) return "Never used";
		const now = new Date();
		const usedDate = new Date(date);
		const diffInHours = (now - usedDate) / (1000 * 60 * 60);

		if (diffInHours < 1) {
			const diffInMinutes = Math.floor((now - usedDate) / (1000 * 60));
			return `${diffInMinutes} minutes ago`;
		} else if (diffInHours < 24) {
			return `${Math.floor(diffInHours)} hours ago`;
		} else {
			return usedDate.toLocaleDateString();
		}
	};

	if (loading && devices.length === 0) {
		return (
			<div className="flex justify-center items-center min-h-[200px]">
				<LoadingSpinner />
			</div>
		);
	}

	return (
		<div className="bg-primary dark:bg-gray-800 rounded-lg shadow-lg p-6">
			<div className="flex items-center justify-between mb-6">
				<div>
					<h2 className="text-xl font-semibold">Push Notification Devices</h2>
					<p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
						Manage devices that receive push notifications
					</p>
				</div>
				
				<button
					onClick={() => setShowAddDevice(true)}
					className="flex items-center gap-2 px-4 py-2 bg-white  hover:bg-gray-600 text-primary rounded-lg transition-colors"
				>
					<Plus className="w-4 h-4" />
					<span>Add Device</span>
				</button>
			</div>

			{devices.length === 0 ? (
				<div className="text-center py-8">
					<Smartphone className="w-12 h-12 text-gray-400 mx-auto mb-3" />
					<p className="text-gray-600 dark:text-gray-400">
						No devices registered yet
					</p>
					<p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
						Add a device to receive push notifications
					</p>
				</div>
			) : (
				<div className="space-y-4">
					{devices.map((device, index) => (
						<motion.div
							key={device.token}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.05 }}
							className={`p-4 rounded-lg border-2 transition-colors ${
								device.isActive
									? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10"
									: "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50"
							}`}
						>
							<div className="flex items-start justify-between">
								<div className="flex items-start gap-4 flex-1">
									<div className={`p-3 rounded-lg ${
										device.isActive
											? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
											: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
									}`}>
										{getDeviceIcon(device.deviceType)}
									</div>
									
									<div className="flex-1">
										<div className="flex items-center gap-2 mb-1">
											<h3 className="font-semibold">{device.deviceName}</h3>
											{device.isActive && (
												<CheckCircle className="w-4 h-4 text-green-500" />
											)}
										</div>
										<div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
											<p>
												<span className="font-medium capitalize">{device.deviceType}</span> device
											</p>
											<p className="text-xs">
												Last used: {formatLastUsed(device.lastUsed)}
											</p>
											<p className="text-xs font-mono text-gray-500 dark:text-gray-500 break-all">
												Token: {device.token.substring(0, 20)}...
											</p>
										</div>
									</div>
								</div>

								<div className="flex items-center gap-2 ml-4">
									{/* Toggle Active/Inactive */}
									<button
										onClick={() => handleToggleDevice(device.token)}
										className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
										title={device.isActive ? "Deactivate" : "Activate"}
									>
										{device.isActive ? (
											<ToggleRight className="w-6 h-6 text-green-500" />
										) : (
											<ToggleLeft className="w-6 h-6 text-gray-400" />
										)}
									</button>

									{/* Remove Device */}
									<button
										onClick={() => handleRemoveDevice(device.token)}
										className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
										title="Remove Device"
									>
										<Trash2 className="w-5 h-5 text-red-500" />
									</button>
								</div>
							</div>
						</motion.div>
					))}
				</div>
			)}

			{/* Add Device Modal */}
			{showAddDevice && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 mt-16">
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.9 }}
						className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
					>
						<h3 className="text-xl font-semibold mb-4">Register New Device</h3>

						<div className="space-y-4">
							{/* Device Token */}
							<div>
								<label className="block text-sm font-medium mb-2">
									Device Token (FCM Token) *
								</label>
								<textarea
									value={newDevice.token}
									onChange={(e) => setNewDevice({ ...newDevice, token: e.target.value })}
									className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
									rows="3"
									placeholder="Enter FCM device token"
								/>
							</div>

							{/* Device Type */}
							<div>
								<label className="block text-sm font-medium mb-2">
									Device Type *
								</label>
								<select
									value={newDevice.deviceType}
									onChange={(e) => setNewDevice({ ...newDevice, deviceType: e.target.value })}
									className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
								>
									<option value="web">Web Browser</option>
									<option value="android">Android</option>
									<option value="ios">iOS</option>
								</select>
							</div>

							{/* Device Name */}
							<div>
								<label className="block text-sm font-medium mb-2">
									Device Name (Optional)
								</label>
								<input
									type="text"
									value={newDevice.deviceName}
									onChange={(e) => setNewDevice({ ...newDevice, deviceName: e.target.value })}
									className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
									placeholder="e.g., My iPhone, Chrome Browser"
								/>
							</div>
						</div>

						<div className="flex gap-4 justify-end mt-6">
							<button
								onClick={() => setShowAddDevice(false)}
								className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
							>
								Cancel
							</button>
							<button
								onClick={handleRegisterDevice}
								disabled={registering}
								className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
							>
								{registering ? "Registering..." : "Register Device"}
							</button>
						</div>
					</motion.div>
				</div>
			)}
		</div>
	);
};

export default PushNotificationSettings;
