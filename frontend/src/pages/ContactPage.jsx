import { useState } from "react";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
// import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Recycle, Send } from "lucide-react";

const ContactPage = () => {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		subject: "",
		message: ""
	});

	// const handleChange = (e) => {
	// 	setFormData({ ...formData, [e.target.name]: e.target.value });
	// };
	const updateFormData = (field, value) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		// In a real app, you would send this data to your backend
		alert("Thank you for your message! We'll get back to you soon.");
		setFormData({ name: "", email: "", subject: "", message: "" });
	};

	return (
		<div className="min-h-screen flex">
			{/* Left side - Image */}
			<div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
				<div className="absolute inset-0 bg-linear-to-br from-green-600/90 to-green-900/90 z-10" />
				<img
					src="https://images.unsplash.com/photo-1766650189458-bb0e7969ba5d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdXRvJTIwcGFydHMlMjBtZWNoYW5pY2FsJTIwd29ya3Nob3B8ZW58MXx8fHwxNzc0MDI1NDUyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
					alt="Contact Us"
					className="absolute inset-0 w-full h-full object-cover"
				/>
				<div className="relative z-20 flex flex-col justify-center items-start p-16 text-white">
					<div className="flex items-center gap-3 mb-12">
						<div className="bg-white p-3 rounded-xl">
							<Recycle className="w-8 h-8 text-green-600" />
						</div>
						<h1 className="text-4xl text-white">SpareXchange</h1>
					</div>
					<h2 className="text-5xl mb-6 leading-tight text-white">
						Get in Touch
					</h2>
					<p className="text-xl text-green-50 max-w-md mb-12">
						Have questions? We're here to help. Reach out to our team and we'll
						get back to you as soon as possible.
					</p>

					<div className="space-y-6 w-full">
						<Card className="bg-white/10 backdrop-blur-sm border-white/20">
							<CardContent className="p-6">
								<div className="flex items-center gap-4">
									<div className="bg-white/20 p-3 rounded-lg">
										<Mail className="w-6 h-6 text-white" />
									</div>
									<div>
										<div className="text-sm text-green-100">Email Us</div>
										<div className="text-white">support@sparexchange.com</div>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card className="bg-white/10 backdrop-blur-sm border-white/20">
							<CardContent className="p-6">
								<div className="flex items-center gap-4">
									<div className="bg-white/20 p-3 rounded-lg">
										<Phone className="w-6 h-6 text-white" />
									</div>
									<div>
										<div className="text-sm text-green-100">Call Us</div>
										<div className="text-white">+(251) 935-033-357</div>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card className="bg-white/10 backdrop-blur-sm border-white/20">
							<CardContent className="p-6">
								<div className="flex items-center gap-4">
									<div className="bg-white/20 p-3 rounded-lg">
										<MapPin className="w-6 h-6 text-white" />
									</div>
									<div>
										<div className="text-sm text-green-100">Visit Us</div>
										<div className="text-white">
											Adama Nazreth, Bole
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>

			<div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background dark:bg-gradient-to-r from-gray-900 via-green-900 to-emerald-900 dark:text-black">
				<div className="w-full max-w-md space-y-8">
					{/* Mobile Logo */}
					<div className="lg:hidden flex items-center gap-3 justify-center">
						<div className="bg-green-600 p-2 rounded-lg">
							<Recycle className="w-6 h-6 text-white" />
						</div>
						<h1 className="text-2xl">SpareXchange</h1>
					</div>
					{/* Header */}
					<div className="text-center lg:text-left">
						<h2 className="text-3xl mb-2">Contact Us</h2>
						<p className="text-muted-foreground">
							{`Fill out the form and we'll be in touch soon`}
						</p>
					</div>
					{/* Form */}
					<form onSubmit={handleSubmit} className="space-y-6">
						<div className="space-y-2">
							<Label htmlFor="name">Full Name</Label>
							<Input
								id="name"
								type="text"
								placeholder="Abebe Kebede"
								value={formData.name}
								onChange={(e) => updateFormData("name", e.target.value)}
								required
								className=" bg-gray-200 dark:bg-accent border border-border"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="email">Email Address</Label>
							<Input
								id="email"
								type="email"
								placeholder="abebe@example.com"
								value={formData.email}
								onChange={(e) => updateFormData("email", e.target.value)}
								required
								className="bg-gray-200 dark:bg-accent border border-border"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="subject">Subject</Label>
							<Input
								id="subject"
								type="text"
								placeholder="How can we help?"
								value={formData.subject}
								onChange={(e) => updateFormData("subject", e.target.value)}
								required
								className="bg-gray-200 dark:bg-accent border border-border"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="message">Message</Label>
							<Textarea
								id="message"
								placeholder="Tell us more about your inquiry..."
								value={formData.message}
								onChange={(e) => updateFormData("message", e.target.value)}
								required
								rows={6}
								className=" bg-gray-200 dark:bg-accent border border-border resize-none"
							/>
						</div>

						<Button
							type="submit"
							className="w-full bg-primary hover:bg-primary/90"
						>
							<Send className="w-4 h-4 mr-2" />
							Send Message
						</Button>
					</form>

				</div>
			</div>

		</div>

	);
};

export default ContactPage;