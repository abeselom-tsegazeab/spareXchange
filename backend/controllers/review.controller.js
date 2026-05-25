import { Review } from "../models/review.model.js";
import { User } from "../models/user.model.js";
import { Exchange } from "../models/exchange.model.js";

// Get user's completed exchanges eligible for review
export const getReviewableExchanges = async (req, res) => {
	try {
		const reviewerId = req.userId;
		const { revieweeId } = req.query;

		console.log('=== Get Reviewable Exchanges ===');
		console.log('Reviewer:', reviewerId);
		console.log('Reviewee (optional):', revieweeId);

		// Find fully completed exchanges where user is participant
		const query = {
			status: "fully_completed",
			$or: [{ buyerId: reviewerId }, { sellerId: reviewerId }]
		};

		// If revieweeId is provided, filter exchanges with that user
		if (revieweeId) {
			query.$or = [
				{ buyerId: reviewerId, sellerId: revieweeId },
				{ sellerId: reviewerId, buyerId: revieweeId }
			];
		}

		const exchanges = await Exchange.find(query)
			.populate("buyerId", "name profilePicture")
			.populate("sellerId", "name profilePicture")
			.populate("listingId", "title images category")
			.sort({ createdAt: -1 });

		// Filter out exchanges already reviewed
		const reviewableExchanges = [];
		for (const exchange of exchanges) {
			const existingReview = await Review.findOne({
				reviewerId,
				exchangeId: exchange._id
			});

			if (!existingReview) {
				// Determine who the other party is (the reviewee)
				const otherParty = exchange.buyerId._id.toString() === reviewerId 
					? exchange.sellerId 
					: exchange.buyerId;

				reviewableExchanges.push({
					exchangeId: exchange._id,
					revieweeId: otherParty._id,
					revieweeName: otherParty.name,
					revieweeProfilePicture: otherParty.profilePicture,
					listingTitle: exchange.listingId?.title || "Exchange",
					completedAt: exchange.updatedAt,
					exchangeType: exchange.buyerId._id.toString() === reviewerId ? "Bought from" : "Sold to"
				});
			}
		}

		console.log(`Found ${reviewableExchanges.length} reviewable exchanges`);

		res.status(200).json({ 
			success: true, 
			count: reviewableExchanges.length,
			data: reviewableExchanges 
		});
	} catch (error) {
		console.error("Error in getReviewableExchanges:", error);
		res.status(500).json({ success: false, message: "Server error", error: error.message });
	}
};

export const createReview = async (req, res) => {
	try {
		const { revieweeId, exchangeId, rating, comment } = req.body;
		const reviewerId = req.userId;

		console.log('=== Create Review Request ===');
		console.log('Reviewer ID:', reviewerId);
		console.log('Reviewee ID:', revieweeId);
		console.log('Exchange ID:', exchangeId);
		console.log('Rating:', rating);
		console.log('Comment:', comment);

		if (!rating || rating < 1 || rating > 5) {
			return res.status(400).json({ success: false, message: "Valid rating (1-5) is required" });
		}

		if (!revieweeId) {
			return res.status(400).json({ success: false, message: "Reviewee ID is required" });
		}

		// Check if reviewer is admin
		const reviewer = await User.findById(reviewerId);
		const isAdmin = reviewer && (reviewer.userType === "admin" || reviewer.permissions?.includes("admin"));
		console.log('Is admin:', isAdmin);

		// If not admin, require exchange and validate it
		if (!isAdmin) {
			if (!exchangeId) {
				return res.status(400).json({ success: false, message: "Exchange ID is required" });
			}

			// Ensure exchange exists and is fully completed
			console.log('Finding exchange...');
			const exchange = await Exchange.findById(exchangeId);
			if (!exchange) {
				console.log('Exchange not found:', exchangeId);
				return res.status(404).json({ success: false, message: "Exchange not found" });
			}
			console.log('Exchange found:', exchange.status);

			if (exchange.status !== "fully_completed") {
				return res.status(400).json({ 
					success: false, 
					message: "Exchange must be fully completed to leave a review. Current status: " + exchange.status 
				});
			}

			// Check if user is part of exchange
			console.log('Checking authorization...');
			console.log('Exchange buyerId:', exchange.buyerId?.toString());
			console.log('Exchange sellerId:', exchange.sellerId?.toString());
			console.log('Current user:', reviewerId);
			
			if (exchange.buyerId.toString() !== reviewerId && exchange.sellerId.toString() !== reviewerId) {
				return res.status(403).json({ success: false, message: "Not authorized to review this exchange" });
			}
			console.log('Authorization passed');
		} else {
			// Admin can review anyone without exchange
			console.log('Admin review - skipping exchange validation');
			if (exchangeId) {
				// If admin provides exchangeId, validate it exists but don't require completion
				const exchange = await Exchange.findById(exchangeId);
				if (exchange) {
					console.log('Admin providing exchange context:', exchange.status);
				}
			}
		}

		// Create the review
		console.log('Creating review...');
		const newReview = new Review({
			reviewerId,
			revieweeId,
			exchangeId: isAdmin ? exchangeId || null : exchangeId,
			rating,
			comment,
		});

		await newReview.save();
		console.log('Review saved successfully');

		// Update the reviewee's average rating in the User model
		console.log('Updating user trust score...');
		const reviews = await Review.find({ revieweeId });
		const totalReviews = reviews.length;
		const sumRatings = reviews.reduce((sum, rev) => sum + rev.rating, 0);
		const trustScore = sumRatings / totalReviews;

		console.log('Total reviews:', totalReviews);
		console.log('Sum ratings:', sumRatings);
		console.log('New trust score:', trustScore);

		await User.findByIdAndUpdate(revieweeId, {
			trustScore: trustScore,
			totalReviews: totalReviews,
		});
		console.log('User updated successfully');

		res.status(201).json({ success: true, message: "Review created successfully", data: newReview });
	} catch (error) {
		console.error("=== Error in createReview ===");
		console.error("Error name:", error.name);
		console.error("Error message:", error.message);
		console.error("Error stack:", error.stack);
		console.error("Error details:", error);
		
		// Check for duplicate key error (user already reviewed)
		if (error.code === 11000) {
			return res.status(400).json({ success: false, message: "You have already reviewed this exchange" });
		}
		
		// Check for validation error
		if (error.name === 'ValidationError') {
			return res.status(400).json({ 
				success: false, 
				message: "Validation error", 
				details: error.message 
			});
		}
		
		res.status(500).json({ success: false, message: "Server error", error: error.message });
	}
};

export const getUserReviews = async (req, res) => {
	try {
		const { userId } = req.params;

		const reviews = await Review.find({ revieweeId: userId })
			.sort({ createdAt: -1 })
			.populate("reviewerId", "name profilePicture");

		res.status(200).json({ success: true, count: reviews.length, data: reviews });
	} catch (error) {
		console.error("Error in getUserReviews: ", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};
