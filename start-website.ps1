<<<<<<< HEAD
# Health Tracker - Website Startup Script
Write-Host "🚀 Starting Health Tracker Website..." -ForegroundColor Green
Write-Host ""

# Function to find Node.js
function Find-NodeJS {
    $commonPaths = @(
        "C:\Program Files\nodejs\node.exe",
        "C:\Program Files (x86)\nodejs\node.exe",
        "$env:APPDATA\npm\node.exe",
        "$env:LOCALAPPDATA\Programs\nodejs\node.exe"
    )
    
    foreach ($path in $commonPaths) {
        if (Test-Path $path) {
            return $path
        }
    }
    
    # Try to find in PATH
    $nodeInPath = Get-Command node -ErrorAction SilentlyContinue
    if ($nodeInPath) {
        return $nodeInPath.Source
    }
    
    return $null
}

# Find Node.js
$nodePath = Find-NodeJS

if (-not $nodePath) {
    Write-Host "❌ Node.js not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "After installation, restart this script." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host "✅ Found Node.js at: $nodePath" -ForegroundColor Green
Write-Host ""

# Get npm path (usually in same directory as node)
$nodeDir = Split-Path $nodePath
$npmPath = Join-Path $nodeDir "npm.cmd"
if (-not (Test-Path $npmPath)) {
    $npmPath = "npm"  # Fallback to npm in PATH
}

# Check if .env file exists in server directory
$serverEnvPath = Join-Path $PSScriptRoot "server\.env"
if (-not (Test-Path $serverEnvPath)) {
    Write-Host "⚠️  .env file not found in server directory" -ForegroundColor Yellow
    Write-Host "Creating .env file from template..." -ForegroundColor Yellow
    
    $envContent = @"
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/health-tracker

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-secure-$(Get-Random -Minimum 1000 -Maximum 9999)

# Client URL
CLIENT_URL=http://localhost:3000

# Admin bootstrap
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=ChangeMe123!
ADMIN_NAME=System Administrator

# Cloudinary (for image uploads) - Optional
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# AI Service - Optional
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_API_KEY=your-ai-service-key

# Email Service - Optional
EMAIL_SERVICE_API_KEY=your-email-service-key
EMAIL_FROM=noreply@healthtracker.com

# WebRTC Configuration - Optional
WEBRTC_STUN_SERVER=stun:stun.l.google.com:19302
WEBRTC_TURN_SERVER=your-turn-server-url
"@
    
    try {
        Set-Content -Path $serverEnvPath -Value $envContent -Force
        Write-Host "✅ .env file created successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to create .env file: $_" -ForegroundColor Red
        Write-Host "Please create server\.env manually using server\env.example as a template" -ForegroundColor Yellow
    }
    Write-Host ""
}

# Change to project root
Set-Location $PSScriptRoot

# Check if node_modules exist
$serverNodeModules = Join-Path $PSScriptRoot "server\node_modules"
$clientNodeModules = Join-Path $PSScriptRoot "client\node_modules"

if (-not (Test-Path $serverNodeModules)) {
    Write-Host "📦 Installing server dependencies..." -ForegroundColor Cyan
    Set-Location "server"
    & $npmPath install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install server dependencies" -ForegroundColor Red
        exit 1
    }
    Set-Location $PSScriptRoot
    Write-Host ""
}

if (-not (Test-Path $clientNodeModules)) {
    Write-Host "📦 Installing client dependencies..." -ForegroundColor Cyan
    Set-Location "client"
    & $npmPath install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install client dependencies" -ForegroundColor Red
        exit 1
    }
    Set-Location $PSScriptRoot
    Write-Host ""
}

# Check if concurrently is installed in root
$rootNodeModules = Join-Path $PSScriptRoot "node_modules"
if (-not (Test-Path $rootNodeModules)) {
    Write-Host "📦 Installing root dependencies..." -ForegroundColor Cyan
    & $npmPath install
    Write-Host ""
}

Write-Host "🎯 Starting servers..." -ForegroundColor Green
Write-Host ""
Write-Host "Frontend will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend API will be available at: http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop both servers" -ForegroundColor Yellow
Write-Host ""

# Start both servers using concurrently
& $npmPath run dev

=======
# Health Tracker - Website Startup Script
Write-Host "🚀 Starting Health Tracker Website..." -ForegroundColor Green
Write-Host ""

# Function to find Node.js
function Find-NodeJS {
    $commonPaths = @(
        "C:\Program Files\nodejs\node.exe",
        "C:\Program Files (x86)\nodejs\node.exe",
        "$env:APPDATA\npm\node.exe",
        "$env:LOCALAPPDATA\Programs\nodejs\node.exe"
    )
    
    foreach ($path in $commonPaths) {
        if (Test-Path $path) {
            return $path
        }
    }
    
    # Try to find in PATH
    $nodeInPath = Get-Command node -ErrorAction SilentlyContinue
    if ($nodeInPath) {
        return $nodeInPath.Source
    }
    
    return $null
}

# Find Node.js
$nodePath = Find-NodeJS

if (-not $nodePath) {
    Write-Host "❌ Node.js not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "After installation, restart this script." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host "✅ Found Node.js at: $nodePath" -ForegroundColor Green
Write-Host ""

# Get npm path (usually in same directory as node)
$nodeDir = Split-Path $nodePath
$npmPath = Join-Path $nodeDir "npm.cmd"
if (-not (Test-Path $npmPath)) {
    $npmPath = "npm"  # Fallback to npm in PATH
}

# Check if .env file exists in server directory
$serverEnvPath = Join-Path $PSScriptRoot "server\.env"
if (-not (Test-Path $serverEnvPath)) {
    Write-Host "⚠️  .env file not found in server directory" -ForegroundColor Yellow
    Write-Host "Creating .env file from template..." -ForegroundColor Yellow
    
    $envContent = @"
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/health-tracker

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-secure-$(Get-Random -Minimum 1000 -Maximum 9999)

# Client URL
CLIENT_URL=http://localhost:3000

# Admin bootstrap
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=ChangeMe123!
ADMIN_NAME=System Administrator

# Cloudinary (for image uploads) - Optional
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# AI Service - Optional
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_API_KEY=your-ai-service-key

# Email Service - Optional
EMAIL_SERVICE_API_KEY=your-email-service-key
EMAIL_FROM=noreply@healthtracker.com

# WebRTC Configuration - Optional
WEBRTC_STUN_SERVER=stun:stun.l.google.com:19302
WEBRTC_TURN_SERVER=your-turn-server-url
"@
    
    try {
        Set-Content -Path $serverEnvPath -Value $envContent -Force
        Write-Host "✅ .env file created successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to create .env file: $_" -ForegroundColor Red
        Write-Host "Please create server\.env manually using server\env.example as a template" -ForegroundColor Yellow
    }
    Write-Host ""
}

# Change to project root
Set-Location $PSScriptRoot

# Check if node_modules exist
$serverNodeModules = Join-Path $PSScriptRoot "server\node_modules"
$clientNodeModules = Join-Path $PSScriptRoot "client\node_modules"

if (-not (Test-Path $serverNodeModules)) {
    Write-Host "📦 Installing server dependencies..." -ForegroundColor Cyan
    Set-Location "server"
    & $npmPath install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install server dependencies" -ForegroundColor Red
        exit 1
    }
    Set-Location $PSScriptRoot
    Write-Host ""
}

if (-not (Test-Path $clientNodeModules)) {
    Write-Host "📦 Installing client dependencies..." -ForegroundColor Cyan
    Set-Location "client"
    & $npmPath install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install client dependencies" -ForegroundColor Red
        exit 1
    }
    Set-Location $PSScriptRoot
    Write-Host ""
}

# Check if concurrently is installed in root
$rootNodeModules = Join-Path $PSScriptRoot "node_modules"
if (-not (Test-Path $rootNodeModules)) {
    Write-Host "📦 Installing root dependencies..." -ForegroundColor Cyan
    & $npmPath install
    Write-Host ""
}

Write-Host "🎯 Starting servers..." -ForegroundColor Green
Write-Host ""
Write-Host "Frontend will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend API will be available at: http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop both servers" -ForegroundColor Yellow
Write-Host ""

# Start both servers using concurrently
& $npmPath run dev

>>>>>>> 9b13ef4d0212ee86c68046927a4dbe8e6a7fa339
