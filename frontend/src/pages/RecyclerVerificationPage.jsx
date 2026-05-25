import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Shield, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Award
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

const RecyclerVerificationPage = () => {
  const { verifyRecyclingByToken } = useAuthStore();
  const [token, setToken] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [verifiedSubmission, setVerifiedSubmission] = useState(null);

  const handleTokenChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setToken(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (token.length !== 6) {
      toast.error("Please enter a valid 6-digit token");
      return;
    }

    setIsVerifying(true);

    try {
      const response = await verifyRecyclingByToken(token);
      setVerifiedSubmission(response.submission);
      setVerificationSuccess(true);
      toast.success("Recycling verified successfully!");
      setToken("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to verify recycling");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleReset = () => {
    setVerificationSuccess(false);
    setVerifiedSubmission(null);
    setToken("");
  };

  if (verificationSuccess && verifiedSubmission) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 bg-opacity-80 backdrop-blur-xl rounded-3xl border border-green-500 border-opacity-50 p-8 shadow-2xl"
          >
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="inline-flex items-center justify-center p-4 bg-green-500 bg-opacity-10 rounded-full mb-4"
              >
                <CheckCircle className="size-16 text-green-500" />
              </motion.div>
              <h2 className="text-3xl font-bold text-white mb-2">Verification Successful!</h2>
              <p className="text-gray-400">
                Eco-points have been awarded to the user.
              </p>
            </div>

            <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 mb-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Item Type</p>
                  <p className="text-white font-semibold capitalize">
                    {verifiedSubmission.itemType.replace('-', ' ')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Points Awarded</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    +{verifiedSubmission.ecoPointsEarned} pts
                  </p>
                </div>
              </div>
              
              <div>
                <p className="text-gray-400 text-sm mb-1">Description</p>
                <p className="text-white">{verifiedSubmission.itemDescription}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Location</p>
                  <p className="text-white">{verifiedSubmission.location}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Status</p>
                  <p className="text-green-400 font-semibold">Approved</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 mb-6 text-center">
              <Award className="size-8 text-white mx-auto mb-2" />
              <p className="text-white font-semibold">
                Achievement Unlocked: "Eco Warrior (First Recycle)"
              </p>
            </div>

            <button
              onClick={handleReset}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-lg transition duration-200"
            >
              Verify Another Submission
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center p-3 bg-blue-500 bg-opacity-10 rounded-2xl mb-4">
            <Shield className="size-10 text-blue-500" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-600 text-transparent bg-clip-text mb-2">
            Verify Recycling
          </h1>
          <p className="text-gray-400 max-w-md mx-auto">
            Enter the 6-digit verification token to approve the recycling submission and award eco-points.
          </p>
        </motion.div>

        {/* Verification Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900 bg-opacity-80 backdrop-blur-xl rounded-3xl border border-gray-800 p-8 shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Token Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-3">
                Verification Token <span className="text-red-500">*</span>
              </label>
              
              <div className="flex justify-center mb-4">
                <input
                  type="text"
                  value={token}
                  onChange={handleTokenChange}
                  placeholder="000000"
                  className="w-64 px-6 py-4 bg-gray-800 bg-opacity-50 border-2 border-gray-700 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white text-center text-4xl font-mono font-bold tracking-widest transition-all"
                  maxLength={6}
                  required
                />
              </div>

              <p className="text-gray-500 text-sm text-center">
                Enter the 6-digit code provided by the user
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-500 bg-opacity-10 border border-blue-500 border-opacity-30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="size-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-300">
                  <p className="font-semibold text-blue-400 mb-1">Verification Process:</p>
                  <ul className="space-y-1 text-gray-400">
                    <li>1. Confirm the item matches the description</li>
                    <li>2. Verify the item condition is acceptable</li>
                    <li>3. Click verify to award eco-points</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isVerifying || token.length !== 6}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-xl transition duration-200 flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="size-5" />
                  Verify & Award Points
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default RecyclerVerificationPage;
