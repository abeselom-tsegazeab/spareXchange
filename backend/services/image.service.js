import cloudinary from "cloudinary";
import fs from "fs";
import path from "path";
import crypto from "crypto";

// Configure Cloudinary
const cloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && 
                            process.env.CLOUDINARY_API_KEY && 
                            process.env.CLOUDINARY_API_SECRET;

if (cloudinaryConfigured) {
	cloudinary.v2.config({
		cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
		api_key: process.env.CLOUDINARY_API_KEY,
		api_secret: process.env.CLOUDINARY_API_SECRET,
	});
	console.log("✓ Cloudinary configured successfully");
} else {
	console.log("⚠ Cloudinary not configured - using local storage fallback");
}

/**
 * Upload image to Cloudinary with local fallback
 * @param {String} base64Data - Base64 encoded image data or URL
 * @param {String} resourceType - 'image' or 'raw' (for PDFs)
 * @returns {String|null} - Public URL of uploaded image
 */
export const uploadImage = async (base64Data, resourceType = 'image') => {
	if (!base64Data) return null;

	// If it's already a URL, return it
	if (base64Data.startsWith("http")) return base64Data;

	// Cloudinary upload (if configured)
	if (cloudinaryConfigured) {
		try {
			const isPDF = base64Data.includes("application/pdf");
			const actualResourceType = isPDF ? 'raw' : resourceType;
			
			const uploadOptions = {
				folder: "sparexchange/verifications",
				resource_type: actualResourceType,
			};

			// Add image-specific transformations
			if (actualResourceType === 'image') {
				uploadOptions.transformation = [
					{ quality: "auto", fetch_format: "auto" },
					{ width: 1200, crop: "limit" },
				];
			}

			const result = await cloudinary.v2.uploader.upload(base64Data, uploadOptions);
			return result.secure_url;
		} catch (error) {
			console.error("Cloudinary upload failed, falling back to local:", error.message);
			// Fallback to local storage
		}
	}

	// Local storage fallback
	return uploadToLocal(base64Data);
};

/**
 * Upload file to local filesystem (fallback)
 * Supports both images and PDFs
 */
const uploadToLocal = async (base64Data) => {
	if (!base64Data) {
		console.error("uploadToLocal: No base64 data provided");
		return null;
	}

	try {
		// Check if it's a valid base64 data URL
		if (!base64Data.startsWith("data:")) {
			console.error("uploadToLocal: Invalid data URL format");
			return null;
		}

		const base64Content = base64Data.split(";base64,").pop();
		const buffer = Buffer.from(base64Content, "base64");
		
		// Determine file extension based on MIME type
		const mimeTypeMatch = base64Data.match(/^data:([^;]+);/);
		const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';
		
		let extension;
		if (mimeType === 'application/pdf') {
			extension = '.pdf';
		} else if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
			extension = '.jpg';
		} else if (mimeType === 'image/png') {
			extension = '.png';
		} else if (mimeType === 'image/webp') {
			extension = '.webp';
		} else if (mimeType === 'image/gif') {
			extension = '.gif';
		} else {
			extension = '.jpg'; // Default fallback
		}
		
		const filename = `${crypto.randomBytes(16).toString("hex")}${extension}`;
		const uploadsDir = path.join(path.resolve(), "backend", "uploads", "verification");
		const filePath = path.join(uploadsDir, filename);
		
		// Ensure uploads directory exists
		await fs.promises.mkdir(uploadsDir, { recursive: true });
		
		await fs.promises.writeFile(filePath, buffer);
		
		// Return the public access URL
		const publicUrl = `/uploads/verification/${filename}`;
		console.log(`✓ File uploaded to local storage: ${publicUrl}`);
		return publicUrl;
	} catch (error) {
		console.error("Local file upload failed:", error);
		return null;
	}
};

/**
 * Upload document (PDF or image) to Cloudinary
 * Specifically for verification documents
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {String} mimetype - File MIME type
 * @param {String} originalName - Original filename
 * @returns {String|null} - Public URL of uploaded document
 */
export const uploadVerificationDocument = async (fileBuffer, mimetype, originalName) => {
	if (!fileBuffer) return null;

	try {
		// Convert buffer to base64
		const base64Data = `data:${mimetype};base64,${fileBuffer.toString('base64')}`;
		
		// Determine if it's a PDF or image
		const isPDF = mimetype === 'application/pdf';
		
		// CRITICAL FIX: Use 'auto' resource type for PDFs
		// This allows Cloudinary to properly handle PDFs with preview capabilities
		// 'raw' resources can't be previewed in browsers (no content-type)
		// 'auto' lets Cloudinary detect and handle PDFs correctly
		const resourceType = isPDF ? 'auto' : 'image';
		
		// Extract file extension for proper download
		const fileExtension = isPDF ? '.pdf' : 
			mimetype === 'image/jpeg' ? '.jpg' :
			mimetype === 'image/png' ? '.png' :
			mimetype === 'image/webp' ? '.webp' :
			mimetype === 'image/gif' ? '.gif' : '.jpg';
		
		if (cloudinaryConfigured) {
			try {
				// Create a shorter, cleaner public_id (Cloudinary has limits)
				// Use timestamp + short hash instead of full filename
				const timestamp = Date.now();
				const shortHash = crypto.randomBytes(4).toString('hex');
				const publicId = `doc_${timestamp}_${shortHash}`;
				
				const uploadOptions = {
					folder: "sparexchange/verifications",
					resource_type: resourceType,
					public_id: publicId,
					// For PDFs, use format parameter to ensure proper handling
					format: isPDF ? 'pdf' : undefined,
					// Store metadata in context instead (no need to pre-create fields)
					context: `original_name=${originalName.replace(/[^a-zA-Z0-9._-]/g, '_')}|file_type=${mimetype.replace(/[^a-zA-Z0-9._-]/g, '_')}|upload_date=${new Date().toISOString().replace(/[^a-zA-Z0-9._-]/g, '_')}`
				};

				// For images, add optimization
				if (!isPDF) {
					uploadOptions.transformation = [
						{ quality: "auto", fetch_format: "auto" },
						{ width: 1200, crop: "limit" },
					];
				}

				const result = await cloudinary.v2.uploader.upload(base64Data, uploadOptions);
				
				// Construct URL with proper format for PREVIEW
				let previewUrl = result.secure_url;
				
				if (isPDF) {
					// For PDFs uploaded as 'auto' resource type:
					// Cloudinary returns URL with proper structure
					// We need to ensure it has .pdf extension for browser recognition
					
					// Cloudinary auto resource URLs look like:
					// https://res.cloudinary.com/{cloud}/image/upload/{folder}/{public_id}
					// We need to append .pdf for proper content-type
					if (!previewUrl.endsWith('.pdf')) {
						previewUrl = previewUrl + '.pdf';
					}
					
					console.log(`✓ PDF uploaded to Cloudinary (auto resource): ${previewUrl}`);
					console.log(`  Resource type: ${result.resource_type}`);
					console.log(`  Format: ${result.format}`);
				} else {
					// For images: ensure proper format extension
					const formatExt = mimetype === 'image/png' ? '.png' :
						mimetype === 'image/webp' ? '.webp' :
						mimetype === 'image/gif' ? '.gif' : '.jpg';
					
					// Check if URL already has extension
					if (!previewUrl.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
						previewUrl = previewUrl + formatExt;
					}
					console.log(`✓ Image uploaded to Cloudinary (preview): ${previewUrl}`);
				}
				
				// Return preview URL (without fl_attachment)
				// Frontend will add fl_attachment for downloads
				return previewUrl;
			} catch (error) {
				console.error("Cloudinary document upload failed:", error.message);
				throw error;
			}
		} else {
			// Fallback to local storage
			console.log("⚠ Cloudinary not configured, using local storage fallback");
			return uploadToLocal(base64Data);
		}
	} catch (error) {
		console.error("Document upload failed:", error);
		return null;
	}
};

/**
 * Bulk upload verification documents
 * @param {Array} files - Array of file objects from multer
 * @returns {Array} - Array of uploaded document URLs
 */
export const bulkUploadVerificationDocs = async (files) => {
	if (!Array.isArray(files) || files.length === 0) {
		console.error("bulkUploadVerificationDocs: No files provided or invalid format");
		return [];
	}
	
	console.log(`bulkUploadVerificationDocs: Attempting to upload ${files.length} file(s)`);
	
	const uploadPromises = files.map((file, index) => {
		console.log(`File ${index + 1}: ${file.originalname} (${file.mimetype}, ${file.size} bytes)`);
		return uploadVerificationDocument(file.buffer, file.mimetype, file.originalname);
	});
	
	const results = await Promise.all(uploadPromises);
	
	// Filter out null results and log
	const successfulUploads = results.filter(url => url !== null);
	const failedUploads = results.length - successfulUploads.length;
	
	console.log(`bulkUploadVerificationDocs: ${successfulUploads.length} succeeded, ${failedUploads} failed`);
	
	if (failedUploads > 0) {
		console.error(`bulkUploadVerificationDocs: ${failedUploads} file(s) failed to upload`);
	}
	
	return successfulUploads;
};

/**
 * Delete image from Cloudinary or local storage
 * @param {String} imageUrl - URL of image to delete
 */
export const deleteImage = async (imageUrl) => {
	if (!imageUrl) return;

	// Delete from Cloudinary
	if (imageUrl.includes("res.cloudinary.com")) {
		try {
			// Extract public_id from URL
			const urlParts = imageUrl.split("/");
			const filename = urlParts[urlParts.length - 1].split(".")[0];
			const publicId = `sparexchange/${filename}`;
			
			await cloudinary.v2.uploader.destroy(publicId);
		} catch (error) {
			console.error("Cloudinary delete failed:", error.message);
		}
	}
	// Delete from local storage
	else if (imageUrl.startsWith("/uploads/")) {
		try {
			const filePath = path.join(path.resolve(), "backend", imageUrl);
			if (fs.existsSync(filePath)) {
				await fs.promises.unlink(filePath);
			}
		} catch (error) {
			console.error("Local image delete failed:", error.message);
		}
	}
};

/**
 * Bulk upload images
 */
export const bulkUploadImages = async (base64Array) => {
	if (!Array.isArray(base64Array)) return [];
	const uploadPromises = base64Array.map(img => uploadImage(img));
	const results = await Promise.all(uploadPromises);
	return results.filter(url => url !== null);
};

/**
 * Optimize image URL for different contexts
 */
export const optimizeImageUrl = (url, options = {}) => {
	if (!url || !url.includes("res.cloudinary.com")) return url;

	const { width = 800, quality = "auto", format = "auto" } = options;
	
	// Add Cloudinary transformation parameters
	const transformations = `w_${width},q_${quality},f_${format}`;
	const uploadIndex = url.indexOf("/upload/");
	
	if (uploadIndex !== -1) {
		return url.replace("/upload/", `/upload/${transformations}/`);
	}
	
	return url;
};
