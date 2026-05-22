// Script to create admin with custom credentials
// Usage: node create-admin-custom.js <email> <password> [name]

const mongoose = require('mongoose');
const Admin = require('./models/Admin');
require('dotenv').config();

const createCustomAdmin = async (email, password, name) => {
  try {
    // Connect to database
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/health-tracker';
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to database\n');

    // Delete all existing admins first
    console.log('🗑️  Deleting all existing admin accounts...\n');
    const deleteResult = await Admin.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.deletedCount} admin account(s)\n`);

    // Check if email already exists
    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      console.log('⚠️  Admin with this email already exists. Deleting it...\n');
      await Admin.deleteOne({ email: email.toLowerCase() });
    }

    // Create new admin
    const newAdmin = new Admin({
      name: name || 'System Administrator',
      email: email.toLowerCase(),
      password: password,
      isActive: true
    });

    await newAdmin.save();

    console.log('✅ New admin account created successfully!\n');
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('🔐 NEW ADMIN CREDENTIALS:\n');
    console.log(`  Name: ${newAdmin.name}`);
    console.log(`  Email: ${newAdmin.email}`);
    console.log(`  Password: ${password}`);
    console.log(`  ID: ${newAdmin._id}`);
    console.log('\n');
    console.log('📝 Update your .env file:\n');
    console.log(`  ADMIN_EMAIL=${newAdmin.email}`);
    console.log(`  ADMIN_PASSWORD=${password}`);
    console.log(`  ADMIN_NAME=${newAdmin.name}`);
    console.log('\n');

  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

// Get command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('Usage: node create-admin-custom.js <email> <password> [name]');
  console.log('Example: node create-admin-custom.js admin@example.com MySecurePass123 "Admin Name"');
  process.exit(1);
}

const email = args[0];
const password = args[1];
const name = args[2] || 'System Administrator';

// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  console.error('❌ Invalid email format');
  process.exit(1);
}

// Validate password length
if (password.length < 6) {
  console.error('❌ Password must be at least 6 characters long');
  process.exit(1);
}

createCustomAdmin(email, password, name);

