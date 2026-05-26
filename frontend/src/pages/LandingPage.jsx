import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Recycle, Shuffle, Users, Wrench, Leaf, Truck, Car, Cpu, Smartphone, Gamepad2, Camera, Watch, Headphones, Laptop, ArrowRight, Star, Phone } from "lucide-react";
import ListingCard from "../components/ListingCard";
import CategoryCard from "../components/CategoryCard";
// import InteractiveMap from "../components/InteractiveMap";
// import PersonalizedCTA from "../components/PersonalizedCTA";
// import ActivityFeed from "../components/ActivityFeed";
// import SocialProofNotification from "../components/SocialProofNotification";
// import AnimatedFooter from "../components/AnimatedFooter";
import { useTheme } from "../contexts/ThemeContext";
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

const LandingPage = () => {
  const { darkMode } = useTheme();
  const STATS = [
    { value: '50K+', label: 'Active Parts' },
    { value: '10K+', label: 'Happy Users' },
    { value: '5K+', label: 'Verified Sellers' },
    { value: '4.8', label: 'Avg Rating' },
  ];

  const FEATURES = [
    {
      icon: Recycle,
      title: "Buy & Sell Spare Parts",
      description: "Find affordable spare parts for vehicles, machinery, and electronics from verified sellers in our secure marketplace.",
    },
    {
      icon: Shuffle,
      title: "Exchange Program",
      description: "Trade your spare parts directly with other users through our peer-to-peer exchange system.",
    },
    {
      icon: Users,
      title: "Community Network",
      description: "Connect with garages, repair shops, recyclers, and electronics enthusiasts in a collaborative ecosystem.",
    },
    {
      icon: Leaf,
      title: "Eco Points System",
      description: "Earn rewards for recycling spare parts and contributing to sustainable practices.",
    },
    {
      icon: Wrench,
      title: "Technician Support",
      description: "Request professional technician assistance for complex repairs and installations.",
    },
    {
      icon: Truck,
      title: "Real-Time Matching",
      description: "Instantly find compatible spare parts with our advanced search and matching algorithms.",
    },
  ];
  const TESTIMONIALS = [
    {
      name: 'Sarah Johnson',
      role: 'Individual Buyer',
      content: 'Found the perfect transmission for my Honda at half the dealer price. SpareXchange made it so easy!',
      rating: 5,
    },
    {
      name: 'Mike\'s Auto Shop',
      role: 'Business',
      content: 'We source all our parts through SpareXchange now. Great inventory and reliable sellers.',
      rating: 5,
    },
    {
      name: 'Green Recycling Co.',
      role: 'Recycler',
      content: 'The platform has helped us reach more customers and move inventory faster than ever.',
      rating: 5,
    },
  ];
  const HOW_IT_WORKS = [
    { level: "1", title: "Create Account", description: "Sign up as a user, business, or recycler in just minutes." },
    { level: 2, title: "Browse or List", description: "Search for parts you need or list your inventory for sale." },
    { level: 3, title: "Connect & Transact", description: "Communicate with sellers/buyers and securely complete purchases or exchanges through our platform." },
    { level: 4, title: "Trade or Recycle", description: "Trade parts directly with peers or recycle unused components to earn Eco Points." },
    { level: 5, title: "Complete Transaction", description: "Secure checkout, fast shipping, and buyer protection." }
  ];


  return (
    <div className={`min-h-screen overflow-hidden ${darkMode ? 'bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* <SocialProofNotification /> */}
      {/* Floating Shapes */}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-600 to-green-900 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1766650189458-bb0e7969ba5d?w=1920&h=1080&fit=crop)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl mb-6 leading-tight text-white">
              {`Your Sustainable Marketplace for Spare Parts`}
            </h1>
            <p className="text-xl text-green-50 mb-8 leading-relaxed">
              Connect with thousands of sellers, find quality parts, and contribute to a greener future.
              Whether you're a buyer, business, or recycler - we've got you covered.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/signup">
                <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 h-14 px-8">
                  Start Buying
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/marketplace">
                <Button size="lg" variant="outline" className="border-white bg-primary text-white hover:bg-white/10 h-14 px-8">
                  Browse Parts
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl text-primary mb-2">{stat.value}</div>
                <div className="text-black">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl mb-4 text-primary">Why Choose SpareXchange?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We make finding and selling auto parts simple, secure, and sustainable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature, index) => (
              <motion.div key={index}
                className="relative"
                whileHover={{
                  y: -5,
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  borderColor: '#10b981'
                }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className={`h-full hover:shadow-lg transition-shadow ${darkMode ? "bg-white text-black" : "bg-primary text-white"}`}>
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl mb-3 text-foreground">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* How It Works */}
      <section className="py-20 bg-[var(--secondary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl mb-4 text-primary">How It Works</h2>
            <p className="text-xl text-muted-foreground">Get started in five simple steps</p>
          </div>
          {/*change this elements into component later*/}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((step, index) => {
              return (
                <motion.div key={index} className="text-center border border-primary rounded-lg p-2 shadow-lg"
                  whileHover={{
                    y: -5,
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    borderColor: '#10b981'
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={`w-20 h-20 dark:bg-white dark:text-black bg-primary rounded-full flex items-center justify-center text-3xl mx-auto mb-4`}>
                    {step.level}
                  </div>
                  <h3 className="text-xl mb-3 text-primary">{step.title}</h3>
                  <p className="text-muted-foreground">
                    {step.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>
      {/* this is left from version 1 */}
      {/* Categories Showcase */}
      <section className='container mx-auto px-4 sm:px-6 py-12 sm:py-16 relative z-10'>
        <div
          // initial={{ scale: 0.8, opacity: 0 }}
          // whileInView={{ scale: 1, opacity: 1 }}
          // viewport={{ once: true }}
          // transition={{ duration: 0.6 }}
          className='relative mb-12 sm:mb-16'
        >
          <div className='absolute -inset-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full blur-xl opacity-20'></div>
          <motion.h2
            className={`text-3xl sm:text-4xl text-center relative bg-gradient-to-r ${darkMode ? 'from-green-400 to-emerald-500' : 'from-green-600 to-emerald-700'} text-transparent bg-clip-text pb-2 `}
          // initial={{ y: 20 }}
          // whileInView={{ y: 0 }}
          // viewport={{ once: true }}
          // transition={{ duration: 0.3 }}
          >
            Popular Categories
          </motion.h2>
        </div>
        <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6'>
          {/*change this info by data from backend*/}
          {[
            { name: "Automotive", count: "2.5K" },
            { name: "Electronics", count: "1.8K" },
            { name: "Mobile Devices", count: "3.2K" },
            { name: "Gaming", count: "900" },
            { name: "Cameras", count: "750" },
            { name: "Wearables", count: "1.2K" },
            { name: "Audio", count: "1.5K" },
            { name: "Computers", count: "2.1K" }
          ].map((category, index) => (
            <CategoryCard key={index} category={category} index={index} />
          ))}
        </div>
      </section>
      {/* this is left from version 1 */}
      {/* Recent Listings Preview */}
      <section className='container mx-auto px-4 sm:px-6 py-12 sm:py-16 relative z-10'>
        <motion.div
          // initial={{ scale: 0.8, opacity: 0 }}
          // whileInView={{ scale: 1, opacity: 1 }}
          // viewport={{ once: true }}
          // transition={{ duration: 0.6 }}
          className='relative mb-12 sm:mb-16 text-center'
        >
          <div className='absolute -inset-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full blur-xl opacity-20 mx-auto left-1/2 transform -translate-x-1/2'></div>
          <motion.h2
            className={`text-3xl sm:text-4xl pb-2 relative bg-gradient-to-r ${darkMode ? 'from-green-400 to-emerald-500' : 'from-green-600 to-emerald-700'} text-transparent bg-clip-text`}
            initial={{ y: 20 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
          >
            Recent Listings
          </motion.h2>
          <motion.p
            className={`dark:text-white text-black mt-4 max-w-2xl mx-auto`}
          // initial={{ opacity: 0 }}
          // whileInView={{ opacity: 1 }}
          // viewport={{ once: true }}
          // transition={{ duration: 0.6, delay: 0.2 }}
          >
            {`Check out the latest spare parts added to our marketplace`}
          </motion.p>
        </motion.div>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6'>
          {/*change this info with data from the backend*/}
          {[
            { icon: <Phone />, title: "iPhone 12 Pro Max Battery", price: "25", condition: "New", seller: "TechSolutions", location: "San Francisco, CA", timeAgo: "2 hours ago" },
            { icon: <Car />, title: "BMW X5 Brake Pads", price: "85", condition: "Refurbished", seller: "AutoPartsHub", location: "Los Angeles, CA", timeAgo: "5 hours ago" },
            { icon: <Gamepad2 />, title: "PlayStation 5 Controller", price: "45", condition: "Like New", seller: "GameSwap", location: "New York, NY", timeAgo: "1 day ago" },
            { icon: <Laptop />, title: "Dell XPS 13 Screen", price: "120", condition: "Used", seller: "LaptopRepair", location: "Chicago, IL", timeAgo: "1 day ago" }
          ].map((listing, index) => (
            <ListingCard key={index} listing={listing} index={index} />
          ))}
        </div>
        <motion.div
          className='text-center mt-10'
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Link
              to='/marketplace'
              className={`inline-block px-6 py-3 sm:px-8 sm:py-4 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-base sm:text-lg hover:from-green-600 hover:to-emerald-700 transition duration-300 shadow-lg hover:shadow-green-500/30 relative overflow-hidden group ${darkMode ? '' : 'shadow-md'}`}
            >
              <span className='relative z-10 flex items-center justify-center'>
                View All Listings
                <motion.svg
                  className='ml-2 w-4 h-4 sm:w-5 sm:h-5'
                  width='20'
                  height='20'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                // whileHover={{ x: 5 }}
                // transition={{ type: "spring", stiffness: 300 }}
                >
                  <path d='M5 12h14' />
                  <path d='M12 5l7 7-7 7' />
                </motion.svg>
              </span>
              <div className='absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left'></div>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* this is feaature is undercontruction */}
      {/* Interactive Map Section */}
      {/* <section className='container mx-auto px-4 sm:px-6 py-12 sm:py-16 relative z-10'>
				<motion.div
					initial={{ scale: 0.8, opacity: 0 }}
					whileInView={{ scale: 1, opacity: 1 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
					className='relative mb-12 sm:mb-16 text-center'
				>
					<div className='absolute -inset-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full blur-xl opacity-20 mx-auto left-1/2 transform -translate-x-1/2'></div>
					<motion.h2
						className={`text-3xl sm:text-4xl font-bold relative bg-gradient-to-r ${darkMode ? 'from-green-400 to-emerald-500' : 'from-green-600 to-emerald-700'} text-transparent bg-clip-text`}
						initial={{ y: 20 }}
						whileInView={{ y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.3 }}
					>
						User Activity Map
					</motion.h2>
					<motion.p
						className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-4 max-w-2xl mx-auto`}
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6, delay: 0.2 }}
					>
						See where our community is most active around the world
					</motion.p>
				</motion.div>
				<div className='max-w-4xl mx-auto'>
					<InteractiveMap />
				</div>
			</section> */}
      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl mb-4 text-primary">What Our Users Say</h2>
            <p className="text-xl text-muted-foreground">Join thousands of satisfied customers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="p-6 text-foreground">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className=" mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <div className="">{testimonial.name}</div>
                    <div className="text-sm ">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-green-600 to-green-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl mb-6 text-white">Ready to Get Started?</h2>
          <p className="text-xl text-green-50 mb-8">
            Join SpareXchange today and discover a better way to buy and sell auto parts.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/signup">
              <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 h-14 px-8">
                Create Free Account
              </Button>
            </Link>
            <Link to="/leaderboard">
              <Button size="lg" variant="outline" className=" bg-primary border-white text-white hover:bg-white/10 h-14 px-8">
                View Top Sellers
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-accent py-12 text-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-primary p-2 rounded-lg">
                  <Recycle className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-lg text-foreground">SpareXchange</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your trusted marketplace for sustainable auto parts exchange.
              </p>
            </div>
            <div>
              <h4 className="mb-4 text-foreground">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/marketplace" className="hover:text-primary">Marketplace</Link></li>
                <li><Link to="/leaderboard" className="hover:text-primary">Leaderboard</Link></li>
                <li><Link to="/dashboard" className="hover:text-primary">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-foreground">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/faq" className="hover:text-primary">FAQ</Link></li>
                <li><Link to="/contact" className="hover:text-primary">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-foreground">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/terms" className="hover:text-primary">Terms of Service</Link></li>
                <li><Link to="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2026 SpareXchange. All rights reserved.</p>
          </div>
        </div>
      </footer>


      {/* <AnimatedFooter /> */}
    </div>
  );
};

export default LandingPage;