import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Trophy, Award, Star, Crown, CheckCircle, XCircle, 
  TrendingUp, Users, RotateCcw, Lock, Unlock
} from "lucide-react";
import { useCommunityStore } from "../store/communityStore";
import toast from "react-hot-toast";

const AchievementsPage = () => {
  const { 
    userAchievements,
    achievementDefinitions,
    achievementLeaderboard,
    loadingAchievements,
    getAchievementDefinitions,
    getUserAchievements,
    checkAndUnlockAchievements,
    getAchievementLeaderboard
  } = useCommunityStore();

  const [activeTab, setActiveTab] = useState("my-achievements");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      getAchievementDefinitions(),
      getUserAchievements(),
      getAchievementLeaderboard(10)
    ]);
  };

  const handleCheckAchievements = async () => {
    try {
      const result = await checkAndUnlockAchievements();
      if (result.unlocked && result.unlocked.length > 0) {
        toast.success(`🎉 Congratulations! You unlocked ${result.unlocked.length} new achievement(s)!`);
      } else {
        toast.success("Achievements checked! No new achievements to unlock.");
      }
    } catch (error) {
      toast.error("Failed to check achievements");
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "listing": return <Trophy size={20} />;
      case "exchange": return <Users size={20} />;
      case "review": return <Star size={20} />;
      case "recycling": return <Award size={20} />;
      case "eco_points": return <TrendingUp size={20} />;
      case "community": return <Crown size={20} />;
      default: return <Award size={20} />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "listing": return "from-blue-500 to-blue-600";
      case "exchange": return "from-green-500 to-green-600";
      case "review": return "from-yellow-500 to-yellow-600";
      case "recycling": return "from-purple-500 to-purple-600";
      case "eco_points": return "from-pink-500 to-pink-600";
      case "community": return "from-indigo-500 to-indigo-600";
      default: return "from-gray-500 to-gray-600";
    }
  };

  const filteredAchievements = (achievements) => {
    if (selectedCategory === "all") return achievements;
    return achievements.filter(a => a.category === selectedCategory);
  };

  const categories = [
    { id: "all", name: "All", icon: <Award size={16} /> },
    { id: "listing", name: "Listings", icon: <Trophy size={16} /> },
    { id: "exchange", name: "Exchanges", icon: <Users size={16} /> },
    { id: "review", name: "Reviews", icon: <Star size={16} /> },
    { id: "recycling", name: "Recycling", icon: <Award size={16} /> },
    { id: "eco_points", name: "Eco Points", icon: <TrendingUp size={16} /> },
    { id: "community", name: "Community", icon: <Crown size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 text-gray-900 dark:text-white">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                  <Trophy className="text-yellow-400" size={40} />
                  Achievements & Badges
                </h1>
                <p className="text-gray-600 dark:text-gray-300">Track your progress and unlock new achievements</p>
              </div>
              <button
                onClick={handleCheckAchievements}
                disabled={loadingAchievements}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 transition duration-300 disabled:opacity-50"
              >
                <RotateCcw size={18} />
                {loadingAchievements ? "Checking..." : "Check Achievements"}
              </button>
            </div>

            {/* Stats Summary */}
            {userAchievements?.stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-primary dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Unlocked</span>
                    <CheckCircle className="text-green-400" size={24} />
                  </div>
                  <div className="text-3xl font-bold text-background dark:text-green-400">
                    {userAchievements.stats.totalUnlocked}
                  </div>
                </div>
                <div className="bg-primary dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Locked</span>
                    <Lock className="text-gray-500 dark:text-gray-400" size={24} />
                  </div>
                  <div className="text-3xl font-bold text-gray-700 dark:text-gray-400">
                    {userAchievements.stats.totalLocked}
                  </div>
                </div>
                <div className="bg-primary dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Completion</span>
                    <TrendingUp className="text-blue-400" size={24} />
                  </div>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {userAchievements.stats.completionPercentage}%
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${userAchievements.stats.completionPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-300 dark:border-gray-700">
            <button
              onClick={() => setActiveTab("my-achievements")}
              className={`px-6 py-3 rounded-t-lg transition duration-300 ${
                activeTab === "my-achievements"
                  ? "bg-gray-100 dark:bg-gray-800 text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              My Achievements
            </button>
            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`px-6 py-3 rounded-t-lg transition duration-300 ${
                activeTab === "leaderboard"
                  ? "bg-gray-100 dark:bg-gray-800 text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              Leaderboard
            </button>
          </div>

          {/* My Achievements Tab */}
          {activeTab === "my-achievements" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2 mb-6">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition duration-300 ${
                      selectedCategory === cat.id
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    {cat.icon}
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Unlocked Achievements */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <CheckCircle className="text-green-400" />
                  Unlocked Achievements
                </h2>
                {userAchievements?.unlocked && filteredAchievements(userAchievements.unlocked).length === 0 ? (
                  <div className="bg-primary dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
                    <Award size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                    <h3 className="text-xl font-bold mb-2">No unlocked achievements yet</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Start engaging with the community to unlock your first achievements!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userAchievements?.unlocked && 
                      filteredAchievements(userAchievements.unlocked).map((achievement) => (
                        <motion.div
                          key={achievement.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-primary dark:bg-gray-800 rounded-xl p-6 border-2 border-green-600 dark:border-green-600 hover:border-green-400 transition duration-300"
                        >
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-lg bg-gradient-to-r ${getCategoryColor(achievement.category)}`}>
                              <span className="text-3xl">{achievement.icon}</span>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-lg mb-1 text-gray-900 dark:text-white">{achievement.name}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{achievement.description}</p>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 bg-gradient-to-r ${getCategoryColor(achievement.category)} rounded-full text-xs font-bold`}>
                                  {achievement.category ? achievement.category.replace("_", " ") : "General"}
                                </span>
                                <span className="flex items-center gap-1 text-green-400 text-xs">
                                  <Unlock size={12} />
                                  Unlocked
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    }
                  </div>
                )}
              </div>

              {/* Locked Achievements */}
              <div>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Lock className="text-gray-400" />
                  Locked Achievements
                </h2>
                {userAchievements?.locked && filteredAchievements(userAchievements.locked).length === 0 ? (
                  <div className="bg-primary dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
                    <Crown size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                    <h3 className="text-xl font-bold mb-2">All achievements unlocked!</h3>
                    <p className="text-gray-600 dark:text-gray-400">Congratulations! You're a true champion!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userAchievements?.locked && 
                      filteredAchievements(userAchievements.locked).map((achievement) => (
                        <motion.div
                          key={achievement.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-primary dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 opacity-75 hover:opacity-100 transition duration-300"
                        >
                          <div className="flex items-start gap-4">
                            <div className="p-3 rounded-lg bg-gray-200 dark:bg-gray-700">
                              <span className="text-3xl grayscale">{achievement.icon}</span>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-lg mb-1 text-gray-900 dark:text-white">{achievement.name}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{achievement.description}</p>
                              <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                  <span className="text-gray-600 dark:text-gray-400">Progress</span>
                                  <span className="text-gray-700 dark:text-gray-300">{achievement.progress || 0}%</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                  <div
                                    className={`bg-gradient-to-r ${getCategoryColor(achievement.category)} h-2 rounded-full transition-all duration-500`}
                                    style={{ width: `${achievement.progress || 0}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    }
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Leaderboard Tab */}
          {activeTab === "leaderboard" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="bg-primary dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Crown className="text-yellow-400" />
                  Achievement Leaderboard
                </h2>
                
                {achievementLeaderboard.length === 0 ? (
                  <div className="text-center py-12">
                    <Users size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">No leaderboard data yet</h3>
                    <p className="text-gray-600 dark:text-gray-400">Be the first to climb the leaderboard!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {achievementLeaderboard.map((user, index) => (
                      <motion.div
                        key={user.userId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`bg-gray-100 dark:bg-gray-700 rounded-lg p-4 flex items-center gap-4 ${
                          index < 3 ? "border-2 border-yellow-600" : "border border-gray-200 dark:border-gray-600"
                        }`}
                      >
                        <div className={`text-3xl font-bold w-12 text-center ${
                          index === 0 ? "text-yellow-400" :
                          index === 1 ? "text-gray-300" :
                          index === 2 ? "text-orange-400" :
                          "text-gray-400"
                        }`}>
                          #{index + 1}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white">{user.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <span>{user.achievementsCount} achievements</span>
                            <span>•</span>
                            <span>{user.ecoPoints} eco points</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className={`px-3 py-1 bg-gradient-to-r ${
                            user.ecoTier === "Gold" ? "from-yellow-500 to-yellow-600" :
                            user.ecoTier === "Silver" ? "from-gray-400 to-gray-500" :
                            user.ecoTier === "Bronze" ? "from-orange-600 to-orange-700" :
                            "from-green-500 to-emerald-600"
                          } rounded-full text-white text-sm font-bold`}>
                            {user.ecoTier || "Bronze"}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AchievementsPage;
