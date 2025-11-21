# 🚀 Quick Start Guide - Photo Proof Mobile

## ✅ Prerequisites Met!

- ✅ All dependencies installed (1,518 packages)
- ✅ TypeScript errors fixed (0 errors)
- ✅ Import errors resolved
- ✅ Missing peer dependency installed
- ✅ Ready to run!

---

## 📱 Start the App (3 Steps)

### Step 1: Navigate to Project
```bash
cd /Users/ns632@apac.comcast.com/Documents/v0_photo_proof/photo-proof-mobile
```

### Step 2: Start Development Server
```bash
npx expo start
```

### Step 3: Open on Device/Simulator
Once Expo starts, you'll see options:
- Press **`i`** for iOS Simulator
- Press **`a`** for Android Emulator  
- **Scan QR code** with Expo Go app on your phone

---

## 📲 Install Expo Go (For Physical Device)

### iOS (iPhone/iPad):
1. Open App Store
2. Search "Expo Go"
3. Install the app
4. Open it and scan the QR code from terminal

### Android (Phone/Tablet):
1. Open Google Play Store
2. Search "Expo Go"
3. Install the app
4. Open it and scan the QR code from terminal

---

## 🖥️ Use Simulators/Emulators

### iOS Simulator (Mac Only):
```bash
# Start Expo
npx expo start

# Press 'i' when prompted
# Simulator will launch automatically
```

### Android Emulator:
```bash
# 1. Open Android Studio
# 2. Start an emulator (AVD Manager)
# 3. Then start Expo
npx expo start

# Press 'a' when prompted
```

---

## 🎯 Test Features

Once the app loads, test these features:

### 1. Authentication ✅
- Welcome screen with animations
- Login/Register flows
- Studio vs Client toggle

### 2. Home Dashboard ✅
- 6 analytics cards (Galleries, Photos, Clients, Views, Favorites, Storage)
- "This Month" growth section
- Recent galleries carousel

### 3. Gallery Features ✅
- Browse galleries with filters
- Search galleries
- View photo grid (3 columns)
- Tap photo for full-screen viewer

### 4. Photo Viewer ✅
- Pinch to zoom (1x to 4x)
- Pan when zoomed
- Swipe down to close
- Favorite, download, share, delete

### 5. Photo Upload ✅
- Pick multiple photos (up to 50)
- Preview thumbnails
- Add gallery title
- Upload with progress tracking

### 6. Client Management ✅ (Studio users)
- View client list
- Search/filter clients
- View client details
- Add new clients
- Call/Email/WhatsApp quick actions

### 7. Profile & Settings ✅
- Edit profile
- Studio section (Clients, Analytics, Branding)
- Logout

---

## 🔧 Troubleshooting

### If Server Won't Start:
```bash
# Clear cache and restart
npx expo start --clear
```

### If Port is Busy:
```bash
# Kill process on port 8081
lsof -ti:8081 | xargs kill -9

# Then restart
npx expo start
```

### If Module Errors:
```bash
# Reinstall dependencies
rm -rf node_modules
npm install

# Clear cache
npx expo start --clear
```

---

## 🎨 Configure Backend API

The app expects your Photo Proof API to be running. Update the API URL:

### Option 1: Environment Variable
```bash
# Create .env file
echo "EXPO_PUBLIC_API_URL=https://your-api.com" > .env

# Restart Expo
npx expo start --clear
```

### Option 2: Update API Client
Edit `src/services/api/client.ts`:
```typescript
const API_BASE_URL = 'https://your-api.com';
```

### For Local Testing:
```bash
# Use your computer's IP address (not localhost!)
# Find your IP: ifconfig | grep "inet "
# Example: http://192.168.1.100:8000
```

---

## 📊 Project Structure Quick Reference

```
photo-proof-mobile/
├── app/                    # All screens (Expo Router)
│   ├── (auth)/            # Login, Register, Welcome
│   ├── (tabs)/            # Home, Gallery, Create, Activity, Profile
│   ├── clients/           # Client management
│   ├── gallery/[id].tsx   # Gallery detail
│   └── photo/[id].tsx     # Photo viewer
│
├── src/
│   ├── services/api/      # API integration
│   │   ├── client.ts      # API client
│   │   ├── auth.ts        # Authentication
│   │   ├── photos.ts      # Photo operations
│   │   ├── projects.ts    # Gallery/project operations
│   │   ├── clients.ts     # Client management
│   │   └── comments.ts    # Comments
│   │
│   ├── stores/            # State management (Zustand)
│   │   └── authStore.ts   # Auth state
│   │
│   ├── components/        # Reusable components
│   │   └── gallery/       # Gallery-specific components
│   │
│   └── theme/             # Theme configuration
│       └── ThemeProvider.tsx
│
├── assets/                # Static assets
│   ├── images/            # Custom images
│   └── fonts/             # Custom fonts
│
└── Configuration files:
    ├── package.json       # Dependencies
    ├── app.json          # Expo config
    ├── tsconfig.json     # TypeScript config
    └── babel.config.js   # Babel config
```

---

## 🎯 Development Workflow

### 1. Start Development
```bash
npx expo start
```

### 2. Make Changes
- Edit files in `app/` or `src/`
- Save file
- App reloads automatically (Fast Refresh)

### 3. View Logs
- Logs appear in terminal
- Press `j` to open React DevTools
- Shake device for debug menu

### 4. Test Features
- Navigate through app
- Test all interactions
- Check error handling

### 5. Build for Production
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

---

## 📚 Useful Commands

```bash
# Start development server
npx expo start

# Start with cache cleared
npx expo start --clear

# Start in tunnel mode (for remote testing)
npx expo start --tunnel

# Start on specific platform
npx expo start --ios
npx expo start --android
npx expo start --web

# Type checking
npx tsc --noEmit

# Install new package
npm install package-name

# Update Expo SDK
npx expo install --fix
```

---

## 🔍 Keyboard Shortcuts (During Development)

When Expo is running:

- **`i`** - Open in iOS Simulator
- **`a`** - Open in Android Emulator
- **`w`** - Open in web browser
- **`r`** - Reload app
- **`m`** - Toggle menu
- **`j`** - Open React DevTools
- **`c`** - Show logs
- **`?`** - Show all commands
- **`q`** - Quit

---

## ✅ You're Ready!

Everything is set up and ready to go:

1. ✅ All dependencies installed
2. ✅ TypeScript configured
3. ✅ Path aliases working
4. ✅ API services ready
5. ✅ All screens implemented
6. ✅ Gesture handlers updated
7. ✅ Missing dependencies fixed

---

## 🚀 Run It Now!

```bash
npx expo start
```

Then scan the QR code or press `i` for iOS or `a` for Android!

---

## 📖 Additional Docs

- `ICONS_AND_IMAGES_GUIDE.md` - Icon and image reference
- `ICON_REFERENCE.md` - Every icon used in the app
- `IMPORT_ERRORS_FIXED.md` - Import issues resolution
- `STARTUP_ISSUES_FIXED.md` - Startup troubleshooting
- `FINAL_MOBILE_APP_COMPLETE.md` - Complete feature list
- `README.md` - Full project documentation

---

**Happy coding! 🎉**
