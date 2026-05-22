
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const updatePatientProfile = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/health-tracker';
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to database');

        const userEmail = 'gopikak.23aid@kongu.edu';
        const user = await User.findOne({ email: userEmail });

        if (!user) {
            console.log(`❌ User not found: ${userEmail}`);
            process.exit(1);
        }

        console.log(`Found user: ${user.name} (${user._id})`);

        user.profile = {
            ...user.profile,
            age: 20,
            gender: 'female',
            height: 155,
            weight: 40
        };

        await user.save();
        console.log(`✅ Successfully updated profile for ${userEmail}.`);

    } catch (error) {
        console.error('❌ Error updating profile:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

updatePatientProfile();
