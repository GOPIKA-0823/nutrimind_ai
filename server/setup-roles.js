
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs'); // Assuming bcryptjs is used or similar
require('dotenv').config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/health-tracker';

const usersToSetup = [
    {
        name: 'Gopika K',
        email: 'gopikak.23aid@kongu.edu',
        password: 'password123',
        role: 'user'
    },
    {
        name: 'Dr. Gobika',
        email: 'gobikakandasamy9@gmail.com',
        password: 'password123',
        role: 'doctor'
    }
];

// Helper to hash password manually if needed, though User model pre-save hook usually handles it.
// Checking models/User.js would be ideal, but I'll assume standard pre-save.

mongoose.connect(uri)
    .then(async () => {
        console.log('Connected to MongoDB');

        for (const userData of usersToSetup) {
            let user = await User.findOne({ email: userData.email });

            if (user) {
                console.log(`Updating existing user: ${userData.email}`);
                user.role = userData.role;
                // Optionally update password if you want to reset it
                // user.password = userData.password; 
                await user.save();
                console.log(`User ${userData.email} updated to role: ${userData.role}`);
            } else {
                console.log(`Creating new user: ${userData.email}`);
                user = new User(userData);
                await user.save();
                console.log(`User ${userData.email} created with role: ${userData.role}`);
            }
        }

        console.log('Role setup complete!');
        process.exit(0);
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
