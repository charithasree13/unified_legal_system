import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/Schemas';

// Force USE_MOCK_DB to false to interact directly with MongoDB Atlas
process.env.USE_MOCK_DB = 'false';

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGO_URI;

async function seedAdmin() {
  const args = process.argv.slice(2);
  let email = '';
  let password = '';
  let name = '';
  let phone = '';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--email' && args[i + 1]) email = args[i + 1];
    if (args[i] === '--password' && args[i + 1]) password = args[i + 1];
    if (args[i] === '--name' && args[i + 1]) name = args[i + 1];
    if (args[i] === '--phone' && args[i + 1]) phone = args[i + 1];
  }

  if (!MONGO_URI) {
    console.error('❌ MONGO_URI is missing in server/.env file.');
    process.exit(1);
  }

  // Mask credentials in output
  const maskedUri = MONGO_URI.replace(/:([^@]+)@/, ':****@');
  console.log(`🔌 Connecting to MongoDB Atlas: ${maskedUri}`);

  try {
    await mongoose.connect(MONGO_URI);
    console.log('⚡ Connected to MongoDB Atlas successfully.');
  } catch (err: any) {
    console.error('❌ Failed to connect to MongoDB Atlas:', err.message);
    process.exit(1);
  }

  if (email && password) {
    // Create/update specific admin user passed via CLI
    const targetName = name || 'System Administrator';
    const targetPhone = phone || '9999999999';

    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    const hashedPassword = await bcrypt.hash(password, 10);

    if (existing) {
      existing.password = hashedPassword;
      existing.role = 'Admin';
      existing.isVerified = true;
      existing.hasCompletedProfile = true;
      if (name) existing.name = name;
      if (phone) existing.phone = phone;
      await existing.save();
      console.log(`\n✅ Updated existing user "${email}" to Admin role with updated password.`);
    } else {
      await User.create({
        name: targetName,
        email: email.trim().toLowerCase(),
        phone: targetPhone,
        password: hashedPassword,
        role: 'Admin',
        isVerified: true,
        emailVerified: true,
        hasCompletedProfile: true,
        authProvider: 'LOCAL'
      });
      console.log(`\n✅ Created new Admin user successfully:`);
      console.log(`   - Email: ${email}`);
      console.log(`   - Name: ${targetName}`);
      console.log(`   - Phone: ${targetPhone}`);
    }
  } else {
    // Seed default admin accounts
    console.log('\n--- Seeding Default Admin Accounts ---');
    const defaultAdmins = [
      {
        name: 'P V Prasad',
        email: 'pvprasadvmpl@gmail.com',
        phone: '9247253096',
        password: 'Prasad@1971',
        role: 'Admin'
      },
      {
        name: 'System Admin',
        email: 'elitelegaldeskmpl@gmail.com',
        phone: '7013829234',
        password: 'Elitelegaldesk@2026',
        role: 'Admin'
      }
    ];

    for (const admin of defaultAdmins) {
      const existing = await User.findOne({ email: admin.email });
      if (existing) {
        // Reset password and ensure Admin role
        const hashedPassword = await bcrypt.hash(admin.password, 10);
        existing.password = hashedPassword;
        existing.role = 'Admin';
        existing.isVerified = true;
        existing.hasCompletedProfile = true;
        await existing.save();
        console.log(`🔄 Reset password for existing Admin: ${admin.email} (Password: ${admin.password})`);
      } else {
        const hashedPassword = await bcrypt.hash(admin.password, 10);
        await User.create({
          name: admin.name,
          email: admin.email,
          phone: admin.phone,
          password: hashedPassword,
          role: 'Admin',
          isVerified: true,
          emailVerified: true,
          hasCompletedProfile: true,
          authProvider: 'LOCAL'
        });
        console.log(`✅ Created Admin: ${admin.email} | Password: ${admin.password}`);
      }
    }
  }

  await mongoose.disconnect();
  console.log('\n🔌 Disconnected from MongoDB Atlas.');
}

seedAdmin().catch((err) => {
  console.error('❌ Error during admin seeding:', err);
  process.exit(1);
});
