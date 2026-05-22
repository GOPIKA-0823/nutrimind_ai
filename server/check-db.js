
const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/health-tracker';
console.log('Testing connection to:', uri);

mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
    .then(() => {
        console.log('Successfully connected to MongoDB!');
        process.exit(0);
    })
    .catch(err => {
        console.error('Connection failed:', err.message);
        process.exit(1);
    });
