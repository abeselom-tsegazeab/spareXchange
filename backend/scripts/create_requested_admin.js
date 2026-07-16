import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/user.model.js';

const email = 'olyadnegero287@gmail.com';
const password = '12345678Ol!';
const name = 'Olyad Negero';
const adminPermissions = ['admin', 'view_stats', 'view_reports', 'moderate_content', 'run_jobs'];

try {
    await mongoose.connect(process.env.MONGO_URI);
    let user = await User.findOne({ email });
    const hashedPassword = await bcrypt.hash(password, 10);
    const update = {
        name,
        password: hashedPassword,
        userType: 'admin',
        isVerified: true,
        roleStatus: 'verified',
        permissions: adminPermissions,
        isActive: true,
        isBanned: false,
        authProvider: 'local',
        verificationToken: undefined,
        verificationTokenExpiresAt: undefined,
        refreshToken: undefined,
    };

    if (user) {
        await User.updateOne({ _id: user._id }, { $set: update });
        user = await User.findById(user._id);
    } else {
        user = await User.create({ email, ...update });
    }

    const passwordValid = await bcrypt.compare(password, user.password);
    console.log(JSON.stringify({
        ok: true,
        email: user.email,
        userType: user.userType,
        isVerified: user.isVerified,
        roleStatus: user.roleStatus,
        permissions: user.permissions,
        passwordValid,
    }, null, 2));
} catch (error) {
    console.error(JSON.stringify({ ok: false, error: error.message }, null, 2));
    process.exitCode = 1;
} finally {
    await mongoose.disconnect();
}
