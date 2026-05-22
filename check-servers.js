<<<<<<< HEAD
// Script to check if servers are running
const http = require('http');

function checkServer(port, name) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}`, (res) => {
      console.log(`✅ ${name} server is running on port ${port}`);
      resolve(true);
    });
    
    req.on('error', (err) => {
      console.log(`❌ ${name} server is not running on port ${port}`);
      resolve(false);
    });
    
    req.setTimeout(3000, () => {
      console.log(`⏰ ${name} server timeout on port ${port}`);
      resolve(false);
    });
  });
}

async function checkAllServers() {
  console.log('🔍 Checking server status...\n');
  
  const frontend = await checkServer(3000, 'Frontend (Next.js)');
  const backend = await checkServer(5000, 'Backend (Express)');
  
  console.log('\n📋 Summary:');
  if (frontend && backend) {
    console.log('🎉 Both servers are running! You can now access the application.');
    console.log('🌐 Frontend: http://localhost:3000');
    console.log('🔧 Backend API: http://localhost:5000');
  } else {
    console.log('⚠️  Some servers are not running. Please check the terminal output.');
    if (!frontend) {
      console.log('💡 To start frontend: cd client && npm run dev');
    }
    if (!backend) {
      console.log('💡 To start backend: cd server && npm run dev');
    }
  }
}

checkAllServers();
=======
// Script to check if servers are running
const http = require('http');

function checkServer(port, name) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}`, (res) => {
      console.log(`✅ ${name} server is running on port ${port}`);
      resolve(true);
    });
    
    req.on('error', (err) => {
      console.log(`❌ ${name} server is not running on port ${port}`);
      resolve(false);
    });
    
    req.setTimeout(3000, () => {
      console.log(`⏰ ${name} server timeout on port ${port}`);
      resolve(false);
    });
  });
}

async function checkAllServers() {
  console.log('🔍 Checking server status...\n');
  
  const frontend = await checkServer(3000, 'Frontend (Next.js)');
  const backend = await checkServer(5000, 'Backend (Express)');
  
  console.log('\n📋 Summary:');
  if (frontend && backend) {
    console.log('🎉 Both servers are running! You can now access the application.');
    console.log('🌐 Frontend: http://localhost:3000');
    console.log('🔧 Backend API: http://localhost:5000');
  } else {
    console.log('⚠️  Some servers are not running. Please check the terminal output.');
    if (!frontend) {
      console.log('💡 To start frontend: cd client && npm run dev');
    }
    if (!backend) {
      console.log('💡 To start backend: cd server && npm run dev');
    }
  }
}

checkAllServers();
>>>>>>> 9b13ef4d0212ee86c68046927a4dbe8e6a7fa339
