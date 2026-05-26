// import { useState } from "react";
// import { Link } from 'react-router';
import { Button } from '../components/ui/button';
// import { motion } from "framer-motion";
import { MessageCircle, Mail, Recycle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { Card, CardContent } from '../components/ui/card';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

// import { Card, CardContent } from '../components/ui/card';
// import { Link } from 'react-router';
// import { Button } from '../components/ui/button';

const FaqPage = () => {
	// const [openIndex, setOpenIndex] = useState(null);

	// const toggleAccordion = (index) => {
	// 	setOpenIndex(openIndex === index ? null : index);
	// };
	const { darkMode } = useTheme();

	const FAQ_CATEGORIES = [
		{
			category: 'Getting Started',
			questions: [
				{
					question: 'How do I create an account?',
					answer: 'Click on the "Get Started" or "Sign Up" button in the top right corner. Choose your account type (User, Business, or Recycler), fill in your details, and verify your email address.',
				},
				{
					question: 'What are the different account types?',
					answer: 'We offer three account types: User (for individual buyers/sellers), Business (for repair shops and garages), and Recycler (for recycling centers). Each type has features tailored to your needs.',
				},
				{
					question: 'Is it free to join?',
					answer: 'Yes! Creating an account and browsing parts is completely free. We only charge a small commission fee when you successfully sell an item.',
				},
			],
		},
		{
			category: 'Buying Parts',
			questions: [
				{
					question: 'How do I search for parts?',
					answer: 'Use the search bar on the marketplace page to search by part name, part number, or brand. You can also filter by category, condition, price range, and location.',
				},
				{
					question: 'What payment methods do you accept?',
					answer: 'We accept all major credit cards (Visa, Mastercard, American Express), debit cards, and PayPal. All transactions are secure and encrypted.',
				},
				{
					question: 'How does shipping work?',
					answer: 'Shipping is handled by the seller. Each listing includes shipping costs and estimated delivery times. Orders over $50 often qualify for free shipping.',
				},
				{
					question: 'What is buyer protection?',
					answer: 'Our buyer protection program ensures you receive the item as described. If there\'s an issue, we offer refunds and dispute resolution within 30 days of purchase.',
				},
			],
		},
		{
			category: 'Selling Parts',
			questions: [
				{
					question: 'How do I list a part for sale?',
					answer: 'Go to your profile, click "Create Listing," and fill in the details including photos, description, price, and condition. Your listing will be live within minutes.',
				},
				{
					question: 'What fees do sellers pay?',
					answer: 'We charge a 5% commission on successful sales. There are no listing fees or monthly charges. You only pay when you sell.',
				},
				{
					question: 'How do I get paid?',
					answer: 'Payments are processed within 2-3 business days after the buyer confirms receipt. Funds are transferred directly to your linked bank account or PayPal.',
				},
				{
					question: 'Can I edit my listings after posting?',
					answer: 'Yes! You can edit your listings at any time from your profile dashboard. Update prices, photos, descriptions, or mark items as sold.',
				},
			],
		},
		{
			category: 'Account & Security',
			questions: [
				{
					question: 'How do I reset my password?',
					answer: 'Click on "Forgot Password" on the login page, enter your email, and we\'ll send you a reset link. The link expires in 1 hour for security.',
				},
				{
					question: 'Is my information secure?',
					answer: 'Absolutely. We use industry-standard encryption to protect your data. Payment information is processed through secure payment gateways and never stored on our servers.',
				},
				{
					question: 'How do I verify my account?',
					answer: 'After signing up, check your email for a verification link. Click the link to verify your account. Verified accounts build trust with other users.',
				},
				{
					question: 'Can I delete my account?',
					answer: 'Yes, you can delete your account anytime from Account Settings. Note that this action is permanent and cannot be undone.',
				},
			],
		},
	];

	return (
		<div className='min-h-screen text-white py-12 bg-primary/20 dark:bg-gradient-to-r from-gray-900 via-green-900 to-emerald-900 dark:text-black'>
			{/* Hero Section */}
			<div className="bg-gradient-to-br from-green-600 to-green-900 text-white py-16 my-4">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<h1 className="text-5xl mb-4 text-white">Frequently Asked Questions</h1>
					<p className="text-xl text-foreground">
						Find answers to common questions about SpareXchange
					</p>
				</div>
			</div>
			{/* FAQ Content */}
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

				<div className={`space-y-8 text-black `}>
					{FAQ_CATEGORIES.map((category, categoryIndex) => (
						<div key={categoryIndex}>
							<h2 className="text-2xl mb-4 text-primary dark:text-background">{category.category}</h2>
							<Accordion type="single" collapsible className="space-y-2 ">
								{category.questions.map((item, index) => (
									<AccordionItem
										key={index}
										value={`${categoryIndex}-${index}`}
										className="border border-border rounded-lg px-6 bg-card dark:bg-accent "
									>
										<AccordionTrigger className="hover:no-underline text-left">
											{item.question}
										</AccordionTrigger>
										<AccordionContent className="text-foreground">
											{item.answer}
										</AccordionContent>
									</AccordionItem>
								))}
							</Accordion>
						</div>
					))}
				</div>
				{/* Contact Support Section */}
				<Card className={`mt-16 dark:bg-accent `}>
					<CardContent className="text-center">
						<MessageCircle className="w-12 h-12 mt-2 text-primary mx-auto mb-4" />
						<h3 className="text-2xl mb-2 text-primary">Still Have Questions?</h3>
						<p className="text-foreground mb-6">
							Can't find what you're looking for? Our support team is here to help.
						</p>
						<div className="flex flex-wrap justify-center gap-4">
							<Button className='bg-primary hover:bg-[#16a34a]/90'>
								<Link to="/contact" className='flex text-white'>
									<Mail className="w-4 h-4 mr-2" />
									Contact Support
								</Link>
							</Button>
							<Button variant="outline" asChild>
								<a href="mailto:support@sparexchange.com" className='hover:bg-primary/70 hover:text-background border border-primary'>
									Email Us
								</a>
							</Button>

						</div>
					</CardContent>
				</Card>
			</div>

			{/* Footer */}
			<footer className="border-t border-border bg-card py-12 mt-16 dark:bg-accent ">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
						<div>
							<div className="flex items-center gap-3 mb-4">
								<div className="bg-[var(--primary)] p-2 rounded-lg">
									<Recycle className="w-5 h-5 text-[var(--primary-foreground)]" />
								</div>
								<span className="text-lg text-[var(--foreground)]">SpareXchange</span>
							</div>
							<p className="text-sm text-[var(--muted-foreground)]">
								Your trusted marketplace for sustainable auto parts exchange.
							</p>
						</div>
						<div>
							<h4 className="mb-4 text-[var(--foreground)]">Product</h4>
							<ul className="space-y-2 text-sm text-[var(--muted-foreground)]">
								<li><Link to="/marketplace" className="hover:text-primary">Marketplace</Link></li>
								<li><Link to="/leaderboard" className="hover:text-primary">Leaderboard</Link></li>
								<li><Link to="/dashboard" className="hover:text-primary">Dashboard</Link></li>
							</ul>
						</div>
						<div>
							<h4 className="mb-4 text-[var(--foreground)]">Support</h4>
							<ul className="space-y-2 text-sm text-[var(--muted-foreground)]">
								<li><Link to="/faq" className="hover:text-primary">FAQ</Link></li>
								<li><Link to="/contact" className="hover:text-primary">Contact Us</Link></li>
							</ul>
						</div>
						<div>
							<h4 className="mb-4 text-[var(--foreground)]">Legal</h4>
							<ul className="space-y-2 text-sm text-[var(--muted-foreground)]">
								<li><Link to="/terms" className="hover:text-primary">Terms of Service</Link></li>
								<li><Link to="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
							</ul>
						</div>
					</div>
					<div className="border-t border-border pt-8 text-center text-sm text-[var(--muted-foreground)]">
						<p>&copy; 2026 SpareXchange. All rights reserved.</p>
					</div>
				</div>
			</footer>



		</div>
	);
};

export default FaqPage;