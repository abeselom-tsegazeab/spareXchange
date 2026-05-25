import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../models/user.model.js";

dotenv.config();

const migrateSendNotificationsPermission = async () => {
	try {
		console.log("Connecting to database...");
		await mongoose.connect(process.env.MONGO_URI);
		console.log("✓ Database connected");

		// Find all verified users who don't have send_notifications permission
		const verifiedUsersWithoutPermission = await User.find({
			isVerified: true,
			permissions: { $ne: "send_notifications" }
		});

		console.log(`\nFound ${verifiedUsersWithoutPermission.length} verified users without send_notifications permission`);

		if (verifiedUsersWithoutPermission.length === 0) {
			console.log("✓ All verified users already have the permission. No migration needed.");
			process.exit(0);
		}

		// Update each user
		let updatedCount = 0;
		for (const user of verifiedUsersWithoutPermission) {
			if (!user.permissions.includes("send_notifications")) {
				user.permissions.push("send_notifications");
				await user.save();
				updatedCount++;
				console.log(`✓ Updated: ${user.email} (${user.name})`);
			}
		}

		console.log(`\n✓ Migration complete! Updated ${updatedCount} users`);
		console.log("All verified users now have send_notifications permission");
		
		process.exit(0);
	} catch (error) {
		console.error("❌ Migration failed:", error);
		process.exit(1);
	}
};

migrateSendNotificationsPermission();
