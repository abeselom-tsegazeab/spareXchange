import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Recycle, 
  Filter, 
  Calendar, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  Clock,
  Loader2,
  Eye,
  Trophy
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

const STATUS_CONFIG = {
  pending: { 
    color: "text-yellow-500", 
    bg: "bg-yellow-500 bg-opacity-10", 
    border: "border-yellow-500",
    icon: Clock,
    label: "Pending" 
  },
  approved: { 
    color: "text-green-500", 
    bg: "bg-green-500 bg-opacity-10", 
    border: "border-green-500",
    icon: CheckCircle,
    label: "Approved" 
  },
  rejected: { 
    color: "text-red-500", 
    bg: "bg-red-500 bg-opacity-10", 
    border: "border-red-500",
    icon: XCircle,
    label: "Rejected" 
  },
  completed: { 
    color: "text-blue-500", 
    bg: "bg-blue-500 bg-opacity-10", 
    border: "border-blue-500",
    icon: CheckCircle,
    label: "Completed" 
  }
};

const ITEM_TYPE_LABELS = {
  electronics: "Electronics",
  "vehicle-parts": "Vehicle Parts",
  "mobile-devices": "Mobile Devices",
  computers: "Computers",
  batteries: "Batteries",
  appliances: "Appliances",
  plastic: "Plastic",
  metal: "Metal",
  other: "Other"
};

const MySubmissionsPage = () => {
  const { user, getUserRecyclingSubmissions } = useAuthStore();
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await getUserRecyclingSubmissions();
      if (response.success) {
        setSubmissions(response.submissions);
      } else {
        toast.error("Failed to load submissions");
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast.error("An error occurred while fetching submissions");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSubmissions = filterStatus === "all" 
    ? submissions 
    : submissions.filter(s => s.status === filterStatus);

  const totalPoints = submissions
    .filter(s => s.status === "approved" || s.status === "completed")
    .reduce((sum, s) => sum + s.ecoPointsEarned, 0);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center p-3 bg-green-500 bg-opacity-10 rounded-2xl mb-4">
            <Recycle className="size-10 text-green-500" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 text-transparent bg-clip-text mb-2">
            My Recycling Submissions
          </h1>
          <p className="text-gray-400 max-w-md mx-auto">
            Track your recycling history and earned eco-points.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900 bg-opacity-80 backdrop-blur-xl rounded-2xl border border-gray-800 p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <Recycle className="size-8 text-green-500" />
              <span className="text-3xl font-bold text-white">{submissions.length}</span>
            </div>
            <p className="text-gray-400 text-sm font-semibold">Total Submissions</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900 bg-opacity-80 backdrop-blur-xl rounded-2xl border border-gray-800 p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <Trophy className="size-8 text-yellow-500" />
              <span className="text-3xl font-bold text-emerald-400">{totalPoints}</span>
            </div>
            <p className="text-gray-400 text-sm font-semibold">Points Earned</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900 bg-opacity-80 backdrop-blur-xl rounded-2xl border border-gray-800 p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="size-8 text-blue-500" />
              <span className="text-3xl font-bold text-white">
                {submissions.filter(s => s.status === "approved" || s.status === "completed").length}
              </span>
            </div>
            <p className="text-gray-400 text-sm font-semibold">Successful Recycles</p>
          </motion.div>
        </div>

        {/* Filter Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-900 bg-opacity-80 backdrop-blur-xl rounded-2xl border border-gray-800 p-4 mb-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <Filter className="size-5 text-gray-400" />
            <span className="text-sm font-semibold text-gray-300">Filter by Status:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {["all", "pending", "approved", "rejected", "completed"].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  filterStatus === status
                    ? "bg-green-500 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                {status === "all" ? "All" : STATUS_CONFIG[status]?.label || status}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Submissions List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="size-10 text-green-500 animate-spin" />
              <p className="text-gray-400 animate-pulse">Loading your submissions...</p>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gray-900 bg-opacity-80 backdrop-blur-xl rounded-2xl border border-gray-800 p-12 text-center"
            >
              <Recycle className="size-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No submissions found</h3>
              <p className="text-gray-400">
                {filterStatus === "all" 
                  ? "Start recycling and earn eco-points!" 
                  : `No ${filterStatus} submissions yet.`}
              </p>
            </motion.div>
          ) : (
            <AnimatePresence>
              {filteredSubmissions.map((submission, index) => {
                const statusConfig = STATUS_CONFIG[submission.status];
                const StatusIcon = statusConfig.icon;

                return (
                  <motion.div
                    key={submission._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`bg-gray-900 bg-opacity-80 backdrop-blur-xl rounded-2xl border ${statusConfig.border} border-opacity-30 p-6 hover:border-opacity-60 transition-all`}
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      {/* Left: Item Info */}
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`p-2 rounded-lg ${statusConfig.bg}`}>
                            <StatusIcon className={`size-5 ${statusConfig.color}`} />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-white mb-1">
                              {ITEM_TYPE_LABELS[submission.itemType] || submission.itemType}
                            </h3>
                            <p className="text-gray-400 text-sm mb-2">
                              {submission.itemDescription}
                            </p>
                          </div>
                        </div>

                        {/* Meta Info */}
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="size-4" />
                            {formatDate(submission.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="size-4" />
                            {submission.location}
                          </span>
                          {submission.estimatedWeight && (
                            <span>{submission.estimatedWeight} kg</span>
                          )}
                          {submission.estimatedValue && (
                            <span>${submission.estimatedValue}</span>
                          )}
                        </div>

                        {/* Notes */}
                        {submission.notes && (
                          <p className="text-gray-500 text-sm mt-2 italic">
                            Note: {submission.notes}
                          </p>
                        )}
                      </div>

                      {/* Right: Status & Points */}
                      <div className="flex md:flex-col items-center md:items-end gap-4">
                        <div className={`px-4 py-2 rounded-lg ${statusConfig.bg} border ${statusConfig.border}`}>
                          <span className={`font-bold ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-400 text-xs">Points Earned</p>
                          <p className="text-2xl font-bold text-emerald-400">
                            +{submission.ecoPointsEarned}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Verification Token (for pending) */}
                    {submission.status === "pending" && submission.verificationToken && (
                      <div className="mt-4 pt-4 border-t border-gray-800">
                        <div className="flex items-center gap-2">
                          <Eye className="size-4 text-yellow-500" />
                          <span className="text-gray-400 text-sm">Verification Token:</span>
                          <span className="font-mono font-bold text-yellow-400">
                            {submission.verificationToken}
                          </span>
                        </div>
                        <p className="text-gray-500 text-xs mt-1">
                          Share this token with the recycler to verify your submission.
                        </p>
                      </div>
                    )}

                    {/* Verification Info (for approved/completed) */}
                    {(submission.status === "approved" || submission.status === "completed") && submission.verifiedAt && (
                      <div className="mt-4 pt-4 border-t border-gray-800">
                        <p className="text-gray-500 text-xs">
                          Verified on {formatDate(submission.verifiedAt)}
                          {submission.isVerifiedByRecycler && " by Recycler"}
                        </p>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};

export default MySubmissionsPage;
