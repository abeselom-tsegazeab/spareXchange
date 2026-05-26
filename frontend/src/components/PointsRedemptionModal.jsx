import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Gift, 
  X, 
  Trophy,
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

const PointsRedemptionModal = ({ isOpen, onClose }) => {
  const { user, redeemPoints } = useAuthStore();
  const [points, setPoints] = useState("");
  const [rewardDescription, setRewardDescription] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redemptionSuccess, setRedemptionSuccess] = useState(false);

  const presetRewards = [
    { points: 50, description: "5% Discount on next Technician Fee" },
    { points: 100, description: "10% Discount on next Technician Fee" },
    { points: 200, description: "Free Basic Vehicle Inspection" },
    { points: 500, description: "Premium Listing Boost for 30 days" },
    { points: 1000, description: "Exclusive Gaia Tier Badge" }
  ];

  const handlePresetSelect = (preset) => {
    setPoints(preset.points.toString());
    setRewardDescription(preset.description);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const pointsToRedeem = parseInt(points);

    if (!pointsToRedeem || pointsToRedeem <= 0) {
      toast.error("Please enter a valid points amount");
      return;
    }

    if (pointsToRedeem > user.ecoPoints) {
      toast.error("Insufficient eco-points");
      return;
    }

    if (!rewardDescription.trim()) {
      toast.error("Please describe the reward you want to redeem");
      return;
    }

    if (user.roleStatus !== "verified") {
      toast.error("Only verified users can redeem points");
      return;
    }

    setIsRedeeming(true);

    try {
      await redeemPoints(pointsToRedeem, rewardDescription);
      setRedemptionSuccess(true);
      toast.success("Points redeemed successfully!");
      
      setTimeout(() => {
        setRedemptionSuccess(false);
        setPoints("");
        setRewardDescription("");
        onClose();
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to redeem points");
    } finally {
      setIsRedeeming(false);
    }
  };

  const maxRedeemable = user.ecoPoints || 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-gray-900 bg-opacity-95 backdrop-blur-xl rounded-3xl border border-gray-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              {/* Header */}
              <div className="sticky top-0 bg-gray-900 bg-opacity-95 backdrop-blur-xl border-b border-gray-800 p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500 bg-opacity-10 rounded-xl">
                    <Gift className="size-6 text-purple-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Redeem Eco-Points</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-800 rounded-lg transition"
                >
                  <X className="size-5 text-gray-400" />
                </button>
              </div>

              {redemptionSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-12 text-center"
                >
                  <CheckCircle className="size-20 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">Redemption Successful!</h3>
                  <p className="text-gray-400">
                    Your points have been redeemed. Enjoy your reward!
                  </p>
                </motion.div>
              ) : (
                <div className="p-6 space-y-6">
                  {/* User's Points Balance */}
                  <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-6 text-center">
                    <Trophy className="size-8 text-white mx-auto mb-2" />
                    <p className="text-white text-sm font-semibold mb-1">Your Balance</p>
                    <p className="text-4xl font-bold text-white">{user.ecoPoints || 0}</p>
                    <p className="text-white text-sm">Eco-Points Available</p>
                  </div>

                  {/* Warning if not verified */}
                  {user.roleStatus !== "verified" && (
                    <div className="bg-red-500 bg-opacity-10 border border-red-500 border-opacity-30 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="size-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-gray-300">
                          <p className="font-semibold text-red-400 mb-1">Verification Required</p>
                          <p className="text-gray-400">
                            You need to be a verified user to redeem points. Please complete the verification process.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Preset Rewards */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">Quick Select Rewards</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {presetRewards.map((preset, index) => (
                        <button
                          key={index}
                          onClick={() => handlePresetSelect(preset)}
                          disabled={user.roleStatus !== "verified" || preset.points > maxRedeemable}
                          className="p-4 bg-gray-800 bg-opacity-50 border border-gray-700 rounded-xl hover:border-purple-500 hover:bg-opacity-80 transition disabled:opacity-50 disabled:cursor-not-allowed text-left"
                        >
                          <p className="text-purple-400 font-bold text-lg mb-1">
                            {preset.points} pts
                          </p>
                          <p className="text-gray-400 text-sm">
                            {preset.description}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Redemption Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Points to Redeem
                      </label>
                      <input
                        type="number"
                        value={points}
                        onChange={(e) => setPoints(e.target.value)}
                        placeholder="Enter points amount"
                        className="w-full px-4 py-3 bg-gray-800 bg-opacity-50 border border-gray-700 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white transition-all"
                        min="1"
                        max={maxRedeemable}
                        required
                      />
                      <p className="text-gray-500 text-xs mt-1">
                        Maximum: {maxRedeemable} points
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Reward Description
                      </label>
                      <textarea
                        value={rewardDescription}
                        onChange={(e) => setRewardDescription(e.target.value)}
                        placeholder="Describe the reward you want to redeem..."
                        className="w-full px-4 py-3 bg-gray-800 bg-opacity-50 border border-gray-700 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white transition-all resize-none"
                        rows="3"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isRedeeming || user.roleStatus !== "verified" || maxRedeemable === 0}
                      className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-xl transition duration-200 flex items-center justify-center gap-2"
                    >
                      {isRedeeming ? (
                        <>
                          <Loader2 className="size-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Gift className="size-5" />
                          Redeem Points
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PointsRedemptionModal;
