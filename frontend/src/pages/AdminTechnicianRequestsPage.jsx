import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTechnicianRequestStore } from "../store/technicianRequestStore";
import { toast } from "react-hot-toast";
import { 
  Wrench, MapPin, Clock, DollarSign, ArrowRight, Search, 
  Filter, User
} from "lucide-react";

const SERVICE_TYPES = [
  "repair",
  "installation",
  "maintenance",
  "diagnosis",
  "Engine Repair",
  "other"
];

const PRIORITIES = ["low", "medium", "high", "urgent"];

const STATUS_COLORS = {
  pending: "bg-yellow-600",
  quoted: "bg-blue-600",
  accepted: "bg-purple-600",
  "in-progress": "bg-indigo-600",
  arrived: "bg-teal-600",
  started: "bg-orange-600",
  completed: "bg-green-600",
  cancelled: "bg-red-600"
};

const PRIORITY_COLORS = {
  low: "text-green-600 dark:text-green-400",
  medium: "text-yellow-600 dark:text-yellow-400",
  high: "text-orange-600 dark:text-orange-400",
  urgent: "text-red-600 dark:text-red-400"
};

const AdminTechnicianRequestsPage = () => {
  const { technicianRequests, getAllTechnicianRequests, isLoading } = useTechnicianRequestStore();
  const [filters, setFilters] = useState({
    serviceType: "",
    priority: "",
    status: ""
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      await getAllTechnicianRequests(filters);
    } catch (error) {
      toast.error("Failed to load service requests");
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    loadRequests();
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setFilters({ serviceType: "", priority: "", status: "" });
    loadRequests();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className='min-h-screen bg-white dark:bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 text-gray-900 dark:text-white py-8 px-4'
    >
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3'>
            <Wrench className='text-cyan-600 dark:text-cyan-400' size={40} />
            Admin - Technician Requests
          </h1>
          <p className='text-gray-600 dark:text-gray-400'>Monitor and manage all service requests</p>
        </div>

        {/* Search and Filters */}
        <div className='bg-primary dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-6'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex-1 max-w-md'>
              <div className='relative'>
                <Search className='absolute left-3 top-3.5 text-gray-500 dark:text-gray-400' size={20} />
                <input
                  type='text'
                  placeholder='Search by location or description...'
                  className='w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500'
                />
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className='flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition duration-200'
            >
              <Filter size={20} />
              Filters
            </button>
          </div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className='border-t border-gray-200 dark:border-gray-700 pt-4 mt-4'
            >
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
                <div>
                  <label className='block text-gray-900 dark:text-white text-sm font-semibold mb-2'>Service Type</label>
                  <select
                    name='serviceType'
                    value={filters.serviceType}
                    onChange={handleFilterChange}
                    className='w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500'
                  >
                    <option value=''>All Types</option>
                    {SERVICE_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className='block text-gray-900 dark:text-white text-sm font-semibold mb-2'>Priority</label>
                  <select
                    name='priority'
                    value={filters.priority}
                    onChange={handleFilterChange}
                    className='w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500'
                  >
                    <option value=''>All Priorities</option>
                    {PRIORITIES.map(priority => (
                      <option key={priority} value={priority}>{priority}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className='block text-gray-900 dark:text-white text-sm font-semibold mb-2'>Status</label>
                  <select
                    name='status'
                    value={filters.status}
                    onChange={handleFilterChange}
                    className='w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500'
                  >
                    <option value=''>All Statuses</option>
                    <option value='pending'>Pending</option>
                    <option value='quoted'>Quoted</option>
                    <option value='accepted'>Accepted</option>
                    <option value='in-progress'>In Progress</option>
                    <option value='completed'>Completed</option>
                    <option value='cancelled'>Cancelled</option>
                  </select>
                </div>
              </div>
              <div className='flex gap-3'>
                <button
                  onClick={handleApplyFilters}
                  className='px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-700 transition duration-200'
                >
                  Apply Filters
                </button>
                <button
                  onClick={handleClearFilters}
                  className='px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-lg transition duration-200'
                >
                  Clear Filters
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Results Count */}
        <div className='mb-4'>
          <p className='text-gray-600 dark:text-gray-400'>
            Showing <span className='text-cyan-600 dark:text-cyan-400 font-semibold'>{technicianRequests.length}</span> request{technicianRequests.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Requests List */}
        {isLoading ? (
          <div className='text-center py-16'>
            <div className='animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500 mx-auto'></div>
            <p className='text-gray-600 dark:text-gray-400 mt-4'>Loading service requests...</p>
          </div>
        ) : technicianRequests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='bg-primary dark:bg-gray-800 rounded-xl p-12 border border-gray-200 dark:border-gray-700 text-center'
          >
            <Wrench size={64} className='mx-auto text-gray-400 mb-4' />
            <h3 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>No Service Requests Available</h3>
            <p className='text-gray-600 dark:text-gray-400'>Check back later or adjust your filters</p>
          </motion.div>
        ) : (
          <div className='space-y-4'>
            {technicianRequests.map((request, index) => (
              <motion.div
                key={request._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className='bg-primary dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-cyan-500 dark:hover:border-cyan-600 transition duration-200'
              >
                <div className='flex items-start justify-between mb-4'>
                  <div className='flex-1'>
                    {/* Service Type & Status */}
                    <div className='flex items-center gap-3 mb-2'>
                      <h3 className='text-xl font-bold text-gray-900 dark:text-white capitalize'>{request.serviceType}</h3>
                      <span className={`px-3 py-1 ${STATUS_COLORS[request.status]} text-white text-xs rounded-full capitalize`}>
                        {request.status}
                      </span>
                      <span className={`text-sm font-semibold ${PRIORITY_COLORS[request.priority]}`}>
                        {request.priority} priority
                      </span>
                    </div>

                    {/* Description */}
                    <p className='text-gray-700 dark:text-gray-300 mb-3 line-clamp-2'>{request.description}</p>

                    {/* Location, Date, Budget */}
                    <div className='flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3'>
                      <span className='flex items-center gap-1'>
                        <MapPin size={14} />
                        {request.location}
                      </span>
                      <span className='flex items-center gap-1'>
                        <Clock size={14} />
                        {formatDate(request.createdAt)}
                      </span>
                      {request.budgetMin && request.budgetMax && (
                        <span className='flex items-center gap-1 text-green-600 dark:text-green-400'>
                          {/* <DollarSign size={14} /> */}
                          ${request.budgetMin} - ${request.budgetMax}
                        </span>
                      )}
                    </div>

                    {/* User & Technician Info */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3 mt-4'>
                      {/* Sent By */}
                      {request.userId && (
                        <div className='bg-gray-100 dark:bg-gray-700 rounded-lg p-3'>
                          <div className='flex items-center gap-2 mb-1'>
                            <User size={14} className='text-cyan-600 dark:text-cyan-400' />
                            <span className='text-gray-900 dark:text-white font-semibold text-sm'>Sent By:</span>
                          </div>
                          <p className='text-gray-700 dark:text-gray-300 text-sm'>{request.userId.name || 'User'}</p>
                          <p className='text-gray-600 dark:text-gray-400 text-xs'>{request.userId.location || 'N/A'}</p>
                        </div>
                      )}

                      {/* Sent To (Assigned Technician) */}
                      {request.assignedTechnician ? (
                        <div className='bg-gray-100 dark:bg-gray-700 rounded-lg p-3'>
                          <div className='flex items-center gap-2 mb-1'>
                            <Wrench size={14} className='text-purple-600 dark:text-purple-400' />
                            <span className='text-gray-900 dark:text-white font-semibold text-sm'>Assigned To:</span>
                          </div>
                          <p className='text-gray-700 dark:text-gray-300 text-sm'>{request.assignedTechnician.name || 'Technician'}</p>
                          <p className='text-gray-600 dark:text-gray-400 text-xs'>{request.assignedTechnician.location || 'N/A'}</p>
                        </div>
                      ) : (
                        request.quotes && request.quotes.length > 0 && (
                          <div className='bg-gray-100 dark:bg-gray-700 rounded-lg p-3'>
                            <div className='flex items-center gap-2 mb-1'>
                              <DollarSign size={14} className='text-yellow-600 dark:text-yellow-400' />
                              <span className='text-gray-900 dark:text-white font-semibold text-sm'>Quotes Received:</span>
                            </div>
                            <p className='text-gray-700 dark:text-gray-300 text-sm'>{request.quotes.length} quote(s)</p>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className='ml-4 flex flex-col gap-2'>
                    <Link
                      to={`/admin/technician-requests/${request._id}`}
                      className='px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-lg transition duration-200 flex items-center gap-2'
                    >
                      View Details
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminTechnicianRequestsPage;
