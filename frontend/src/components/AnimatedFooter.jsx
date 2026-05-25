import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Youtube, 
  Mail, 
  Phone, 
  MapPin,
  Leaf,
  Recycle,
  Wrench,
  Package
} from "lucide-react";
import { Link } from "react-router-dom";

const AnimatedFooter = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail("");
      // Reset subscription message after 3 seconds
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  // Footer navigation links
  const navigation = {
    product: [
      { name: "Marketplace", href: "/marketplace" },
      { name: "How It Works", href: "/#how-it-works" },
      { name: "Categories", href: "/#categories" },
      { name: "Pricing", href: "/pricing" },
    ],
    company: [
      { name: "About Us", href: "/about" },
      { name: "Careers", href: "/careers" },
      { name: "Blog", href: "/blog" },
      { name: "Press", href: "/press" },
    ],
    resources: [
      { name: "Help Center", href: "/help" },
      { name: "Partners", href: "/partners" },
      { name: "Guides", href: "/guides" },
      { name: "Community", href: "/community" },
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" },
      { name: "Licenses", href: "/licenses" },
    ],
  };

  // Social media links
  const socialMedia = [
    { name: "Facebook", icon: Facebook, href: "#" },
    { name: "Twitter", icon: Twitter, href: "#" },
    { name: "Instagram", icon: Instagram, href: "#" },
    { name: "LinkedIn", icon: Linkedin, href: "#" },
    { name: "YouTube", icon: Youtube, href: "#" },
  ];

  return (
    <footer className="bg-gray-900 border-t border-gray-800 pt-12 pb-8">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Single Row Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand and Newsletter - Full width on mobile, half on tablet, quarter on desktop */}
          <div className="sm:col-span-2 lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <Link to="/" className="flex items-center">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-2 rounded-lg">
                  <Recycle className="h-6 w-6 text-white" />
                </div>
                <span className="ml-3 text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
                  SpareXChange
                </span>
              </Link>
              <p className="mt-4 text-gray-400 text-sm">
                Connecting communities through sustainable spare part exchange.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h3 className="text-white font-semibold mb-4">Stay Updated</h3>
              <form onSubmit={handleSubmit} className="relative">
                <div className="flex">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-grow px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-r-lg font-medium transition-all duration-300 transform hover:scale-105"
                  >
                    <Mail className="h-5 w-5" />
                  </button>
                </div>
                {isSubscribed && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-green-400 text-sm mt-2"
                  >
                    Thank you for subscribing!
                  </motion.p>
                )}
              </form>
            </motion.div>
          </div>

          {/* Contact Us Column */}
          <div>
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="text-white font-semibold mb-4"
            >
              Contact Us
            </motion.h3>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center text-gray-400">
                <Mail className="h-5 w-5 mr-3 text-green-500" />
                <span>support@sparexchange.com</span>
              </div>
              <div className="flex items-center text-gray-400">
                <Phone className="h-5 w-5 mr-3 text-green-500" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center text-gray-400">
                <MapPin className="h-5 w-5 mr-3 text-green-500" />
                <span>San Francisco, CA</span>
              </div>
            </motion.div>
          </div>

          {/* Quick Links - Combined Product and Company */}
          <div>
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-white font-semibold mb-4"
            >
              Quick Links
            </motion.h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-gray-300 font-medium mb-3">Product</h4>
                <ul className="space-y-2">
                  {navigation.product.slice(0, 2).map((item, index) => (
                    <motion.li
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                    >
                      <Link
                        to={item.href}
                        className="text-gray-400 hover:text-green-400 transition-colors duration-300 text-sm flex items-center group"
                      >
                        <span className="transform group-hover:translate-x-1 transition-transform duration-300">
                          {item.name}
                        </span>
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-gray-300 font-medium mb-3">Company</h4>
                <ul className="space-y-2">
                  {navigation.company.slice(0, 2).map((item, index) => (
                    <motion.li
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: 0.25 + index * 0.1 }}
                    >
                      <Link
                        to={item.href}
                        className="text-gray-400 hover:text-green-400 transition-colors duration-300 text-sm flex items-center group"
                      >
                        <span className="transform group-hover:translate-x-1 transition-transform duration-300">
                          {item.name}
                        </span>
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Resources Links */}
          <div>
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-white font-semibold mb-4"
            >
              Resources
            </motion.h3>
            <ul className="space-y-2">
              {navigation.resources.map((item, index) => (
                <motion.li
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                >
                  <Link
                    to={item.href}
                    className="text-gray-400 hover:text-green-400 transition-colors duration-300 text-sm flex items-center group"
                  >
                    <span className="transform group-hover:translate-x-1 transition-transform duration-300">
                      {item.name}
                    </span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="text-white font-semibold mb-4"
            >
              Legal
            </motion.h3>
            <ul className="space-y-2">
              {navigation.legal.slice(0, 2).map((item, index) => (
                <motion.li
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.35 + index * 0.1 }}
                >
                  <Link
                    to={item.href}
                    className="text-gray-400 hover:text-green-400 transition-colors duration-300 text-sm flex items-center group"
                  >
                    <span className="transform group-hover:translate-x-1 transition-transform duration-300">
                      {item.name}
                    </span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="border-t border-gray-800 pt-8 mt-8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-center">
            <div className="flex justify-center sm:justify-start">
              <div className="flex items-center space-x-4">
                {socialMedia.slice(0, 4).map((item, index) => (
                  <motion.a
                    key={item.name}
                    href={item.href}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                    className="text-gray-400 hover:text-green-400 transition-colors duration-300 transform hover:scale-110"
                    whileHover={{ y: -3 }}
                  >
                    <item.icon className="h-5 w-5" />
                  </motion.a>
                ))}
              </div>
            </div>

            <div className="flex justify-center">
              <div className="flex items-center space-x-6">
                <div className="flex items-center text-gray-400 text-sm">
                  <Leaf className="h-4 w-4 mr-2 text-green-500" />
                  <span>EcoPoints: 10K+</span>
                </div>
                <div className="flex items-center text-gray-400 text-sm">
                  <Package className="h-4 w-4 mr-2 text-green-500" />
                  <span>Parts Exchanged: 50K+</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center sm:justify-end">
              <div className="flex space-x-4">
                {socialMedia.slice(4).map((item, index) => (
                  <motion.a
                    key={item.name}
                    href={item.href}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.9 + index * 0.1 }}
                    className="text-gray-400 hover:text-green-400 transition-colors duration-300 transform hover:scale-110"
                    whileHover={{ y: -3 }}
                  >
                    <item.icon className="h-5 w-5" />
                  </motion.a>
                ))}
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="mt-8 text-center text-gray-500 text-sm"
          >
            <p>&copy; {new Date().getFullYear()} SpareXChange. All rights reserved. Building a sustainable future through spare part exchange.</p>
            <p className="mt-2">Reducing e-waste one part at a time.</p>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
};

export default AnimatedFooter;