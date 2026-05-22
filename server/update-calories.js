
const mongoose = require('mongoose');
require('dotenv').config();
const DailyLog = require('./models/DailyLog');
const FoodEntry = require('./models/FoodEntry');
const User = require('./models/User');

const updateCalories = async () => {
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

        // Find logs for Jan 2026
        const startDate = new Date('2026-01-01T00:00:00.000Z');
        const endDate = new Date('2026-01-25T23:59:59.999Z');

        const logs = await DailyLog.find({
            user: user._id,
            date: { $gte: startDate, $lte: endDate }
        });

        console.log(`Found ${logs.length} logs to update.`);

        const meals = [
            { name: 'Oatmeal & Fruits', type: 'breakfast', calories: 350 },
            { name: 'Grilled Chicken Salad', type: 'lunch', calories: 450 },
            { name: 'Salmon with Veggies', type: 'dinner', calories: 550 },
            { name: 'Greek Yogurt', type: 'snack', calories: 150 },
            { name: 'Avocado Toast', type: 'breakfast', calories: 400 },
            { name: 'Quinoa Bowl', type: 'lunch', calories: 500 },
            { name: 'Pasta Primavera', type: 'dinner', calories: 600 },
            { name: 'Mixed Nuts', type: 'snack', calories: 200 }
        ];

        for (const log of logs) {
            // Check if logs already have food entries (although we know they don't from previous steps)
            if (log.foodEntries && log.foodEntries.length > 0) {
                // Optional: Skip or clear? Let's clear and re-populate to be sure.
                // Actually, safer to check if totalCalories is 0.
                // But let's just populate fresh.
            }

            const dailyFoodEntries = [];
            const numMeals = Math.floor(Math.random() * 2) + 3; // 3-4 meals

            for (let i = 0; i < numMeals; i++) {
                const meal = meals[Math.floor(Math.random() * meals.length)];

                const foodEntry = new FoodEntry({
                    user: user._id,
                    dailyLog: log._id,
                    name: meal.name,
                    mealType: meal.type,
                    timestamp: log.date, // Same day
                    nutrition: {
                        calories: meal.calories + Math.floor(Math.random() * 50) // Variance
                    }
                });

                await foodEntry.save();
                dailyFoodEntries.push(foodEntry._id);
            }

            log.foodEntries = dailyFoodEntries;
            await log.save();
            console.log(`Updated log for ${new Date(log.date).toDateString()} with ${dailyFoodEntries.length} food entries.`);
        }

        console.log(`✅ Successfully updated calorie data for all logs.`);

    } catch (error) {
        console.error('❌ Error updating calories:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

updateCalories();
