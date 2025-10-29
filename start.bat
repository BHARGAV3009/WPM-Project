@echo off
echo 🚀 Starting ChatsApp - WhatsApp-like Chat Application
echo ==================================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js v18 or higher.
    pause
    exit /b 1
)

echo 📁 Setting up project directories...

REM Install server dependencies
echo 🔧 Installing server dependencies...
cd server
if not exist "node_modules" (
    npm install
)

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo 📝 Creating .env file...
    (
        echo PORT=3000
        echo MONGODB_URI=mongodb://localhost:27017/chatsapp
        echo JWT_SECRET=your_jwt_secret_key_change_this_in_production
        echo CLIENT_URL=http://localhost:4200
        echo NODE_ENV=development
    ) > .env
    echo ✅ .env file created. Please update JWT_SECRET for production.
)

REM Start server in background
echo 🖥️  Starting server...
start "ChatsApp Server" cmd /k "npm start"

REM Wait a moment for server to start
timeout /t 3 /nobreak >nul

REM Install client dependencies
echo 🔧 Installing client dependencies...
cd ..\client
if not exist "node_modules" (
    npm install
)

REM Start client
echo 🌐 Starting client...
start "ChatsApp Client" cmd /k "ng serve"

echo.
echo ✅ ChatsApp is starting up!
echo 📱 Client: http://localhost:4200
echo 🖥️  Server: http://localhost:3000
echo.
echo Press any key to exit...
pause >nul
