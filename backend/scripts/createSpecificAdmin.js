import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { User } from "../models/user.model.js";

// Load environment variables
dotenv.config();

const createAdmin = async () => {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const email = "olyadnegero287@gmail.com";
    const password = "12345678Ol!";
    const name = "Olyad Negero";

    const hashedPassword = await bcrypt.hash(password, 10);
    const adminPermissions = ["admin", "view_stats", "view_reports", "moderate_content", "run_jobs"];

    // Find if user already exists
    let user = await User.findOne({ email });

    if (user) {
      console.log(`\n⚠️  User with email ${email} already exists. Upgrading to admin...`);
      user.userType = "admin";
      user.isVerified = true;
      user.password = hashedPassword;
      user.permissions = adminPermissions;
      user.isActive = true;
      await user.save();
      console.log(`✅ User successfully upgraded to admin and password updated!`);
    } else {
      console.log(`\n🔐 Creating new admin account for ${email}...`);
      user = new User({
        email,
        password: hashedPassword,
        name,
        userType: "admin",
        isVerified: true,
        permissions: adminPermissions,
        ecoPoints: 0,
        trustScore: 100,
        isActive: true
      });
      await user.save();
      console.log(`✅ Admin account created successfully!`);
    }

    console.log("═══════════════════════════════════════");
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`👤 User Type: admin`);
    console.log(`🔐 Permissions: Full admin access`);
    console.log("═══════════════════════════════════════");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding specific admin account:", error.message);
    process.exit(1);
  }
};

createAdmin();
