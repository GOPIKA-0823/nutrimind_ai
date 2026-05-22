
const mongoose = require('mongoose');
require('dotenv').config();
const DailyLog = require('./models/DailyLog');
const User = require('./models/User');

const seedLogs = async () => {
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

        // Define date range: Jan 1 2026 to Jan 24 2026
        const startDate = new Date('2026-01-01T00:00:00.000Z');
        const endDate = new Date('2026-01-24T23:59:59.999Z');

        // Clear existing logs for this period to avoid duplicates? 
        // Maybe better to upsert or check existence. 
        // For simplicity, let's just loop and create if not exists.

        const logsToCreate = [];
        const currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            // Clone date
            const logDate = new Date(currentDate);

            // Randomize data slightly
            const moodScore = Math.floor(Math.random() * 3) + 7; // 7-9
            const sleepDuration = Math.floor(Math.random() * 2) + 6; // 6-8 hours
            const steps = Math.floor(Math.random() * 5000) + 5000; // 5000-10000 steps
            const water = Math.floor(Math.random() * 1000) + 1500; // 1500-2500 ml
            const calories = Math.floor(Math.random() * 500) + 1800; // 1800-2300 kcal

            const logEntry = {
                user: user._id,
                date: logDate,
                mood: {
                    score: moodScore,
                    notes: 'Feeling good data seeded',
                    emotions: ['happy', 'energetic'],
                    stressLevel: 3,
                    energyLevel: 7
                },
                sleep: {
                    duration: sleepDuration,
                    quality: 8,
                    bedtime: new Date(logDate.setHours(22, 0, 0)),
                    wakeTime: new Date(logDate.setHours(6, 0, 0)),
                    notes: 'Slept well'
                },
                activity: {
                    steps: steps,
                    waterIntake: water,
                    exercise: [],
                    notes: 'Morning walk'
                },
                // We'd ideally link FoodEntry objects but for simplicity we rely on virtuals typically.
                // However, the model requires refs. If calculateTotal isn't needed for the immediate report, we can skip specific food entries or mock them if schema allows.
                // The schema has `foodEntries: [{ ref: 'FoodEntry' }]`.
                // If we leave it empty, totalCalories virtual will be 0.
                // But for monthly report generation, it might need aggregation. 
                // Let's assume the report generator can handle it or we update report logic locally.
                // Or we can just create array of mock objectIds if verified.
                // Actually, without creating FoodEntry documents, we can't link them.
                // Let's rely on valid Mood/Sleep/Activity data which is sufficient for basic report.
                foodEntries: [],
                isComplete: true
            };

            // Check if log exists for this date (ignoring time)
            const startOfDay = new Date(currentDate);
            startOfDay.setUTCHours(0, 0, 0, 0);
            const endOfDay = new Date(currentDate);
            endOfDay.setUTCHours(23, 59, 59, 999);

            const existing = await DailyLog.findOne({
                user: user._id,
                date: { $gte: startOfDay, $lte: endOfDay }
            });

            if (!existing) {
                logsToCreate.push(logEntry);
            } else {
                console.log(`Log already exists for ${currentDate.toDateString()}`);
            }

            // Next day
            currentDate.setDate(currentDate.getDate() + 1);
        }

        if (logsToCreate.length > 0) {
            await DailyLog.insertMany(logsToCreate);
            console.log(`✅ Successfully seeded ${logsToCreate.length} logs from Jan 1 to Jan 24.`);
        } else {
            console.log('No new logs to seed.');
        }

    } catch (error) {
        console.error('❌ Error seeding logs:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

seedLogs();
