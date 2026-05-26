import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Package, ShoppingCart, User, TrendingUp } from "lucide-react";
import { useAuthStore } from "../store/authStore";

const PersonalizedCTA = () => {
  const { isAuthenticated, user } = useAuthStore();
  const [userBehavior, setUserBehavior] = useState({
    hasListings: false,
    hasPurchases: false,
    favoriteCategory: null,
    ecoPoints: 0
  });

  // Simulate user behavior data - in a real app, this would come from user activity tracking
  useEffect(() => {
    if (isAuthenticated && user) {
      // Simulate user behavior based on user data
      setUserBehavior({
        hasListings: Math.random() > 0.5,
        hasPurchases: Math.random() > 0.3,
        favoriteCategory: ["Automotive", "Electronics", "Mobile Devices", "Gaming"][Math.floor(Math.random() * 4)],
        ecoPoints: user.ecoPoints || 0
      });
    }
  }, [isAuthenticated, user]);

  // Determine personalized CTA based on user behavior
  const getPersonalizedCTA = () => {
    if (!isAuthenticated) {
      return {
        title: "Join Our Community",
        description: "Start buying, selling, and exchanging spare parts today",
        buttonText: "Sign Up Now",
        icon: User,
        link: "/signup",
        color: "from-green-500 to-emerald-600",
        hoverColor: "hover:from-green-600 hover:to-emerald-700"
      };
    }

    // Authenticated user CTAs
    if (!userBehavior.hasListings && !userBehavior.hasPurchases) {
      return {
        title: "Start Selling Today",
        description: "List your first spare part and reach thousands of potential buyers",
        buttonText: "Create Your First Listing",
        icon: Package,
        link: "/marketplace/create",
        color: "from-blue-500 to-indigo-600",
        hoverColor: "hover:from-blue-600 hover:to-indigo-700"
      };
    }

    if (userBehavior.hasListings && !userBehavior.hasPurchases) {
      return {
        title: "Expand Your Reach",
        description: `List more ${userBehavior.favoriteCategory} parts and grow your business`,
        buttonText: "Add New Listing",
        icon: TrendingUp,
        link: "/marketplace/create",
        color: "from-purple-500 to-pink-600",
        hoverColor: "hover:from-purple-600 hover:to-pink-700"
      };
    }

    if (userBehavior.hasPurchases && userBehavior.ecoPoints < 100) {
      return {
        title: "Earn EcoPoints",
        description: "Recycle your old parts and earn rewards for sustainable practices",
        buttonText: "Learn About Recycling",
        icon: ShoppingCart,
        link: "/recycling",
        color: "from-yellow-500 to-orange-600",
        hoverColor: "hover:from-yellow-600 hover:to-orange-700"
      };
    }

    // Default CTA for active users
    return {
      title: "Boost Your Impact",
      description: "Continue contributing to our circular economy and earn more EcoPoints",
      buttonText: "View Your Dashboard",
      icon: TrendingUp,
      link: "/dashboard",
      color: "from-green-500 to-emerald-600",
      hoverColor: "hover:from-green-600 hover:to-emerald-700"
    };
  };

  const cta = getPersonalizedCTA();
  const IconComponent = cta.icon;

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-2xl p-6 border border-gray-700 hover:border-green-500 transition duration-300 group cursor-pointer relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ 
        y: -5,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        borderColor: '#10b981'
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className='absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl'></div>
      
      <div className="flex flex-col sm:flex-row items-center text-center sm:text-left">
        <div className="mb-4 sm:mb-0 sm:mr-6 relative z-10">
          <div className={`bg-gradient-to-r ${cta.color} p-3 rounded-full inline-flex`}>
            <IconComponent className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <div className="flex-1 relative z-10">
          <h3 className="text-2xl font-bold mb-2 group-hover:text-green-400 transition-colors duration-300">
            {cta.title}
          </h3>
          <p className="text-gray-400 mb-4">
            {cta.description}
          </p>
          <motion.div
            className={`inline-block px-6 py-3 rounded-lg bg-gradient-to-r ${cta.color} ${cta.hoverColor} text-white font-bold text-base hover:shadow-lg transition duration-300 relative overflow-hidden group`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Link to={cta.link} className='relative z-10 block h-full w-full'>
              <span>{cta.buttonText}</span>
            </Link>
            <div className={`absolute inset-0 bg-gradient-to-r ${cta.hoverColor.replace('hover:', '')} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default PersonalizedCTA;