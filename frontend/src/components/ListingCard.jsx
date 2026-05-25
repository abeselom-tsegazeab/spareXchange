import { motion } from "framer-motion";
import { User, MapPin, Clock } from "lucide-react";

const ListingCard = ({ listing, index }) => {
  return (
    <motion.div
      key={index}
      className="dark:bg-white dark:text-primary bg-primary backdrop-filter backdrop-blur-lg rounded-2xl p-4 border border-gray-700 hover:border-green-500 transition duration-300 group cursor-pointer relative overflow-hidden"
      // initial={{ opacity: 0, y: 20 }}
      // whileInView={{ opacity: 1, y: 0 }}
      // viewport={{ once: true }}
      // transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{
        y: -5,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        borderColor: '#10b981'
      }}
      whileTap={{ scale: 0.98 }}
    // transition={{ type: "spring", stiffness: 300 }}
    >
      <div className='absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl'></div>
      <div className="flex items-start mb-3 relative z-10">
        <div className="bg-primary rounded-lg w-16 h-16 flex items-center justify-center mr-3 flex-shrink-0 group-hover:bg-gray-600 transition-colors duration-300">
          <div className="bg-white rounded w-10 h-10 group-hover:bg-gray-500 transition-colors duration-300 flex items-center justify-center">{listing.icon}</div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg truncate group-hover:text-green-400 transition-colors duration-300">{listing.title}</h3>
          <div className="flex items-center text-white dark:text-black text-sm mt-1">
            <MapPin size={14} className="mr-1 group-hover:text-green-400 transition-colors duration-300" />
            <span className="truncate group-hover:text-green-300 transition-colors duration-300">{listing.location}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-3 relative z-10">
        <span className="text-black font-bold text-lg group-hover:text-green-300 transition-colors duration-300">${listing.price}</span>
        <span className="text-white dark:text-black text-sm group-hover:text-gray-300 transition-colors duration-300">{listing.condition}</span>
      </div>

      <div className="flex justify-between items-center text-gray-400 text-sm relative z-10">
        <div className="flex items-center text-white dark:text-black">
          <User size={14} className="mr-1 group-hover:text-green-400 transition-colors duration-300" />
          <span className="group-hover:text-green-300 transition-colors duration-300">{listing.seller}</span>
        </div>
        <div className="flex items-center text-white dark:text-black">
          <Clock size={14} className="mr-1 group-hover:text-green-400 transition-colors duration-300" />
          <span className="group-hover:text-green-300 transition-colors duration-300">{listing.timeAgo}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ListingCard;