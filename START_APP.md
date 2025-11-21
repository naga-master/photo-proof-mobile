# 🚀 Start Photo Proof Mobile App

## ✅ Ignore iOS Simulator Warning

The warning you see:
```
Unable to run simctl:
Error: xcrun simctl help exited with non-zero code: 72
```

**This is NOT a problem!** It just means iOS simulator tools aren't configured. You have better options anyway.

---

## 📱 Best Way to Test: Use Your Phone

This is actually the **easiest and best** way to test:

### Step 1: Install Expo Go
- **iPhone**: Open App Store, search "Expo Go", install
- **Android**: Open Play Store, search "Expo Go", install

### Step 2: Start the App
```bash
cd /Users/ns632@apac.comcast.com/Documents/v0_photo_proof/photo-proof-mobile
npx expo start
```

### Step 3: Scan QR Code
- Open Expo Go on your phone
- Tap "Scan QR code"
- Point camera at QR code in terminal
- App loads instantly! ✅

**Make sure your phone and computer are on the same WiFi network.**

---

## 🌐 Alternative: Test in Web Browser

If you want to test quickly without a phone:

```bash
# Start Expo
npx expo start

# Press 'w' when it starts
# Or visit: http://localhost:8081
```

The app will open in your web browser! (Most features work, but gestures are limited)

---

## 🤖 Alternative: Use Android Emulator

If you have Android Studio installed:

```bash
# 1. Open Android Studio
# 2. Start an emulator (AVD Manager)
# 3. Then in terminal:
npx expo start

# Press 'a' when it starts
```

---

## 🍎 Fix iOS Simulator (Optional)

Only do this if you really want to use iOS simulator:

### Option 1: Install Xcode Command Line Tools
```bash
xcode-select --install
```

### Option 2: Set Xcode Path
```bash
# If you have Xcode installed
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer

# Verify
xcode-select -p
# Should show: /Applications/Xcode.app/Contents/Developer
```

### Option 3: Install Full Xcode
1. Open Mac App Store
2. Search "Xcode"
3. Install (it's ~12GB, takes a while)
4. Open Xcode once to complete setup
5. Agree to license
6. Then restart Expo

**But honestly, using your phone with Expo Go is much easier!**

---

## 🎯 Quick Start Checklist

- [ ] Expo Go installed on phone
- [ ] Phone and computer on same WiFi
- [ ] Backend API running (optional for initial test)
- [ ] Run `npx expo start` in terminal
- [ ] Scan QR code with Expo Go
- [ ] App loads and you can navigate! ✅

---

## 🔧 If Port 8081 is Busy

```bash
# Kill the process
lsof -ti:8081 | xargs kill -9

# Then start again
npx expo start
```

---

## 📊 What You'll See

When Expo starts successfully:

```
Starting project at /path/to/photo-proof-mobile

Starting Metro Bundler
› Metro waiting on exp://192.168.x.x:8081

› Press a │ open Android
› Press w │ open web

› Press r │ reload app
› Press m │ toggle menu
› Press ? │ show all commands

Logs from the server...
```

The QR code will appear below this. Just scan it!

---

## 🎨 Test These Features

Once the app loads on your phone:

### 1. Welcome Screen ✅
- See animated gradient background
- Tap "Sign In" or "Create Account"

### 2. Login ✅
- Try test credentials:
  - Client: `emily.james@email.com` / `OldClient`
  - Studio: `studio@example.com` / `password123`

### 3. Home Dashboard ✅
- See 6 stat cards
- Check "This Month" growth section
- Scroll recent galleries

### 4. Gallery Tab ✅
- Browse galleries
- Use search
- Filter by status
- Pull down to refresh

### 5. Photo Viewer ✅
- Tap a gallery
- Tap a photo
- **Pinch to zoom** (works great on real device!)
- **Pan when zoomed**
- **Swipe down to close**
- Try favorite, download, share buttons

### 6. Create Tab ✅
- Tap center "+" button
- Pick photos from your gallery
- Preview selection
- Add gallery title
- Watch upload progress

### 7. Profile Tab ✅
- View settings
- If studio user, tap "Clients"
- Try different menu options

---

## 🌐 Backend API Configuration

The app tries to connect to:
```
http://192.168.1.100:8000
```

### If You Need to Change It:

**Find your computer's IP:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Update the API URL:**
```typescript
// Edit: src/services/api/client.ts
const API_BASE_URL = 'http://YOUR_IP_HERE:8000';
```

**Restart Expo:**
```bash
npx expo start --clear
```

---

## 🐛 Troubleshooting

### Can't Scan QR Code?
- Make sure camera permissions are enabled for Expo Go
- Try entering the URL manually in Expo Go
- Or press 'w' for web version

### "Unable to connect to Metro"?
- Check phone and computer are on **same WiFi**
- Disable VPN if you have one
- Try tunnel mode: `npx expo start --tunnel`

### App Won't Load?
```bash
# Clear everything and restart
rm -rf node_modules/.cache .expo
npx expo start --clear
```

### White Screen?
- Check terminal for errors
- Press `r` in terminal to reload
- Shake phone and tap "Reload"

---

## ✅ You're Ready!

Ignore the iOS simulator warning and just use your phone. It's actually better because:

- ✅ **Faster** - No need to boot simulator
- ✅ **Real gestures** - Pinch to zoom works perfectly
- ✅ **Accurate testing** - See exactly how users will experience it
- ✅ **Easier** - Just scan QR code

---

## 🚀 Start Now

```bash
cd photo-proof-mobile
npx expo start
```

Then:
1. Open Expo Go on your phone
2. Scan the QR code
3. Start testing! 🎉

---

**The iOS simulator warning is harmless. Your app will work perfectly on real devices!**
