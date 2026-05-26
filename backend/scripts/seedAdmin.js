import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { User } from "../models/user.model.js";

// Load environment variables
dotenv.config();

const seedAdmin = async () => {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ userType: "admin" });
    if (existingAdmin) {
      console.log("\n⚠️  Admin account already exists!");
      console.log("═══════════════════════════════════════");
      console.log(`📧 Email: ${existingAdmin.email}`);
      console.log(`👤 Name: ${existingAdmin.name}`);
      console.log(`✅ Verified: ${existingAdmin.isVerified}`);
      console.log("═══════════════════════════════════════");
      process.exit(0);
    }
    
    console.log("\n🔐 Creating admin account...");
    const hashedPassword = await bcrypt.hash("Admin@123!", 10);
    
    const admin = new User({
      email: "admin@sparexchange.com",
      password: hashedPassword,
      name: "System Administrator",
      userType: "admin",
      isVerified: true, // Auto-verified
      permissions: ["admin", "view_stats", "view_reports", "moderate_content", "run_jobs"],
      ecoPoints: 0,
      trustScore: 100,
      isActive: true
    });
    
    await admin.save();
    
    console.log("\n✅ Admin account created successfully!");
    console.log("═══════════════════════════════════════");
    console.log("📧 Email: admin@sparexchange.com");
    console.log("🔑 Password: Admin@123!");
    console.log("👤 User Type: admin");
    console.log("✅ Verified: Yes (auto-verified)");
    console.log("🔐 Permissions: Full admin access");
    console.log("═══════════════════════════════════════");
    console.log("\n⚠️  Please change the password after first login!");
    console.log("\n🚀 You can now login and access the admin panel at /admin");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin account:", error.message);
    process.exit(1);
  }
};

seedAdmin();
