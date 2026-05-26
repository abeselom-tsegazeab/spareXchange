import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Award, TrendingUp, Users, Search, Loader2, Sparkles } from "lucide-react";
import TierBadge from "../components/TierBadge";
import { useAuthStore } from "../store/authStore";
// import { useTheme } from "../contexts/ThemeContext";
import toast from "react-hot-toast";
import axios from "axios";

const LeaderboardPage = () => {
    const { user } = useAuthStore();
    // const { darkMode } = useTheme();
    const [leaderboard, setLeaderboard] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [stats, setStats] = useState({
        totalEcoPointsAwarded: 0,
        monthlyGrowth: 0
    });
    const [statsLoading, setStatsLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/users/leaderboard");
                if (response.data.success) {
                    setLeaderboard(response.data.leaderboard);
                } else {
                    toast.error("Failed to load leaderboard");
                }
            } catch (error) {
                console.error("Error fetching leaderboard:", error);
                toast.error("An error occurred while fetching the leaderboard");
            } finally {
                setIsLoading(false);
            }
        };

        const fetchLeaderboardStats = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/users/leaderboard/stats");
                if (response.data.success) {
                    setStats({
                        totalEcoPointsAwarded: response.data.stats.totalEcoPointsAwarded,
                        monthlyGrowth: response.data.stats.monthlyGrowth.percentage
                    });
                }
            } catch (error) {
                console.error("Error fetching leaderboard stats:", error);
                // Use fallback values if stats fail to load
                setStats({
                    totalEcoPointsAwarded: 0,
                    monthlyGrowth: 0
                });
            } finally {
                setStatsLoading(false);
            }
        };

        fetchLeaderboard();
        fetchLeaderboardStats();
    }, []);

    const filteredLeaderboard = leaderboard.filter((u) =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className='min-h-screen bg-white dark:bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 text-gray-900 dark:text-white py-8 px-4'>
            <div className='max-w-4xl mx-auto'>
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='text-center mb-12'
                >
                    <div className='inline-flex items-center justify-center p-3 bg-yellow-100 dark:bg-yellow-500 dark:bg-opacity-10 rounded-2xl mb-4'>
                        <Trophy className='size-10 text-yellow-600 dark:text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]' />
                    </div>
                    <h1 className='text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-600 text-transparent bg-clip-text mb-2'>
                        Eco-Warriors Leaderboard
                    </h1>
                    <p className='text-gray-600 dark:text-gray-400 max-w-md mx-auto'>
                        The top contributors driving sustainability through the SpareXChange ecosystem.
                    </p>
                </motion.div>

                {/* Stats Row */}
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
                    <StatCard 
                        icon={Users} 
                        label='Active Recyclers' 
                        value={statsLoading ? "..." : leaderboard.length + 100 + "+"} 
                    />
                    <StatCard 
                        icon={Award} 
                        label='Eco Points Awarded' 
                        value={statsLoading ? "..." : stats.totalEcoPointsAwarded.toLocaleString()} 
                        color='text-emerald-500' 
                    />
                    <StatCard 
                        icon={TrendingUp} 
                        label='Monthly Growth' 
                        value={statsLoading ? "..." : `${stats.monthlyGrowth >= 0 ? '+' : ''}${stats.monthlyGrowth}%`} 
                        color={stats.monthlyGrowth >= 0 ? 'text-blue-500' : 'text-red-500'} 
                    />
                </div>

                {/* Search Bar */}
                <div className='relative mb-8'>
                    <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                        <Search className='size-5 text-gray-500 dark:text-gray-400' />
                    </div>
                    <input
                        type='text'
                        placeholder='Search eco-warriors...'
                        className='w-full pl-12 pr-4 py-4 bg-gray-200 dark:bg-gray-900 dark:bg-opacity-50 border border-gray-300 dark:border-gray-800 rounded-2xl focus:border-green-500 focus:ring-2 focus:ring-green-500/20 text-gray-900 dark:text-white placeholder-gray-600 dark:placeholder-gray-500 transition-all duration-300'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Leaderboard Table/List */}
                <div className='bg-primary dark:bg-gray-900 dark:bg-opacity-80 backdrop-blur-xl rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden'>
                    {isLoading ? (
                        <div className='flex flex-col items-center justify-center py-24 gap-4'>
                            <Loader2 className='size-10 text-green-500 animate-spin' />
                            <p className='text-gray-600 dark:text-gray-400 animate-pulse'>Fetching top performers...</p>
                        </div>
                    ) : (
                        <div className='overflow-x-auto'>
                            <table className='w-full'>
                                <thead>
                                    <tr className='border-b border-gray-300 dark:border-gray-800 bg-gray-100 dark:bg-gray-800 dark:bg-opacity-30'>
                                        <th className='px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-500 uppercase tracking-widest'>Rank</th>
                                        <th className='px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-500 uppercase tracking-widest'>Eco-Warrior</th>
                                        <th className='px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-500 uppercase tracking-widest hidden md:table-cell'>Tier</th>
                                        <th className='px-6 py-4 text-right text-xs font-bold text-gray-600 dark:text-gray-500 uppercase tracking-widest'>Eco-Points</th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-200 dark:divide-gray-800'>
                                    <AnimatePresence>
                                        {filteredLeaderboard.map((entry, index) => (
                                            <motion.tr
                                                key={entry._id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className={`group transition-colors duration-200 ${entry._id === user?._id ? "bg-green-100 dark:bg-green-500 dark:bg-opacity-5" : "hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:bg-opacity-50"
                                                    }`}
                                            >
                                                <td className='px-6 py-5 whitespace-nowrap italic'>
                                                    <div className='flex items-center gap-2'>
                                                        {index === 0 && <Sparkles className='size-4 text-yellow-500' />}
                                                        <span className={`font-bold ${index < 3 ? "text-yellow-500" : "dark:text-gray-500 text-gray-700"}`}>
                                                            #{index + 1}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className='px-6 py-5 whitespace-nowrap'>
                                                    <div className='flex items-center gap-4'>
                                                        <div className='relative'>
                                                            <img
                                                                src={entry.profilePicture || "/avatar-placeholder.png"}
                                                                className='size-10 rounded-full border-2 border-gray-300 dark:border-gray-700 group-hover:border-green-500 transition-colors'
                                                                alt={entry.name}
                                                            />
                                                            {index < 3 && (
                                                                <div className='absolute -top-1 -right-1 size-4 bg-yellow-500 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center shadow-lg'>
                                                                    <Trophy className='size-2.5 text-black' />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className='flex flex-col'>
                                                            <span className={`font-bold ${entry._id === user?._id ? "text-green-600 dark:text-green-400" : "text-gray-900 dark:text-white"}`}>
                                                                {entry.name} {entry._id === user?._id && "(You)"}
                                                            </span>
                                                            <span className='md:hidden'>
                                                                <TierBadge tier={entry.ecoTier} />
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className='px-6 py-5 whitespace-nowrap hidden md:table-cell'>
                                                    <TierBadge tier={entry.ecoTier} />
                                                </td>
                                                <td className='px-6 py-5 whitespace-nowrap text-right'>
                                                    <span className='font-mono font-bold text-lg text-gray-900 dark:text-white'>
                                                        {entry.ecoPoints.toLocaleString()}
                                                    </span>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                    )}
                    {!isLoading && filteredLeaderboard.length === 0 && (
                        <div className='text-center py-20 text-gray-600 dark:text-gray-500'>
                            No eco-warriors found matching your search.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon: Icon, label, value, color = "text-yellow-500" }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className='bg-primary dark:bg-gray-900 dark:bg-opacity-50 p-6 rounded-2xl border border-gray-200 dark:border-gray-800'
    >
        <Icon className={`size-6 ${color} mb-2`} />
        <div className='text-2xl font-bold text-gray-900 dark:text-white'>{value}</div>
        <div className='text-xs text-gray-600 dark:text-gray-500 uppercase tracking-widest font-bold'>{label}</div>
    </motion.div>
);

export default LeaderboardPage;
