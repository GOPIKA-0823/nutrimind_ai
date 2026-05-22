const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function assignDoctor() {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('MONGODB_URI not found in environment variables');
        }

        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        const userEmail = 'aswathys.23aid@kongu.edu';
        const doctorEmail = 'gobikakandasamy9@gmail.com';

        // Find the patient
        const patient = await User.findOne({ email: userEmail });
        if (!patient) {
            console.log(`User with email ${userEmail} not found`);
            return;
        }

        // Find the doctor
        const doctor = await User.findOne({
            email: doctorEmail,
            role: 'doctor'
        });

        if (!doctor) {
            console.log(`Doctor with email ${doctorEmail} not found`);
            // Fallback: search by name even if case insensitive doesn't match exactly
            const allDoctors = await User.find({ role: 'doctor' });
            console.log('Available doctors:', allDoctors.map(d => d.name));
            return;
        }

        console.log(`Found patient: ${patient.name} (${patient._id})`);
        console.log(`Found doctor: ${doctor.name} (${doctor._id})`);

        // Assign doctor
        patient.profile = patient.profile || {};
        patient.profile.doctorId = doctor._id;
        await patient.save();

        console.log(`Successfully assigned doctor ${doctor.name} to patient ${patient.name}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

assignDoctor();
