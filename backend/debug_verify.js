import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/user.model.js';

dotenv.config();

const main = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const u = await User.findOne({
    verificationToken: '123456',
    verificationTokenExpiresAt: { $gt: new Date() },
  });
  console.log(u ? 'found yes' : 'not found');
  if (u) console.log(u);
  process.exit(0);
};

main().catch((err) => { console.error(err); process.exit(1); });