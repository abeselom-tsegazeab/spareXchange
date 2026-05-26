/**
 * Diagnostic Script: Check Cloudinary File Accessibility
 * Tests if verification documents are accessible from Cloudinary
 * 
 * Usage: node backend/scripts/check_cloudinary_files.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/user.model.js';

dotenv.config();

const checkCloudinaryFiles = async () => {
	try {
		console.log('🔍 Starting Cloudinary file diagnostic...\n');

		// Connect to MongoDB
		await mongoose.connect(process.env.MONGO_URI);
		console.log('✅ Connected to MongoDB\n');

		// Find all users with verification documents
		const usersWithDocs = await User.find({
			'verificationDocs.0': { $exists: true }
		});

		console.log(`Found ${usersWithDocs.length} user(s) with verification documents\n`);
		console.log('='.repeat(80));

		let totalFiles = 0;
		let accessibleFiles = 0;
		let inaccessibleFiles = 0;

		for (const user of usersWithDocs) {
			console.log(`\n👤 User: ${user.name} (${user.email})`);
			console.log(`   Documents: ${user.verificationDocs.length}`);
			console.log('-'.repeat(80));

			for (const docUrl of user.verificationDocs) {
				totalFiles++;
				console.log(`\n📄 File ${totalFiles}:`);
				console.log(`   URL: ${docUrl}`);

				try {
					// Test if URL is accessible
					const response = await fetch(docUrl, { method: 'HEAD' });
					
					if (response.ok) {
						console.log(`   ✅ Accessible (Status: ${response.status})`);
						console.log(`   Content-Type: ${response.headers.get('content-type')}`);
						console.log(`   Content-Length: ${response.headers.get('content-length')} bytes`);
						accessibleFiles++;
					} else {
						console.log(`   ❌ NOT Accessible (Status: ${response.status} ${response.statusText})`);
						inaccessibleFiles++;
						
						if (response.status === 401) {
							console.log(`   💡 Reason: Unauthorized - File may require authentication`);
						} else if (response.status === 404) {
							console.log(`   💡 Reason: Not Found - File doesn't exist in Cloudinary`);
						}
					}
				} catch (error) {
					console.log(`   ❌ Error checking file: ${error.message}`);
					inaccessibleFiles++;
				}
			}
			console.log('\n');
		}

		console.log('='.repeat(80));
		console.log('📊 Diagnostic Summary:');
		console.log('='.repeat(80));
		console.log(`Total files checked: ${totalFiles}`);
		console.log(`✅ Accessible: ${accessibleFiles}`);
		console.log(`❌ Inaccessible: ${inaccessibleFiles}`);
		console.log('='.repeat(80));

		if (inaccessibleFiles > 0) {
			console.log('\n⚠️  WARNING: Some files are not accessible!');
			console.log('\nPossible reasons:');
			console.log('1. Files were deleted from Cloudinary');
			console.log('2. Cloudinary access settings changed');
			console.log('3. Files were never uploaded successfully');
			console.log('4. Cloudinary credentials are incorrect');
			console.log('\nRecommendation:');
			console.log('- Upload new test file to verify Cloudinary is working');
			console.log('- Check Cloudinary dashboard: https://cloudinary.com/console');
			console.log('- Verify files exist in: sparexchange/verifications folder');
		} else {
			console.log('\n✅ All files are accessible!');
		}

	} catch (error) {
		console.error('❌ Diagnostic failed:', error.message);
		console.error(error);
	} finally {
		await mongoose.disconnect();
		console.log('\n👋 Disconnected from MongoDB');
		process.exit(0);
	}
};

// Run diagnostic
checkCloudinaryFiles();
