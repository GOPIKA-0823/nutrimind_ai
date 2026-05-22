
const mongoose = require('mongoose');
const DailyLog = require('./models/DailyLog');
const User = require('./models/User');
require('dotenv').config();

async function checkLogs() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Trying to find user by generic search since exact email is unknown/variable
        // The screenshot showed "23ADR048" as the username or part of it.
        const user = await User.findOne({
            $or: [{ username: /23ADR048/i }, { email: /23ad/i }]
        });

        let userId;
        if (!user) {
            console.log('Specific user not found. listing all users to pick one...');
            const users = await User.find({}).limit(3);
            users.forEach(u => console.log(`User: ${u.username}, Email: ${u.email}, ID: ${u._id}`));
            if (users.length > 0) userId = users[0]._id;
            else return;
        } else {
            userId = user._id;
            console.log(`Found Target User: ${user.username} (${user._id})`);
        }

        const logs = await DailyLog.find({ user: userId }).sort({ date: -1 });

        console.log(`Found ${logs.length} logs for user ${userId}.`);
        logs.forEach(log => {
            console.log(`Date: ${log.date.toISOString().split('T')[0]} | Points: ${calculatePoints(log)}`);
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
