import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, ShoppingCart, Package, CheckCircle } from "lucide-react";

const SocialProofNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const [visibleNotification, setVisibleNotification] = useState(null);

  // Sample social proof notifications - in a real app, this would come from an API
  const notificationData = [
    {
      id: 1,
      user: "John",
      location: "New York, NY",
      action: "purchased",
      item: "iPhone 12 Pro Max Battery",
      time: "2 minutes ago",
      avatar: "J"
    },
    {
      id: 2,
      user: "Sarah",
      location: "Los Angeles, CA",
      action: "listed",
      item: "Samsung Galaxy S21 Screen",
      time: "5 minutes ago",
      avatar: "S"
    },
    {
      id: 3,
      user: "Michael",
      location: "Chicago, IL",
      action: "exchanged",
      item: "PlayStation 5 Controller",
      time: "7 minutes ago",
      avatar: "M"
    },
    {
      id: 4,
      user: "Emily",
      location: "Houston, TX",
      action: "purchased",
      item: "MacBook Pro Charger",
      time: "12 minutes ago",
      avatar: "E"
    },
    {
      id: 5,
      user: "David",
      location: "Phoenix, AZ",
      action: "listed",
      item: "Nikon D850 Lens",
      time: "15 minutes ago",
      avatar: "D"
    }
  ];

  // Show notifications periodically
  useEffect(() => {
    const showNextNotification = () => {
      const randomIndex = Math.floor(Math.random() * notificationData.length);
      const notification = notificationData[randomIndex];
      setVisibleNotification(notification);
      
      // Hide notification after 5 seconds
      setTimeout(() => {
        setVisibleNotification(null);
      }, 5000);
    };
    
    // Show first notification immediately
    showNextNotification();
    
    // Then show notifications every 15 seconds
    const interval = setInterval(showNextNotification, 15000);
    
    return () => clearInterval(interval);
  }, [notificationData.length]);

  return (
    <AnimatePresence>
      {visibleNotification && (
        <motion.div
          className="fixed bottom-6 right-6 z-50"
          initial={{ opacity: 0, y: 50, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="bg-gray-800 bg-opacity-90 backdrop-filter backdrop-blur-lg rounded-xl p-4 border border-gray-700 shadow-2xl max-w-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold">
                  {visibleNotification.avatar}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center text-sm text-gray-400 mb-1">
                  <CheckCircle className="w-4 h-4 mr-1 text-green-400" />
                  <span>Just now</span>
                </div>
                
                <p className="text-gray-200 text-sm mb-1">
                  <span className="font-bold text-green-400">{visibleNotification.user}</span> from{" "}
                  <span className="font-bold">{visibleNotification.location}</span> {visibleNotification.action} a{" "}
                  <span className="font-bold text-emerald-400">{visibleNotification.item}</span>
                </p>
                
                <div className="flex items-center text-xs text-gray-500 mt-2">
                  <User className="w-3 h-3 mr-1" />
                  <span>Verified Buyer</span>
                </div>
              </div>
              
              <button 
                onClick={() => setVisibleNotification(null)}
                className="flex-shrink-0 ml-2 text-gray-500 hover:text-gray-300 transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SocialProofNotification;