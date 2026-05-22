<<<<<<< HEAD
// Simple script to create .env file for server
const fs = require('fs');
const path = require('path');

const envContent = `# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/health-tracker

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-secure

# Client URL
CLIENT_URL=http://localhost:3000

# Cloudinary (for image uploads) - Optional for now
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# AI Service (if using external service) - Optional for now
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_API_KEY=your-ai-service-key

# Email Service (for notifications) - Optional for now
EMAIL_SERVICE_API_KEY=your-email-service-key
EMAIL_FROM=noreply@healthtracker.com

# WebRTC Configuration - Optional for now
WEBRTC_STUN_SERVER=stun:stun.l.google.com:19302
WEBRTC_TURN_SERVER=your-turn-server-url`;

const envPath = path.join(__dirname, 'server', '.env');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully in server directory');
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
}
=======
// Simple script to create .env file for server
const fs = require('fs');
const path = require('path');

const envContent = `# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/health-tracker

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-secure

# Client URL
CLIENT_URL=http://localhost:3000

# Cloudinary (for image uploads) - Optional for now
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# AI Service (if using external service) - Optional for now
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_API_KEY=your-ai-service-key

# Email Service (for notifications) - Optional for now
EMAIL_SERVICE_API_KEY=your-email-service-key
EMAIL_FROM=noreply@healthtracker.com

# WebRTC Configuration - Optional for now
WEBRTC_STUN_SERVER=stun:stun.l.google.com:19302
WEBRTC_TURN_SERVER=your-turn-server-url`;

const envPath = path.join(__dirname, 'server', '.env');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully in server directory');
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
}
>>>>>>> 9b13ef4d0212ee86c68046927a4dbe8e6a7fa339
