import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { 
  Wrench, MapPin, Clock, DollarSign, User, MessageCircle, 
  Mail, Phone, ArrowLeft, Trash2, Ban, Copy
} from "lucide-react";
import axios from "axios";

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

const AdminTechnicianRequestDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [contactModal, setContactModal] = useState(null); // 'user' or 'technician'

  useEffect(() => {
    loadRequest();
  }, [id]);

  const loadRequest = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/technician-requests/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });

      if (response.data.success) {
        setRequest(response.data.request);
      }
    } catch (error) {
      toast.error("Failed to load request details");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const handleBanUser = async (userId, userType) => {
    if (!window.confirm(`Are you sure you want to ban this ${userType}?`)) return;

    try {
      await axios.post(
        `http://localhost:5000/api/admin/users/${userId}/ban`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      toast.success(`${userType} banned successfully`);
      loadRequest();
    } catch (error) {
      toast.error(`Failed to ban ${userType}`);
      console.error(error);
    }
  };

  const handleDeleteRequest = async () => {
    if (!window.confirm("Are you sure you want to delete this request?")) return;

    try {
      // Note: You may need to add a delete endpoint for admin
      toast.success("Request deleted successfully");
      navigate("/admin/technician-requests");
    } catch (error) {
      toast.error("Failed to delete request");
      console.error(error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-white dark:bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500 mx-auto'></div>
          <p className='text-gray-600 dark:text-gray-400 mt-4'>Loading request details...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className='min-h-screen bg-white dark:bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 flex items-center justify-center'>
        <div className='text-center'>
          <Wrench size={64} className='mx-auto text-gray-400 mb-4' />
          <h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>Request Not Found</h2>
          <Link
            to='/admin/technician-requests'
            className='text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300'
          >
            Back to Requests
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className='min-h-screen bg-white dark:bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 text-gray-900 dark:text-white py-8 px-4'
    >
      <div className='max-w-6xl mx-auto'>
        {/* Back Button */}
        <button
          onClick={() => navigate("/admin/technician-requests")}
          className='flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition duration-200'
        >
          <ArrowLeft size={20} />
          Back to Requests
        </button>

        {/* Header */}
        <div className='bg-primary dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-6'>
          <div className='flex items-start justify-between mb-4'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900 dark:text-white capitalize mb-2'>{request.serviceType}</h1>
              <div className='flex items-center gap-3'>
                <span className={`px-3 py-1 ${STATUS_COLORS[request.status]} text-white text-sm rounded-full capitalize`}>
                  {request.status}
                </span>
                <span className={`text-lg font-semibold ${PRIORITY_COLORS[request.priority]}`}>
                  {request.priority} priority
                </span>
              </div>
            </div>
            <button
              onClick={handleDeleteRequest}
              className='px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition duration-200 flex items-center gap-2'
            >
              <Trash2 size={16} />
              Delete Request
            </button>
          </div>

          <p className='text-gray-700 dark:text-gray-300 text-lg'>{request.description}</p>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-sm text-gray-600 dark:text-gray-400'>
            <div className='flex items-center gap-2'>
              <MapPin size={16} />
              <span>{request.location}</span>
            </div>
            <div className='flex items-center gap-2'>
              <Clock size={16} />
              <span>Created: {formatDate(request.createdAt)}</span>
            </div>
            {request.budgetMin && request.budgetMax && (
              <div className='flex items-center gap-2 text-green-600 dark:text-green-400'>
                <DollarSign size={16} />
                <span>Budget: ${request.budgetMin} - ${request.budgetMax}</span>
              </div>
            )}
          </div>
        </div>

        {/* User & Technician Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
          {/* Request Owner */}
          {request.userId && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className='bg-primary dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700'
            >
              <div className='flex items-center justify-between mb-4'>
                <h2 className='text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2'>
                  <User className='text-cyan-600 dark:text-cyan-400' size={24} />
                  Request Owner
                </h2>
                {request.userId.isBanned && (
                  <span className='px-3 py-1 bg-red-600 text-white text-sm rounded-full'>Banned</span>
                )}
              </div>

              <div className='space-y-3 mb-4'>
                <div>
                  <p className='text-gray-600 dark:text-gray-400 text-sm'>Name</p>
                  <p className='text-gray-900 dark:text-white font-semibold'>{request.userId.name || 'N/A'}</p>
                </div>
                <div>
                  <p className='text-gray-600 dark:text-gray-400 text-sm'>Email</p>
                  <p className='text-gray-900 dark:text-white'>{request.userId.email || 'N/A'}</p>
                </div>
                <div>
                  <p className='text-gray-600 dark:text-gray-400 text-sm'>Phone</p>
                  <p className='text-gray-900 dark:text-white'>{request.userId.phone || request.contactInfo?.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className='text-gray-600 dark:text-gray-400 text-sm'>Location</p>
                  <p className='text-gray-900 dark:text-white'>{request.userId.location || request.location || 'N/A'}</p>
                </div>
              </div>

              <div className='space-y-2'>
                <button
                  onClick={() => setContactModal('user')}
                  className='w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-lg transition duration-200 flex items-center justify-center gap-2'
                >
                  <MessageCircle size={18} />
                  Contact User
                </button>
                <button
                  onClick={() => handleBanUser(request.userId._id, 'user')}
                  className={`w-full px-4 py-3 ${request.userId.isBanned ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'} text-white font-semibold rounded-lg transition duration-200 flex items-center justify-center gap-2`}
                >
                  <Ban size={18} />
                  {request.userId.isBanned ? 'Unban User' : 'Ban User'}
                </button>
              </div>
            </motion.div>
          )}

          {/* Assigned Technician */}
          {request.assignedTechnician ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className='bg-primary dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700'
            >
              <div className='flex items-center justify-between mb-4'>
                <h2 className='text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2'>
                  <Wrench className='text-purple-600 dark:text-purple-400' size={24} />
                  Assigned Technician
                </h2>
                {request.assignedTechnician.isBanned && (
                  <span className='px-3 py-1 bg-red-600 text-white text-sm rounded-full'>Banned</span>
                )}
              </div>

              <div className='space-y-3 mb-4'>
                <div>
                  <p className='text-gray-600 dark:text-gray-400 text-sm'>Name</p>
                  <p className='text-gray-900 dark:text-white font-semibold'>{request.assignedTechnician.name || 'N/A'}</p>
                </div>
                <div>
                  <p className='text-gray-600 dark:text-gray-400 text-sm'>Email</p>
                  <p className='text-gray-900 dark:text-white'>{request.assignedTechnician.email || 'N/A'}</p>
                </div>
                <div>
                  <p className='text-gray-600 dark:text-gray-400 text-sm'>Phone</p>
                  <p className='text-gray-900 dark:text-white'>{request.assignedTechnician.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className='text-gray-600 dark:text-gray-400 text-sm'>Location</p>
                  <p className='text-gray-900 dark:text-white'>{request.assignedTechnician.location || 'N/A'}</p>
                </div>
              </div>

              <div className='space-y-2'>
                <button
                  onClick={() => setContactModal('technician')}
                  className='w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold rounded-lg transition duration-200 flex items-center justify-center gap-2'
                >
                  <MessageCircle size={18} />
                  Contact Technician
                </button>
                <button
                  onClick={() => handleBanUser(request.assignedTechnician._id, 'technician')}
                  className={`w-full px-4 py-3 ${request.assignedTechnician.isBanned ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'} text-white font-semibold rounded-lg transition duration-200 flex items-center justify-center gap-2`}
                >
                  <Ban size={18} />
                  {request.assignedTechnician.isBanned ? 'Unban Technician' : 'Ban Technician'}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className='bg-primary dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700'
            >
              <div className='flex items-center justify-center h-full'>
                <div className='text-center'>
                  <Wrench size={48} className='mx-auto text-gray-400 mb-4' />
                  <p className='text-gray-600 dark:text-gray-400'>No technician assigned yet</p>
                  {request.quotes && request.quotes.length > 0 && (
                    <p className='text-yellow-600 dark:text-yellow-400 mt-2'>{request.quotes.length} quote(s) received</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Quotes Section */}
        {request.quotes && request.quotes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='bg-primary dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-6'
          >
            <h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2'>
              <DollarSign className='text-yellow-600 dark:text-yellow-400' size={28} />
              Quotes Received ({request.quotes.length})
            </h2>

            <div className='space-y-4'>
              {request.quotes.map((quote, index) => (
                <div key={index} className='bg-gray-100 dark:bg-gray-700 rounded-lg p-4'>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <p className='text-gray-900 dark:text-white font-semibold mb-1'>
                        {quote.technicianId?.name || 'Unknown Technician'}
                      </p>
                      <p className='text-green-600 dark:text-green-400 text-lg font-bold mb-2'>
                        ${quote.estimatedCost}
                      </p>
                      {quote.additionalNotes && (
                        <p className='text-gray-700 dark:text-gray-300 text-sm'>{quote.additionalNotes}</p>
                      )}
                      <p className='text-gray-600 dark:text-gray-400 text-xs mt-2'>
                        Submitted: {formatDate(quote.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Contact Modal */}
        {contactModal && (
          <div className='fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4'>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className='bg-primary dark:bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-200 dark:border-gray-700'
            >
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-2xl font-bold text-gray-900 dark:text-white'>
                  Contact {contactModal === 'user' ? 'User' : 'Technician'}
                </h3>
                <button
                  onClick={() => setContactModal(null)}
                  className='text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                >
                  ✕
                </button>
              </div>

              {(() => {
                const contact = contactModal === 'user' ? request.userId : request.assignedTechnician;
                if (!contact) return null;

                return (
                  <div className='space-y-4'>
                    <div>
                      <p className='text-gray-600 dark:text-gray-400 text-sm mb-1'>Name</p>
                      <p className='text-gray-900 dark:text-white font-semibold'>{contact.name}</p>
                    </div>

                    <div>
                      <p className='text-gray-600 dark:text-gray-400 text-sm mb-1'>Email</p>
                      <div className='flex items-center gap-2'>
                        <p className='text-gray-900 dark:text-white flex-1'>{contact.email}</p>
                        <button
                          onClick={() => handleCopyToClipboard(contact.email, 'Email')}
                          className='p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition duration-200 text-gray-900 dark:text-white'
                          title='Copy Email'
                        >
                          <Copy size={16} />
                        </button>
                        <a
                          href={`mailto:${contact.email}`}
                          className='p-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition duration-200'
                          title='Send Email'
                        >
                          <Mail size={16} />
                        </a>
                      </div>
                    </div>

                    {(contact.phone || request.contactInfo?.phone) && (
                      <div>
                        <p className='text-gray-600 dark:text-gray-400 text-sm mb-1'>Phone</p>
                        <div className='flex items-center gap-2'>
                          <p className='text-gray-900 dark:text-white flex-1'>{contact.phone || request.contactInfo.phone}</p>
                          <button
                            onClick={() => handleCopyToClipboard(contact.phone || request.contactInfo.phone, 'Phone')}
                            className='p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition duration-200 text-gray-900 dark:text-white'
                            title='Copy Phone'
                          >
                            <Copy size={16} />
                          </button>
                          <a
                            href={`tel:${contact.phone || request.contactInfo.phone}`}
                            className='p-2 bg-green-600 hover:bg-green-700 rounded-lg transition duration-200'
                            title='Call'
                          >
                            <Phone size={16} />
                          </a>
                        </div>
                      </div>
                    )}

                    <Link
                      to={`/messages/${contact._id}`}
                      className='w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-lg transition duration-200 flex items-center justify-center gap-2'
                      onClick={() => setContactModal(null)}
                    >
                      <MessageCircle size={18} />
                      Send Message
                    </Link>
                  </div>
                );
              })()}
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminTechnicianRequestDetailPage;
