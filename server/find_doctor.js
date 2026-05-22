const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function findDoctor() {
    await mongoose.connect(process.env.MONGODB_URI);
    const users = await User.find({
        $or: [
            { name: /gobikakandasamy/i },
            { email: /gobikakandasamy/i }
        ]
    });
    users.forEach(u => console.log(`E: ${u.email} I: ${u._id}`));
    await mongoose.disconnect();
}

findDoctor();
