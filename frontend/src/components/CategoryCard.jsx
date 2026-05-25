import { motion } from "framer-motion";
import { Car, Cpu, Smartphone, Gamepad2, Camera, Watch, Headphones, Laptop } from "lucide-react";

const CategoryCard = ({ category, index }) => {
  const icons = {
    "Automotive": Car,
    "Electronics": Cpu,
    "Mobile Devices": Smartphone,
    "Gaming": Gamepad2,
    "Cameras": Camera,
    "Wearables": Watch,
    "Audio": Headphones,
    "Computers": Laptop
  };

  const IconComponent = icons[category.name] || Cpu;

  return (
    <motion.div
      className={`dark:bg-white dark:text-black bg-primary text-white backdrop-filter backdrop-blur-lg rounded-2xl p-6 border border-gray-700 hover:border-green-500 transition duration-300 group cursor-pointer relative overflow-hidden`}
      // initial={{ opacity: 0, y: 20 }}
      // whileInView={{ opacity: 1, y: 0 }}
      // viewport={{ once: true }}
      // transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{
        y: -10,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        borderColor: '#10b981'
      }}
      whileTap={{ scale: 0.98 }}
    // transition={{ duration: 0.5, delay: index * 0.1, type: "spring", stiffness: 300 }}
    >
      <div className='absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl'></div>
      <div className="flex flex-col items-center text-center relative z-10">
        <div className="bg-white  dark:bg-primary rounded-full p-4 mb-4 group-hover:bg-green-500 group-hover:scale-110 transition-all duration-300">
          <IconComponent className="w-8 h-8 text-green-400 group-hover:text-white transition-colors duration-300" />
        </div>
        <h3 className="text-xl mb-2 group-hover:text-green-400 transition-colors duration-300">{category.name}</h3>
        <p className=" text-sm group-hover:text-gray-300 transition-colors duration-300">{category.count}+ parts</p>
      </div>
    </motion.div>
  );
};

export default CategoryCard;