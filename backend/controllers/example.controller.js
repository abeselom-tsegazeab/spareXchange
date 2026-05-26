/**
 * Example Controller Using New Error Handling & Logging
 * This demonstrates the recommended pattern for all controllers
 */

import asyncHandler from "../utils/asyncHandler.js";
import { NotFoundError, ValidationError, AuthorizationError, BusinessLogicError } from "../utils/errors.js";
import { listingLogger } from "../utils/logger.js";
import { ListingRepository } from "../repositories/listing.repository.js";

const listingRepo = new ListingRepository();

/**
 * Example: Get listing by ID
 * BEFORE: 20 lines with try-catch
 * AFTER: 8 lines with asyncHandler
 */
export const getListingExample = asyncHandler(async (req, res) => {
	const { id } = req.params;

	// Use repository pattern
	const listing = await listingRepo.findById(id, {
		populate: { path: "seller", select: "name profilePicture" },
	});

	// Throw custom error (caught by asyncHandler)
	if (!listing) {
		throw new NotFoundError("Listing");
	}

	// Log the action
	listingLogger.info("Listing retrieved", {
		listingId: id,
		userId: req.userId,
	});

	res.status(200).json({
		success: true,
		listing,
	});
});

/**
 * Example: Create listing with validation
 */
export const createListingExample = asyncHandler(async (req, res) => {
	const { title, description, price, category, condition, location } = req.body;

	// Validate required fields
	if (!title || !description || !price || !category || !condition || !location) {
		throw new ValidationError("All required fields must be filled", [
			{ field: "title", message: "Title is required" },
			{ field: "description", message: "Description is required" },
			{ field: "price", message: "Price is required" },
		]);
	}

	// Business logic validation
	if (price < 0) {
		throw new BusinessLogicError("Price cannot be negative");
	}

	// Create listing
	const newListing = await listingRepo.create({
		title,
		description,
		price,
		category,
		condition,
		location,
		seller: req.userId,
	});

	// Log creation
	listingLogger.info("Listing created", {
		listingId: newListing._id,
		seller: req.userId,
		category,
	});

	res.status(201).json({
		success: true,
		message: "Listing created successfully",
		listing: newListing,
	});
});

/**
 * Example: Update listing with ownership check
 */
export const updateListingExample = asyncHandler(async (req, res) => {
	const { id } = req.params;

	const listing = await listingRepo.findById(id);

	if (!listing) {
		throw new NotFoundError("Listing");
	}

	// Check ownership
	if (listing.seller.toString() !== req.userId) {
		throw new AuthorizationError("You can only update your own listings");
	}

	// Update
	const updatedListing = await listingRepo.updateById(id, req.body);

	listingLogger.info("Listing updated", {
		listingId: id,
		userId: req.userId,
	});

	res.status(200).json({
		success: true,
		message: "Listing updated successfully",
		listing: updatedListing,
	});
});

/**
 * Example: Delete listing with business logic
 */
export const deleteListingExample = asyncHandler(async (req, res) => {
	const { id } = req.params;

	const listing = await listingRepo.findById(id);

	if (!listing) {
		throw new NotFoundError("Listing");
	}

	if (listing.seller.toString() !== req.userId) {
		throw new AuthorizationError("You can only delete your own listings");
	}

	// Check if listing has active exchanges
	const ExchangeRepository = (await import("../repositories/exchange.repository.js")).ExchangeRepository;
	const exchangeRepo = new ExchangeRepository();
	
	const activeExchanges = await exchangeRepo.count({
		listingId: id,
		status: { $in: ["pending", "accepted"] },
	});

	if (activeExchanges > 0) {
		throw new BusinessLogicError("Cannot delete listing with active exchanges", 409);
	}

	// Soft delete
	await listingRepo.deleteById(id, true);

	listingLogger.info("Listing deleted", {
		listingId: id,
		userId: req.userId,
	});

	res.status(200).json({
		success: true,
		message: "Listing deleted successfully",
	});
});

export default {
	getListingExample,
	createListingExample,
	updateListingExample,
	deleteListingExample,
};
