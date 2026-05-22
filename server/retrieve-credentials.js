// Script to retrieve all users and admin credentials from database
const mongoose = require('mongoose');
const User = require('./models/User');
const Admin = require('./models/Admin');
require('dotenv').config();

const retrieveCredentials = async () => {
  try {
    // Connect to database
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/health-tracker';
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to database\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Retrieve all users
    console.log('📋 ALL USERS IN DATABASE:\n');
    const users = await User.find({}).select('name email role isActive createdAt');
    
    if (users.length === 0) {
      console.log('  No users found in database.\n');
    } else {
      users.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.role.toUpperCase()}: ${user.name}`);
        console.log(`     Email: ${user.email}`);
        console.log(`     Status: ${user.isActive ? 'Active' : 'Inactive'}`);
        console.log(`     Created: ${user.createdAt.toLocaleDateString()}`);
        console.log(`     ID: ${user._id}`);
        console.log('');
      });
    }

    console.log('═══════════════════════════════════════════════════════════\n');

    // Retrieve all admins
    console.log('👑 ADMIN ACCOUNTS:\n');
    const admins = await Admin.find({}).select('name email isActive createdAt');
    
    if (admins.length === 0) {
      console.log('  No admin accounts found.\n');
    } else {
      admins.forEach((admin, index) => {
        console.log(`  ${index + 1}. Admin: ${admin.name}`);
        console.log(`     Email: ${admin.email}`);
        console.log(`     Status: ${admin.isActive ? 'Active' : 'Inactive'}`);
        console.log(`     Created: ${admin.createdAt.toLocaleDateString()}`);
        console.log(`     ID: ${admin._id}`);
        console.log('');
      });
    }

    console.log('═══════════════════════════════════════════════════════════\n');

    // Check environment variables for admin credentials
    console.log('🔐 ADMIN CREDENTIALS FROM ENVIRONMENT:\n');
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME;
    
    if (adminEmail) {
      console.log(`  Email: ${adminEmail}`);
    } else {
      console.log('  Email: Not set in .env file');
    }
    
    if (adminPassword) {
      console.log(`  Password: ${adminPassword}`);
    } else {
      console.log('  Password: Not set in .env file');
    }
    
    if (adminName) {
      console.log(`  Name: ${adminName}`);
    } else {
      console.log('  Name: Not set in .env file');
    }

    console.log('\n═══════════════════════════════════════════════════════════\n');

    // Summary
    const userCount = await User.countDocuments({ role: 'user' });
    const doctorCount = await User.countDocuments({ role: 'doctor' });
    const activeUsers = await User.countDocuments({ isActive: true });
    
    console.log('📊 DATABASE SUMMARY:\n');
    console.log(`  Total Users: ${userCount}`);
    console.log(`  Total Doctors: ${doctorCount}`);
    console.log(`  Active Users: ${activeUsers}`);
    console.log(`  Total Admins: ${admins.length}`);
    console.log('\n');

    // Check for test users
    console.log('🧪 TEST ACCOUNTS (if any):\n');
    const testUsers = await User.find({ 
      $or: [
        { email: /test/i },
        { email: /example/i },
        { name: /test/i }
      ]
    }).select('name email role');
    
    if (testUsers.length > 0) {
      testUsers.forEach(user => {
        console.log(`  - ${user.name} (${user.email}) - ${user.role}`);
      });
    } else {
      console.log('  No test accounts found.');
    }
    console.log('\n');

  } catch (error) {
    console.error('❌ Error retrieving credentials:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

retrieveCredentials();

