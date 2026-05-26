import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { 
  AlertTriangle, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Ban, 
  MessageSquare,
  Trash2,
  FileText,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useDisputeStore } from "../store/disputeStore";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";

const DisputeManagement = () => {
  const { 
    getDisputes, 
    getDisputeById, 
    updateDisputeStatus, 
    deleteDispute,
    getDisputeStats,
    disputes,
    selectedDispute,
    disputeStats,
    disputesPagination,
    isLoading
  } = useDisputeStore();

  const [filters, setFilters] = useState({ page: 1, limit: 20 });
  const [showModeratorModal, setShowModeratorModal] = useState(false);
  const [moderatorNote, setModeratorNote] = useState("");
  const [selectedAction, setSelectedAction] = useState(null);
  const [currentDisputeId, setCurrentDisputeId] = useState(null);

  useEffect(() => {
    loadDisputes();
    loadDisputeStats();
  }, [filters]);

  const loadDisputes = async () => {
    try {
      await getDisputes(filters);
    } catch (error) {
      toast.error("Failed to load disputes");
    }
  };

  const loadDisputeStats = async () => {
    try {
      await getDisputeStats();
    } catch (error) {
      console.error("Failed to load dispute stats");
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleViewDispute = async (disputeId) => {
    try {
      await getDisputeById(disputeId);
    } catch (error) {
      toast.error("Failed to load dispute details");
    }
  };

  const handleActionClick = (disputeId, action) => {
    setCurrentDisputeId(disputeId);
    setSelectedAction(action);
    setModeratorNote("");
    setShowModeratorModal(true);
  };

  const handleConfirmAction = async () => {
    if (!moderatorNote.trim()) {
      toast.error("Admin note is required");
      return;
    }

    try {
      // Get the current dispute data
      const currentDispute = selectedDispute || disputes.find(d => d._id === currentDisputeId);
      
      const statusMap = {
        resolve: "resolved",
        dismiss: "dismissed",
        review: "under_review",
        warn_user: "resolved",
        ban_user: "resolved",
        remove_listing: "resolved",
        cancel_exchange: "resolved",
        edit_listing: "resolved"
      };

      const actionMap = {
        resolve: "none",
        dismiss: "none",
        review: "none",
        warn_user: "warn_user",
        ban_user: "ban_user",
        remove_listing: "remove_listing",
        cancel_exchange: "cancel_exchange",
        edit_listing: "edit_listing"
      };

      // Update dispute status
      await updateDisputeStatus(currentDisputeId, {
        status: statusMap[selectedAction] || "resolved",
        adminNote: moderatorNote,
        action: actionMap[selectedAction]
      });

      // Perform additional actions based on type
      if (selectedAction === "ban_user" && currentDispute?.targetId?._id) {
        // Ban the user
        await axios.patch(
          `http://localhost:5000/api/admin/users/${currentDispute.targetId._id}/ban`,
          { isBanned: true },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        toast.success(`User ${currentDispute.targetId.name} has been banned`);
      } else if (selectedAction === "warn_user" && currentDispute?.targetId?._id) {
        // Send warning notification to user
        await axios.post(
          `http://localhost:5000/api/notifications`,
          {
            userId: currentDispute.targetId._id,
            title: "⚠️ Warning from Admin",
            message: `You have received a warning regarding a dispute. Admin note: ${moderatorNote}`,
            type: "warning",
            link: `/profile`
          },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        toast.success(`Warning sent to ${currentDispute.targetId.name}`);
      } else if (selectedAction === "remove_listing" && currentDispute?.listingId?._id) {
        // Remove the listing
        await axios.delete(
          `http://localhost:5000/api/listings/${currentDispute.listingId._id}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        toast.success("Listing has been removed");
      } else if (selectedAction === "cancel_exchange" && currentDispute?.exchangeId?._id) {
        // Cancel the exchange
        await axios.patch(
          `http://localhost:5000/api/exchanges/${currentDispute.exchangeId._id}`,
          { status: "cancelled" },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        toast.success("Exchange has been cancelled");
      } else if (selectedAction === "edit_listing" && currentDispute?.listingId?._id) {
        toast.success("Listing marked for editing. Please edit manually in listing management.");
      } else {
        toast.success(`Dispute ${selectedAction.replace("_", " ")} successfully`);
      }

      setShowModeratorModal(false);
      loadDisputes();
      loadDisputeStats();
    } catch (error) {
      console.error("Action error:", error);
      toast.error(error.response?.data?.message || "Failed to perform action");
    }
  };

  const handleDeleteDispute = async (disputeId) => {
    if (!window.confirm("Are you sure you want to delete this dispute?")) {
      return;
    }

    try {
      await deleteDispute(disputeId);
      toast.success("Dispute deleted successfully");
      loadDisputes();
      loadDisputeStats();
    } catch (error) {
      toast.error("Failed to delete dispute");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-900/50 text-yellow-400 border-yellow-700",
      under_review: "bg-blue-900/50 text-blue-400 border-blue-700",
      resolved: "bg-green-900/50 text-green-400 border-green-700",
      dismissed: "bg-gray-900/50 text-gray-400 border-gray-700"
    };
    return colors[status] || colors.pending;
  };

  const getReasonLabel = (reason) => {
    const labels = {
      not_as_described: "Item not as described",
      no_show: "User didn't show up",
      harassment: "Harassment or inappropriate behavior",
      scam: "Suspected scam or fraud",
      other: "Other"
    };
    return labels[reason] || reason;
  };

  if (isLoading && disputes.length === 0) {
    return <LoadingSpinner />;
  }

  if (selectedDispute) {
    return (
      <DisputeDetail 
        dispute={selectedDispute}
        onBack={() => useDisputeStore.getState().clearSelectedDispute()}
        onAction={handleActionClick}
        onDelete={handleDeleteDispute}
      />
    );
  }

  return (
    <div className='min-h-screen bg-white dark:bg-gradient-to-b from-gray-900 via-green-900 to-emerald-900 text-gray-900 dark:text-white py-8'>
      <div className='container mx-auto px-4 max-w-7xl'>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className='mb-8'
        >
          <h1 className='text-4xl font-bold mb-2 flex items-center'>
            <AlertTriangle size={40} className='mr-3 text-red-600 dark:text-red-400' />
            Dispute Management
          </h1>
          <p className='text-gray-600 dark:text-gray-400'>Manage user disputes and reports</p>
        </motion.div>

        {/* Stats Overview */}
        {disputeStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='mb-6 grid grid-cols-2 md:grid-cols-4 gap-4'
          >
            <div className='bg-primary dark:bg-gray-800 rounded-xl border border-yellow-600 dark:border-yellow-700 p-4'>
              <p className='text-sm text-gray-600 dark:text-gray-400 mb-1'>Pending</p>
              <p className='text-2xl font-bold text-yellow-600 dark:text-yellow-400'>
                {disputeStats.disputesByStatus.find(s => s._id === "pending")?.count || 0}
              </p>
            </div>
            <div className='bg-primary dark:bg-gray-800 rounded-xl border border-blue-600 dark:border-blue-700 p-4'>
              <p className='text-sm text-gray-600 dark:text-gray-400 mb-1'>Under Review</p>
              <p className='text-2xl font-bold text-blue-600 dark:text-blue-400'>
                {disputeStats.disputesByStatus.find(s => s._id === "under_review")?.count || 0}
              </p>
            </div>
            <div className='bg-primary dark:bg-gray-800 rounded-xl border border-green-600 dark:border-green-700 p-4'>
              <p className='text-sm text-gray-600 dark:text-gray-400 mb-1'>Resolved</p>
              <p className='text-2xl font-bold text-green-600 dark:text-green-400'>
                {disputeStats.disputesByStatus.find(s => s._id === "resolved")?.count || 0}
              </p>
            </div>
            <div className='bg-primary dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-700 p-4'>
              <p className='text-sm text-gray-600 dark:text-gray-400 mb-1'>Avg Resolution</p>
              <p className='text-2xl font-bold text-purple-600 dark:text-purple-400'>
                {disputeStats.avgResolutionHours}h
              </p>
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='mb-6 p-4 bg-primary dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700'
        >
          <div className='flex items-center gap-4 flex-wrap'>
            <Filter size={20} className='text-background dark:text-green-600 dark:text-green-400' />
            <select
              value={filters.status || ""}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className='bg-gray-200 dark:bg-gray-900 text-gray-900 dark:text-white px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600'
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
            <select
              value={filters.targetModel || ""}
              onChange={(e) => handleFilterChange("targetModel", e.target.value)}
              className='bg-gray-200 dark:bg-gray-900 text-gray-900 dark:text-white px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600'
            >
              <option value="">All Types</option>
              <option value="User">User</option>
              <option value="Listing">Listing</option>
              <option value="Exchange">Exchange</option>
            </select>
          </div>
        </motion.div>

        {/* Disputes Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='bg-primary dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden'
        >
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-gray-100 dark:bg-gray-900/50'>
                <tr>
                  <th className='px-6 py-4 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase'>Date</th>
                  <th className='px-6 py-4 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase'>Type</th>
                  <th className='px-6 py-4 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase'>Reason</th>
                  <th className='px-6 py-4 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase'>Status</th>
                  <th className='px-6 py-4 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase'>Reporter</th>
                  <th className='px-6 py-4 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase'>Actions</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-border'>
                {disputes.map((dispute, index) => (
                  <motion.tr
                    key={dispute._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className='hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:bg-opacity-30 transition'
                  >
                    <td className='px-6 py-4 text-sm'>
                      {new Date(dispute.createdAt).toLocaleDateString()}
                    </td>
                    <td className='px-6 py-4'>
                      <span className='text-sm font-medium'>{dispute.targetModel}</span>
                    </td>
                    <td className='px-6 py-4'>
                      <span className='text-sm'>{getReasonLabel(dispute.reason)}</span>
                    </td>
                    <td className='px-6 py-4'>
                      <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(dispute.status)}`}>
                        {dispute.status}
                      </span>
                    </td>
                    <td className='px-6 py-4 text-sm'>
                      {dispute.reporterId?.name || "Unknown"}
                    </td>
                    <td className='px-6 py-4'>
                      <div className='flex gap-2'>
                        <button
                          onClick={() => handleViewDispute(dispute._id)}
                          className='p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition'
                          title='View Details'
                        >
                          <Eye size={16} />
                        </button>
                        {dispute.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleActionClick(dispute._id, "resolve")}
                              className='p-2 bg-green-600 hover:bg-green-700 rounded-lg transition'
                              title='Resolve'
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button
                              onClick={() => handleActionClick(dispute._id, "dismiss")}
                              className='p-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition'
                              title='Dismiss'
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {disputesPagination && disputesPagination.totalPages > 1 && (
            <div className='px-6 py-4 border-t border-gray-700 flex items-center justify-between'>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Page {disputesPagination.page} of {disputesPagination.totalPages}
              </p>
              <div className='flex gap-2'>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={filters.page === 1}
                  className='p-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={filters.page === disputesPagination.totalPages}
                  className='p-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Moderator Modal */}
        {showModeratorModal && (
          <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50'>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className='bg-primary dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 max-w-md w-full mx-4'
            >
              <h3 className='text-xl font-bold mb-4'>Admin Action</h3>
              <p className='text-gray-400 mb-4'>
                Action: <span className='text-white font-bold capitalize'>{selectedAction?.replace("_", " ")}</span>
              </p>
              <textarea
                value={moderatorNote}
                onChange={(e) => setModeratorNote(e.target.value)}
                placeholder='Enter admin note...'
                className='w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white mb-4'
                rows={4}
              />
              <div className='flex gap-3'>
                <button
                  onClick={() => setShowModeratorModal(false)}
                  className='flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition'
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAction}
                  className='flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition'
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

const DisputeDetail = ({ dispute, onBack, onAction, onDelete }) => {
  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-900/50 text-yellow-400 border-yellow-700",
      under_review: "bg-blue-900/50 text-blue-400 border-blue-700",
      resolved: "bg-green-900/50 text-green-400 border-green-700",
      dismissed: "bg-gray-900/50 text-gray-400 border-gray-700"
    };
    return colors[status] || colors.pending;
  };

  const getReasonLabel = (reason) => {
    const labels = {
      not_as_described: "Item not as described",
      no_show: "User didn't show up",
      harassment: "Harassment or inappropriate behavior",
      scam: "Suspected scam or fraud",
      other: "Other"
    };
    return labels[reason] || reason;
  };

  return (
    <div className='min-h-screen bg-white dark:bg-gradient-to-b from-gray-900 via-green-900 to-emerald-900 text-gray-900 dark:text-white py-8'>
      <div className='container mx-auto px-4 max-w-4xl'>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className='mb-6'
        >
          <button
            onClick={onBack}
            className='flex items-center text-gray-400 hover:text-white transition mb-4'
          >
            <ChevronLeft size={20} className='mr-1' />
            Back to Disputes
          </button>
          <h1 className='text-3xl font-bold flex items-center'>
            <FileText size={32} className='mr-3 text-red-400' />
            Dispute Details
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 20 }}
          className='bg-primary dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6'
        >
          <div className='grid grid-cols-2 gap-4 mb-6'>
            <div>
              <p className='text-gray-400 text-sm mb-1'>Status</p>
              <span className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(dispute.status)}`}>
                {dispute.status}
              </span>
            </div>
            <div>
              <p className='text-gray-400 text-sm mb-1'>Date</p>
              <p className='font-bold'>{new Date(dispute.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className='text-gray-400 text-sm mb-1'>Target Type</p>
              <p className='font-bold'>{dispute.targetModel}</p>
            </div>
            <div>
              <p className='text-gray-400 text-sm mb-1'>Reason</p>
              <p className='font-bold capitalize'>{getReasonLabel(dispute.reason)}</p>
            </div>
            <div>
              <p className='text-gray-400 text-sm mb-1'>Reporter</p>
              <p className='font-bold'>{dispute.reporterId?.name}</p>
              <p className='text-sm text-gray-400'>{dispute.reporterId?.email}</p>
            </div>
            <div>
              <p className='text-gray-400 text-sm mb-1'>Target User</p>
              <p className='font-bold'>{dispute.targetId?.name}</p>
              <p className='text-sm text-gray-400'>{dispute.targetId?.email}</p>
            </div>
          </div>

          {dispute.description && (
            <div className='mb-6 p-4 bg-gray-900/50 rounded-lg'>
              <p className='text-gray-400 text-sm mb-2'>Description</p>
              <p>{dispute.description}</p>
            </div>
          )}

          {dispute.adminNote && (
            <div className='mb-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg'>
              <p className='text-blue-400 text-sm mb-2'>Admin Note</p>
              <p className='text-white'>{dispute.adminNote}</p>
            </div>
          )}

          {dispute.status === "pending" && (
            <div className='grid grid-cols-2 md:grid-cols-5 gap-3'>
              <button
                onClick={() => onAction(dispute._id, "resolve")}
                className='flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition'
              >
                <CheckCircle size={18} />
                Resolve
              </button>
              <button
                onClick={() => onAction(dispute._id, "dismiss")}
                className='flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg transition'
              >
                <XCircle size={18} />
                Dismiss
              </button>
              <button
                onClick={() => onAction(dispute._id, "review")}
                className='flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition'
              >
                <Eye size={18} />
                Review
              </button>
              {dispute.targetModel === "User" && (
                <>
                  <button
                    onClick={() => onAction(dispute._id, "ban_user")}
                    className='flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition'
                  >
                    <Ban size={18} />
                    Ban User
                  </button>
                  <button
                    onClick={() => onAction(dispute._id, "warn_user")}
                    className='flex items-center justify-center gap-2 px-4 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition'
                  >
                    <MessageSquare size={18} />
                    Warn User
                  </button>
                </>
              )}
              {dispute.targetModel === "Listing" && (
                <>
                  <button
                    onClick={() => onAction(dispute._id, "remove_listing")}
                    className='flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg transition'
                  >
                    <Trash2 size={18} />
                    Remove
                  </button>
                  <button
                    onClick={() => onAction(dispute._id, "edit_listing")}
                    className='flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition'
                  >
                    <FileText size={18} />
                    Edit
                  </button>
                </>
              )}
              {dispute.targetModel === "Exchange" && (
                <button
                  onClick={() => onAction(dispute._id, "cancel_exchange")}
                  className='flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition'
                >
                  <XCircle size={18} />
                  Cancel
                </button>
              )}
            </div>
          )}

          <button
            onClick={() => onDelete(dispute._id)}
            className='mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-900/50 hover:bg-red-900/80 border border-red-700 rounded-lg transition'
          >
            <Trash2 size={18} />
            Delete Dispute
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default DisputeManagement;
