
const mongoose = require('mongoose');
require('dotenv').config();
const DailyLog = require('./models/DailyLog');
const FoodEntry = require('./models/FoodEntry');
const User = require('./models/User');

const updateFoodsTN = async () => {
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

        // Find logs for Jan 2026
        const startDate = new Date('2026-01-01T00:00:00.000Z');
        const endDate = new Date('2026-01-25T23:59:59.999Z');

        const logs = await DailyLog.find({
            user: user._id,
            date: { $gte: startDate, $lte: endDate }
        });

        console.log(`Found ${logs.length} logs to update.`);

        // TN Food Menu
        const breakfast = [
            { name: 'Idli & Sambar', calories: 300 },
            { name: 'Dosa with Coconut Chutney', calories: 450 },
            { name: 'Pongal & Vada', calories: 500 },
            { name: 'Poori Masala', calories: 550 },
            { name: 'Rava Upma', calories: 350 }
        ];

        const lunch = [
            { name: 'Rice, Sambar, Poriyal', calories: 650 },
            { name: 'Curd Rice & Pickle', calories: 400 },
            { name: 'Veg Biryani & Raita', calories: 600 },
            { name: 'Lemon Rice & Potato Fry', calories: 550 },
            { name: 'Full Meals (Rice, Kuzhambu, Rasam)', calories: 750 }
        ];

        const dinner = [
            { name: 'Chapati & Kurma', calories: 450 },
            { name: 'Idiyappam & Coconut Milk', calories: 350 },
            { name: 'Parotta & Salna', calories: 600 },
            { name: 'Uthappam', calories: 400 },
            { name: 'Dosa & Sambar', calories: 400 }
        ];

        const snack = [
            { name: 'Medhu Vada', calories: 200 },
            { name: 'Masala Vadai', calories: 250 },
            { name: 'Bajji', calories: 200 },
            { name: 'Sundal', calories: 150 },
            { name: 'Filter Coffee', calories: 100 }
        ];

        for (const log of logs) {
            // Remove old food entries
            if (log.foodEntries && log.foodEntries.length > 0) {
                await FoodEntry.deleteMany({ _id: { $in: log.foodEntries } });
            }

            const dailyFoodEntries = [];

            // Breakfast
            const bf = breakfast[Math.floor(Math.random() * breakfast.length)];
            const bfEntry = new FoodEntry({
                user: user._id,
                dailyLog: log._id,
                name: bf.name,
                mealType: 'breakfast',
                timestamp: new Date(new Date(log.date).setHours(8, 30)),
                nutrition: { calories: bf.calories }
            });
            await bfEntry.save();
            dailyFoodEntries.push(bfEntry._id);

            // Lunch
            const ln = lunch[Math.floor(Math.random() * lunch.length)];
            const lnEntry = new FoodEntry({
                user: user._id,
                dailyLog: log._id,
                name: ln.name,
                mealType: 'lunch',
                timestamp: new Date(new Date(log.date).setHours(13, 0)),
                nutrition: { calories: ln.calories }
            });
            await lnEntry.save();
            dailyFoodEntries.push(lnEntry._id);

            // Snack
            const sn = snack[Math.floor(Math.random() * snack.length)];
            const snEntry = new FoodEntry({
                user: user._id,
                dailyLog: log._id,
                name: sn.name,
                mealType: 'snack',
                timestamp: new Date(new Date(log.date).setHours(16, 30)),
                nutrition: { calories: sn.calories }
            });
            await snEntry.save();
            dailyFoodEntries.push(snEntry._id);

            // Dinner
            const dn = dinner[Math.floor(Math.random() * dinner.length)];
            const dnEntry = new FoodEntry({
                user: user._id,
                dailyLog: log._id,
                name: dn.name,
                mealType: 'dinner',
                timestamp: new Date(new Date(log.date).setHours(20, 0)),
                nutrition: { calories: dn.calories }
            });
            await dnEntry.save();
            dailyFoodEntries.push(dnEntry._id);

            log.foodEntries = dailyFoodEntries;
            await log.save();
            // console.log(`Updated TN food for ${new Date(log.date).toDateString()}`);
        }

        console.log(`✅ Successfully updated logs with Tamil Nadu style foods.`);

    } catch (error) {
        console.error('❌ Error updating foods:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

updateFoodsTN();
