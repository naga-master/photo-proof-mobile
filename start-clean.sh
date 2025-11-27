#!/bin/bash

# Photo Proof Mobile - Clean Start Script
# This script starts the development build with a clean cache

echo "🧹 Starting Photo Proof Mobile (Development Build) with clean cache..."
echo ""

# Change to project directory
cd "$(dirname "$0")"

# Check if development build exists
if [ ! -d "ios" ]; then
    echo "❌ ERROR: Development build not found!"
    echo ""
    echo "You need to build the app first:"
    echo "  npx expo run:ios"
    echo ""
    echo "This is a one-time setup that takes 10-15 minutes."
    echo "After that, this script will work for daily development."
    exit 1
fi

# Clear any existing Metro cache
echo "📦 Clearing Metro cache..."
rm -rf $TMPDIR/metro-* $TMPDIR/haste-map-* 2>/dev/null

# Start Expo with development build
echo ""
echo "🚀 Starting Expo Development Build..."
echo "⏳ Please wait for the bundler to complete"
echo "📱 Then press 'i' to launch iOS simulator"
echo ""
echo "💡 Using development build (not Expo Go)"
echo ""

npx expo start -c --dev-client

