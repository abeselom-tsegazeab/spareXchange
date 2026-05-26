import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useExchangeStore } from "../store/exchangeStore";
import { useListingStore } from "../store/listingStore";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import { X, MapPin, Calendar, Tag } from "lucide-react";

const ProposeExchangeModal = ({ isOpen, onClose, listingId }) => {
  const { user } = useAuthStore();
  const { proposeExchange, isLoading } = useExchangeStore();
  const { listings, getUserListings } = useListingStore();
  
  const [offeredItems, setOfferedItems] = useState("");
  const [offeredListingId, setOfferedListingId] = useState("");
  const [meetingLocation, setMeetingLocation] = useState("");
  const [meetingTime, setMeetingTime] = useState("");

  useEffect(() => {
    if (isOpen && user) {
      fetchUserListings();
    }
  }, [isOpen, user]);

  const fetchUserListings = async () => {
    try {
      await getUserListings();
    } catch (error) {
      console.error("Failed to fetch listings:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!offeredItems.trim() && !offeredListingId) {
      toast.error("Please describe what you're offering or select a listing");
      return;
    }

    try {
      const exchangeData = {
        listingId,
        offeredItems: offeredItems.trim(),
        offeredListingId: offeredListingId || undefined,
        meetingLocation: meetingLocation.trim() || undefined,
        meetingTime: meetingTime || undefined
      };

      await proposeExchange(exchangeData);
      toast.success("Exchange proposal sent successfully!");
      handleClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to propose exchange");
    }
  };

  const handleClose = () => {
    setOfferedItems("");
    setOfferedListingId("");
    setMeetingLocation("");
    setMeetingTime("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-700">
                <h2 className="text-2xl font-bold text-white">Propose Exchange</h2>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-white transition"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Offered Items */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    What are you offering? *
                  </label>
                  <textarea
                    value={offeredItems}
                    onChange={(e) => setOfferedItems(e.target.value)}
                    placeholder="e.g., 'Brake Pads + $50 Cash', 'OEM Alternator', etc."
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition"
                    rows="3"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Describe the items, parts, or cash you're offering in exchange
                  </p>
                </div>

                {/* Or Select Your Listing */}
                {listings && listings.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                      <Tag size={16} className="text-green-400" />
                      Or select one of your listings (optional)
                    </label>
                    <select
                      value={offeredListingId}
                      onChange={(e) => setOfferedListingId(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500 transition"
                    >
                      <option value="">Select a listing to offer...</option>
                      {listings
                        .filter(l => l.available)
                        .map(listing => (
                          <option key={listing._id} value={listing._id}>
                            {listing.title} - ${listing.price}
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                {/* Meeting Location */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                    <MapPin size={16} className="text-green-400" />
                    Preferred Meeting Location (optional)
                  </label>
                  <input
                    type="text"
                    value={meetingLocation}
                    onChange={(e) => setMeetingLocation(e.target.value)}
                    placeholder="e.g., 'Central Police Station', 'SuperFix Garage'"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition"
                  />
                </div>

                {/* Meeting Time */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                    <Calendar size={16} className="text-green-400" />
                    Preferred Meeting Time (optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={meetingTime}
                    onChange={(e) => setMeetingTime(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500 transition"
                  />
                </div>

                {/* Info Box */}
                <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
                  <p className="text-sm text-blue-300">
                    <strong>Note:</strong> The seller will review your proposal and can accept, reject, or make a counter-offer. 
                    You can propose up to 3 active exchanges per listing.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-700">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition font-semibold"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-semibold disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending..." : "Send Proposal"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProposeExchangeModal;
