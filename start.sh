#!/bin/bash

# ChatsApp Startup Script
echo "🚀 Starting ChatsApp - WhatsApp-like Chat Application"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first."
    echo "   On macOS: brew services start mongodb-community"
    echo "   On Ubuntu: sudo systemctl start mongod"
    echo "   On Windows: Start MongoDB service"
    exit 1
fi

# Check if Angular CLI is installed
if ! command -v ng &> /dev/null; then
    echo "📦 Installing Angular CLI..."
    npm install -g @angular/cli
fi

echo "📁 Setting up project directories..."

# Install server dependencies
echo "🔧 Installing server dependencies..."
cd server
if [ ! -d "node_modules" ]; then
    npm install
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOL
PORT=3000
MONGODB_URI=mongodb://localhost:27017/chatsapp
JWT_SECRET=your_jwt_secret_key_change_this_in_production
CLIENT_URL=http://localhost:4200
NODE_ENV=development
EOL
    echo "✅ .env file created. Please update JWT_SECRET for production."
fi

# Start server in background
echo "🖥️  Starting server..."
npm start &
SERVER_PID=$!

# Wait a moment for server to start
sleep 3

# Install client dependencies
echo "🔧 Installing client dependencies..."
cd ../client
if [ ! -d "node_modules" ]; then
    npm install
fi

# Start client
echo "🌐 Starting client..."
ng serve &
CLIENT_PID=$!

echo ""
echo "✅ ChatsApp is starting up!"
echo "📱 Client: http://localhost:4200"
echo "🖥️  Server: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $SERVER_PID 2>/dev/null
    kill $CLIENT_PID 2>/dev/null
    echo "✅ Servers stopped."
    exit 0
}

# Trap Ctrl+C
trap cleanup SIGINT

# Wait for processes
wait
