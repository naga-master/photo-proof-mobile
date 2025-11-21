#!/bin/bash

# Photo Proof Mobile - Start Script
# Run this to start the app

echo "🚀 Starting Photo Proof Mobile App..."
echo

# Kill any existing process on port 8081
echo "📦 Clearing port 8081..."
lsof -ti:8081 | xargs kill -9 2>/dev/null || true
sleep 1

# Clear cache
echo "🧹 Clearing cache..."
rm -rf .expo node_modules/.cache 2>/dev/null || true

echo
echo "✅ Starting Expo development server..."
echo
echo "Once started:"
echo "  📱 Scan QR code with Expo Go app on your phone"
echo "  🌐 Press 'w' for web browser"
echo "  📱 Press 'a' for Android emulator"
echo
echo "Make sure your phone and computer are on the same WiFi!"
echo

# Start Expo
npx expo start --clear
