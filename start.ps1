# Smart Procure - Quick Start Script for Windows PowerShell

Write-Host "🚀 Smart Procure - Quick Start" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Check if Node.js is installed
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Check if PostgreSQL is installed
Write-Host "Checking PostgreSQL..." -ForegroundColor Yellow
$pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
if ($pgService) {
    Write-Host "✅ PostgreSQL service found" -ForegroundColor Green
} else {
    Write-Host "⚠️ PostgreSQL not detected. You can use Neon (cloud PostgreSQL) instead." -ForegroundColor Yellow
}

Write-Host "`n📦 Step 1: Installing dependencies..." -ForegroundColor Cyan
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Dependencies installed`n" -ForegroundColor Green

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "📝 Step 2: Creating .env file..." -ForegroundColor Cyan
    Copy-Item ".env.example" ".env"
    Write-Host "✅ .env file created" -ForegroundColor Green
    Write-Host "⚠️ IMPORTANT: Edit .env file with your database credentials!" -ForegroundColor Yellow
    Write-Host "   Press any key to open .env in notepad..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    notepad .env
} else {
    Write-Host "✅ .env file already exists`n" -ForegroundColor Green
}

Write-Host "`n🗃️ Step 3: Setting up database..." -ForegroundColor Cyan
Set-Location "apps\backend"

Write-Host "Generating Prisma Client..." -ForegroundColor Yellow
npm run prisma:generate

Write-Host "Running database migrations..." -ForegroundColor Yellow
npm run prisma:migrate

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database setup complete`n" -ForegroundColor Green
    
    # Ask to seed database
    $seed = Read-Host "Do you want to seed the database with demo data? (y/n)"
    if ($seed -eq "y" -or $seed -eq "Y") {
        Write-Host "Seeding database..." -ForegroundColor Yellow
        npm run prisma:seed
        Write-Host "`n✅ Database seeded with demo data" -ForegroundColor Green
        Write-Host "`n📝 Login credentials:" -ForegroundColor Cyan
        Write-Host "   Email: admin@smartprocure.com" -ForegroundColor White
        Write-Host "   Password: admin123`n" -ForegroundColor White
    }
} else {
    Write-Host "❌ Database setup failed. Please check your DATABASE_URL in .env" -ForegroundColor Red
    Set-Location "..\..\"
    exit 1
}

Set-Location "..\..\"

Write-Host "`n🎉 Setup complete!" -ForegroundColor Green
Write-Host "`n🚀 Starting Smart Procure..." -ForegroundColor Cyan
Write-Host "   Backend will run on: http://localhost:3001" -ForegroundColor White
Write-Host "   Frontend will run on: http://localhost:3000" -ForegroundColor White
Write-Host "   API Docs: http://localhost:3001/api/docs`n" -ForegroundColor White

Write-Host "Press Ctrl+C to stop the servers`n" -ForegroundColor Yellow

# Start the application
npm run dev
