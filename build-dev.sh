#!/bin/bash

# Photo Proof Mobile - Development Build Script
# This creates a development build with all native modules

echo "🏗️  Building Photo Proof Mobile Development Build..."
echo ""
echo "This will:"
echo "  1. Generate native iOS project"
echo "  2. Install all native dependencies"
echo "  3. Build and install on simulator"
echo "  4. Start Metro bundler"
echo ""
echo "⏳ This may take 5-10 minutes on first run..."
echo ""

# Change to project directory
cd "$(dirname "$0")"

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf ios/build 2>/dev/null

# Build and run on iOS
echo ""
echo "🚀 Building for iOS..."
npx expo run:ios

