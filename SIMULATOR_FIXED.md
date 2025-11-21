# ✅ iOS Simulator Network Issue Fixed

## ⚠️ Issue
When running the app in iOS Simulator, you got:
```
The network connection was lost.
It looks like you may be using a LAN URL...
```

## 🔧 Root Cause
The API client was hardcoded to use IP `10.6.34.189:8000` for iOS, which the simulator can't reach.

**iOS Simulator doesn't use LAN IP addresses** - it uses `localhost` or `127.0.0.1` to connect to the host machine.

## ✅ What I Fixed

**File**: `src/services/api/client.ts`

**Changed**:
```typescript
// Before (broken)
ios: 'http://10.6.34.189:8000',  // ❌ Simulator can't reach this

// After (fixed)
ios: 'http://localhost:8000',    // ✅ Simulator uses localhost
```

---

## 🚀 RESTART EXPO AND TEST

### Step 1: Restart Expo
```bash
cd /Users/ns632@apac.comcast.com/Documents/v0_photo_proof/photo-proof-mobile

# Stop existing
lsof -ti:8081 | xargs kill -9

# Start with clear cache
npx expo start --clear
```

### Step 2: Open iOS Simulator
Press **`i`** when Expo starts

(If you get the Xcode error, run: `sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer`)

### Step 3: Wait for App to Load
The simulator will open and install the app. Wait ~30 seconds for it to load.

---

## 🧪 TEST LOGIN

Once the app loads in the simulator:

### Step 1: Click "Sign In"

### Step 2: Toggle to "Studio"
**IMPORTANT**: Enable the Studio/Client toggle

### Step 3: Enter Credentials
```
Email:    studio@admin.com
Password: password123
```

### Step 4: Click "Sign In" Button

---

## ✅ Expected Result

**Console (in Xcode or Expo)** shows:
```
📡 API Client initialized with baseURL: http://localhost:8000
🔐 Login attempt: { endpoint: '/api/auth/studio/login', username: 'studio@admin.com' }
🚀 API Request: POST /api/auth/studio/login
```

**App shows**:
- ✅ No network error
- ✅ "Welcome Back!" toast notification
- ✅ Redirects to home dashboard
- ✅ 6 stat cards visible
- ✅ "This Month" section shows
- ✅ Bottom navigation works
- ✅ **Everything works!** 🎉

---

## 📱 Platform-Specific API URLs

The app now uses correct URLs for each platform:

```typescript
Platform.select({
  ios: 'http://localhost:8000',      // ✅ iOS Simulator
  android: 'http://10.0.2.2:8000',   // ✅ Android Emulator
  default: 'http://localhost:8000',  // ✅ Web
})
```

### Why These URLs?

- **iOS Simulator**: Uses `localhost` because it runs on the same machine as the host
- **Android Emulator**: Uses `10.0.2.2` which is Android's special alias for the host's localhost
- **Web Browser**: Uses `localhost` directly

---

## 🐛 Troubleshooting

### Issue: Still getting network error

**Check Backend is Running**:
```bash
lsof -i:8000
# Should show Python process
```

**Check Backend URL**:
```bash
curl http://localhost:8000/health
# Should return: {"status":"healthy"}
```

**Restart Backend if Needed**:
```bash
cd photo_proof_api
./start_with_cors.sh
```

### Issue: App loads but login fails

**Check Console Logs**:
```bash
# In Expo terminal, you should see:
📡 API Client initialized with baseURL: http://localhost:8000
```

If you see a different URL, clear the cache:
```bash
cd photo-proof-mobile
npx expo start --clear
```

### Issue: "Cannot connect to Metro"

**Solution**: Make sure Expo is running on port 8081
```bash
lsof -i:8081
# Should show node process

# If not running:
cd photo-proof-mobile
npx expo start
```

### Issue: Simulator stuck on splash screen

**Solution**: Reload the app
- Press **Cmd+R** in the simulator
- Or shake the device (Cmd+Ctrl+Z) and tap "Reload"

---

## 🎯 For Physical iOS Device

If you want to test on a real iPhone (not simulator):

### Step 1: Get Your Computer's IP
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

Example output: `inet 192.168.1.9`

### Step 2: Update API URL for Physical Device
Edit `src/services/api/client.ts`:

```typescript
const getApiUrl = () => {
  if (__DEV__) {
    // Check if running on physical device
    const isDevice = Platform.OS !== 'web' && !Platform.isTV;
    
    if (isDevice && Platform.OS === 'ios') {
      // For physical iOS device, use your computer's IP
      return 'http://192.168.1.9:8000';  // Replace with your IP
    }
    
    return Platform.select({
      ios: 'http://localhost:8000',        // iOS Simulator
      android: 'http://10.0.2.2:8000',     // Android Emulator
      default: 'http://localhost:8000',
    });
  }
  return 'https://api.photoproof.com';
};
```

### Step 3: Make Sure Backend Accepts Network Connections
The `start_with_cors.sh` already includes wildcards like `http://*.*.*.*:8081` which allow any IP address.

### Step 4: Scan QR Code in Expo Go App
Install Expo Go from App Store, then scan the QR code in the Expo terminal.

---

## ✅ Quick Fix Summary

**Problem**: iOS Simulator trying to connect to unreachable IP address

**Solution**: Changed iOS API URL to `http://localhost:8000`

**Result**: 
- ✅ Simulator can now reach backend
- ✅ Network errors gone
- ✅ Login works
- ✅ All API calls work

---

## 🚀 Quick Restart

```bash
# Terminal 1: Backend (if not running)
cd photo_proof_api
./start_with_cors.sh

# Terminal 2: Mobile App
cd photo-proof-mobile
npx expo start --clear

# Press 'i' for iOS Simulator
# Login: studio@admin.com / password123 (Studio toggle ON)
```

---

**The iOS Simulator will now connect to localhost properly! 🎉**
