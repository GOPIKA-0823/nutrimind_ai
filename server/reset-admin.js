// Script to delete old admin accounts and create a new admin account
const mongoose = require('mongoose');
const Admin = require('./models/Admin');
require('dotenv').config();

const resetAdmin = async () => {
  try {
    // Connect to database
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/health-tracker';
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to database\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Step 1: List all existing admin accounts
    console.log('📋 Checking existing admin accounts...\n');
    const existingAdmins = await Admin.find({});
    
    if (existingAdmins.length > 0) {
      console.log(`Found ${existingAdmins.length} admin account(s):\n`);
      existingAdmins.forEach((admin, index) => {
        console.log(`  ${index + 1}. ${admin.name}`);
        console.log(`     Email: ${admin.email}`);
        console.log(`     Status: ${admin.isActive ? 'Active' : 'Inactive'}`);
        console.log(`     Created: ${admin.createdAt.toLocaleDateString()}`);
        console.log(`     ID: ${admin._id}`);
        console.log('');
      });

      // Step 2: Delete all existing admin accounts
      console.log('🗑️  Deleting old admin accounts...\n');
      const deleteResult = await Admin.deleteMany({});
      console.log(`✅ Deleted ${deleteResult.deletedCount} admin account(s)\n`);
    } else {
      console.log('  No existing admin accounts found.\n');
    }

    console.log('═══════════════════════════════════════════════════════════\n');

    // Step 3: Create new admin account
    console.log('➕ Creating new admin account...\n');
    
    // New admin credentials
    const newAdminEmail = process.env.NEW_ADMIN_EMAIL || 'admin@healthtracker.com';
    const newAdminPassword = process.env.NEW_ADMIN_PASSWORD || 'Admin@123456';
    const newAdminName = process.env.NEW_ADMIN_NAME || 'System Administrator';

    // Check if email already exists (shouldn't after deletion, but just in case)
    const existingAdmin = await Admin.findOne({ email: newAdminEmail });
    if (existingAdmin) {
      console.log('⚠️  Admin with this email already exists. Deleting it first...\n');
      await Admin.deleteOne({ email: newAdminEmail });
    }

    // Create new admin
    const newAdmin = new Admin({
      name: newAdminName,
      email: newAdminEmail,
      password: newAdminPassword, // Will be hashed automatically by the model
      isActive: true
    });

    await newAdmin.save();

    console.log('✅ New admin account created successfully!\n');
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('🔐 NEW ADMIN CREDENTIALS:\n');
    console.log(`  Name: ${newAdminName}`);
    console.log(`  Email: ${newAdminEmail}`);
    console.log(`  Password: ${newAdminPassword}`);
    console.log(`  ID: ${newAdmin._id}`);
    console.log('\n');
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('📝 IMPORTANT: Update your .env file with these credentials:\n');
    console.log(`  ADMIN_EMAIL=${newAdminEmail}`);
    console.log(`  ADMIN_PASSWORD=${newAdminPassword}`);
    console.log(`  ADMIN_NAME=${newAdminName}`);
    console.log('\n');
    console.log('✅ Admin reset completed successfully!\n');

  } catch (error) {
    console.error('❌ Error resetting admin:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

// Allow custom credentials via command line arguments
const args = process.argv.slice(2);
if (args.length >= 2) {
  process.env.NEW_ADMIN_EMAIL = args[0];
  process.env.NEW_ADMIN_PASSWORD = args[1];
  if (args[2]) {
    process.env.NEW_ADMIN_NAME = args[2];
  }
}

resetAdmin();

