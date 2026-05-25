import multer from "multer";
import path from "path";
import fs from "fs";

// Memory storage for Cloudinary uploads (profile pictures and verification documents)
const memoryStorage = multer.memoryStorage();

// Disk storage for general uploads (fallback only)
const diskStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		let uploadPath;
		
		// Different folders for different file types
		if (req.path && req.path.includes("/profile")) {
			uploadPath = "uploads/profiles/";
		} else {
			uploadPath = "uploads/verification/";
		}
		
		if (!fs.existsSync(uploadPath)) {
			fs.mkdirSync(uploadPath, { recursive: true });
		}
		cb(null, uploadPath);
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
	},
});

const fileFilter = (req, file, cb) => {
	// Allowed file types for verification documents
	const allowedTypes = [
		"application/pdf",
		"image/jpeg",
		"image/png",
		"image/webp",
		"image/gif"
	];
	
	if (allowedTypes.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(new Error("Invalid file type. Only PDF, JPG, PNG, WebP, and GIF are allowed."), false);
	}
};

// Export different upload configurations

// For verification documents - use memory storage for Cloudinary upload
export const upload = multer({
	storage: memoryStorage,
	limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for verification docs
	fileFilter: fileFilter,
});

// For profile pictures - use memory storage for Cloudinary upload
export const uploadProfilePicture = multer({
	storage: memoryStorage,
	limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
	fileFilter: fileFilter,
});

// Legacy disk storage export (for backward compatibility)
export const uploadDisk = multer({
	storage: diskStorage,
	limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
	fileFilter: fileFilter,
});
