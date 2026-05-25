/**
 * Migration Script: Fix Verification Document URLs
 * Removes 'fl_attachment' from existing URLs in the database
 * 
 * Usage: node backend/scripts/fix_verification_urls.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import {User} from '../models/user.model.js';

dotenv.config();

const fixVerificationURLs = async () => {
	try {
		console.log('🔧 Starting verification URL migration...\n');

		// Connect to MongoDB
		await mongoose.connect(process.env.MONGO_URI);
		console.log('✅ Connected to MongoDB\n');

		// Find all users with verification documents
		const usersWithDocs = await User.find({
			'verificationDocs.0': { $exists: true }
		});

		console.log(`Found ${usersWithDocs.length} user(s) with verification documents\n`);

		let totalFixed = 0;
		let totalUsers = 0;

		for (const user of usersWithDocs) {
			let needsUpdate = false;
			const updatedDocs = [];

			for (const docUrl of user.verificationDocs) {
				// Check if URL contains fl_attachment
				if (docUrl.includes('/upload/fl_attachment/')) {
					// Remove fl_attachment from URL
					const fixedUrl = docUrl.replace('/upload/fl_attachment/', '/upload/');
					updatedDocs.push(fixedUrl);
					needsUpdate = true;
					totalFixed++;
					console.log(`  ✓ Fixed: ${docUrl.substring(0, 80)}...`);
					console.log(`    To:    ${fixedUrl.substring(0, 80)}...\n`);
				} else {
					updatedDocs.push(docUrl);
				}
			}

			if (needsUpdate) {
				user.verificationDocs = updatedDocs;
				await user.save();
				totalUsers++;
				console.log(`  💾 Updated user: ${user.name} (${user.email})\n`);
			}
		}

		console.log('\n' + '='.repeat(60));
		console.log('📊 Migration Summary:');
		console.log('='.repeat(60));
		console.log(`Total users checked: ${usersWithDocs.length}`);
		console.log(`Total users updated: ${totalUsers}`);
		console.log(`Total URLs fixed: ${totalFixed}`);
		console.log('='.repeat(60));

		if (totalFixed === 0) {
			console.log('\n✅ All URLs are already correct! No migration needed.');
		} else {
			console.log('\n✅ Migration completed successfully!');
		}

	} catch (error) {
		console.error('❌ Migration failed:', error.message);
		console.error(error);
	} finally {
		await mongoose.disconnect();
		console.log('\n👋 Disconnected from MongoDB');
		process.exit(0);
	}
};

// Run migration
fixVerificationURLs();
