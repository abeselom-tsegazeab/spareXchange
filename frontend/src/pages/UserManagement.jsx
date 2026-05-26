import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  Search, 
  Filter, 
  Ban, 
  CheckCircle, 
  XCircle, 
  Eye,
  UserCheck,
  AlertTriangle,
  Trash2,
  Lock,
  Shield,
  ShieldCheck
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useAdminStore } from "../store/adminStore";
import { useAuthStore } from "../store/authStore";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";
import axios from "axios";

const UserManagement = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const { 
    getAllUsers, 
    getPendingVerifications,
    verifyUser,
    verifyUserEmail,
    toggleUserBan,
    users,
    pendingVerifications,
    isLoading,
    setState
  } = useAdminStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [verificationNote, setVerificationNote] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // 'all' or 'pending'
  const [previewDoc, setPreviewDoc] = useState(null); // For document preview modal
  const iframeRef = useRef(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [adminPassword, setAdminPassword] = useState("");
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);
  const [showMakeAdminModal, setShowMakeAdminModal] = useState(false);
  const [userToPromote, setUserToPromote] = useState(null);
  const [isPromoting, setIsPromoting] = useState(false);
  const [showRemoveAdminModal, setShowRemoveAdminModal] = useState(false);
  const [userToDemote, setUserToDemote] = useState(null);
  const [isDemoting, setIsDemoting] = useState(false);

  // Load PDF into iframe using blob URL to bypass CORS
  useEffect(() => {
    if (previewDoc && previewDoc.type === 'pdf') {
      setPdfLoading(true);
      setPdfError(false);
      
      // Remove fl_attachment from URL for preview
      const previewUrl = previewDoc.url.replace('/upload/fl_attachment/', '/upload/');
      
      // Fetch PDF as blob to bypass CORS
      fetch(previewUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch PDF');
          }
          return response.blob();
        })
        .then(blob => {
          // Create blob URL
          const blobUrl = URL.createObjectURL(blob);
          
          // Set iframe src to blob URL
          if (iframeRef.current) {
            iframeRef.current.src = blobUrl;
          }
          
          setPdfLoading(false);
          
          // Cleanup blob URL when component unmounts or preview changes
          return () => URL.revokeObjectURL(blobUrl);
        })
        .catch(error => {
          console.error('Failed to load PDF:', error);
          setPdfError(true);
          setPdfLoading(false);
        });
    }
  }, [previewDoc]);

  useEffect(() => {
    fetchUsers();
    fetchPendingVerifications();
  }, []);

  const fetchUsers = async () => {
    try {
      const filters = {};
      if (filterType !== "all") filters.userType = filterType;
      if (searchTerm) filters.search = searchTerm;
      await getAllUsers(filters);
    } catch (error) {
      toast.error("Failed to load users");
    }
  };

  const fetchPendingVerifications = async () => {
    try {
      await getPendingVerifications();
    } catch (error) {
      console.error("Failed to load pending verifications");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleVerifyUser = async (userId, status) => {
    try {
      await verifyUser(userId, status, verificationNote);
      toast.success(`User ${status === "verified" ? "verified" : "rejected"} successfully`);
      setShowVerificationModal(false);
      setVerificationNote("");
      setSelectedUser(null);
      fetchUsers();
      fetchPendingVerifications();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update user");
    }
  };

  const handleBanUser = async (userId) => {
    if (!window.confirm("Are you sure you want to toggle ban status for this user?")) {
      return;
    }
    try {
      await toggleUserBan(userId);
      toast.success("User ban status updated");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to update ban status");
    }
  };

  const handleVerifyEmail = async (userId) => {
    if (!window.confirm("Are you sure you want to verify this user's email?")) {
      return;
    }
    try {
      await verifyUserEmail(userId);
      toast.success("User email verified successfully");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to verify user email");
    }
  };

  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
    setAdminPassword("");
  };

  const handleDeleteUser = async () => {
    if (!adminPassword) {
      toast.error("Please enter your password to confirm deletion");
      return;
    }

    setIsVerifyingPassword(true);
    try {
      // Verify admin password before deletion
      const response = await axios.post(
        "http://localhost:5000/api/auth/verify-password",
        { password: adminPassword },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      if (response.data.success) {
        // Password verified, proceed with deletion
        const deleteResponse = await axios.delete(
          `http://localhost:5000/api/admin/users/${userToDelete._id}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );

        if (deleteResponse.data.success) {
          // Success - close modal first
          setShowDeleteModal(false);
          setUserToDelete(null);
          setAdminPassword("");
          
          // Show success message
          toast.success(`User ${userToDelete.name} has been deleted`);
          
          // Optimistically remove the user from local state for instant UI update
          setState((prev) => ({
            users: prev.users.filter(u => u._id !== userToDelete._id)
          }));
          
          // Refresh from server in background
          setTimeout(() => fetchUsers(), 500);
        }
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Incorrect password. Deletion cancelled.");
      } else {
        toast.error(error.response?.data?.message || "Failed to delete user");
      }
    } finally {
      setIsVerifyingPassword(false);
    }
  };

  const openMakeAdminModal = (user) => {
    if (user.userType === "admin") {
      toast.error("User is already an admin");
      return;
    }
    setUserToPromote(user);
    setShowMakeAdminModal(true);
  };

  const handleMakeAdmin = async () => {
    if (!adminPassword) {
      toast.error("Please enter your password to confirm");
      return;
    }

    setIsPromoting(true);
    try {
      // Verify admin password
      const response = await axios.post(
        "http://localhost:5000/api/auth/verify-password",
        { password: adminPassword },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      if (response.data.success) {
        // Password verified, proceed with promotion
        const promoteResponse = await axios.patch(
          `http://localhost:5000/api/admin/users/${userToPromote._id}/make-admin`,
          {},
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );

        if (promoteResponse.data.success) {
          // Store user info before clearing state
          const promotedUserId = userToPromote._id;
          const promotedUserName = userToPromote.name;
          
          // Success - close modal first
          setShowMakeAdminModal(false);
          setUserToPromote(null);
          setAdminPassword("");
          
          // Show success messages
          toast.success(`${promotedUserName} has been promoted to admin`);
          toast.info(`${promotedUserName} needs to logout and login again to access admin features`, { duration: 8000 });
          
          // Optimistically update the user in the local state for instant UI update
          setState((prev) => ({
            users: prev.users.map(u => 
              u._id === promotedUserId 
                ? { ...u, userType: "admin", roleStatus: "verified" }
                : u
            )
          }));
          
          // Refresh from server in background
          setTimeout(() => fetchUsers(), 500);
        }
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Incorrect password. Action cancelled.");
      } else {
        toast.error(error.response?.data?.message || "Failed to promote user");
      }
    } finally {
      setIsPromoting(false);
    }
  };

  const openRemoveAdminModal = (user) => {
    if (user.userType !== "admin") {
      toast.error("User is not an admin");
      return;
    }
    if (user._id === currentUser?._id) {
      toast.error("You cannot remove your own admin privileges");
      return;
    }
    setUserToDemote(user);
    setShowRemoveAdminModal(true);
  };

  const handleRemoveAdmin = async () => {
    if (!adminPassword) {
      toast.error("Please enter your password to confirm");
      return;
    }

    setIsDemoting(true);
    try {
      // Verify admin password
      const response = await axios.post(
        "http://localhost:5000/api/auth/verify-password",
        { password: adminPassword },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      if (response.data.success) {
        // Password verified, proceed with demotion
        const demoteResponse = await axios.patch(
          `http://localhost:5000/api/admin/users/${userToDemote._id}/remove-admin`,
          {},
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );

        if (demoteResponse.data.success) {
          // Success - close modal first
          setShowRemoveAdminModal(false);
          setUserToDemote(null);
          setAdminPassword("");
          
          // Show success message
          toast.success(`${userToDemote.name} has been demoted to ${demoteResponse.data.newType}`);
          
          // Optimistically update the user in the local state for instant UI update
          setState((prev) => ({
            users: prev.users.map(u => 
              u._id === userToDemote._id 
                ? { ...u, userType: demoteResponse.data.newType, roleStatus: "pending" }
                : u
            )
          }));
          
          // Refresh from server in background
          setTimeout(() => fetchUsers(), 500);
        }
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Incorrect password. Action cancelled.");
      } else {
        toast.error(error.response?.data?.message || "Failed to remove admin privileges");
      }
    } finally {
      setIsDemoting(false);
    }
  };

  const handleDownloadDoc = async (docUrl) => {
    // More robust PDF detection
    const isPDF = docUrl.includes('.pdf') || 
                  docUrl.includes('raw/upload') || 
                  docUrl.includes('fl_attachment');
    const isCloudinary = docUrl.includes('res.cloudinary.com');
    
    try {
      // Remove fl_attachment for fetching
      const fetchUrl = docUrl.replace('/upload/fl_attachment/', '/upload/');
      
      // Fetch file as blob
      const response = await fetch(fetchUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      
      // Create download link
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = isPDF ? 'document.pdf' : 'document.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      
      toast.success('Download started!');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Download failed. Try opening in new tab.');
      
      // Fallback: open in new tab
      let fallbackUrl = docUrl;
      if (isPDF && isCloudinary && !fallbackUrl.includes('fl_attachment')) {
        fallbackUrl = fallbackUrl.replace('/upload/', '/upload/fl_attachment/');
      }
      window.open(fallbackUrl, '_blank');
    }
  };

  const openVerificationModal = (user) => {
    setSelectedUser(user);
    setShowVerificationModal(true);
    setVerificationNote("");
  };

  const filteredUsers = users.filter(user => {
    if (activeTab === "pending") {
      return user.roleStatus === "pending";
    }
    return true;
  });

  if (isLoading && users.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 text-white' : 'bg-white text-gray-900'} py-8`}>
      <div className='container mx-auto px-4 max-w-7xl'>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className='mb-8'
        >
          <h1 className='text-4xl font-bold mb-2 bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text flex items-center'>
            <Users size={40} className='mr-3' />
            User Management
          </h1>
          <p className='text-gray-400'>Manage users, approve verifications, and monitor activity</p>
        </motion.div>

        {/* Tabs */}
        <div className='flex gap-4 mb-6'>
          <button
            onClick={() => setActiveTab("all")}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === "all"
                ? "bg-green-600 text-white"
                : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            All Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${
              activeTab === "pending"
                ? "bg-yellow-600 text-white"
                : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            <AlertTriangle size={18} />
            Pending Verifications ({pendingVerifications.length})
          </button>
        </div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='mb-6 bg-primary dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6'
        >
          <form onSubmit={handleSearch} className='flex flex-col md:flex-row gap-4'>
            <div className='flex-1 relative'>
              <Search size={20} className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
              <input
                type='text'
                placeholder='Search by name or email...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-3 text-background bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-green-500'
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className='px-4 py-3 bg-gray-900 text-background border border-gray-700 rounded-lg focus:outline-none focus:border-green-500'
            >
              <option value='all'>All Types</option>
              <option value='individual'>Individual</option>
              <option value='garage'>Garage</option>
              <option value='repair-shop'>Repair Shop</option>
              <option value='recycler'>Recycler</option>
              <option value='technician'>Technician</option>
              <option value='admin'>Admin</option>
            </select>
            <button
              type='submit'
              className='px-6 py-3 bg-background dark:bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition flex items-center gap-2'
            >
              <Filter size={18} />
              Apply Filters
            </button>
          </form>
        </motion.div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='bg-primary dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden'
        >
          <div className='overflow-x-auto'>
            <table className='w-full' style={{ tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '30%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '13%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '20%' }} />
              </colgroup>
              <thead className='bg-gray-900 border-b border-gray-700'>
                <tr>
                  <th className='px-3 py-3 text-left text-xs font-semibold text-gray-400 uppercase'>User</th>
                  <th className='px-3 py-3 text-left text-xs font-semibold text-gray-400 uppercase'>Type</th>
                  <th className='px-3 py-3 text-left text-xs font-semibold text-gray-400 uppercase'>Status</th>
                  <th className='px-3 py-3 text-left text-xs font-semibold text-gray-400 uppercase'>Role</th>
                  <th className='px-3 py-3 text-left text-xs font-semibold text-gray-400 uppercase'>Joined</th>
                  <th className='px-3 py-3 text-center text-xs font-semibold text-gray-400 uppercase'>Actions</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-700'>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan='6' className='px-3 py-12 text-center text-gray-400'>
                      <Users size={48} className='mx-auto mb-4 opacity-50' />
                      <p className='text-lg'>No users found</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr 
                      key={user._id} 
                      className='hover:bg-gray-700/50 transition cursor-pointer'
                      onClick={() => handleUserClick(user._id)}
                    >
                      <td className='px-3 py-3'>
                        <div className='flex items-center gap-2'>
                          <div className='w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center font-bold text-xs flex-shrink-0'>
                            {user.name?.charAt(0).toUpperCase() || "U"}
                          </div>
                          <div className='min-w-0'>
                            <p className='font-semibold text-sm truncate' title={user.name}>{user.name}</p>
                            <p className='text-xs text-gray-400 truncate' title={user.email}>{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className='px-3 py-3'>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold block text-center ${
                          user.userType === "admin" ? "bg-red-900/50 text-red-400" :
                          user.userType === "technician" ? "bg-blue-900/50 text-blue-400" :
                          user.userType === "recycler" ? "bg-green-900/50 text-green-400" :
                          "bg-gray-700 text-gray-300"
                        }`}>
                          {user.userType}
                        </span>
                      </td>
                      <td className='px-3 py-3'>
                        <div className='flex items-center justify-start gap-1'>
                          {user.isBanned ? (
                            <span className='px-2 py-1 rounded-full text-xs font-semibold bg-red-900/50 text-red-400 flex items-center gap-1'>
                              <Ban size={11} /> <span className='hidden sm:inline'>Banned</span>
                            </span>
                          ) : user.isVerified ? (
                            <span className='px-2 py-1 rounded-full text-xs font-semibold bg-green-900/50 text-green-400 flex items-center gap-1'>
                              <CheckCircle size={11} /> <span className='hidden sm:inline'>Verified</span>
                            </span>
                          ) : (
                            <span className='px-2 py-1 rounded-full text-xs font-semibold bg-yellow-900/50 text-yellow-400 flex items-center gap-1'>
                              <AlertTriangle size={11} /> <span className='hidden sm:inline'>Unverified</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className='px-3 py-3'>
                        {user.roleStatus === "pending" ? (
                          <span className='px-2 py-1 rounded-full text-xs font-semibold bg-yellow-900/50 text-yellow-400 flex items-center gap-1'>
                            <AlertTriangle size={11} /> <span className='hidden sm:inline'>Pending</span>
                          </span>
                        ) : user.roleStatus === "verified" ? (
                          <span className='px-2 py-1 rounded-full text-xs font-semibold bg-green-900/50 text-green-400 flex items-center gap-1'>
                            <UserCheck size={11} /> <span className='hidden sm:inline'>Verified</span>
                          </span>
                        ) : (
                          <span className='text-gray-500 text-xs'>N/A</span>
                        )}
                      </td>
                      <td className='px-3 py-3 text-xs text-gray-400'>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className='px-3 py-3'>
                        <div className='flex gap-1 justify-center flex-wrap'>
                          {user.roleStatus === "pending" && user.userType !== "admin" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openVerificationModal(user);
                              }}
                              className='p-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg transition flex-shrink-0'
                              title='Review Verification'
                            >
                              <Eye size={14} />
                            </button>
                          )}
                          {!user.isVerified && user.userType !== "admin" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleVerifyEmail(user._id);
                              }}
                              className='p-1.5 bg-green-600 hover:bg-green-700 rounded-lg transition flex-shrink-0'
                              title='Verify Email'
                            >
                              <UserCheck size={14} />
                            </button>
                          )}
                          {user.userType !== "admin" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBanUser(user._id);
                              }}
                              className={`p-1.5 rounded-lg transition flex-shrink-0 ${
                                user.isBanned 
                                  ? "bg-green-600 hover:bg-green-700" 
                                  : "bg-red-600 hover:bg-red-700"
                              }`}
                              title={user.isBanned ? "Unban User" : "Ban User"}
                            >
                              {user.isBanned ? <CheckCircle size={14} /> : <Ban size={14} />}
                            </button>
                          )}
                          {user.userType !== "admin" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openDeleteModal(user);
                              }}
                              className='p-1.5 bg-red-700 hover:bg-red-800 rounded-lg transition flex-shrink-0'
                              title='Delete User'
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                          {user.userType !== "admin" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openMakeAdminModal(user);
                              }}
                              className='p-1.5 bg-purple-600 hover:bg-purple-700 rounded-lg transition flex-shrink-0'
                              title='Make Admin'
                            >
                              <Shield size={14} />
                            </button>
                          )}
                          {user.userType === "admin" && user._id !== currentUser?._id && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openRemoveAdminModal(user);
                              }}
                              className='p-1.5 bg-orange-600 hover:bg-orange-700 rounded-lg transition flex-shrink-0'
                              title='Remove Admin'
                            >
                              <ShieldCheck size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Verification Modal */}
        {showVerificationModal && selectedUser && (
          <div className='fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className='bg-primary dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto'
            >
              <div className='p-6'>
                <h2 className='text-2xl font-bold mb-4 flex items-center gap-2'>
                  <UserCheck size={28} className='text-green-400' />
                  Review Verification Request
                </h2>

                <div className='space-y-4 mb-6'>
                  <div className='bg-gray-900/50 p-4 rounded-lg'>
                    <p className='text-sm text-gray-400 mb-1'>User Name</p>
                    <p className='font-semibold'>{selectedUser.name}</p>
                  </div>
                  <div className='bg-gray-900/50 p-4 rounded-lg'>
                    <p className='text-sm text-gray-400 mb-1'>Email</p>
                    <p className='font-semibold'>{selectedUser.email}</p>
                  </div>
                  <div className='bg-gray-900/50 p-4 rounded-lg'>
                    <p className='text-sm text-gray-400 mb-1'>Requested Role</p>
                    <p className='font-semibold capitalize'>{selectedUser.userType}</p>
                  </div>
                  {selectedUser.expertise && (
                    <div className='bg-gray-900/50 p-4 rounded-lg'>
                      <p className='text-sm text-gray-400 mb-1'>Expertise</p>
                      <p className='font-semibold'>{selectedUser.expertise}</p>
                    </div>
                  )}
                  {selectedUser.verificationDocs && selectedUser.verificationDocs.length > 0 && (
                    <div className='bg-gray-900/50 p-4 rounded-lg'>
                      <p className='text-sm text-gray-400 mb-2'>Verification Documents ({selectedUser.verificationDocs.length})</p>
                      <div className='space-y-3'>
                        {selectedUser.verificationDocs.map((doc, index) => {
                          // More robust PDF detection
                          const isPDF = doc.includes('.pdf') || 
                                        doc.includes('raw/upload') || 
                                        doc.includes('fl_attachment');
                          const isCloudinary = doc.includes('res.cloudinary.com');
                          
                          return (
                            <div key={index} className='bg-primary dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700'>
                              {/* Document Preview */}
                              <div className='p-3 border-b border-gray-700'>
                                <div className='flex items-center justify-between mb-2'>
                                  <span className='text-sm font-semibold text-white'>
                                    {isPDF ? '📄' : '🖼️'} Document {index + 1}
                                  </span>
                                  <span className='text-xs text-gray-400'>
                                    {isCloudinary ? 'Cloudinary' : 'Local Storage'}
                                  </span>
                                </div>
                                
                                {/* Image Preview */}
                                {!isPDF && isCloudinary && (
                                  <div className='mb-2 rounded overflow-hidden'>
                                    <img 
                                      src={doc} 
                                      alt={`Verification document ${index + 1}`}
                                      className='w-full h-auto max-h-64 object-contain bg-gray-900'
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'block';
                                      }}
                                    />
                                    <div className='hidden p-4 text-center text-gray-400 text-sm'>
                                      Failed to load image preview
                                    </div>
                                  </div>
                                )}
                                
                                {/* PDF Preview Notice */}
                                {isPDF && (
                                  <div className='mb-2 p-3 bg-blue-900/30 border border-blue-700 rounded text-sm text-blue-300'>
                                    📋 PDF Document - Click to view in new tab
                                  </div>
                                )}
                              </div>
                              
                              {/* Action Buttons */}
                              <div className='p-3 flex gap-2'>
                                <button
                                  onClick={() => setPreviewDoc({ url: doc, type: isPDF ? 'pdf' : 'image', index })}
                                  className='flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm font-semibold transition flex items-center justify-center gap-2'
                                >
                                  👁️ Preview
                                </button>
                                <button
                                  onClick={() => handleDownloadDoc(doc)}
                                  className='px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-semibold transition'
                                  title='Download'
                                >
                                  ⬇️ Download
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <p className='text-xs text-gray-500 mt-3'>
                        💡 Tip: Click "View Full Size" to examine documents in detail before approving/rejecting
                      </p>
                    </div>
                  )}
                  <div className='bg-gray-900/50 p-4 rounded-lg'>
                    <label className='text-sm text-gray-400 mb-2 block'>Moderator Note (Optional)</label>
                    <textarea
                      value={verificationNote}
                      onChange={(e) => setVerificationNote(e.target.value)}
                      placeholder='Add a note about this verification decision...'
                      className='w-full p-3 bg-gray-200 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:border-green-500 resize-none text-gray-900 dark:text-white'
                      rows='3'
                    />
                  </div>
                </div>

                <div className='flex gap-3'>
                  <button
                    onClick={() => handleVerifyUser(selectedUser._id, "verified")}
                    className='flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition flex items-center justify-center gap-2'
                  >
                    <CheckCircle size={20} />
                    Approve Verification
                  </button>
                  <button
                    onClick={() => handleVerifyUser(selectedUser._id, "rejected")}
                    className='flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition flex items-center justify-center gap-2'
                  >
                    <XCircle size={20} />
                    Reject Verification
                  </button>
                  <button
                    onClick={() => {
                      setShowVerificationModal(false);
                      setSelectedUser(null);
                      setVerificationNote("");
                    }}
                    className='px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition'
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Document Preview Modal */}
        {previewDoc && (
          <div className='fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[60] p-4'>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className='bg-gray-900 rounded-xl border border-gray-700 max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col'
            >
              {/* Header */}
              <div className='p-4 border-b border-gray-700 flex items-center justify-between'>
                <h3 className='text-xl font-bold text-white flex items-center gap-2'>
                  {previewDoc.type === 'pdf' ? '📄' : '🖼️'} Document Preview
                </h3>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className='p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition'
                >
                  <XCircle size={24} className='text-gray-400 hover:text-white' />
                </button>
              </div>

              {/* Preview Content */}
              <div className='flex-1 overflow-auto p-4 bg-gray-950'>
                {previewDoc.type === 'image' ? (
                  <div className='flex items-center justify-center min-h-[60vh]'>
                    <img
                      src={previewDoc.url}
                      alt='Document preview'
                      className='max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl'
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className='hidden flex-col items-center justify-center text-gray-400'>
                      <AlertTriangle size={48} className='mb-4' />
                      <p className='text-lg'>Failed to load image preview</p>
                      <button
                        onClick={() => window.open(previewDoc.url, '_blank')}
                        className='mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white transition'
                      >
                        Open in New Tab
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className='flex flex-col items-center justify-center min-h-[60vh] w-full'>
                    {/* Inline PDF Preview using blob URL */}
                    <div className='w-full max-w-4xl bg-white rounded-lg shadow-2xl overflow-hidden relative' style={{ height: '75vh' }}>
                      {/* Loading State */}
                      {pdfLoading && (
                        <div className='absolute inset-0 bg-gray-900 bg-opacity-90 flex items-center justify-center z-10'>
                          <div className='text-center'>
                            <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4'></div>
                            <p className='text-white text-lg'>Loading PDF...</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Error State */}
                      {pdfError && (
                        <div className='absolute inset-0 bg-gray-900 bg-opacity-90 flex items-center justify-center z-10'>
                          <div className='text-center text-white'>
                            <AlertTriangle size={64} className='mx-auto mb-4 text-red-500' />
                            <p className='text-lg mb-4'>Failed to load PDF preview</p>
                            <p className='text-sm text-gray-400 mb-6'>Click "Open in New Tab" to view the document</p>
                          </div>
                        </div>
                      )}
                      
                      <iframe
                        ref={iframeRef}
                        id='pdf-preview-iframe'
                        className='w-full h-full border-0'
                        title='PDF Preview'
                      />
                    </div>
                    {/* Fallback buttons */}
                    <div className='mt-4 flex gap-4'>
                      <button
                        onClick={() => window.open(previewDoc.url.replace('/upload/fl_attachment/', '/upload/'), '_blank')}
                        className='px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold transition flex items-center gap-2'
                      >
                        👁️ Open in New Tab
                      </button>
                      <button
                        onClick={() => handleDownloadDoc(previewDoc.url)}
                        className='px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition flex items-center gap-2'
                      >
                        ⬇️ Download PDF
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className='p-4 border-t border-gray-700 flex justify-between items-center'>
                <p className='text-sm text-gray-400'>
                  {previewDoc.type === 'pdf' ? 'PDF Document' : 'Image Document'}
                </p>
                <div className='flex gap-2'>
                  <button
                    onClick={() => handleDownloadDoc(previewDoc.url)}
                    className='px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-semibold transition'
                  >
                    ⬇️ Download
                  </button>
                  <button
                    onClick={() => setPreviewDoc(null)}
                    className='px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm font-semibold transition'
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Delete User Modal with Password Verification */}
        {showDeleteModal && userToDelete && (
          <div className='fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className='bg-primary dark:bg-gray-800 rounded-xl border border-red-300 dark:border-red-700 max-w-md w-full'
            >
              <div className='p-6'>
                <div className='flex items-center gap-3 mb-4'>
                  <div className='p-3 bg-red-600/20 rounded-full'>
                    <AlertTriangle size={32} className='text-red-500' />
                  </div>
                  <div>
                    <h2 className='text-2xl font-bold text-white'>Delete User Account</h2>
                    <p className='text-sm text-gray-400'>This action cannot be undone</p>
                  </div>
                </div>

                <div className='bg-red-900/20 border border-red-700 rounded-lg p-4 mb-6'>
                  <p className='text-white font-semibold mb-2'>You are about to delete:</p>
                  <div className='bg-gray-900/50 p-3 rounded-lg'>
                    <p className='text-white font-semibold'>{userToDelete.name}</p>
                    <p className='text-sm text-gray-400'>{userToDelete.email}</p>
                    <p className='text-xs text-gray-500 mt-1'>User ID: {userToDelete._id}</p>
                  </div>
                  <p className='text-xs text-red-400 mt-3'>
                    ⚠️ Warning: This will permanently delete the user account and all associated data including listings, exchanges, and messages.
                  </p>
                </div>

                <div className='mb-6'>
                  <label className='text-sm text-gray-400 mb-2 block flex items-center gap-2'>
                    <Lock size={14} />
                    Enter your admin password to confirm:
                  </label>
                  <input
                    type='password'
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && adminPassword) {
                        handleDeleteUser();
                      }
                    }}
                    placeholder='Enter your password...'
                    className='w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500 text-white'
                    autoFocus
                  />
                </div>

                <div className='flex gap-3'>
                  <button
                    onClick={handleDeleteUser}
                    disabled={!adminPassword || isVerifyingPassword}
                    className='flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition flex items-center justify-center gap-2'
                  >
                    {isVerifyingPassword ? (
                      <>
                        <div className='animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white'></div>
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Trash2 size={18} />
                        Delete User
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setUserToDelete(null);
                      setAdminPassword("");
                    }}
                    className='px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition'
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Make Admin Modal with Password Verification */}
        {showMakeAdminModal && userToPromote && (
          <div className='fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className='bg-primary dark:bg-gray-800 rounded-xl border border-purple-300 dark:border-purple-700 max-w-md w-full'
            >
              <div className='p-6'>
                <div className='flex items-center gap-3 mb-4'>
                  <div className='p-3 bg-purple-600/20 rounded-full'>
                    <ShieldCheck size={32} className='text-purple-500' />
                  </div>
                  <div>
                    <h2 className='text-2xl font-bold text-white'>Promote to Admin</h2>
                    <p className='text-sm text-gray-400'>Grant admin privileges</p>
                  </div>
                </div>

                <div className='bg-purple-900/20 border border-purple-700 rounded-lg p-4 mb-6'>
                  <p className='text-white font-semibold mb-2'>You are about to promote:</p>
                  <div className='bg-gray-900/50 p-3 rounded-lg'>
                    <p className='text-white font-semibold'>{userToPromote.name}</p>
                    <p className='text-sm text-gray-400'>{userToPromote.email}</p>
                    <p className='text-xs text-gray-500 mt-1'>Current Role: {userToPromote.userType}</p>
                  </div>
                  <p className='text-xs text-purple-400 mt-3'>
                    ⚠️ Warning: This user will have full admin access including user management, content moderation, and system settings.
                  </p>
                </div>

                <div className='mb-6'>
                  <label className='text-sm text-gray-400 mb-2 block flex items-center gap-2'>
                    <Lock size={14} />
                    Enter your admin password to confirm:
                  </label>
                  <input
                    type='password'
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && adminPassword) {
                        handleMakeAdmin();
                      }
                    }}
                    placeholder='Enter your password...'
                    className='w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 text-white'
                    autoFocus
                  />
                </div>

                <div className='flex gap-3'>
                  <button
                    onClick={handleMakeAdmin}
                    disabled={!adminPassword || isPromoting}
                    className='flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition flex items-center justify-center gap-2'
                  >
                    {isPromoting ? (
                      <>
                        <div className='animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white'></div>
                        Promoting...
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={18} />
                        Promote to Admin
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowMakeAdminModal(false);
                      setUserToPromote(null);
                      setAdminPassword("");
                    }}
                    className='px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition'
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Remove Admin Modal with Password Verification */}
        {showRemoveAdminModal && userToDemote && (
          <div className='fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className='bg-primary dark:bg-gray-800 rounded-xl border border-orange-300 dark:border-orange-700 max-w-md w-full'
            >
              <div className='p-6'>
                <div className='flex items-center gap-3 mb-4'>
                  <div className='p-3 bg-orange-600/20 rounded-full'>
                    <Shield size={32} className='text-orange-500' />
                  </div>
                  <div>
                    <h2 className='text-2xl font-bold text-white'>Remove Admin Privileges</h2>
                    <p className='text-sm text-gray-400'>Demote user from admin role</p>
                  </div>
                </div>

                <div className='bg-orange-900/20 border border-orange-700 rounded-lg p-4 mb-6'>
                  <p className='text-white font-semibold mb-2'>You are about to remove admin from:</p>
                  <div className='bg-gray-900/50 p-3 rounded-lg'>
                    <p className='text-white font-semibold'>{userToDemote.name}</p>
                    <p className='text-sm text-gray-400'>{userToDemote.email}</p>
                    <p className='text-xs text-gray-500 mt-1'>Current Role: {userToDemote.userType}</p>
                  </div>
                  <p className='text-xs text-orange-400 mt-3'>
                    ⚠️ Warning: This user will lose all admin access including user management, content moderation, and system settings. They will be reverted to a regular user.
                  </p>
                </div>

                <div className='mb-6'>
                  <label className='text-sm text-gray-400 mb-2 block flex items-center gap-2'>
                    <Lock size={14} />
                    Enter your admin password to confirm:
                  </label>
                  <input
                    type='password'
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && adminPassword) {
                        handleRemoveAdmin();
                      }
                    }}
                    placeholder='Enter your password...'
                    className='w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500 text-white'
                    autoFocus
                  />
                </div>

                <div className='flex gap-3'>
                  <button
                    onClick={handleRemoveAdmin}
                    disabled={!adminPassword || isDemoting}
                    className='flex-1 px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition flex items-center justify-center gap-2'
                  >
                    {isDemoting ? (
                      <>
                        <div className='animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white'></div>
                        Removing...
                      </>
                    ) : (
                      <>
                        <Shield size={18} />
                        Remove Admin
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowRemoveAdminModal(false);
                      setUserToDemote(null);
                      setAdminPassword("");
                    }}
                    className='px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition'
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
