import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";

const FaqPage = () => {
	const [openIndex, setOpenIndex] = useState(null);

	const toggleAccordion = (index) => {
		setOpenIndex(openIndex === index ? null : index);
	};

	const faqs = [
		{
			question: "What is SpareXChange?",
			answer: "SpareXChange is a marketplace platform that connects users who want to buy, sell, or exchange spare parts for vehicles, machinery, and electronics. Our platform promotes sustainability by extending the life of spare parts and reducing electronic waste."
		},
		{
			question: "How does the exchange system work?",
			answer: "Our exchange system allows users to trade spare parts directly with other users. You can list parts you no longer need and specify what you're looking for in return. Our matching algorithm helps connect users with complementary needs."
		},
		{
			question: "Is my personal information secure?",
			answer: "Yes, we take security seriously. All personal information is encrypted and stored securely. We follow industry best practices for data protection and never share your information with third parties without your consent."
		},
		{
			question: "How do I verify my account?",
			answer: "After signing up, you'll receive a verification email. Click the link in the email to verify your account. Verified accounts have access to all platform features including listing items and participating in exchanges."
		},
		{
			question: "What is the Eco Points system?",
			answer: "Eco Points are rewards you earn for participating in sustainable activities on our platform, such as recycling parts, completing exchanges, or listing items for reuse. These points can be redeemed for discounts on future transactions."
		},
		{
			question: "Are there any fees for using SpareXChange?",
			answer: "Basic membership is free. We charge a small transaction fee only when you successfully complete a purchase or exchange. The exact fee percentage is displayed before you confirm any transaction."
		},
		{
			question: "How do I contact a seller or buyer?",
			answer: "Once you're logged in, you can use our built-in messaging system to communicate with other users. Simply navigate to a listing and click the 'Message Seller' button to start a conversation."
		},
		{
			question: "What if I receive a damaged or incorrect item?",
			answer: "We recommend inspecting items upon receipt. If you receive a damaged or incorrect item, contact the seller immediately through our messaging system. If you can't resolve the issue directly, our support team can help mediate the dispute."
		},
		{
			question: "Can I sell used parts?",
			answer: "Yes, we encourage selling used parts that are still functional. Please be honest about the condition of your items and provide clear photos. This helps build trust in our community and supports our sustainability mission."
		},
		{
			question: "How do I report a problem or suspicious activity?",
			answer: "If you encounter any issues or suspect fraudulent activity, please contact our support team immediately through the 'Contact Us' page. We investigate all reports promptly and take appropriate action to maintain platform safety."
		}
	];

	return (
		<div className='min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white py-12'>
			<div className='container mx-auto px-4'>
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className='text-center mb-16'
				>
					<h1 className='text-5xl font-bold mb-6 bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text flex items-center justify-center'>
						<HelpCircle className='mr-4' size={48} />
						Frequently Asked Questions
					</h1>
					<p className='text-xl text-gray-300 max-w-3xl mx-auto'>
						Find answers to common questions about SpareXChange and how our platform works
					</p>
				</motion.div>

				<div className='max-w-3xl mx-auto'>
					{faqs.map((faq, index) => (
						<motion.div
							key={index}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, delay: index * 0.1 }}
							className='mb-4 bg-gray-800 rounded-xl border border-gray-700 overflow-hidden'
						>
							<button
								className='w-full p-6 text-left flex justify-between items-center hover:bg-gray-750 transition duration-300'
								onClick={() => toggleAccordion(index)}
							>
								<h3 className='text-xl font-semibold'>{faq.question}</h3>
								{openIndex === index ?
									<ChevronUp size={24} className='text-green-400' /> :
									<ChevronDown size={24} className='text-green-400' />
								}
							</button>
							{openIndex === index && (
								<motion.div
									initial={{ height: 0, opacity: 0 }}
									animate={{ height: 'auto', opacity: 1 }}
									exit={{ height: 0, opacity: 0 }}
									transition={{ duration: 0.3 }}
									className='px-6 pb-6 text-gray-300'
								>
									{faq.answer}
								</motion.div>
							)}
						</motion.div>
					))}
				</div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.5 }}
					className='mt-16 text-center'
				>
					<h2 className='text-3xl font-bold mb-6 text-green-400'>Still Have Questions?</h2>
					<p className='text-xl text-gray-300 max-w-2xl mx-auto mb-8'>
						Can't find the answer you're looking for? Our support team is here to help.
					</p>
					<a
						href='/contact'
						className='inline-block px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 transition duration-300'
					>
						Contact Support
					</a>
				</motion.div>
			</div>
		</div>
	);
};

export default FaqPage;