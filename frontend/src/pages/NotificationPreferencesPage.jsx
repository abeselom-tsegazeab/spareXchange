import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useNotificationStore } from "../store/notificationStore";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";
import {
	ArrowLeft,
	Bell,
	Mail,
	MessageSquare,
	ListTodo,
	RefreshCcw,
	Save,
	Settings,
	Megaphone,
    BellIcon
} from "lucide-react";

const NotificationPreferencesPage = () => {
	const navigate = useNavigate();
	const { preferences, loading, getPreferences, updatePreferences, resetPreferences } = useNotificationStore();
	
	const [formData, setFormData] = useState({
		emailNotifications: true,
		pushNotifications: true,
		smsNotifications: false,
		listingAlerts: true,
		exchangeUpdates: true,
		messageNotifications: true,
		systemAnnouncements: true,
		marketingEmails: false
	});

	const [saving, setSaving] = useState(false);

	useEffect(() => {
		loadPreferences();
	}, []);

	const loadPreferences = async () => {
		try {
			const prefs = await getPreferences();
			if (prefs) {
				setFormData(prefs);
			}
		} catch (error) {
			toast.error("Failed to load preferences");
		}
	};

	const handleToggle = (field) => {
		setFormData(prev => ({
			...prev,
			[field]: !prev[field]
		}));
	};

	const handleSave = async () => {
		setSaving(true);
		try {
			await updatePreferences(formData);
			toast.success("Preferences saved successfully");
		} catch (error) {
			toast.error("Failed to save preferences");
		} finally {
			setSaving(false);
		}
	};

	const handleReset = async () => {
		if (window.confirm("Are you sure you want to reset all preferences to defaults?")) {
			try {
				await resetPreferences();
				toast.success("Preferences reset to defaults");
			} catch (error) {
				toast.error("Failed to reset preferences");
			}
		}
	};

	const preferenceGroups = [
		{
			title: "Notification Channels",
			icon: <Bell className="w-5 h-5" />,
			items: [
				{ key: "emailNotifications", label: "Email Notifications", description: "Receive notifications via email", icon: <Mail className="w-5 h-5" /> },
				{ key: "pushNotifications", label: "Push Notifications", description: "Receive push notifications on your devices", icon: <Bell className="w-5 h-5" /> },
				{ key: "smsNotifications", label: "SMS Notifications", description: "Receive text message notifications", icon: <MessageSquare className="w-5 h-5" /> }
			]
		},
		{
			title: "Activity Alerts",
			icon: <ListTodo className="w-5 h-5" />,
			items: [
				{ key: "listingAlerts", label: "Listing Alerts", description: "Get notified about new listings and updates", icon: <ListTodo className="w-5 h-5" /> },
				{ key: "exchangeUpdates", label: "Exchange Updates", description: "Receive updates on your exchanges", icon: <RefreshCcw className="w-5 h-5" /> },
				{ key: "messageNotifications", label: "Message Notifications", description: "Get notified when you receive messages", icon: <MessageSquare className="w-5 h-5" /> }
			]
		},
		{
			title: "System & Marketing",
			icon: <Settings className="w-5 h-5" />,
			items: [
				{ key: "systemAnnouncements", label: "System Announcements", description: "Important platform updates and announcements", icon: <BellIcon className="w-5 h-5" /> },
				{ key: "marketingEmails", label: "Marketing Emails", description: "Promotional content and special offers", icon: <Megaphone className="w-5 h-5" /> }
			]
		}
	];

	if (loading && !preferences) {
		return <LoadingSpinner />;
	}

	return (
		<div className="min-h-screen bg-white dark:bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 py-8 px-4">
		<div className="max-w-4xl mx-auto">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
			>
				{/* Header */}
				<div className="mb-8">
					<div className="flex items-center gap-4 mb-4">
						<button
							onClick={() => navigate(-1)}
							className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
						>
							<ArrowLeft className="w-6 h-6" />
						</button>
						<div>
							<h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notification Preferences</h1>
							<p className="text-gray-600 dark:text-gray-400 mt-1">
								Customize how and when you receive notifications
							</p>
						</div>
					</div>
				</div>

				{/* Preference Groups */}
				<div className="space-y-6 mb-8">
					{preferenceGroups.map((group, groupIndex) => (
						<motion.div
							key={group.title}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: groupIndex * 0.1 }}
							className="bg-primary dark:bg-gray-800 rounded-lg shadow-lg p-6"
						>
							<div className="flex items-center gap-3 mb-4">
								<div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
									{group.icon}
								</div>
								<h2 className="text-xl font-semibold text-gray-900 dark:text-white">{group.title}</h2>
							</div>

							<div className="space-y-4">
								{group.items.map((item) => (
									<div
										key={item.key}
										className="flex items-center justify-between p-4 bg-primary/50 dark:bg-gray-700/50 rounded-lg hover:bg-primary/70 dark:hover:bg-gray-700 transition-colors"
									>
										<div className="flex items-center gap-3 flex-1">
											<div className="text-gray-600 dark:text-gray-400">
												{item.icon}
											</div>
											<div>
												<h3 className="font-medium text-gray-900 dark:text-white">{item.label}</h3>
												<p className="text-sm text-gray-500 dark:text-gray-400">
													{item.description}
												</p>
											</div>
										</div>
										
										{/* Toggle Switch */}
										<button
											onClick={() => handleToggle(item.key)}
											className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
												formData[item.key]
													? "bg-green-500"
													: "bg-gray-300 dark:bg-gray-600"
											}`}
										>
											<span
												className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
													formData[item.key] ? "translate-x-6" : "translate-x-1"
												}`}
											/>
										</button>
									</div>
								))}
							</div>
						</motion.div>
					))}
				</div>

				{/* Action Buttons */}
				<div className="flex gap-4 justify-end">
					<button
						onClick={handleReset}
						className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors font-medium flex items-center gap-2"
					>
						<RefreshCcw className="w-4 h-4" />
						Reset to Defaults
					</button>
					<button
						onClick={handleSave}
						disabled={saving}
						className="px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
					>
						<Save className="w-4 h-4" />
						{saving ? "Saving..." : "Save Changes"}
					</button>
				</div>
			</motion.div>
		</div>
		</div>
	);
};

export default NotificationPreferencesPage;
