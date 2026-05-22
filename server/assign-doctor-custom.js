
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const assignDoctor = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/health-tracker';
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to database');

        const patientEmail = 'gopikak.23aid@kongu.edu';
        const doctorEmail = 'gobikakandasamy9@gmail.com';

        const patient = await User.findOne({ email: patientEmail });
        if (!patient) {
            console.log(`❌ Patient not found: ${patientEmail}`);
            process.exit(1);
        }

        const doctor = await User.findOne({ email: doctorEmail });
        if (!doctor) {
            console.log(`❌ Doctor not found: ${doctorEmail}`);
            process.exit(1);
        }

        if (doctor.role !== 'doctor') {
            console.log(`❌ User ${doctorEmail} is not a doctor! Role: ${doctor.role}`);
            // Optional: Force update role if needed, but safer to warn first.
            // For this request, I will just warn.
        }

        // Assign doctor to patient
        // Note: User model has profile.doctorId based on previous view_file
        if (!patient.profile) {
            patient.profile = {};
        }
        patient.profile.doctorId = doctor._id;

        await patient.save();

        console.log(`✅ Successfully assigned patient ${patient.name} (${patientEmail}) to doctor ${doctor.name} (${doctorEmail})`);

    } catch (error) {
        console.error('❌ Error assigning doctor:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

assignDoctor();
