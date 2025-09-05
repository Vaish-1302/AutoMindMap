# AutoMindMap Environment Setup Script
# Run this script to set up your environment variables

Write-Host "Setting up AutoMindMap environment variables..." -ForegroundColor Green

# Set MongoDB URI (default to local MongoDB)
$mongodbUri = Read-Host "Enter MongoDB URI (default: mongodb://localhost:27017/automindmap)"
if ([string]::IsNullOrWhiteSpace($mongodbUri)) {
    $mongodbUri = "mongodb://localhost:27017/automindmap"
}

# Set Gemini API Key
$geminiApiKey = Read-Host "Enter your Gemini API Key (required)"
if ([string]::IsNullOrWhiteSpace($geminiApiKey)) {
    Write-Host "Gemini API Key is required for AI features to work!" -ForegroundColor Red
    exit 1
}

# Set JWT Secret
$jwtSecret = Read-Host "Enter JWT Secret (default: automindmap-secret-key)"
if ([string]::IsNullOrWhiteSpace($jwtSecret)) {
    $jwtSecret = "automindmap-secret-key"
}

# Set Port
$port = Read-Host "Enter server port (default: 5000)"
if ([string]::IsNullOrWhiteSpace($port)) {
    $port = "5000"
}

# Create .env file content
$envContent = @"
# MongoDB Configuration
MONGODB_URI=$mongodbUri
DATABASE_NAME=automindmap

# Gemini API Configuration
GEMINI_API_KEY=$geminiApiKey

# Server Configuration
PORT=$port
NODE_ENV=development

# JWT Configuration
JWT_SECRET=$jwtSecret
JWT_EXPIRES_IN=7d
"@

# Write to .env file
$envContent | Out-File -FilePath ".env" -Encoding UTF8

Write-Host "Environment variables have been saved to .env file!" -ForegroundColor Green
Write-Host "You can now run 'npm run dev' to start the development server." -ForegroundColor Green

# Set environment variables for current session
$env:MONGODB_URI = $mongodbUri
$env:GEMINI_API_KEY = $geminiApiKey
$env:JWT_SECRET = $jwtSecret
$env:PORT = $port
$env:NODE_ENV = "development"

Write-Host "Environment variables have been set for the current session." -ForegroundColor Green
