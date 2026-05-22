<<<<<<< HEAD
# MongoDB Setup Guide

## Option 1: MongoDB Atlas (Cloud - Recommended)

1. **Create a free MongoDB Atlas account:**
   - Go to https://www.mongodb.com/atlas
   - Sign up for a free account
   - Create a new cluster (choose the free tier)

2. **Get your connection string:**
   - In Atlas dashboard, click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

3. **Update your .env file:**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/health-tracker?retryWrites=true&w=majority
   ```

## Option 2: Local MongoDB Installation

### Windows:
1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Install with default settings
3. Start MongoDB service
4. Your connection string will be: `mongodb://localhost:27017/health-tracker`

### Using Chocolatey (as Administrator):
```powershell
# Run PowerShell as Administrator
choco install mongodb -y
```

## Quick Start (Using Atlas)

1. **Sign up for MongoDB Atlas** (free tier available)
2. **Create a cluster** (choose the free M0 tier)
3. **Create a database user:**
   - Username: `healthtracker`
   - Password: `healthtracker123` (or your preferred password)
4. **Whitelist your IP address** (or use 0.0.0.0/0 for development)
5. **Get connection string** and update the .env file

## Test Connection

Run the setup script to test your connection:
```bash
cd server
node ../setup-database.js
```

## Environment Variables

Make sure your `server/.env` file contains:
```
MONGODB_URI=your_connection_string_here
JWT_SECRET=your-super-secret-jwt-key-here
PORT=5000
CLIENT_URL=http://localhost:3000
```
=======
# MongoDB Setup Guide

## Option 1: MongoDB Atlas (Cloud - Recommended)

1. **Create a free MongoDB Atlas account:**
   - Go to https://www.mongodb.com/atlas
   - Sign up for a free account
   - Create a new cluster (choose the free tier)

2. **Get your connection string:**
   - In Atlas dashboard, click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

3. **Update your .env file:**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/health-tracker?retryWrites=true&w=majority
   ```

## Option 2: Local MongoDB Installation

### Windows:
1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Install with default settings
3. Start MongoDB service
4. Your connection string will be: `mongodb://localhost:27017/health-tracker`

### Using Chocolatey (as Administrator):
```powershell
# Run PowerShell as Administrator
choco install mongodb -y
```

## Quick Start (Using Atlas)

1. **Sign up for MongoDB Atlas** (free tier available)
2. **Create a cluster** (choose the free M0 tier)
3. **Create a database user:**
   - Username: `healthtracker`
   - Password: `healthtracker123` (or your preferred password)
4. **Whitelist your IP address** (or use 0.0.0.0/0 for development)
5. **Get connection string** and update the .env file

## Test Connection

Run the setup script to test your connection:
```bash
cd server
node ../setup-database.js
```

## Environment Variables

Make sure your `server/.env` file contains:
```
MONGODB_URI=your_connection_string_here
JWT_SECRET=your-super-secret-jwt-key-here
PORT=5000
CLIENT_URL=http://localhost:3000
```
>>>>>>> 9b13ef4d0212ee86c68046927a4dbe8e6a7fa339
