#!/bin/bash

echo "🔄 Restarting development environment..."

# Kill any existing processes
echo "Stopping existing processes..."
pkill -f "next-server" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Clear caches
echo "Clearing caches..."
rm -rf .next
rm -rf node_modules/.cache

# Wait a moment
sleep 2

# Start fresh
echo "Starting development server..."
npm run dev