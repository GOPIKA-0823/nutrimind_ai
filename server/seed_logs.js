
const mongoose = require('mongoose');
const DailyLog = require('./models/DailyLog');
const User = require('./models/User');
require('dotenv').config();

async function seedLogs() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find the target user
        const user = await User.findOne({ email: 'gopikak.23aid@kongu.edu' });
        if (!user) {
            console.error('Target user gopikak.23aid@kongu.edu not found!');
            return;
        }
        console.log(`Seeding data for user: ${user.username} (${user._id})`);

        // Define the date range (Jan 26 to Jan 31, 2026)
        // Note: JS months are 0-indexed (0 = Jan)
        const dates = [
            new Date(2026, 0, 26),
            new Date(2026, 0, 27),
            new Date(2026, 0, 28),
            new Date(2026, 0, 29),
            new Date(2026, 0, 30),
            new Date(2026, 0, 31),
        ];

        const logs = [];

        for (const date of dates) {
            // Check if log already exists
            const existing = await DailyLog.findOne({
                user: user._id,
                date: {
                    $gte: new Date(date).setHours(0, 0, 0, 0),
                    $lt: new Date(date).setHours(23, 59, 59, 999)
                }
            });

            if (existing) {
                console.log(`Log for ${date.toDateString()} already exists. Skipping.`);
                continue;
            }

            // Generate semi-random realistic data
            const moodScore = 6 + Math.floor(Math.random() * 4); // 6-9
            const sleepHours = 6 + Math.random() * 3; // 6-9 hours
            const sleepQuality = 6 + Math.floor(Math.random() * 4); // 6-9
            const steps = 4000 + Math.floor(Math.random() * 6000); // 4000-10000
            const calories = 1500 + Math.floor(Math.random() * 500); // 1500-2000

            logs.push({
                user: user._id,
                date: date,
                mood: {
                    score: moodScore,
                    notes: 'Feeling good today',
                    emotions: ['happy', 'calm']
                },
                sleep: {
                    duration: sleepHours,
                    quality: sleepQuality,
                    notes: 'Slept well'
                },
                activity: {
                    steps: steps,
                    exerciseCount: 1,
                    waterIntake: 2000,
                    notes: 'Morning walk'
                },
                food: {
                    entries: [],
                    totalCalories: calories
                },
                notes: 'Productive day'
            });
        }

        if (logs.length > 0) {
            await DailyLog.insertMany(logs);
            console.log(`Successfully inserted ${logs.length} logs!`);
        } else {
            console.log('No new logs to insert.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

seedLogs();
