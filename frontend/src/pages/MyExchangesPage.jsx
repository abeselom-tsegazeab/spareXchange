import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useExchangeStore } from "../store/exchangeStore";
import { useAuthStore } from "../store/authStore";
import LoadingSpinner from "../components/LoadingSpinner";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Eye,
  Filter,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const STATUS_CONFIG = {
  pending: { color: "bg-yellow-500", label: "Pending", icon: Clock },
  counter_offered: { color: "bg-orange-500", label: "Counter Offered", icon: AlertTriangle },
  accepted: { color: "bg-blue-500", label: "Accepted", icon: CheckCircle },
  rejected: { color: "bg-red-500", label: "Rejected", icon: XCircle },
  cancelled: { color: "bg-gray-500", label: "Cancelled", icon: XCircle },
  completed_by_buyer: { color: "bg-indigo-500", label: "Completed by Buyer", icon: CheckCircle },
  completed_by_seller: { color: "bg-indigo-500", label: "Completed by Seller", icon: CheckCircle },
  fully_completed: { color: "bg-green-500", label: "Completed", icon: CheckCircle },
  disputed: { color: "bg-red-600", label: "Disputed", icon: AlertTriangle },
  expired: { color: "bg-gray-600", label: "Expired", icon: XCircle }
};

const MyExchangesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { exchanges, getUserExchanges, isLoading, totalExchanges, totalPages, currentPage } = useExchangeStore();
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    fetchExchanges();
  }, [filter, page]);

  const fetchExchanges = async () => {
    const filters = { page, limit };
    if (filter) filters.status = filter;
    await getUserExchanges(filters);
  };

  const handleViewExchange = (exchangeId) => {
    navigate(`/exchange/${exchangeId}`);
  };

  const StatusBadge = ({ status }) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-white ${config.color}`}>
        <Icon size={12} />
        {config.label}
      </span>
    );
  };

  const ExchangeCard = ({ exchange }) => {
    const isBuyer = exchange.buyerId?._id === user?._id;
    const role = isBuyer ? "Buyer" : "Seller";
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-primary dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:border-green-500 transition-all duration-300"
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {exchange.listingId?.title || "Unknown Listing"}
            </h3>
            <StatusBadge status={exchange.status} />
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
            {role}
          </span>
        </div>

        <div className="space-y-2 mb-4 text-sm">
          {exchange.offeredItems && (
            <p className="text-gray-700 dark:text-gray-300">
              <span className="text-gray-500 dark:text-gray-400">Your Offer:</span> {exchange.offeredItems}
            </p>
          )}
          {exchange.meetingDetails?.location && (
            <p className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <MapPin size={14} className="text-green-600 dark:text-green-400" />
              {exchange.meetingDetails.location}
            </p>
          )}
          {exchange.meetingDetails?.time && (
            <p className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Calendar size={14} className="text-green-600 dark:text-green-400" />
              {new Date(exchange.meetingDetails.time).toLocaleDateString()}
            </p>
          )}
          {exchange.disputeStatus === "open" && (
            <p className="text-red-400 flex items-center gap-2 font-semibold">
              <AlertTriangle size={14} />
              Dispute Open
            </p>
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(exchange.createdAt).toLocaleDateString()}
          </span>
          <button
            onClick={() => handleViewExchange(exchange._id)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition duration-300"
          >
            <Eye size={16} />
            View Details
          </button>
        </div>
      </motion.div>
    );
  };

  if (isLoading && exchanges.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">My Exchanges</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your exchange proposals and transactions</p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-4"
        >
          <Filter size={20} className="text-green-600 dark:text-green-400" />
          <select
            value={filter}
            onChange={(e) => { setFilter(e.target.value); setPage(1); }}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-green-500"
          >
            <option value="">All Exchanges</option>
            <option value="pending">Pending</option>
            <option value="counter_offered">Counter Offered</option>
            <option value="accepted">Accepted</option>
            <option value="fully_completed">Completed</option>
            <option value="disputed">Disputed</option>
            <option value="cancelled">Cancelled</option>
            <option value="expired">Expired</option>
          </select>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {totalExchanges} total exchange{totalExchanges !== 1 ? 's' : ''}
          </span>
        </motion.div>

        {/* Exchanges Grid */}
        {exchanges.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">No exchanges found</p>
            <button
              onClick={() => navigate("/marketplace")}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition duration-300"
            >
              Browse Marketplace
            </button>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {exchanges.map((exchange) => (
                <ExchangeCard key={exchange._id} exchange={exchange} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center items-center gap-4"
              >
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white transition"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
                <span className="text-gray-600 dark:text-gray-400">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white transition"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyExchangesPage;
