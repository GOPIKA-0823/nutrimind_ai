<<<<<<< HEAD
# 🚀 Quick Start Guide - Health Tracker Website

## ⚠️ Important: Node.js Required

This application requires **Node.js** to be installed. If you see errors about Node.js not being found, please install it first.

## 📋 Prerequisites

1. **Node.js 18+** - Download from https://nodejs.org/
2. **MongoDB** - Either:
   - Local installation: https://www.mongodb.com/try/download/community
   - OR MongoDB Atlas (cloud): https://www.mongodb.com/atlas (free tier available)

## 🔧 Setup Steps

### Step 1: Install Node.js (if not already installed)

1. Go to https://nodejs.org/
2. Download the LTS version for Windows
3. Run the installer
4. **Important**: Make sure to check "Add to PATH" during installation
5. Restart your terminal/command prompt after installation

### Step 2: Verify Installation

Open a new PowerShell or Command Prompt and run:
```powershell
node --version
npm --version
```

Both commands should show version numbers. If they don't, Node.js is not properly installed.

### Step 3: Set Up Environment Variables

The server needs a `.env` file. Create `server\.env` with this content:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/health-tracker
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-secure
CLIENT_URL=http://localhost:3000
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=ChangeMe123!
ADMIN_NAME=System Administrator
```

**Note**: If using MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string.

### Step 4: Install Dependencies

Open PowerShell in the project root (`C:\Users\RITHVIK\Downloads\Full\Full`) and run:

```powershell
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..

# Install client dependencies
cd client
npm install
cd ..
```

### Step 5: Start MongoDB (if using local MongoDB)

Make sure MongoDB is running:
- If installed as a service, it should start automatically
- Or start it manually: `mongod`

### Step 6: Start the Website

**Option A: Using the startup script (Recommended)**
```powershell
.\start-website.ps1
```

**Option B: Manual start**
```powershell
# Terminal 1 - Start backend server
cd server
npm run dev

# Terminal 2 - Start frontend client
cd client
npm run dev
```

**Option C: Using concurrently (from root)**
```powershell
npm run dev
```

## 🌐 Access the Website

Once both servers are running:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## 🐛 Troubleshooting

### Error: "node is not recognized"
- Node.js is not installed or not in PATH
- Solution: Install Node.js and restart your terminal

### Error: "MongoDB connection error"
- MongoDB is not running
- Solution: Start MongoDB service or check your connection string

### Error: "Port 3000/5000 already in use"
- Another application is using the port
- Solution: 
  ```powershell
  # Find and kill process on port 5000
  netstat -ano | findstr :5000
  taskkill /PID <PID_NUMBER> /F
  
  # Find and kill process on port 3000
  netstat -ano | findstr :3000
  taskkill /PID <PID_NUMBER> /F
  ```

### Error: "Cannot find module"
- Dependencies are not installed
- Solution: Run `npm install` in the root, server, and client directories

### Error: "EADDRINUSE: address already in use"
- Port is already in use
- Solution: Kill the process using the port (see above) or change the port in `.env`

## 📝 Notes

- Both servers (frontend and backend) must be running simultaneously
- The backend server must start before the frontend can connect
- MongoDB must be running for the backend to work
- First-time setup may take a few minutes to install all dependencies

## ✅ Success Indicators

You'll know everything is working when:
1. Backend shows: "Server running on port 5000" and "Connected to MongoDB"
2. Frontend shows: "Ready - started server on 0.0.0.0:3000"
3. You can access http://localhost:3000 in your browser
4. The health check at http://localhost:5000/api/health returns `{"status":"OK"}`

## 🆘 Still Having Issues?

1. Check that all prerequisites are installed
2. Verify Node.js is in your PATH: `where node`
3. Check MongoDB is running: `mongosh` (if local) or verify Atlas connection
4. Review error messages in the terminal for specific issues
5. Make sure firewall is not blocking ports 3000 and 5000

=======
# 🚀 Quick Start Guide - Health Tracker Website

## ⚠️ Important: Node.js Required

This application requires **Node.js** to be installed. If you see errors about Node.js not being found, please install it first.

## 📋 Prerequisites

1. **Node.js 18+** - Download from https://nodejs.org/
2. **MongoDB** - Either:
   - Local installation: https://www.mongodb.com/try/download/community
   - OR MongoDB Atlas (cloud): https://www.mongodb.com/atlas (free tier available)

## 🔧 Setup Steps

### Step 1: Install Node.js (if not already installed)

1. Go to https://nodejs.org/
2. Download the LTS version for Windows
3. Run the installer
4. **Important**: Make sure to check "Add to PATH" during installation
5. Restart your terminal/command prompt after installation

### Step 2: Verify Installation

Open a new PowerShell or Command Prompt and run:
```powershell
node --version
npm --version
```

Both commands should show version numbers. If they don't, Node.js is not properly installed.

### Step 3: Set Up Environment Variables

The server needs a `.env` file. Create `server\.env` with this content:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/health-tracker
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-secure
CLIENT_URL=http://localhost:3000
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=ChangeMe123!
ADMIN_NAME=System Administrator
```

**Note**: If using MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string.

### Step 4: Install Dependencies

Open PowerShell in the project root (`C:\Users\RITHVIK\Downloads\Full\Full`) and run:

```powershell
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..

# Install client dependencies
cd client
npm install
cd ..
```

### Step 5: Start MongoDB (if using local MongoDB)

Make sure MongoDB is running:
- If installed as a service, it should start automatically
- Or start it manually: `mongod`

### Step 6: Start the Website

**Option A: Using the startup script (Recommended)**
```powershell
.\start-website.ps1
```

**Option B: Manual start**
```powershell
# Terminal 1 - Start backend server
cd server
npm run dev

# Terminal 2 - Start frontend client
cd client
npm run dev
```

**Option C: Using concurrently (from root)**
```powershell
npm run dev
```

## 🌐 Access the Website

Once both servers are running:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## 🐛 Troubleshooting

### Error: "node is not recognized"
- Node.js is not installed or not in PATH
- Solution: Install Node.js and restart your terminal

### Error: "MongoDB connection error"
- MongoDB is not running
- Solution: Start MongoDB service or check your connection string

### Error: "Port 3000/5000 already in use"
- Another application is using the port
- Solution: 
  ```powershell
  # Find and kill process on port 5000
  netstat -ano | findstr :5000
  taskkill /PID <PID_NUMBER> /F
  
  # Find and kill process on port 3000
  netstat -ano | findstr :3000
  taskkill /PID <PID_NUMBER> /F
  ```

### Error: "Cannot find module"
- Dependencies are not installed
- Solution: Run `npm install` in the root, server, and client directories

### Error: "EADDRINUSE: address already in use"
- Port is already in use
- Solution: Kill the process using the port (see above) or change the port in `.env`

## 📝 Notes

- Both servers (frontend and backend) must be running simultaneously
- The backend server must start before the frontend can connect
- MongoDB must be running for the backend to work
- First-time setup may take a few minutes to install all dependencies

## ✅ Success Indicators

You'll know everything is working when:
1. Backend shows: "Server running on port 5000" and "Connected to MongoDB"
2. Frontend shows: "Ready - started server on 0.0.0.0:3000"
3. You can access http://localhost:3000 in your browser
4. The health check at http://localhost:5000/api/health returns `{"status":"OK"}`

## 🆘 Still Having Issues?

1. Check that all prerequisites are installed
2. Verify Node.js is in your PATH: `where node`
3. Check MongoDB is running: `mongosh` (if local) or verify Atlas connection
4. Review error messages in the terminal for specific issues
5. Make sure firewall is not blocking ports 3000 and 5000

>>>>>>> 9b13ef4d0212ee86c68046927a4dbe8e6a7fa339
