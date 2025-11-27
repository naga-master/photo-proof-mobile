# Quick Fix - Manual Development Build 🚀

## Current Status
✅ Native iOS project created in `ios/` folder  
⏳ Need to install CocoaPods and build

## Option 1: Let Expo Handle CocoaPods (Simplest)

Just run this command and wait (it might take 10-15 minutes on first run):

```bash
cd /Users/ns632@apac.comcast.com/Documents/v0_photo_proof/photo-proof-mobile
npx expo run:ios
```

**What's happening**: Expo will automatically install CocoaPods via Homebrew in the background. Be patient - it's downloading and compiling Ruby and CocoaPods.

## Option 2: Install CocoaPods First (Faster)

If you want more control:

```bash
# Install CocoaPods via Homebrew (one-time setup)
brew install cocoapods

# Then build
cd /Users/ns632@apac.comcast.com/Documents/v0_photo_proof/photo-proof-mobile
npx expo run:ios
```

## Option 3: Use Xcode Directly

1. **Open Simulator**:
   ```bash
   open -a Simulator
   ```

2. **Open Xcode project**:
   ```bash
   cd /Users/ns632@apac.comcast.com/Documents/v0_photo_proof/photo-proof-mobile
   open ios/PhotoProof.xcodeproj
   ```

3. **In Xcode**:
   - Wait for "Installing CocoaPods dependencies" to finish
   - Select your simulator from the device dropdown
   - Click the Play (▶️) button

4. **Start Metro separately**:
   ```bash
   cd /Users/ns632@apac.comcast.com/Documents/v0_photo_proof/photo-proof-mobile
   npx expo start --dev-client
   ```

## What to Expect

### First Time Build
- ⏳ CocoaPods installation: 5-10 minutes
- ⏳ Pod dependencies install: 3-5 minutes  
- ⏳ Xcode compilation: 2-3 minutes
- **Total: ~10-15 minutes**

### After First Build
- ✅ Subsequent builds: 1-2 minutes
- ✅ Hot reload works instantly
- ✅ Just use `npx expo start --dev-client`

## Troubleshooting

### "Command failed: xcrun simctl install"
```bash
# Restart simulator
killall Simulator
open -a Simulator
# Try build again
npx expo run:ios
```

### "No spec found for..."
```bash
cd ios
rm -rf Pods Podfile.lock
cd ..
npx expo run:ios
```

### Xcode Build Fails
```bash
# Clean and rebuild
cd ios
xcodebuild clean -workspace PhotoProof.xcworkspace -scheme PhotoProof
cd ..
npx expo run:ios
```

## After Successful Build

Once built, you'll see:
```
✅ Build Succeeded
✅ Installing on simulator
✅ Starting Metro bundler
✅ App opening...
```

Then the app will open with **ALL native modules working**:
- ✅ Camera access
- ✅ Photo library
- ✅ PDF viewing  
- ✅ Signature capture
- ✅ Secure storage
- ✅ All your new nature theme colors!

## Daily Development Workflow

After the first build, you don't need to rebuild unless you add new native modules:

```bash
# Quick start (development build already installed)
npx expo start --dev-client

# Full rebuild (only when adding native modules)
npx expo run:ios
```

---

## Recommendation

**Just run `npx expo run:ios` and let it do its thing.** Grab a coffee ☕, it's setting everything up for you. The first build is slow, but after that, development is fast with hot reload!
