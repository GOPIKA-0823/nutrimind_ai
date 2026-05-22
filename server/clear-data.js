
const mongoose = require('mongoose');
const Appointment = require('./models/Appointment');
const User = require('./models/User');
const DailyLog = require('./models/DailyLog');
const FoodEntry = require('./models/FoodEntry');
require('dotenv').config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/health-tracker';

mongoose.connect(uri)
    .then(async () => {
        console.log('Connected to MongoDB');

        // 1. Delete ALL appointments
        const deletedAppointments = await Appointment.deleteMany({});
        console.log(`Deleted ${deletedAppointments.deletedCount} appointments.`);

        // 2. Delete ALL users with role 'user' (patients)
        // Be careful NOT to delete doctors or admins
        const deletedPatients = await User.deleteMany({ role: 'user' });
        console.log(`Deleted ${deletedPatients.deletedCount} patients.`);

        // 3. Delete ALL logs and food entries
        const deletedLogs = await DailyLog.deleteMany({});
        const deletedFood = await FoodEntry.deleteMany({});
        console.log(`Deleted ${deletedLogs.deletedCount} daily logs and ${deletedFood.deletedCount} food entries.`);

        console.log('Cleanup complete!');
        process.exit(0);
    })
    .catch(err => {
        console.error('Error during cleanup:', err);
        process.exit(1);
    });
