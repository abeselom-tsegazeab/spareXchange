import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import { User, Mail, Phone, MapPin, Save, ArrowLeft, Loader, Upload, X } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

const EditProfilePage = () => {
	const navigate = useNavigate();
	const { user } = useAuthStore();
	
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
		location: "",
	});

	const [profilePictureFile, setProfilePictureFile] = useState(null);
	const [profilePicturePreview, setProfilePicturePreview] = useState("");
	const [isUpdating, setIsUpdating] = useState(false);

	useEffect(() => {
		if (user) {
			setFormData({
				name: user.name || "",
				email: user.email || "",
				phone: user.phone || "",
				location: user.location || "",
			});
			setProfilePicturePreview(user.profilePicture || "");
		}
	}, [user]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleFileChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			if (file.size > 5 * 1024 * 1024) {
				toast.error("Image must be less than 5MB");
				return;
			}
			setProfilePictureFile(file);
			// Create preview
			const reader = new FileReader();
			reader.onloadend = () => {
				setProfilePicturePreview(reader.result);
			};
			reader.readAsDataURL(file);
		}
	};

	const removeProfilePicture = () => {
		setProfilePictureFile(null);
		setProfilePicturePreview("");
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		
		if (!formData.name.trim()) {
			toast.error("Name is required");
			return;
		}

		setIsUpdating(true);
		try {
			const updateData = new FormData();
			updateData.append("name", formData.name.trim());
			updateData.append("phone", formData.phone.trim());
			updateData.append("location", formData.location.trim());
			
			if (profilePictureFile) {
				updateData.append("profilePicture", profilePictureFile);
			}

			await useAuthStore.getState().updateProfile(updateData);
			toast.success("Profile updated successfully!");
			navigate("/profile");
		} catch (error) {
			console.error("Error updating profile:", error);
			toast.error(error.response?.data?.message || "Failed to update profile");
		} finally {
			setIsUpdating(false);
		}
	};

	if (!user) return null;

	return (
		<div className="min-h-screen bg-white dark:bg-gray-800 py-8 px-4">
			<div className="max-w-2xl mx-auto">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					{/* Header */}
					<div className="flex items-center mb-8">
						<button
							onClick={() => navigate("/profile")}
							className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mr-4"
						>
							<ArrowLeft className="w-5 h-5 mr-2" />
							Back to Profile
						</button>
						<h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Profile</h1>
					</div>

					{/* Form Card */}
					<div className="bg-primary dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
						<form onSubmit={handleSubmit} className="space-y-6">
							{/* Profile Picture Upload */}
							<div className="flex flex-col items-center mb-8">
								<div className="relative">
									{profilePicturePreview ? (
										<img
											src={profilePicturePreview}
											alt="Profile"
											className="w-32 h-32 rounded-full object-cover border-4 border-green-500"
										/>
									) : (
										<div className="w-32 h-32 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center border-4 border-green-500">
											<span className="text-5xl font-bold text-white">
												{formData.name.charAt(0).toUpperCase()}
											</span>
										</div>
									)}
									
									{/* Upload Button Overlay */}
									<label className="absolute bottom-0 right-0 bg-green-600 p-2 rounded-full hover:bg-green-700 transition-colors cursor-pointer">
										<Upload className="w-5 h-5" />
										<input
											type="file"
											accept="image/*"
											onChange={handleFileChange}
											className="hidden"
										/>
									</label>
									
									{/* Remove Button */}
									{profilePicturePreview && (
										<button
											type="button"
											onClick={removeProfilePicture}
											className="absolute top-0 right-0 bg-red-600 p-1 rounded-full hover:bg-red-700 transition-colors"
											title="Remove profile picture"
										>
											<X className="w-4 h-4" />
										</button>
									)}
								</div>
								<p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
									{profilePictureFile ? profilePictureFile.name : "Click to upload profile picture"}
								</p>
								{profilePictureFile && (
									<p className="text-xs text-gray-500 dark:text-gray-400">
										{(profilePictureFile.size / 1024).toFixed(1)} KB
									</p>
								)}
							</div>

							{/* Name */}
							<div className="space-y-2">
								<Label htmlFor="name" className="flex items-center text-gray-900 dark:text-gray-300">
									<User className="w-4 h-4 mr-2" />
									Full Name
								</Label>
								<Input
									id="name"
									name="name"
									type="text"
									value={formData.name}
									onChange={handleChange}
									placeholder="John Doe"
									required
									className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:border-green-500 focus:ring-green-500"
								/>
							</div>

							{/* Email (Read-only) */}
							<div className="space-y-2">
								<Label htmlFor="email" className="flex items-center text-gray-900 dark:text-gray-300">
									<Mail className="w-4 h-4 mr-2" />
									Email Address
								</Label>
								<Input
									id="email"
									type="email"
									value={formData.email}
									disabled
									className="bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed"
								/>
								<p className="text-xs text-red-600 dark:text-red-300 ml-2">Email cannot be changed</p>
							</div>

							{/* Phone */}
							<div className="space-y-2">
								<Label htmlFor="phone" className="flex items-center text-gray-900 dark:text-gray-300">
									<Phone className="w-4 h-4 mr-2" />
									Phone Number
								</Label>
								<Input
									id="phone"
									name="phone"
									type="tel"
									value={formData.phone}
									onChange={handleChange}
									placeholder="+251 911 223 344"
									className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:border-green-500 focus:ring-green-500"
								/>
							</div>

							{/* Location */}
							<div className="space-y-2">
								<Label htmlFor="location" className="flex items-center text-gray-900 dark:text-gray-300">
									<MapPin className="w-4 h-4 mr-2" />
									Location
								</Label>
								<Input
									id="location"
									name="location"
									type="text"
									value={formData.location}
									onChange={handleChange}
									placeholder="Addis Ababa, Ethiopia"
									className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:border-green-500 focus:ring-green-500"
								/>
							</div>

							{/* Submit Button */}
							<div className="flex gap-4 pt-4">
								<Button
									type="button"
									variant="outline"
									onClick={() => navigate("/profile")}
									className="flex-1 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600"
									disabled={isUpdating}
								>
									Cancel
								</Button>
								<Button
									type="submit"
									className="flex-1 bg-green-600 hover:bg-green-700 text-white"
									disabled={isUpdating}
								>
									{isUpdating ? (
										<>
											<Loader className="w-4 h-4 mr-2 animate-spin" />
											Saving...
										</>
									) : (
										<>
											<Save className="w-4 h-4 mr-2" />
											Save Changes
										</>
									)}
								</Button>
							</div>
						</form>
					</div>
				</motion.div>
			</div>
		</div>
	);
};

export default EditProfilePage;
