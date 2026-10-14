import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import User from '../src/models/User.js';

const [email, password, name = 'Admin'] = process.argv.slice(2);

if (!email || !password) {
  console.error('Usage: npm run create:admin -- admin@sr7hub.com "strongpassword" "Your Name"');
  process.exit(1);
}

await connectDB();

const existing = await User.findOne({ email: email.toLowerCase() });
if (existing) {
  existing.password = password;
  existing.role = 'admin';
  existing.active = true;
  await existing.save();
  console.log('♻️  Admin updated:', existing.email);
} else {
  const user = await User.create({ email, password, name, role: 'admin' });
  console.log('✅ Admin created:', user.email);
}

await mongoose.disconnect();
process.exit(0);