
const mongoose = require('mongoose');
const DailyLog = require('./server/models/DailyLog');
const User = require('./server/models/User'); // Assuming User model exists
require('dotenv').config({ path: './server/.env' });

async function checkLogs() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find the user - assuming based on previous context or just grabbing the first one for now as it seems to be single-user dev env mostly
        const user = await User.findOne({ email: '23ADR048' }); // Try username from screenshot
        let userId;

        if (!user) {
            console.log('User 23ADR048 not found, trying to finding any user...');
            const anyUser = await User.findOne({});
            if (!anyUser) {
                console.log('No users found.');
                return;
            }
            userId = anyUser._id;
            console.log(`Using user: ${anyUser.username} (${anyUser._id})`);
        } else {
            userId = user._id;
            console.log(`Found user: ${user.username} (${user._id})`);
        }

        const logs = await DailyLog.find({ user: userId }).sort({ date: -1 }); // Newest first

        console.log(`Found ${logs.length} logs.`);
        logs.forEach(log => {
            console.log(`Date: ${log.date.toISOString()} | Points: ${calculatePoints(log)}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

function calculatePoints(log) {
    const moodPts = (log.mood?.score || 0) * 2;
    const sleepPts = (log.sleep?.quality || 0) * 2;
    const activityPts = Math.floor((log.activity?.steps || 0) / 500);
    return moodPts + sleepPts + activityPts;
}

checkLogs();
