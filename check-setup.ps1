<<<<<<< HEAD
# Health Tracker - Setup Verification Script
Write-Host "🔍 Checking Health Tracker Setup..." -ForegroundColor Cyan
Write-Host ""

$issues = @()
$warnings = @()

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
$nodePath = $null
$commonPaths = @(
    "C:\Program Files\nodejs\node.exe",
    "C:\Program Files (x86)\nodejs\node.exe",
    "$env:APPDATA\npm\node.exe",
    "$env:LOCALAPPDATA\Programs\nodejs\node.exe"
)

foreach ($path in $commonPaths) {
    if (Test-Path $path) {
        $nodePath = $path
        break
    }
}

$nodeInPath = Get-Command node -ErrorAction SilentlyContinue
if ($nodeInPath) {
    $nodePath = $nodeInPath.Source
}

if ($nodePath) {
    $nodeVersion = & $nodePath --version 2>&1
    Write-Host "  ✅ Node.js found: $nodePath" -ForegroundColor Green
    Write-Host "  ✅ Version: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "  ❌ Node.js not found!" -ForegroundColor Red
    $issues += "Node.js is not installed or not in PATH. Please install from https://nodejs.org/"
}

Write-Host ""

# Check npm
Write-Host "Checking npm..." -ForegroundColor Yellow
if ($nodePath) {
    $nodeDir = Split-Path $nodePath
    $npmPath = Join-Path $nodeDir "npm.cmd"
    if (Test-Path $npmPath) {
        $npmVersion = & $npmPath --version 2>&1
        Write-Host "  ✅ npm found: $npmVersion" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  npm not found in Node.js directory" -ForegroundColor Yellow
        $warnings += "npm may not be available"
    }
} else {
    Write-Host "  ❌ Cannot check npm (Node.js not found)" -ForegroundColor Red
}

Write-Host ""

# Check .env file
Write-Host "Checking server .env file..." -ForegroundColor Yellow
$envPath = Join-Path $PSScriptRoot "server\.env"
if (Test-Path $envPath) {
    Write-Host "  ✅ .env file exists" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  .env file not found" -ForegroundColor Yellow
    $warnings += "server\.env file is missing. The startup script will create it automatically."
}

Write-Host ""

# Check dependencies
Write-Host "Checking dependencies..." -ForegroundColor Yellow
$serverNodeModules = Join-Path $PSScriptRoot "server\node_modules"
$clientNodeModules = Join-Path $PSScriptRoot "client\node_modules"
$rootNodeModules = Join-Path $PSScriptRoot "node_modules"

if (Test-Path $serverNodeModules) {
    Write-Host "  ✅ Server dependencies installed" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Server dependencies not installed" -ForegroundColor Yellow
    $warnings += "Server dependencies need to be installed - run: cd server; npm install"
}

if (Test-Path $clientNodeModules) {
    Write-Host "  ✅ Client dependencies installed" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Client dependencies not installed" -ForegroundColor Yellow
    $warnings += "Client dependencies need to be installed - run: cd client; npm install"
}

if (Test-Path $rootNodeModules) {
    Write-Host "  ✅ Root dependencies installed" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Root dependencies not installed" -ForegroundColor Yellow
    $warnings += "Root dependencies need to be installed - run: npm install"
}

Write-Host ""

# Check MongoDB (optional)
Write-Host "Checking MongoDB connection..." -ForegroundColor Yellow
try {
    $mongoProcess = Get-Process mongod -ErrorAction SilentlyContinue
    if ($mongoProcess) {
        Write-Host "  ✅ MongoDB process is running" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  MongoDB process not found (may be using MongoDB Atlas)" -ForegroundColor Yellow
        $warnings += "MongoDB may not be running locally. If using Atlas, this is OK."
    }
} catch {
    Write-Host "  ⚠️  Could not check MongoDB status" -ForegroundColor Yellow
}

Write-Host ""

# Check ports
Write-Host "Checking ports..." -ForegroundColor Yellow
$port3000 = netstat -ano | findstr ":3000" | Select-Object -First 1
$port5000 = netstat -ano | findstr ":5000" | Select-Object -First 1

if ($port3000) {
    Write-Host "  ⚠️  Port 3000 is in use" -ForegroundColor Yellow
    $warnings += "Port 3000 is already in use. You may need to stop the existing process."
} else {
    Write-Host "  ✅ Port 3000 is available" -ForegroundColor Green
}

if ($port5000) {
    Write-Host "  ⚠️  Port 5000 is in use" -ForegroundColor Yellow
    $warnings += "Port 5000 is already in use. You may need to stop the existing process."
} else {
    Write-Host "  ✅ Port 5000 is available" -ForegroundColor Green
}

Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Summary
if ($issues.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host "All checks passed! You are ready to start the website." -ForegroundColor Green
    Write-Host ""
    Write-Host 'Run: .\start-website.ps1' -ForegroundColor Cyan
} elseif ($issues.Count -eq 0) {
    Write-Host 'Setup complete with some warnings:' -ForegroundColor Yellow
    foreach ($warning in $warnings) {
        Write-Host "  - $warning" -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host 'You can still try to start the website, but some features may not work.' -ForegroundColor Yellow
    Write-Host 'Run: .\start-website.ps1' -ForegroundColor Cyan
} else {
    Write-Host 'Setup issues found:' -ForegroundColor Red
        foreach ($issue in $issues) {
            Write-Host ('  - ' + $issue) -ForegroundColor Red
        }
    if ($warnings.Count -gt 0) {
        Write-Host ""
        Write-Host 'Warnings:' -ForegroundColor Yellow
        foreach ($warning in $warnings) {
            Write-Host ('  - ' + $warning) -ForegroundColor Yellow
        }
    }
    Write-Host ""
    Write-Host 'Please fix the issues above before starting the website.' -ForegroundColor Red
    Write-Host 'See QUICK_START.md for detailed instructions.' -ForegroundColor Cyan
}

Write-Host ""

=======
# Health Tracker - Setup Verification Script
Write-Host "🔍 Checking Health Tracker Setup..." -ForegroundColor Cyan
Write-Host ""

$issues = @()
$warnings = @()

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
$nodePath = $null
$commonPaths = @(
    "C:\Program Files\nodejs\node.exe",
    "C:\Program Files (x86)\nodejs\node.exe",
    "$env:APPDATA\npm\node.exe",
    "$env:LOCALAPPDATA\Programs\nodejs\node.exe"
)

foreach ($path in $commonPaths) {
    if (Test-Path $path) {
        $nodePath = $path
        break
    }
}

$nodeInPath = Get-Command node -ErrorAction SilentlyContinue
if ($nodeInPath) {
    $nodePath = $nodeInPath.Source
}

if ($nodePath) {
    $nodeVersion = & $nodePath --version 2>&1
    Write-Host "  ✅ Node.js found: $nodePath" -ForegroundColor Green
    Write-Host "  ✅ Version: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "  ❌ Node.js not found!" -ForegroundColor Red
    $issues += "Node.js is not installed or not in PATH. Please install from https://nodejs.org/"
}

Write-Host ""

# Check npm
Write-Host "Checking npm..." -ForegroundColor Yellow
if ($nodePath) {
    $nodeDir = Split-Path $nodePath
    $npmPath = Join-Path $nodeDir "npm.cmd"
    if (Test-Path $npmPath) {
        $npmVersion = & $npmPath --version 2>&1
        Write-Host "  ✅ npm found: $npmVersion" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  npm not found in Node.js directory" -ForegroundColor Yellow
        $warnings += "npm may not be available"
    }
} else {
    Write-Host "  ❌ Cannot check npm (Node.js not found)" -ForegroundColor Red
}

Write-Host ""

# Check .env file
Write-Host "Checking server .env file..." -ForegroundColor Yellow
$envPath = Join-Path $PSScriptRoot "server\.env"
if (Test-Path $envPath) {
    Write-Host "  ✅ .env file exists" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  .env file not found" -ForegroundColor Yellow
    $warnings += "server\.env file is missing. The startup script will create it automatically."
}

Write-Host ""

# Check dependencies
Write-Host "Checking dependencies..." -ForegroundColor Yellow
$serverNodeModules = Join-Path $PSScriptRoot "server\node_modules"
$clientNodeModules = Join-Path $PSScriptRoot "client\node_modules"
$rootNodeModules = Join-Path $PSScriptRoot "node_modules"

if (Test-Path $serverNodeModules) {
    Write-Host "  ✅ Server dependencies installed" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Server dependencies not installed" -ForegroundColor Yellow
    $warnings += "Server dependencies need to be installed - run: cd server; npm install"
}

if (Test-Path $clientNodeModules) {
    Write-Host "  ✅ Client dependencies installed" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Client dependencies not installed" -ForegroundColor Yellow
    $warnings += "Client dependencies need to be installed - run: cd client; npm install"
}

if (Test-Path $rootNodeModules) {
    Write-Host "  ✅ Root dependencies installed" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Root dependencies not installed" -ForegroundColor Yellow
    $warnings += "Root dependencies need to be installed - run: npm install"
}

Write-Host ""

# Check MongoDB (optional)
Write-Host "Checking MongoDB connection..." -ForegroundColor Yellow
try {
    $mongoProcess = Get-Process mongod -ErrorAction SilentlyContinue
    if ($mongoProcess) {
        Write-Host "  ✅ MongoDB process is running" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  MongoDB process not found (may be using MongoDB Atlas)" -ForegroundColor Yellow
        $warnings += "MongoDB may not be running locally. If using Atlas, this is OK."
    }
} catch {
    Write-Host "  ⚠️  Could not check MongoDB status" -ForegroundColor Yellow
}

Write-Host ""

# Check ports
Write-Host "Checking ports..." -ForegroundColor Yellow
$port3000 = netstat -ano | findstr ":3000" | Select-Object -First 1
$port5000 = netstat -ano | findstr ":5000" | Select-Object -First 1

if ($port3000) {
    Write-Host "  ⚠️  Port 3000 is in use" -ForegroundColor Yellow
    $warnings += "Port 3000 is already in use. You may need to stop the existing process."
} else {
    Write-Host "  ✅ Port 3000 is available" -ForegroundColor Green
}

if ($port5000) {
    Write-Host "  ⚠️  Port 5000 is in use" -ForegroundColor Yellow
    $warnings += "Port 5000 is already in use. You may need to stop the existing process."
} else {
    Write-Host "  ✅ Port 5000 is available" -ForegroundColor Green
}

Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Summary
if ($issues.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host "All checks passed! You are ready to start the website." -ForegroundColor Green
    Write-Host ""
    Write-Host 'Run: .\start-website.ps1' -ForegroundColor Cyan
} elseif ($issues.Count -eq 0) {
    Write-Host 'Setup complete with some warnings:' -ForegroundColor Yellow
    foreach ($warning in $warnings) {
        Write-Host "  - $warning" -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host 'You can still try to start the website, but some features may not work.' -ForegroundColor Yellow
    Write-Host 'Run: .\start-website.ps1' -ForegroundColor Cyan
} else {
    Write-Host 'Setup issues found:' -ForegroundColor Red
        foreach ($issue in $issues) {
            Write-Host ('  - ' + $issue) -ForegroundColor Red
        }
    if ($warnings.Count -gt 0) {
        Write-Host ""
        Write-Host 'Warnings:' -ForegroundColor Yellow
        foreach ($warning in $warnings) {
            Write-Host ('  - ' + $warning) -ForegroundColor Yellow
        }
    }
    Write-Host ""
    Write-Host 'Please fix the issues above before starting the website.' -ForegroundColor Red
    Write-Host 'See QUICK_START.md for detailed instructions.' -ForegroundColor Cyan
}

Write-Host ""

>>>>>>> 9b13ef4d0212ee86c68046927a4dbe8e6a7fa339
