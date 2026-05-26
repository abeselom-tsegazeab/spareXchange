import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
import { useAdminStore } from "../store/adminStore";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";

const ReportManagement = () => {
  const { 
    getReports, 
    getReportById, 
    updateReportStatus, 
    deleteReport,
    getReportStats,
    reports,
    selectedReport,
    reportStats,
    reportsPagination,
    isLoading
  } = useAdminStore();

  const [filters, setFilters] = useState({ page: 1, limit: 20 });
  const [showModeratorModal, setShowModeratorModal] = useState(false);
  const [moderatorNote, setModeratorNote] = useState("");
  const [selectedAction, setSelectedAction] = useState(null);
  const [currentReportId, setCurrentReportId] = useState(null);

  useEffect(() => {
    loadReports();
    loadReportStats();
  }, [filters]);

  const loadReports = async () => {
    try {
      await getReports(filters);
    } catch (error) {
      toast.error("Failed to load reports");
    }
  };

  const loadReportStats = async () => {
    try {
      await getReportStats();
    } catch (error) {
      console.error("Failed to load report stats");
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleViewReport = async (reportId) => {
    try {
      await getReportById(reportId);
    } catch (error) {
      toast.error("Failed to load report details");
    }
  };

  const handleActionClick = (reportId, action) => {
    setCurrentReportId(reportId);
    setSelectedAction(action);
    setModeratorNote("");
    setShowModeratorModal(true);
  };

  const handleConfirmAction = async () => {
    if (!moderatorNote.trim()) {
      toast.error("Moderator note is required");
      return;
    }

    try {
      const statusMap = {
        resolve: "resolved",
        dismiss: "dismissed",
        warn: "reviewed"
      };

      const actionMap = {
        resolve: null,
        dismiss: null,
        remove_listing: "remove_listing",
        ban_user: "ban_user",
        warn: "warn_user"
      };

      await updateReportStatus(currentReportId, {
        status: statusMap[selectedAction] || "resolved",
        moderatorNote,
        action: actionMap[selectedAction]
      });

      toast.success("Report updated successfully");
      setShowModeratorModal(false);
      loadReports();
      loadReportStats();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update report");
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm("Are you sure you want to delete this report?")) {
      return;
    }

    try {
      await deleteReport(reportId);
      toast.success("Report deleted successfully");
      loadReports();
      loadReportStats();
    } catch (error) {
      toast.error("Failed to delete report");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-900/50 text-yellow-400 border-yellow-700",
      reviewed: "bg-blue-900/50 text-blue-400 border-blue-700",
      resolved: "bg-green-900/50 text-green-400 border-green-700",
      dismissed: "bg-gray-900/50 text-gray-400 border-gray-700"
    };
    return colors[status] || colors.pending;
  };

  const getReasonLabel = (reason) => {
    const labels = {
      inaccurate: "Inaccurate Information",
      fraud: "Fraud/Scam",
      repost: "Duplicate/Repost",
      offensive: "Offensive Content",
      other: "Other"
    };
    return labels[reason] || reason;
  };

  if (isLoading && reports.length === 0) {
    return <LoadingSpinner />;
  }

  if (selectedReport) {
    return (
      <ReportDetail 
        report={selectedReport}
        onBack={() => useAdminStore.getState().clearSelectedReport()}
        onAction={handleActionClick}
        onDelete={handleDeleteReport}
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
            Report Management
          </h1>
          <p className='text-gray-600 dark:text-gray-400'>Moderate content and handle user reports</p>
        </motion.div>

        {/* Stats Overview */}
        {reportStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='mb-6 grid grid-cols-2 md:grid-cols-4 gap-4'
          >
            <div className='bg-primary dark:bg-gray-800 rounded-xl border border-yellow-600 dark:border-yellow-700 p-4'>
              <p className='text-sm text-gray-600 dark:text-gray-400 mb-1'>Pending</p>
              <p className='text-2xl font-bold text-yellow-600 dark:text-yellow-400'>
                {reportStats.reportsByStatus.find(s => s._id === "pending")?.count || 0}
              </p>
            </div>
            <div className='bg-primary dark:bg-gray-800 rounded-xl border border-blue-600 dark:border-blue-700 p-4'>
              <p className='text-sm text-gray-600 dark:text-gray-400 mb-1'>Reviewed</p>
              <p className='text-2xl font-bold text-blue-600 dark:text-blue-400'>
                {reportStats.reportsByStatus.find(s => s._id === "reviewed")?.count || 0}
              </p>
            </div>
            <div className='bg-primary dark:bg-gray-800 rounded-xl border border-green-600 dark:border-green-700 p-4'>
              <p className='text-sm text-gray-600 dark:text-gray-400 mb-1'>Resolved</p>
              <p className='text-2xl font-bold text-background dark:text-green-400'>
                {reportStats.reportsByStatus.find(s => s._id === "resolved")?.count || 0}
              </p>
            </div>
            <div className='bg-primary dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-700 p-4'>
              <p className='text-sm text-gray-600 dark:text-gray-400 mb-1'>Avg Resolution</p>
              <p className='text-2xl font-bold text-purple-600 dark:text-purple-400'>
                {reportStats.avgResolutionTimeHours}h
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
            <Filter size={20} className=' text-background dark:text-green-600 dark:text-green-400' />
            <select
              value={filters.status || ""}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className='bg-gray-200 dark:bg-gray-900 text-gray-900 dark:text-white px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600'
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
            <select
              value={filters.targetModel || ""}
              onChange={(e) => handleFilterChange("targetModel", e.target.value)}
              className='bg-gray-200 dark:bg-gray-900 text-gray-900 dark:text-white px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600'
            >
              <option value="">All Types</option>
              <option value="Listing">Listing</option>
              <option value="User">User</option>
              <option value="Exchange">Exchange</option>
            </select>
          </div>
        </motion.div>

        {/* Reports Table */}
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
                {reports.map((report, index) => (
                  <motion.tr
                    key={report._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className='hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:bg-opacity-30 transition'
                  >
                    <td className='px-6 py-4 text-sm'>
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td className='px-6 py-4'>
                      <span className='text-sm font-medium'>{report.targetModel}</span>
                    </td>
                    <td className='px-6 py-4'>
                      <span className='text-sm'>{getReasonLabel(report.reason)}</span>
                    </td>
                    <td className='px-6 py-4'>
                      <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                    </td>
                    <td className='px-6 py-4 text-sm'>
                      {report.reporter?.name || "Unknown"}
                    </td>
                    <td className='px-6 py-4'>
                      <div className='flex gap-2'>
                        <button
                          onClick={() => handleViewReport(report._id)}
                          className='p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition'
                          title='View Details'
                        >
                          <Eye size={16} />
                        </button>
                        {report.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleActionClick(report._id, "resolve")}
                              className='p-2 bg-green-600 hover:bg-green-700 rounded-lg transition'
                              title='Resolve'
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button
                              onClick={() => handleActionClick(report._id, "dismiss")}
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
          {reportsPagination && reportsPagination.totalPages > 1 && (
            <div className='px-6 py-4 border-t border-gray-700 flex items-center justify-between'>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Page {reportsPagination.page} of {reportsPagination.totalPages}
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
                  disabled={filters.page === reportsPagination.totalPages}
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
              <h3 className='text-xl font-bold mb-4'>Moderator Action</h3>
              <p className='text-gray-400 mb-4'>
                Action: <span className='text-white font-bold capitalize'>{selectedAction?.replace("_", " ")}</span>
              </p>
              <textarea
                value={moderatorNote}
                onChange={(e) => setModeratorNote(e.target.value)}
                placeholder='Enter moderator note...'
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

const ReportDetail = ({ report, onBack, onAction, onDelete }) => {
  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-900/50 text-yellow-400 border-yellow-700",
      reviewed: "bg-blue-900/50 text-blue-400 border-blue-700",
      resolved: "bg-green-900/50 text-green-400 border-green-700",
      dismissed: "bg-gray-900/50 text-gray-400 border-gray-700"
    };
    return colors[status] || colors.pending;
  };

  const getReasonLabel = (reason) => {
    const labels = {
      inaccurate: "Inaccurate Information",
      fraud: "Fraud/Scam",
      repost: "Duplicate/Repost",
      offensive: "Offensive Content",
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
            Back to Reports
          </button>
          <h1 className='text-3xl font-bold flex items-center'>
            <FileText size={32} className='mr-3 text-red-400' />
            Report Details
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='bg-primary dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6'
        >
          <div className='grid grid-cols-2 gap-4 mb-6'>
            <div>
              <p className='text-gray-400 text-sm mb-1'>Status</p>
              <span className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(report.status)}`}>
                {report.status}
              </span>
            </div>
            <div>
              <p className='text-gray-400 text-sm mb-1'>Date</p>
              <p className='font-bold'>{new Date(report.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className='text-gray-400 text-sm mb-1'>Target Type</p>
              <p className='font-bold'>{report.targetModel}</p>
            </div>
            <div>
              <p className='text-gray-400 text-sm mb-1'>Reason</p>
              <p className='font-bold capitalize'>{getReasonLabel(report.reason)}</p>
            </div>
            <div>
              <p className='text-gray-400 text-sm mb-1'>Reporter</p>
              <p className='font-bold'>{report.reporter?.name}</p>
              <p className='text-sm text-gray-400'>{report.reporter?.email}</p>
            </div>
          </div>

          {report.details && (
            <div className='mb-6 p-4 bg-gray-900/50 rounded-lg'>
              <p className='text-gray-400 text-sm mb-2'>Details</p>
              <p>{report.details}</p>
            </div>
          )}

          {report.targetDetails && (
            <div className='mb-6 p-4 bg-gray-900/50 rounded-lg'>
              <p className='text-gray-400 text-sm mb-2'>Target Information</p>
              <pre className='text-sm overflow-auto'>
                {JSON.stringify(report.targetDetails, null, 2)}
              </pre>
            </div>
          )}

          {report.status === "pending" && (
            <div className='grid grid-cols-2 md:grid-cols-5 gap-3'>
              <button
                onClick={() => onAction(report._id, "resolve")}
                className='flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition'
              >
                <CheckCircle size={18} />
                Resolve
              </button>
              <button
                onClick={() => onAction(report._id, "dismiss")}
                className='flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg transition'
              >
                <XCircle size={18} />
                Dismiss
              </button>
              {report.targetModel === "Listing" && (
                <button
                  onClick={() => onAction(report._id, "remove_listing")}
                  className='flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg transition'
                >
                  <Trash2 size={18} />
                  Remove
                </button>
              )}
              {report.targetModel === "User" && (
                <>
                  <button
                    onClick={() => onAction(report._id, "ban_user")}
                    className='flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition'
                  >
                    <Ban size={18} />
                    Ban User
                  </button>
                  <button
                    onClick={() => onAction(report._id, "warn")}
                    className='flex items-center justify-center gap-2 px-4 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition'
                  >
                    <MessageSquare size={18} />
                    Warn
                  </button>
                </>
              )}
            </div>
          )}

          <button
            onClick={() => onDelete(report._id)}
            className='mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-900/50 hover:bg-red-900/80 border border-red-700 rounded-lg transition'
          >
            <Trash2 size={18} />
            Delete Report
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default ReportManagement;
