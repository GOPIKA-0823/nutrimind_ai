# PowerShell script to update .env file with admin credentials
param(
    [string]$Email = "admin@healthtracker.com",
    [string]$Password = "Admin@123456",
    [string]$Name = "System Administrator"
)

$envPath = Join-Path $PSScriptRoot ".env"

if (-not (Test-Path $envPath)) {
    Write-Host "Creating new .env file..." -ForegroundColor Yellow
    # Create from example if it exists
    $examplePath = Join-Path $PSScriptRoot "env.example"
    if (Test-Path $examplePath) {
        Copy-Item $examplePath $envPath
    } else {
        # Create basic .env file
        @"
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/health-tracker
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-secure
CLIENT_URL=http://localhost:3000
ADMIN_EMAIL=$Email
ADMIN_PASSWORD=$Password
ADMIN_NAME=$Name
"@ | Out-File -FilePath $envPath -Encoding utf8
        Write-Host "Created new .env file" -ForegroundColor Green
    }
}

# Read current .env content
$content = Get-Content $envPath -Raw

# Update or add ADMIN_EMAIL
if ($content -match "ADMIN_EMAIL=.*") {
    $content = $content -replace "ADMIN_EMAIL=.*", "ADMIN_EMAIL=$Email"
} else {
    $content += "`nADMIN_EMAIL=$Email"
}

# Update or add ADMIN_PASSWORD
if ($content -match "ADMIN_PASSWORD=.*") {
    $content = $content -replace "ADMIN_PASSWORD=.*", "ADMIN_PASSWORD=$Password"
} else {
    $content += "`nADMIN_PASSWORD=$Password"
}

# Update or add ADMIN_NAME
if ($content -match "ADMIN_NAME=.*") {
    $content = $content -replace "ADMIN_NAME=.*", "ADMIN_NAME=$Name"
} else {
    $content += "`nADMIN_NAME=$Name"
}

# Write back to file
$content | Out-File -FilePath $envPath -Encoding utf8 -NoNewline

Write-Host "✅ Updated .env file with admin credentials:" -ForegroundColor Green
Write-Host "   ADMIN_EMAIL=$Email" -ForegroundColor Cyan
Write-Host "   ADMIN_PASSWORD=$Password" -ForegroundColor Cyan
Write-Host "   ADMIN_NAME=$Name" -ForegroundColor Cyan
Write-Host ""
Write-Host "Note: Password is shown for reference. Keep it secure!" -ForegroundColor Yellow

