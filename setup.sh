#!/bin/bash

# Photo Proof Mobile App Setup Script
# This script sets up the mobile app development environment

echo "================================================"
echo "Photo Proof Mobile App - Setup Script"
echo "================================================"
echo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js installation
echo "🔍 Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js from: https://nodejs.org/"
    exit 1
else
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js installed: $NODE_VERSION${NC}"
fi

# Check npm installation
echo "🔍 Checking npm installation..."
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
else
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✅ npm installed: $NPM_VERSION${NC}"
fi

# Install dependencies
echo
echo "📦 Installing dependencies..."
npm install

# Check if installation was successful
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependencies installed successfully${NC}"
else
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

# Install missing peer dependency (required for Expo Metro bundler)
echo
echo "📦 Installing additional peer dependencies..."
npm install @react-native-community/cli-server-api --save-dev

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Peer dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠️  Warning: Some peer dependencies may be missing${NC}"
fi

# Get local IP address
echo
echo "🌐 Detecting your local IP address..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    LOCAL_IP=$(hostname -I | awk '{print $1}')
else
    # Windows (Git Bash)
    LOCAL_IP=$(ipconfig | grep -A 4 "Wireless LAN" | grep "IPv4" | awk '{print $NF}')
fi

if [ -z "$LOCAL_IP" ]; then
    echo -e "${YELLOW}⚠️  Could not detect IP address automatically${NC}"
    echo "Please find your IP address manually using:"
    echo "  Mac/Linux: ifconfig"
    echo "  Windows: ipconfig"
    LOCAL_IP="YOUR_IP_HERE"
else
    echo -e "${GREEN}✅ Your IP address: $LOCAL_IP${NC}"
fi

# Update API client with local IP
echo
echo "📝 Updating API configuration..."
API_FILE="src/services/api/client.ts"
if [ -f "$API_FILE" ]; then
    # Create backup
    cp "$API_FILE" "$API_FILE.backup"
    
    # Update IP address in the file
    sed -i.bak "s/192.168.1.100/$LOCAL_IP/g" "$API_FILE"
    echo -e "${GREEN}✅ API client updated with IP: $LOCAL_IP${NC}"
else
    echo -e "${YELLOW}⚠️  API client file not found, please update manually${NC}"
fi

# Instructions
echo
echo "================================================"
echo -e "${GREEN}✨ Setup Complete!${NC}"
echo "================================================"
echo
echo "Next steps:"
echo
echo "1. Make sure your backend is running:"
echo "   cd ../photo_proof_api"
echo "   python main.py"
echo
echo "2. Start the mobile app:"
echo "   npx expo start"
echo
echo "3. Test on your device:"
echo "   • Install Expo Go from App Store/Play Store"
echo "   • Scan the QR code with your phone"
echo "   • Make sure your phone is on the same WiFi"
echo
echo "4. Test credentials:"
echo "   Client: emily.james@email.com / OldClient"
echo "   Studio: studio@example.com / password123"
echo
echo "================================================"
echo "Happy coding! 🚀"
echo "================================================"
