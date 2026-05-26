import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, MapPin, Clock, Package, ShoppingCart, TrendingUp } from "lucide-react";

const ActivityFeed = () => {
  // Sample activity data - in a real app, this would come from an API
  const [activities, setActivities] = useState([
    {
      id: 1,
      type: "purchase",
      user: "Alex Johnson",
      item: "iPhone 13 Pro Battery",
      location: "Austin, TX",
      time: "2 minutes ago",
      avatar: "AJ"
    },
    {
      id: 2,
      type: "listing",
      user: "TechRepair Shop",
      item: "Samsung Galaxy S21 Screen",
      location: "Seattle, WA",
      time: "5 minutes ago",
      avatar: "TS"
    },
    {
      id: 3,
      type: "exchange",
      user: "Maria Garcia",
      item: "PlayStation 5 Controller",
      location: "Miami, FL",
      time: "12 minutes ago",
      avatar: "MG"
    },
    {
      id: 4,
      type: "purchase",
      user: "David Chen",
      item: "MacBook Pro Charger",
      location: "San Francisco, CA",
      time: "18 minutes ago",
      avatar: "DC"
    },
    {
      id: 5,
      type: "listing",
      user: "ElectroFix",
      item: "Nikon D850 Lens",
      location: "Denver, CO",
      time: "25 minutes ago",
      avatar: "EF"
    }
  ]);

  // Icons for different activity types
  const getActivityIcon = (type) => {
    switch (type) {
      case "purchase":
        return <ShoppingCart className="w-4 h-4 text-green-400" />;
      case "listing":
        return <Package className="w-4 h-4 text-blue-400" />;
      case "exchange":
        return <TrendingUp className="w-4 h-4 text-purple-400" />;
      default:
        return <User className="w-4 h-4 text-gray-400" />;
    }
  };

  // Colors for different activity types
  const getActivityColor = (type) => {
    switch (type) {
      case "purchase":
        return "border-l-green-500";
      case "listing":
        return "border-l-blue-500";
      case "exchange":
        return "border-l-purple-500";
      default:
        return "border-l-gray-500";
    }
  };

  // Add a new activity periodically to simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newActivityTypes = ["purchase", "listing", "exchange"];
      const newUserNames = ["John Smith", "Sarah Williams", "Michael Brown", "Emily Davis", "Robert Wilson"];
      const newItemNames = [
        "iPad Air Case", 
        "Canon EOS R5 Battery", 
        "Xbox Series X Controller", 
        "Dell Monitor Stand", 
        "Bose Headphones"
      ];
      const newLocations = [
        "Boston, MA", 
        "Portland, OR", 
        "Atlanta, GA", 
        "Phoenix, AZ", 
        "Nashville, TN"
      ];
      
      const newActivity = {
        id: Date.now(),
        type: newActivityTypes[Math.floor(Math.random() * newActivityTypes.length)],
        user: newUserNames[Math.floor(Math.random() * newUserNames.length)],
        item: newItemNames[Math.floor(Math.random() * newItemNames.length)],
        location: newLocations[Math.floor(Math.random() * newLocations.length)],
        time: "Just now",
        avatar: newUserNames[Math.floor(Math.random() * newUserNames.length)].split(' ').map(n => n[0]).join('')
      };
      
      setActivities(prev => [newActivity, ...prev].slice(0, 5));
    }, 10000); // Add new activity every 10 seconds
    
    return () => clearInterval(interval);
  }, [activities.length]);

  return (
    <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-2xl p-6 border border-gray-700">
      <h3 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
        Live Activity Feed
      </h3>
      
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            className={`flex items-start p-4 bg-gray-900 bg-opacity-50 rounded-lg border-l-4 ${getActivityColor(activity.type)} border-gray-700 hover:bg-opacity-70 transition-all duration-300 group cursor-pointer relative overflow-hidden`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ 
              x: 5,
              boxShadow: '0 5px 15px -5px rgba(0, 0, 0, 0.2)'
            }}
          >
            <div className='absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-lg'></div>
            
            <div className="relative z-10 flex-shrink-0 mr-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold">
                {activity.avatar}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-gray-900 rounded-full p-1">
                {getActivityIcon(activity.type)}
              </div>
            </div>
            
            <div className="flex-1 min-w-0 relative z-10">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-gray-200 truncate group-hover:text-green-400 transition-colors duration-300">
                  {activity.user}
                </h4>
                <span className="text-xs text-gray-500 flex items-center ml-2">
                  <Clock className="w-3 h-3 mr-1" />
                  {activity.time}
                </span>
              </div>
              
              <p className="text-gray-400 text-sm mt-1 truncate">
                {activity.type === "purchase" && "purchased"}
                {activity.type === "listing" && "listed"}
                {activity.type === "exchange" && "exchanged"}
                {" "}{activity.item}
              </p>
              
              <div className="flex items-center text-gray-500 text-xs mt-2">
                <MapPin className="w-3 h-3 mr-1" />
                <span className="truncate">{activity.location}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-gray-400 text-sm">
          Real-time updates of transactions happening across our platform
        </p>
      </div>
    </div>
  );
};

export default ActivityFeed;