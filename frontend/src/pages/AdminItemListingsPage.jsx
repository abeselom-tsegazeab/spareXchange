import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { 
  Package, Search, Filter, Eye, Trash2, Ban, MapPin, 
  Calendar, User
} from "lucide-react";
import axios from "axios";

const CATEGORIES = [
  "Engine Parts", "Transmission", "Brakes", "Suspension", 
  "Electrical", "Body Parts", "Interior", "Exterior", "Other"
];

const CONDITIONS = ["New", "Used - Like New", "Used - Good", "Used - Fair", "Refurbished"];

const AdminItemListingsPage = () => {
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: "",
    condition: "",
    status: "",
    available: "",
    search: ""
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.condition) params.condition = filters.condition;
      if (filters.status) params.status = filters.status;
      if (filters.available) params.available = filters.available;
      if (filters.search) params.search = filters.search;

      const response = await axios.get("http://localhost:5000/api/listings/admin/all", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        params
      });

      if (response.data.success) {
        setListings(response.data.listings);
      }
    } catch (error) {
      toast.error("Failed to load listings");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    loadListings();
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setFilters({ category: "", condition: "", status: "", available: "", search: "" });
    loadListings();
  };

  const handleDeleteListing = async (listingId) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/listings/${listingId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      toast.success("Listing deleted successfully");
      loadListings();
    } catch (error) {
      toast.error("Failed to delete listing");
      console.error(error);
    }
  };

  const handleBanUser = async (userId, currentBanStatus) => {
    const action = currentBanStatus ? "unban" : "ban";
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      await axios.post(
        `http://localhost:5000/api/admin/users/${userId}/ban`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      toast.success(`User ${action}ned successfully`);
      loadListings();
    } catch (error) {
      toast.error(`Failed to ${action} user`);
      console.error(error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder-image.jpg";
    if (imagePath.startsWith("http")) return imagePath;
    if (imagePath.startsWith("/uploads")) {
      return `http://localhost:5000${imagePath}`;
    }
    return imagePath;
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
            <Package className='text-purple-600 dark:text-purple-400' size={40} />
            Admin - Item Listings
          </h1>
          <p className='text-gray-600 dark:text-gray-400'>Manage and moderate all marketplace listings</p>
        </div>

        {/* Search and Filters */}
        <div className='bg-primary dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-6'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex-1 max-w-md'>
              <div className='relative'>
                <Search className='absolute left-3 top-3.5 text-gray-500 dark:text-gray-400' size={20} />
                <input
                  type='text'
                  name='search'
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder='Search by title or description...'
                  className='w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500'
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
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4'>
                <div>
                  <label className='block text-gray-900 dark:text-white text-sm font-semibold mb-2'>Category</label>
                  <select
                    name='category'
                    value={filters.category}
                    onChange={handleFilterChange}
                    className='w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500'
                  >
                    <option value=''>All Categories</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className='block text-gray-900 dark:text-white text-sm font-semibold mb-2'>Condition</label>
                  <select
                    name='condition'
                    value={filters.condition}
                    onChange={handleFilterChange}
                    className='w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500'
                  >
                    <option value=''>All Conditions</option>
                    {CONDITIONS.map(cond => (
                      <option key={cond} value={cond}>{cond}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className='block text-gray-900 dark:text-white text-sm font-semibold mb-2'>Status</label>
                  <select
                    name='status'
                    value={filters.status}
                    onChange={handleFilterChange}
                    className='w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500'
                  >
                    <option value=''>All Statuses</option>
                    <option value='true'>Active</option>
                    <option value='false'>Inactive</option>
                  </select>
                </div>
                <div>
                  <label className='block text-gray-900 dark:text-white text-sm font-semibold mb-2'>Availability</label>
                  <select
                    name='available'
                    value={filters.available}
                    onChange={handleFilterChange}
                    className='w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500'
                  >
                    <option value=''>All</option>
                    <option value='true'>Available</option>
                    <option value='false'>Unavailable</option>
                  </select>
                </div>
              </div>
              <div className='flex gap-3'>
                <button
                  onClick={handleApplyFilters}
                  className='px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-indigo-700 transition duration-200'
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
            Showing <span className='text-purple-600 dark:text-purple-400 font-semibold'>{listings.length}</span> listing{listings.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Listings Grid */}
        {isLoading ? (
          <div className='text-center py-16'>
            <div className='animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto'></div>
            <p className='text-gray-400 mt-4'>Loading listings...</p>
          </div>
        ) : listings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='bg-primary dark:bg-gray-800 rounded-xl p-12 border border-gray-200 dark:border-gray-700 text-center'
          >
            <Package size={64} className='mx-auto text-gray-400 mb-4' />
            <h3 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>No Listings Found</h3>
            <p className='text-gray-600 dark:text-gray-400'>Try adjusting your filters</p>
          </motion.div>
        ) : (
          <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
            {listings.map((listing, index) => (
              <motion.div
                key={listing._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className='bg-primary dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-600 transition duration-200 overflow-hidden'
              >
                {/* Image */}
                <div className='h-48 bg-gray-200 dark:bg-gray-700 relative'>
                  <img
                    src={getImageUrl(listing.images?.[0])}
                    alt={listing.title}
                    className='w-full h-full object-cover'
                  />
                  <div className='absolute top-2 right-2 flex gap-2'>
                    <span className={`px-2 py-1 ${listing.isActive ? 'bg-green-600' : 'bg-red-600'} text-white text-xs rounded-full`}>
                      {listing.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className={`px-2 py-1 ${listing.available ? 'bg-blue-600' : 'bg-gray-600'} text-white text-xs rounded-full`}>
                      {listing.available ? 'Available' : 'Sold'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className='p-4'>
                  <h3 className='text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1'>{listing.title}</h3>
                  <p className='text-purple-600 dark:text-purple-400 text-xl font-bold mb-2'>${listing.price}</p>
                  
                  <div className='space-y-1 text-sm text-gray-600 dark:text-gray-400 mb-3'>
                    <div className='flex items-center gap-2'>
                      <Package size={14} />
                      <span>{listing.category}</span>
                      <span className='mx-1'>•</span>
                      <span>{listing.condition}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <MapPin size={14} />
                      <span>{listing.location}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Calendar size={14} />
                      <span>{formatDate(listing.createdAt)}</span>
                      <span className='mx-1'>•</span>
                      <Eye size={14} />
                      <span>{listing.views || 0} views</span>
                    </div>
                  </div>

                  {/* Owner Info */}
                  {listing.seller && (
                    <div className='bg-gray-100 dark:bg-gray-700 rounded-lg p-3 mb-3'>
                      <div className='flex items-center gap-2 mb-2'>
                        <User size={16} className='text-purple-600 dark:text-purple-400' />
                        <span className='text-gray-900 dark:text-white font-semibold text-sm'>{listing.seller.name}</span>
                        {listing.seller.isBanned && (
                          <span className='px-2 py-0.5 bg-red-600 text-white text-xs rounded-full'>Banned</span>
                        )}
                      </div>
                      <div className='text-xs text-gray-600 dark:text-gray-400 space-y-1'>
                        <p>{listing.seller.email}</p>
                        <p className='flex items-center justify-between'>
                          <span>EcoPoints: {listing.seller.ecoPoints || 0}</span>
                          <span className={listing.seller.verifiedSeller ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}>
                            {listing.seller.verifiedSeller ? '✓ Verified' : 'Not Verified'}
                          </span>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className='flex gap-2'>
                    <Link
                      to={`/listing/${listing._id}`}
                      className='flex-1 px-3 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:from-purple-600 hover:to-indigo-700 transition duration-200 text-center'
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => handleDeleteListing(listing._id)}
                      className='px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition duration-200'
                      title='Delete Listing'
                    >
                      <Trash2 size={16} />
                    </button>
                    {listing.seller && (
                      <button
                        onClick={() => handleBanUser(listing.seller._id, listing.seller.isBanned)}
                        className={`px-3 py-2 ${listing.seller.isBanned ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'} text-white rounded-lg transition duration-200`}
                        title={listing.seller.isBanned ? 'Unban User' : 'Ban User'}
                      >
                        <Ban size={16} />
                      </button>
                    )}
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

export default AdminItemListingsPage;
