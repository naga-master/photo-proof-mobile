# Development Build Guide - Native Modules Fix 🛠️

## Why You Need a Development Build

Your app uses native modules that **don't work in Expo Go**:
- ❌ `react-native-pdf` - PDF viewing
- ❌ `react-native-blob-util` - File operations
- ❌ `react-native-signature-canvas` - Signature capture
- ❌ `react-native-mmkv` - Fast storage
- ❌ `expo-camera` - Camera access
- ❌ `expo-media-library` - Photo library access
- ❌ `expo-secure-store` - Secure storage

**Expo Go** only includes a limited set of native modules. For custom native code, you need a **Development Build**.

## What is a Development Build?

A Development Build is like Expo Go, but customized for YOUR app with YOUR native modules. Think of it as your own personal Expo Go that includes all the native features you need.

## How to Build (Two Options)

### Option 1: Quick Build (Recommended)
```bash
cd /Users/ns632@apac.comcast.com/Documents/v0_photo_proof/photo-proof-mobile
./build-dev.sh
```

### Option 2: Manual Build
```bash
cd /Users/ns632@apac.comcast.com/Documents/v0_photo_proof/photo-proof-mobile
npx expo run:ios
```

## What Happens During Build

1. **Prebuild** - Generates native iOS project (creates `ios/` folder)
2. **Pod Install** - Installs native iOS dependencies via CocoaPods
3. **Xcode Build** - Compiles the app with all native modules
4. **Install** - Installs the custom app on your simulator
5. **Metro Start** - Starts the Metro bundler for hot reloading

⏳ **First build takes 5-10 minutes**. Subsequent builds are much faster (1-2 minutes).

## After the Build

Once built, the app will:
- ✅ Have all native modules working
- ✅ Support hot reload (like Expo Go)
- ✅ Include your custom theme
- ✅ Open automatically on the simulator

## For Future Development

After the initial build, you can use the faster development workflow:

```bash
# Start Metro bundler only (if app already installed)
npx expo start --dev-client

# Rebuild only when you:
# - Add new native modules
# - Update native module versions
# - Change app.json plugins
npx expo run:ios
```

## Troubleshooting

### Build Fails?
```bash
# Clean everything and rebuild
rm -rf ios node_modules package-lock.json
npm install
npx expo run:ios
```

### Simulator Not Opening?
```bash
# Make sure simulator is ready
open -a Simulator

# Then rebuild
npx expo run:ios
```

### "No devices found"?
```bash
# List available simulators
xcrun simctl list devices | grep Booted

# If none are booted, open Simulator app first
open -a Simulator
```

### CocoaPods Issues?
```bash
# Update CocoaPods
sudo gem install cocoapods

# Or use Homebrew version
brew install cocoapods
```

## Development Build vs Expo Go

| Feature | Expo Go | Development Build |
|---------|---------|-------------------|
| Setup Time | Instant | 5-10 min first time |
| Native Modules | Limited set | All modules |
| Custom Native Code | ❌ No | ✅ Yes |
| Hot Reload | ✅ Yes | ✅ Yes |
| Easy Updates | ✅ Yes | ✅ Yes |
| Production Ready | ❌ No | ✅ Yes |

## Next Steps

1. Run the build script: `./build-dev.sh`
2. Wait for the build to complete
3. App will open automatically with all features working
4. Continue development with hot reload enabled

---

**Note**: You only need to rebuild when adding/updating native dependencies. For regular code changes, Metro bundler handles hot reloading automatically.
