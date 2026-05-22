# Health & Wellness Tracker

An AI-powered health and wellness tracking application with doctor integration, built with modern web technologies.

## 🌟 Features

### User Features
- **Daily Logging**: Track food, mood, sleep, and activity with intuitive forms
- **AI-Powered Insights**: Get personalized recommendations based on your data patterns
- **Monthly Reports**: AI-generated comprehensive health reports with trends and correlations
- **Doctor Integration**: Connect with healthcare professionals for personalized guidance
- **Gamification**: Earn points, badges, and maintain streaks for motivation
- **Food Recognition**: AI-powered food detection from photos
- **Voice Logging**: Quick voice notes for easy data entry

### Doctor Features
- **Patient Dashboard**: View assigned patients and their health data
- **Monthly Report Review**: Analyze AI-generated reports and add medical insights
- **Appointment Scheduling**: Book chat, video, or in-person consultations
- **Real-time Communication**: Chat and video calls with patients
- **Red Flag Alerts**: Get notified of concerning health patterns

### AI Features
- **Mood Correlation Analysis**: Find patterns between food intake and mental health
- **Nutrition Insights**: Identify deficiencies and overeating patterns
- **Sleep Analysis**: Correlate sleep quality with daily activities
- **Personalized Recommendations**: AI-generated actionable health advice
- **Predictive Analytics**: Forecast health trends and potential issues

## 🏗️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Recharts** - Data visualization and charts
- **React Hook Form** - Form handling and validation
- **Axios** - HTTP client for API calls

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - JSON Web Tokens for authentication
- **Socket.io** - Real-time communication
- **Multer** - File upload handling
- **Cloudinary** - Image storage and processing

### AI & ML
- **Python Flask/FastAPI** - AI microservice
- **TensorFlow/PyTorch** - Machine learning models
- **CNN** - Convolutional Neural Networks for food recognition
- **Correlation Analysis** - Statistical analysis for health patterns

## 📁 Project Structure

```
health-wellness-tracker/
├── client/                 # Next.js frontend
│   ├── app/               # App Router pages
│   ├── components/        # Reusable React components
│   ├── contexts/          # React contexts (Auth, etc.)
│   └── styles/            # Global styles and Tailwind config
├── server/                # Express.js backend
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   └── index.js           # Server entry point
├── ai-service/            # Python AI microservice
│   ├── models/            # ML models
│   ├── services/          # AI analysis services
│   └── app.py             # Flask/FastAPI app
└── docs/                  # Documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB 6+
- Python 3.8+ (for AI service)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/health-wellness-tracker.git
   cd health-wellness-tracker
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install server dependencies
   cd server && npm install
   
   # Install client dependencies
   cd ../client && npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy server environment template
   cp server/env.example server/.env
   
   # Edit server/.env with your configuration
   MONGODB_URI=mongodb://localhost:27017/health-tracker
   JWT_SECRET=your-super-secret-jwt-key
   CLIENT_URL=http://localhost:3000
   ```

4. **Start the development servers**
   ```bash
   # From root directory - starts both client and server
   npm run dev
   
   # Or start individually:
   # Server: npm run server
   # Client: npm run client
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Documentation: http://localhost:5000/api/health

## 📊 Database Schema

### Core Models
- **Users**: User profiles with role-based access (user/doctor)
- **DailyLogs**: Daily health tracking entries
- **FoodEntries**: Individual food items with nutrition data
- **MonthlyReports**: AI-generated monthly health summaries
- **DoctorSuggestions**: Medical recommendations and goals
- **Appointments**: Scheduled consultations and sessions

### Key Relationships
- Users can have multiple DailyLogs
- DailyLogs contain multiple FoodEntries
- MonthlyReports are generated from DailyLogs
- Doctors can add suggestions to MonthlyReports
- Appointments connect patients with doctors

## 🔐 Authentication & Security

- **JWT-based authentication** with role-based access control
- **Password hashing** using bcrypt
- **Rate limiting** to prevent abuse
- **Input validation** and sanitization
- **CORS configuration** for secure cross-origin requests
- **Helmet.js** for security headers

## 🤖 AI Integration

### Food Recognition
- CNN model trained on food images
- Automatic nutrition estimation
- Confidence scoring for accuracy

### Mood Correlation Analysis
- Statistical correlation between food intake and mood
- Pattern recognition in sleep and activity data
- Predictive modeling for health trends

### Report Generation
- Natural language processing for readable insights
- Data visualization recommendations
- Personalized health advice generation

## 📱 Mobile Responsiveness

The application is fully responsive and optimized for:
- Desktop computers (1024px+)
- Tablets (768px - 1023px)
- Mobile phones (320px - 767px)

## 🧪 Testing

```bash
# Run server tests
cd server && npm test

# Run client tests
cd client && npm test

# Run integration tests
npm run test:integration
```

## 🚀 Deployment

### Production Build
```bash
# Build client for production
cd client && npm run build

# Start production server
cd server && npm start
```

### Environment Variables for Production
- Set `NODE_ENV=production`
- Configure production MongoDB URI
- Set secure JWT secret
- Configure Cloudinary for image storage
- Set up SSL certificates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Healthcare professionals who provided domain expertise
- Open source libraries and frameworks used
- AI/ML community for research and models
- Beta testers and early adopters

## 📞 Support

For support, email support@healthtracker.com or join our community Discord server.

## 🔮 Roadmap

### Phase 1 (Current)
- ✅ Core user dashboard and logging
- ✅ Basic AI insights
- ✅ Doctor dashboard
- ✅ Authentication system

### Phase 2 (Next)
- 🔄 Advanced AI models
- 🔄 Video consultation integration
- 🔄 Mobile app development
- 🔄 Community features

### Phase 3 (Future)
- 📋 Wearable device integration
- 📋 Advanced analytics dashboard
- 📋 Telemedicine platform
- 📋 Insurance integration

---

**Built with ❤️ for better health and wellness**
<<<<<<< HEAD
#   n u t r i m i n d  
 
=======
>>>>>>> 9b13ef4d0212ee86c68046927a4dbe8e6a7fa339
#   n u t r i m i n d _ a i  
 #   n u t r i m i n d _ a i  
 #   n u t r i m i n d _ a i  
 #   n u t r i m i n d _ a i  
 #   n u t r i m i n d _ a i  
 #   n u t r i m i n d _ a i  
 #   n u t r i m i n d _ a i  
 