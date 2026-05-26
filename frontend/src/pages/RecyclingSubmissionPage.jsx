import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Recycle, 
  MapPin, 
  Weight, 
  DollarSign, 
  FileText, 
  Camera,
  Loader2,
  CheckCircle,
  AlertCircle,
  QrCode
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import { QRCodeSVG as QRCode } from "qrcode.react";

const ITEM_TYPES = [
  { value: "electronics", label: "Electronics", basePoints: 20 },
  { value: "vehicle-parts", label: "Vehicle Parts", basePoints: 25 },
  { value: "mobile-devices", label: "Mobile Devices", basePoints: 15 },
  { value: "computers", label: "Computers", basePoints: 30 },
  { value: "batteries", label: "Batteries", basePoints: 10 },
  { value: "appliances", label: "Appliances", basePoints: 20 },
  { value: "plastic", label: "Plastic", basePoints: 5 },
  { value: "metal", label: "Metal", basePoints: 8 },
  { value: "other", label: "Other", basePoints: 10 }
];

const RecyclingSubmissionPage = () => {
  const { user, createRecyclingSubmission } = useAuthStore();
  const [formData, setFormData] = useState({
    itemType: "",
    itemDescription: "",
    estimatedWeight: "",
    estimatedValue: "",
    location: "",
    latitude: "",
    longitude: "",
    notes: ""
  });
  const [useWeight, setUseWeight] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [submissionData, setSubmissionData] = useState(null);
  const [estimatedPoints, setEstimatedPoints] = useState(0);

  // Get user's location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
        },
        (error) => {
          console.log("Geolocation error:", error);
          toast.error("Unable to get your location. Please enable location services.");
        }
      );
    }
  }, []);

  // Calculate estimated points
  useEffect(() => {
    if (!formData.itemType) {
      setEstimatedPoints(0);
      return;
    }

    const itemType = ITEM_TYPES.find(t => t.value === formData.itemType);
    const basePoints = itemType?.basePoints || 10;
    
    let points = basePoints;
    if (useWeight && formData.estimatedWeight) {
      points = Math.round(basePoints * parseFloat(formData.estimatedWeight));
    } else if (!useWeight && formData.estimatedValue) {
      points = Math.round(basePoints * (parseFloat(formData.estimatedValue) / 100));
    }

    points = Math.max(5, Math.min(500, points));
    setEstimatedPoints(points);
  }, [formData.itemType, formData.estimatedWeight, formData.estimatedValue, useWeight]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.itemType || !formData.itemDescription || !formData.location) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const submissionPayload = {
        itemType: formData.itemType,
        itemDescription: formData.itemDescription,
        location: formData.location,
        notes: formData.notes
      };

      if (useWeight && formData.estimatedWeight) {
        submissionPayload.estimatedWeight = parseFloat(formData.estimatedWeight);
      } else if (!useWeight && formData.estimatedValue) {
        submissionPayload.estimatedValue = parseFloat(formData.estimatedValue);
      }

      if (formData.latitude && formData.longitude) {
        submissionPayload.latitude = parseFloat(formData.latitude);
        submissionPayload.longitude = parseFloat(formData.longitude);
      }

      const response = await createRecyclingSubmission(submissionPayload);
      
      setSubmissionData(response);
      setSubmissionSuccess(true);
      toast.success("Recycling submission created successfully!");
      
      // Reset form
      setFormData({
        itemType: "",
        itemDescription: "",
        estimatedWeight: "",
        estimatedValue: "",
        location: "",
        latitude: formData.latitude,
        longitude: formData.longitude,
        notes: ""
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create recycling submission");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submissionSuccess && submissionData) {
    return (
      <div className="min-h-screen bg-white dark:bg-gradient-to-b from-gray-900 via-green-900 to-emerald-900 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-primary dark:bg-gray-800 backdrop-blur-xl rounded-3xl border border-gray-200 dark:border-gray-700 p-8 shadow-2xl"
          >
            <div className="text-center mb-6">
              <CheckCircle className="size-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Submission Created!</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Your recycling submission has been created successfully.
              </p>
            </div>

            <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-6 mb-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Verification Token</p>
                  <p className="text-2xl font-mono font-bold text-green-600 dark:text-green-400">
                    {submissionData.submission.verificationToken}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Eco Points</p>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    +{submissionData.submission.ecoPointsEarned} pts
                  </p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Share this token with the recycler to verify your submission and earn points.
              </p>
            </div>

            {submissionData.qrCodeData && (
              <div className="bg-white p-4 rounded-xl mb-6 inline-block mx-auto w-full">
                <div className="flex justify-center">
                  <QRCode 
                    value={submissionData.qrCodeData} 
                    size={200}
                    level="H"
                  />
                </div>
                <p className="text-center text-gray-600 text-xs mt-2">
                  Scan to verify recycling submission
                </p>
              </div>
            )}

            <button
              onClick={() => setSubmissionSuccess(false)}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-lg transition duration-200"
            >
              Create Another Submission
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-b from-gray-900 via-green-900 to-emerald-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center p-3 bg-green-500 bg-opacity-10 rounded-2xl mb-4">
            <Recycle className="size-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Submit for Recycling
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Earn eco-points by recycling your old parts and electronics responsibly.
          </p>
        </motion.div>

        {/* Points Estimator */}
        {estimatedPoints > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-4 mb-6 text-center"
          >
            <p className="text-white font-semibold">
              Estimated Points: <span className="text-2xl font-bold">{estimatedPoints}</span> eco-points
            </p>
          </motion.div>
        )}

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-primary dark:bg-gray-800 backdrop-blur-xl rounded-3xl border border-gray-200 dark:border-gray-700 p-8 shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Item Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Item Type <span className="text-red-500">*</span>
              </label>
              <select
                name="itemType"
                value={formData.itemType}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-500/20 text-gray-900 dark:text-white transition-all"
                required
              >
                <option value="">Select item type</option>
                {ITEM_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label} ({type.basePoints} pts base)
                  </option>
                ))}
              </select>
            </div>

            {/* Item Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <FileText className="inline size-4 mr-1 text-green-600 dark:text-green-400" />
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="itemDescription"
                value={formData.itemDescription}
                onChange={handleChange}
                placeholder="Describe the item you're recycling..."
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-500/20 text-gray-900 dark:text-white transition-all resize-none"
                rows="3"
                required
              />
            </div>

            {/* Weight/Value Toggle */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Quantity Estimation
              </label>
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setUseWeight(true)}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
                    useWeight 
                      ? "bg-green-500 text-white" 
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  <Weight className="inline size-4 mr-1" />
                  Weight (kg)
                </button>
                <button
                  type="button"
                  onClick={() => setUseWeight(false)}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
                    !useWeight 
                      ? "bg-green-500 text-white" 
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  <DollarSign className="inline size-4 mr-1" />
                  Value ($)
                </button>
              </div>

              {useWeight ? (
                <input
                  type="number"
                  name="estimatedWeight"
                  value={formData.estimatedWeight}
                  onChange={handleChange}
                  placeholder="Estimated weight in kg"
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-500/20 text-gray-900 dark:text-white transition-all"
                  min="0"
                  step="0.1"
                />
              ) : (
                <input
                  type="number"
                  name="estimatedValue"
                  value={formData.estimatedValue}
                  onChange={handleChange}
                  placeholder="Estimated value in dollars"
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-500/20 text-gray-900 dark:text-white transition-all"
                  min="0"
                  step="0.01"
                />
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <MapPin className="inline size-4 mr-1 text-green-600 dark:text-green-400" />
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Eastside Recycling Center"
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-500/20 text-gray-900 dark:text-white transition-all"
                required
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Additional Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any additional information..."
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-500/20 text-gray-900 dark:text-white transition-all resize-none"
                rows="2"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-xl transition duration-200 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Recycle className="size-5" />
                  Create Recycling Submission
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default RecyclingSubmissionPage;
