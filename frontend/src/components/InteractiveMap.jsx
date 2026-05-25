import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const InteractiveMap = () => {
  // Sample user location data - in a real app, this would come from an API
  const [userLocations, setUserLocations] = useState([
    { id: 1, city: "New York", lat: 40.7128, lng: -74.0060, density: 85 },
    { id: 2, city: "Los Angeles", lat: 34.0522, lng: -118.2437, density: 72 },
    { id: 3, city: "Chicago", lat: 41.8781, lng: -87.6298, density: 68 },
    { id: 4, city: "Houston", lat: 29.7604, lng: -95.3698, density: 55 },
    { id: 5, city: "Phoenix", lat: 33.4484, lng: -112.0740, density: 45 },
    { id: 6, city: "Philadelphia", lat: 39.9526, lng: -75.1652, density: 62 },
    { id: 7, city: "San Antonio", lat: 29.4241, lng: -98.4936, density: 48 },
    { id: 8, city: "San Diego", lat: 32.7157, lng: -117.1611, density: 58 },
    { id: 9, city: "Dallas", lat: 32.7767, lng: -96.7970, density: 52 },
    { id: 10, city: "San Jose", lat: 37.3382, lng: -121.8863, density: 65 },
  ]);

  // Calculate position based on lat/lng for a simple 2D representation
  const calculatePosition = (lat, lng) => {
    // Simple conversion for demonstration purposes
    // In a real app, you'd use a proper map projection library
    const x = ((lng + 180) / 360) * 100;
    const y = ((90 - lat) / 180) * 100;
    return { x, y };
  };

  // Get dot size based on density
  const getDotSize = (density) => {
    if (density >= 80) return "w-6 h-6";
    if (density >= 60) return "w-5 h-5";
    if (density >= 40) return "w-4 h-4";
    return "w-3 h-3";
  };

  // Get dot color based on density
  const getDotColor = (density) => {
    if (density >= 80) return "bg-green-500";
    if (density >= 60) return "bg-green-400";
    if (density >= 40) return "bg-green-300";
    return "bg-green-200";
  };

  return (
    <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-2xl p-6 border border-gray-700">
      <h3 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
        User Activity Map
      </h3>
      
      <div className="relative w-full h-80 bg-gray-900 rounded-xl overflow-hidden border border-gray-700">
        {/* Simple world map outline */}
        <div className="absolute inset-4 border border-gray-600 rounded-lg">
          {/* Continents representation */}
          <div className="absolute top-1/4 left-1/4 w-1/3 h-1/3 bg-gray-700 rounded-full opacity-30"></div>
          <div className="absolute top-1/3 right-1/4 w-1/4 h-1/4 bg-gray-700 rounded-full opacity-30"></div>
        </div>
        
        {/* User location dots */}
        {userLocations.map((location, index) => {
          const position = calculatePosition(location.lat, location.lng);
          const dotSize = getDotSize(location.density);
          const dotColor = getDotColor(location.density);
          
          return (
            <motion.div
              key={location.id}
              className={`absolute ${dotSize} ${dotColor} rounded-full cursor-pointer group`}
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.1,
                type: "spring",
                stiffness: 300
              }}
              whileHover={{ 
                scale: 1.5,
                zIndex: 10
              }}
              whileTap={{ scale: 1.2 }}
            >
              <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20"></div>
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 bg-opacity-90 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                {location.city}: {location.density} users
              </div>
            </motion.div>
          );
        })}
        
        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-gray-800 bg-opacity-80 rounded-lg p-3 text-xs">
          <div className="font-bold text-gray-300 mb-2">User Density</div>
          <div className="flex items-center mb-1">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-gray-400">High (80+)</span>
          </div>
          <div className="flex items-center mb-1">
            <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
            <span className="text-gray-400">Medium (60-79)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-300 rounded-full mr-2"></div>
            <span className="text-gray-400">Low (40-59)</span>
          </div>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-gray-400 text-sm">
          Real-time visualization of user activity across different regions
        </p>
      </div>
    </div>
  );
};

export default InteractiveMap;