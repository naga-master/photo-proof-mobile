# Photo Proof Mobile App 📱

A modern, high-performance mobile application for Photo Proof built with Expo and React Native. Features a beautiful UI inspired by Instagram, VSCO, and Pinterest.

## 🚀 Features

- **Modern UI/UX**: Beautiful, intuitive interface with smooth animations
- **Multi-Platform**: Works on iOS and Android
- **Fast Performance**: Optimized with FlashList and image caching
- **Secure Authentication**: JWT tokens with secure storage
- **Photo Management**: Upload, view, and organize photo galleries
- **Multi-Tenant Support**: Dynamic studio branding
- **Offline Support**: Works without internet connection
- **Dark Mode**: Automatic theme switching

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or later) - [Download](https://nodejs.org/)
- **npm** or **yarn**
- **Expo Go app** on your phone:
  - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
  - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

### Optional (for advanced testing):
- **Xcode** (Mac only) - For iOS simulator
- **Android Studio** - For Android emulator

## 🛠️ Installation

### Step 1: Clone and Setup

```bash
# Navigate to the mobile app directory
cd photo-proof-mobile

# Install dependencies
npm install

# Or using yarn
yarn install
```

### Step 2: Configure API Connection

Open `src/services/api/client.ts` and update the API URL with your backend IP:

```typescript
// Replace with your computer's IP address
return Platform.select({
  ios: 'http://192.168.1.100:8000',     // Your IP here
  android: 'http://192.168.1.100:8000',  // Your IP here
  default: 'http://localhost:8000',
});
```

**How to find your IP:**
- Mac/Linux: `ifconfig | grep "inet "`
- Windows: `ipconfig`

### Step 3: Start the Backend

Make sure your Photo Proof API is running:

```bash
# In the photo_proof_api directory
cd ../photo_proof_api
python main.py
```

## 🏃‍♂️ Running the App

### Method 1: Using Expo Go (Recommended for beginners)

```bash
# Start the development server
npx expo start

# You'll see a QR code in the terminal
```

**On your phone:**
1. Open Expo Go app
2. **iOS**: Use Camera app to scan QR code
3. **Android**: Use QR scanner in Expo Go
4. The app will load on your device

### Method 2: iOS Simulator (Mac only)

```bash
# Install iOS Simulator (if not installed)
# 1. Install Xcode from App Store
# 2. Open Xcode once and accept license

# Run on iOS Simulator
npx expo run:ios

# Or press 'i' in the terminal after expo start
```

### Method 3: Android Emulator

```bash
# Install Android Studio first
# Create an Android Virtual Device (AVD)

# Run on Android Emulator
npx expo run:android

# Or press 'a' in the terminal after expo start
```

## 🧪 Testing Credentials

Use these credentials to test the app:

**Studio Login:**
```
Email: studio@example.com
Password: password123
```

**Client Login:**
```
Email: emily.james@email.com
Password: OldClient
```

## 📱 App Structure

```
photo-proof-mobile/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Authentication screens
│   │   ├── welcome.tsx    # Welcome screen
│   │   ├── login.tsx      # Login screen
│   │   └── register.tsx   # Registration
│   ├── (tabs)/            # Main app tabs
│   │   ├── index.tsx      # Home dashboard
│   │   ├── gallery.tsx    # Gallery list
│   │   ├── create.tsx     # Upload photos
│   │   ├── activity.tsx  # Notifications
│   │   └── profile.tsx    # User profile
│   └── _layout.tsx        # Root layout
├── src/
│   ├── components/        # Reusable components
│   ├── services/          # API and services
│   ├── stores/            # State management
│   ├── hooks/             # Custom hooks
│   ├── theme/             # Theming system
│   └── types/             # TypeScript types
└── assets/                # Images and fonts
```

## 🎨 Customization

### Theme Colors

Edit `src/theme/colors.ts`:

```typescript
export const colors = {
  primary: '#667EEA',    // Your brand color
  secondary: '#10B981',
  accent: '#F59E0B',
  // ... more colors
};
```

### Fonts

Add custom fonts in `assets/fonts/` and load them in `app/_layout.tsx`.

## 🐛 Debugging

### Enable Developer Menu
- **Physical Device**: Shake your phone
- **iOS Simulator**: Press `Cmd + D`
- **Android Emulator**: Press `Cmd + M` (Mac) or `Ctrl + M` (Windows)

### View Console Logs
```bash
# In the terminal where expo is running
# Logs will appear automatically

# Or use React Native Debugger
brew install --cask react-native-debugger  # Mac
```

### Clear Cache
```bash
# Clear all caches
npx expo start --clear

# Clear specific caches
npx expo start -c
```

## 🚢 Building for Production

### iOS (TestFlight)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account
eas login

# Configure build
eas build:configure

# Build for iOS
eas build --platform ios

# Submit to TestFlight
eas submit -p ios
```

### Android (Google Play)

```bash
# Build for Android
eas build --platform android

# Submit to Google Play
eas submit -p android
```

## 📊 Performance Tips

1. **Image Optimization**: Use appropriate image sizes
2. **Lazy Loading**: Components load on-demand
3. **Cache Management**: Clear cache periodically
4. **Memory Usage**: Monitor with Expo tools

## 🔧 Troubleshooting

### Common Issues

**Issue: Can't connect to backend**
- Solution: Check your IP address in `api/client.ts`
- Ensure phone and computer are on same WiFi

**Issue: Expo Go crashes**
- Solution: Clear cache with `expo start -c`
- Update Expo Go to latest version

**Issue: Images not loading**
- Solution: Check backend is running
- Verify image URLs are accessible

**Issue: Login not working**
- Solution: Check backend logs
- Ensure API endpoints are correct

### Reset Everything
```bash
# Clear all data and reinstall
rm -rf node_modules
rm package-lock.json
npm install
npx expo start --clear
```

## 📚 Additional Resources

- [Expo Documentation](https://docs.expo.dev)
- [React Native Docs](https://reactnative.dev)
- [Expo Router Guide](https://docs.expo.dev/router/introduction/)
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is proprietary and confidential.

## 💬 Support

For issues or questions:
- Create an issue in the repository
- Contact the development team

---

Built with ❤️ using Expo and React Native
