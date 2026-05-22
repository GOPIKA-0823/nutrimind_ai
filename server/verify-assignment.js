
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const verifyAssignment = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/health-tracker';
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        const patientEmail = 'gopikak.23aid@kongu.edu';
        const patient = await User.findOne({ email: patientEmail }).populate('profile.doctorId');

        if (patient && patient.profile && patient.profile.doctorId) {
            console.log(`✅ Verification Success: Patient ${patient.name} is assigned to Doctor ${patient.profile.doctorId.name} (${patient.profile.doctorId.email})`);
        } else {
            console.log(`❌ Verification Failed: Patient is NOT assigned properly.`);
            console.log('Patient:', patient ? patient.profile : 'Not found');
        }

    } catch (error) {
        console.error('❌ Error verifying:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

verifyAssignment();
