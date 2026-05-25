import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useNotificationStore } from "../store/notificationStore";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";
import {
	ArrowLeft,
	Plus,
	Edit2,
	Trash2,
	Key,
	ExternalLink,
	Activity,
	CheckCircle,
	XCircle,
	Copy
} from "lucide-react";

const WebhookManagementPage = () => {
	const navigate = useNavigate();
	const { 
		webhooks, webhookStats, loading, 
		getWebhooks, getWebhookStats,
		createWebhook, updateWebhook, deleteWebhook, regenerateWebhookSecret
	} = useNotificationStore();
	
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [editingWebhook, setEditingWebhook] = useState(null);
	const [newlyCreatedSecret, setNewlyCreatedSecret] = useState(null);

	const [formData, setFormData] = useState({
		name: "",
		url: "",
		events: [],
		headers: {}
	});

	const availableEvents = [
		"listing.created",
		"listing.updated",
		"listing.deleted",
		"exchange.proposed",
		"exchange.completed",
		"exchange.cancelled",
		"message.received",
		"review.created",
		"user.verified",
		"payment.received"
	];

	useEffect(() => {
		loadWebhooks();
		loadStats();
	}, []);

	const loadWebhooks = async () => {
		try {
			await getWebhooks();
		} catch (error) {
			toast.error("Failed to load webhooks");
		}
	};

	const loadStats = async () => {
		try {
			await getWebhookStats();
		} catch (error) {
			console.error("Failed to load stats");
		}
	};

	const handleEventToggle = (event) => {
		setFormData(prev => ({
			...prev,
			events: prev.events.includes(event)
				? prev.events.filter(e => e !== event)
				: [...prev.events, event]
		}));
	};

	const handleCreate = async () => {
		if (!formData.name || !formData.url || formData.events.length === 0) {
			toast.error("Please fill in all required fields");
			return;
		}

		try {
			const response = await createWebhook(formData);
			toast.success("Webhook created successfully");
			
			// Show the secret only once
			if (response.webhookSecret) {
				setNewlyCreatedSecret(response.webhookSecret);
				setTimeout(() => setNewlyCreatedSecret(null), 30000); // Auto-hide after 30s
			}
			
			setShowCreateModal(false);
			resetForm();
		} catch (error) {
			toast.error("Failed to create webhook");
		}
	};

	const handleUpdate = async () => {
		if (!formData.name || !formData.url || formData.events.length === 0) {
			toast.error("Please fill in all required fields");
			return;
		}

		try {
			await updateWebhook(editingWebhook._id, formData);
			toast.success("Webhook updated successfully");
			setEditingWebhook(null);
			resetForm();
		} catch (error) {
			toast.error("Failed to update webhook");
		}
	};

	const handleDelete = async (id) => {
		if (window.confirm("Are you sure you want to delete this webhook?")) {
			try {
				await deleteWebhook(id);
				toast.success("Webhook deleted successfully");
			} catch (error) {
				toast.error("Failed to delete webhook");
			}
		}
	};

	const handleRegenerateSecret = async (id) => {
		if (window.confirm("Are you sure you want to regenerate the webhook secret? The old secret will no longer work.")) {
			try {
				const response = await regenerateWebhookSecret(id);
				toast.success("Webhook secret regenerated");
				setNewlyCreatedSecret(response.webhookSecret);
				setTimeout(() => setNewlyCreatedSecret(null), 30000);
			} catch (error) {
				toast.error("Failed to regenerate secret");
			}
		}
	};

	const openEditModal = (webhook) => {
		setEditingWebhook(webhook);
		setFormData({
			name: webhook.name,
			url: webhook.url,
			events: webhook.events,
			headers: webhook.headers || {}
		});
	};

	const resetForm = () => {
		setFormData({
			name: "",
			url: "",
			events: [],
			headers: {}
		});
	};

	const copyToClipboard = (text) => {
		navigator.clipboard.writeText(text);
		toast.success("Copied to clipboard");
	};

	const formatLastTriggered = (date) => {
		if (!date) return "Never";
		const now = new Date();
		const triggeredDate = new Date(date);
		const diffInHours = (now - triggeredDate) / (1000 * 60 * 60);

		if (diffInHours < 1) {
			const diffInMinutes = Math.floor((now - triggeredDate) / (1000 * 60));
			return `${diffInMinutes} minutes ago`;
		} else if (diffInHours < 24) {
			return `${Math.floor(diffInHours)} hours ago`;
		} else {
			return triggeredDate.toLocaleDateString();
		}
	};

	if (loading && webhooks.length === 0) {
		return <LoadingSpinner />;
	}

	return (
		<div className="max-w-6xl mx-auto px-4 py-8">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
			>
				{/* Header */}
				<div className="mb-6">
					<div className="flex items-center justify-between mb-4">
						<div className="flex items-center gap-4">
							<button
								onClick={() => navigate(-1)}
								className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
							>
								<ArrowLeft className="w-6 h-6" />
							</button>
							<div>
								<h1 className="text-3xl font-bold">Webhook Management</h1>
								<p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
									Manage your webhook integrations
								</p>
							</div>
						</div>
						
						<button
							onClick={() => {
								resetForm();
								setShowCreateModal(true);
							}}
							className="flex items-center gap-2 px-4 py-2 ml-2 bg-primary dark:bg-gray-800 hover:bg-gray-600 text-white rounded-lg transition-colors"
						>
							<Plus className="w-4 h-4" />
							<span>Create Webhook</span>
						</button>
					</div>

					{/* Stats Cards */}
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
						<div className="bg-primary dark:bg-gray-800 rounded-lg shadow p-4">
							<p className="text-sm text-gray-600 dark:text-gray-400">Total Webhooks</p>
							<p className="text-2xl font-bold">{webhookStats?.totalWebhooks || webhooks.length}</p>
						</div>
						<div className="bg-primary dark:bg-gray-800 rounded-lg shadow p-4">
							<p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
							<p className="text-2xl font-bold text-white dark:text-green-400">{webhookStats?.activeWebhooks || webhooks.filter(w => w.isActive).length}</p>
						</div>
						<div className="bg-primary dark:bg-gray-800 rounded-lg shadow p-4">
							<p className="text-sm text-gray-600 dark:text-gray-400">Total Deliveries</p>
							<p className="text-2xl font-bold">{webhookStats?.totalDeliveries || webhooks.reduce((sum, w) => sum + (w.totalDeliveries || 0), 0)}</p>
						</div>
						<div className="bg-primary dark:bg-gray-800 rounded-lg shadow p-4">
							<p className="text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
							<p className="text-2xl font-bold text-white dark:text-green-400">{webhookStats?.successRate || '0%'}</p>
						</div>
					</div>
				</div>

				{/* Newly Created Secret Alert */}
				<AnimatePresence>
					{newlyCreatedSecret && (
						<motion.div
							initial={{ opacity: 0, y: -20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6"
						>
							<div className="flex items-start justify-between">
								<div>
									<h3 className="font-semibold text-yellow-800 dark:text-yellow-400 mb-1">
										⚠️ Important: Save Your Webhook Secret
									</h3>
									<p className="text-sm text-yellow-700 dark:text-yellow-500 mb-2">
										This secret will only be shown once. Store it securely.
									</p>
									<code className="bg-white dark:bg-gray-800 px-3 py-1 rounded text-sm font-mono">
										{newlyCreatedSecret}
									</code>
								</div>
								<button
									onClick={() => copyToClipboard(newlyCreatedSecret)}
									className="p-2 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 rounded transition-colors"
								>
									<Copy className="w-4 h-4" />
								</button>
							</div>
						</motion.div>
					)}
				</AnimatePresence>

				{/* Webhooks List */}
				<div className="space-y-4">
					{webhooks.length === 0 ? (
						<div className="bg-primary dark:bg-gray-800 rounded-lg shadow-lg p-16 text-center">
							<Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
							<h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
								No webhooks configured
							</h3>
							<p className="text-gray-600 dark:text-gray-400">
								Create your first webhook to start receiving event notifications
							</p>
						</div>
					) : (
						webhooks.map((webhook, index) => (
							<motion.div
								key={webhook._id}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.05 }}
								className="bg-primary dark:bg-gray-800 rounded-lg shadow-lg p-6"
							>
								<div className="flex items-start justify-between mb-4">
									<div className="flex-1">
										<div className="flex items-center gap-2 mb-2">
											<h3 className="text-lg font-semibold">{webhook.name}</h3>
											<span className={`px-2 py-1 text-xs rounded-full ${
												webhook.isActive
													? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
													: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400"
											}`}>
												{webhook.isActive ? "Active" : "Inactive"}
											</span>
										</div>
										<div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
											<ExternalLink className="w-4 h-4" />
											<code className="text-xs">{webhook.url}</code>
										</div>
									</div>
									
									<div className="flex items-center gap-2">
										<button
											onClick={() => handleRegenerateSecret(webhook._id)}
											className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
											title="Regenerate Secret"
										>
											<Key className="w-4 h-4 text-orange-500" />
										</button>
										<button
											onClick={() => openEditModal(webhook)}
											className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
											title="Edit"
										>
											<Edit2 className="w-4 h-4 text-blue-500" />
										</button>
										<button
											onClick={() => handleDelete(webhook._id)}
											className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
											title="Delete"
										>
											<Trash2 className="w-4 h-4 text-red-500" />
										</button>
									</div>
								</div>

								{/* Events */}
								<div className="mb-4">
									<p className="text-sm font-medium mb-2">Events:</p>
									<div className="flex flex-wrap gap-2">
										{webhook.events.map(event => (
											<span
												key={event}
												className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full text-xs"
											>
												{event}
											</span>
										))}
									</div>
								</div>

								{/* Stats */}
								<div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
									<div className="flex items-center gap-1">
										{webhook.failedDeliveries === 0 ? (
											<CheckCircle className="w-4 h-4 text-green-500" />
										) : (
											<XCircle className="w-4 h-4 text-red-500" />
										)}
										<span>{webhook.totalDeliveries} deliveries</span>
									</div>
									{webhook.lastTriggered && (
										<span>Last triggered: {formatLastTriggered(webhook.lastTriggered)}</span>
									)}
								</div>
							</motion.div>
						))
					)}
				</div>
			</motion.div>

			{/* Create/Edit Modal */}
			<AnimatePresence>
				{(showCreateModal || editingWebhook) && (
					<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
						<motion.div
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.9 }}
							className="bg-primary dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
						>
							<h2 className="text-2xl font-bold mb-6">
								{editingWebhook ? "Edit Webhook" : "Create Webhook"}
							</h2>

							<div className="space-y-4">
								{/* Name */}
								<div>
									<label className="block text-sm font-medium mb-2 dark:text-gray-400">Name *</label>
									<input
										type="text"
										value={formData.name}
										onChange={(e) => setFormData({ ...formData, name: e.target.value })}
										className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
										placeholder="My Integration Webhook"
									/>
								</div>

								{/* URL */}
								<div>
									<label className="block text-sm font-medium mb-2 dark:text-gray-400">URL *</label>
									<input
										type="url"
										value={formData.url}
										onChange={(e) => setFormData({ ...formData, url: e.target.value })}
										className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
										placeholder="https://myapp.com/webhooks/sparexchange"
									/>
								</div>

								{/* Events */}
								<div>
									<label className="block text-sm font-medium mb-2 dark:text-gray-400">Events * (Select at least one)</label>
									<div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
										{availableEvents.map(event => (
											<label
												key={event}
												className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer dark:text-gray-400"
											>
												<input
													type="checkbox"
													checked={formData.events.includes(event)}
													onChange={() => handleEventToggle(event)}
													className="w-4 h-4"
												/>
												<span className="text-sm">{event}</span>
											</label>
										))}
									</div>
								</div>
							</div>

							<div className="flex gap-4 justify-end mt-6">
								<button
									onClick={() => {
										setShowCreateModal(false);
										setEditingWebhook(null);
										resetForm();
									}}
									className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
								>
									Cancel
								</button>
								<button
									onClick={editingWebhook ? handleUpdate : handleCreate}
									className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
								>
									{editingWebhook ? "Update" : "Create"}
								</button>
							</div>
						</motion.div>
					</div>
				)}
			</AnimatePresence>
		</div>
	);
};

export default WebhookManagementPage;
