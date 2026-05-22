// Database setup script for Health Tracker
// This script helps set up the database connection and initial data

const mongoose = require('mongoose');
require('dotenv').config();

// Database connection
const connectDB = async () => {
  try {
    // For development, we'll use a simple local MongoDB connection
    // If you have MongoDB installed locally, use: mongodb://localhost:27017/health-tracker
    // For cloud (MongoDB Atlas), replace with your connection string
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/health-tracker';
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB Connected Successfully!');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
    
    return true;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.log('\n🔧 Setup Instructions:');
    console.log('1. Install MongoDB locally: https://www.mongodb.com/try/download/community');
    console.log('2. Or use MongoDB Atlas (cloud): https://www.mongodb.com/atlas');
    console.log('3. Update MONGODB_URI in server/.env file');
    return false;
  }
};

// Test database connection
const testConnection = async () => {
  console.log('🚀 Testing Database Connection...\n');
  
  const connected = await connectDB();
  
  if (connected) {
    console.log('\n✅ Database setup complete!');
    console.log('🎉 You can now start the server with: npm run dev');
  } else {
    console.log('\n❌ Database setup failed.');
    console.log('Please follow the setup instructions above.');
  }
  
  process.exit(connected ? 0 : 1);
};

// Run the test
testConnection();
