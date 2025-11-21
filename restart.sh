#!/bin/bash

# Restart Photo Proof Mobile App
cd "$(dirname "$0")"

echo "🛑 Stopping existing Expo server..."
lsof -ti:8081 | xargs kill -9 2>/dev/null

echo "🧹 Clearing Metro cache..."
rm -rf node_modules/.cache
rm -rf .expo

echo ""
echo "🚀 Starting Expo with clean cache..."
echo ""

npx expo start --clear --reset-cache
