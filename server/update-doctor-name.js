
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const updateDoctorName = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/health-tracker';
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        const doctorEmail = 'gobikakandasamy9@gmail.com';
        const doctor = await User.findOne({ email: doctorEmail });

        if (doctor) {
            doctor.name = 'Dr Gopika';
            await doctor.save();
            console.log(`✅ Updated doctor name to: ${doctor.name}`);
        } else {
            console.log(`❌ Doctor not found: ${doctorEmail}`);
        }

    } catch (error) {
        console.error('❌ Error updating doctor:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

updateDoctorName();
