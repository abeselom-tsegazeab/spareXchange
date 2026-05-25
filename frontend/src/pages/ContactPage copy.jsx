import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, Clock, User, MessageSquare } from "lucide-react";

const ContactPage = () => {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		subject: "",
		message: ""
	});

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		// In a real app, you would send this data to your backend
		alert("Thank you for your message! We'll get back to you soon.");
		setFormData({ name: "", email: "", subject: "", message: "" });
	};

	return (
		<div className='min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white py-12'>
			<div className='container mx-auto px-4'>
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className='text-center mb-16'
				>
					<h1 className='text-5xl font-bold mb-6 bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text'>
						Contact Us
					</h1>
					<p className='text-xl text-gray-300 max-w-3xl mx-auto'>
						Have questions or feedback? Our team is here to help. Reach out to us through any of the channels below.
					</p>
				</motion.div>

				<div className='grid grid-cols-1 lg:grid-cols-2 gap-12'>
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5, delay: 0.2 }}
					>
						<h2 className='text-3xl font-bold mb-8 text-green-400'>Get in Touch</h2>
						
						<form onSubmit={handleSubmit} className='space-y-6'>
							<div>
								<label htmlFor='name' className='block text-gray-300 mb-2'>Name</label>
								<div className='relative'>
									<User className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' size={20} />
									<input
										type='text'
										id='name'
										name='name'
										value={formData.name}
										onChange={handleChange}
										className='w-full pl-12 pr-4 py-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-green-500 focus:ring-2 focus:ring-green-500 text-white placeholder-gray-400'
										placeholder='Your name'
										required
									/>
								</div>
							</div>
							
							<div>
								<label htmlFor='email' className='block text-gray-300 mb-2'>Email</label>
								<div className='relative'>
									<Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' size={20} />
									<input
										type='email'
										id='email'
										name='email'
										value={formData.email}
										onChange={handleChange}
										className='w-full pl-12 pr-4 py-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-green-500 focus:ring-2 focus:ring-green-500 text-white placeholder-gray-400'
										placeholder='your.email@example.com'
										required
									/>
								</div>
							</div>
							
							<div>
								<label htmlFor='subject' className='block text-gray-300 mb-2'>Subject</label>
								<div className='relative'>
									<MessageSquare className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' size={20} />
									<input
										type='text'
										id='subject'
										name='subject'
										value={formData.subject}
										onChange={handleChange}
										className='w-full pl-12 pr-4 py-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-green-500 focus:ring-2 focus:ring-green-500 text-white placeholder-gray-400'
										placeholder='What is this regarding?'
										required
									/>
								</div>
							</div>
							
							<div>
								<label htmlFor='message' className='block text-gray-300 mb-2'>Message</label>
								<textarea
									id='message'
									name='message'
									value={formData.message}
									onChange={handleChange}
									rows={5}
									className='w-full px-4 py-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-green-500 focus:ring-2 focus:ring-green-500 text-white placeholder-gray-400'
									placeholder='Your message here...'
									required
								></textarea>
							</div>
							
							<button
								type='submit'
								className='w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 transition duration-300 flex items-center justify-center'
							>
								<Send className='mr-2' size={20} />
								Send Message
							</button>
						</form>
					</motion.div>
					
					<motion.div
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5, delay: 0.4 }}
					>
						<h2 className='text-3xl font-bold mb-8 text-green-400'>Contact Information</h2>
						
						<div className='space-y-8'>
							<div className='flex items-start'>
								<div className='bg-green-900 p-3 rounded-full mr-4'>
									<Mail className='text-green-400' size={24} />
								</div>
								<div>
									<h3 className='text-xl font-semibold mb-2'>Email Us</h3>
									<p className='text-gray-300'>support@sparexchange.com</p>
									<p className='text-gray-400 text-sm mt-1'>General inquiries and support</p>
								</div>
							</div>
							
							<div className='flex items-start'>
								<div className='bg-green-900 p-3 rounded-full mr-4'>
									<Phone className='text-green-400' size={24} />
								</div>
								<div>
									<h3 className='text-xl font-semibold mb-2'>Call Us</h3>
									<p className='text-gray-300'>+1 (555) 123-4567</p>
									<p className='text-gray-400 text-sm mt-1'>Monday-Friday, 9AM-5PM EST</p>
								</div>
							</div>
							
							<div className='flex items-start'>
								<div className='bg-green-900 p-3 rounded-full mr-4'>
									<MapPin className='text-green-400' size={24} />
								</div>
								<div>
									<h3 className='text-xl font-semibold mb-2'>Visit Us</h3>
									<p className='text-gray-300'>123 Sustainability Drive</p>
									<p className='text-gray-300'>Green Valley, CA 90210</p>
									<p className='text-gray-400 text-sm mt-1'>Our headquarters and innovation center</p>
								</div>
							</div>
							
							<div className='flex items-start'>
								<div className='bg-green-900 p-3 rounded-full mr-4'>
									<Clock className='text-green-400' size={24} />
								</div>
								<div>
									<h3 className='text-xl font-semibold mb-2'>Business Hours</h3>
									<p className='text-gray-300'>Monday - Friday: 9:00 AM - 6:00 PM</p>
									<p className='text-gray-300'>Saturday: 10:00 AM - 4:00 PM</p>
									<p className='text-gray-300'>Sunday: Closed</p>
								</div>
							</div>
						</div>
						
						<div className='mt-12 bg-gray-800 rounded-2xl p-6 border border-gray-700'>
							<h3 className='text-2xl font-bold mb-4 text-green-400'>Feedback & Suggestions</h3>
							<p className='text-gray-300 mb-4'>
								We value your feedback and suggestions for improving SpareXChange. 
								Help us build a better platform for everyone.
							</p>
							<a 
								href='mailto:feedback@sparexchange.com' 
								className='inline-flex items-center text-green-400 hover:text-green-300 transition duration-300'
							>
								<Send className='mr-2' size={16} />
								Send us your ideas
							</a>
						</div>
					</motion.div>
				</div>
			</div>
		</div>
	);
};

export default ContactPage;