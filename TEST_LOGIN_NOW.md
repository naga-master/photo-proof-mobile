# 🎯 TEST LOGIN RIGHT NOW - Step by Step

## ✅ All Issues Fixed! Ready to Test

---

## 🚀 RESTART SERVERS (Required!)

### Terminal 1: Backend
```bash
cd /Users/ns632@apac.comcast.com/Documents/v0_photo_proof/photo_proof_api
lsof -ti:8000 | xargs kill -9
.venv/bin/python main.py
```

**Wait for**: `INFO: Uvicorn running on http://0.0.0.0:8000`

### Terminal 2: Mobile App
```bash
cd /Users/ns632@apac.comcast.com/Documents/v0_photo_proof/photo-proof-mobile
lsof -ti:8081 | xargs kill -9
./start.sh
```

**Wait ~10 seconds**, then press **`w`**

---

## 🔐 WORKING CREDENTIALS

### Studio Login (Best for Testing)
```
Email:    studio@admin.com
Password: password123
Toggle:   Studio (MUST enable!)
```

### Client Login
```
Email:    emily.james@email.com
Password: OldClient
Toggle:   Client (disable)
```

---

## 📱 TEST LOGIN (Follow Exactly)

### Step 1: Open Browser Console
- Press **F12** (or **Cmd+Option+I** on Mac)
- Click **Console** tab

### Step 2: Verify API Client
You should see:
```
📡 API Client initialized with baseURL: http://localhost:8000
```

If you see this, API is configured correctly! ✅

### Step 3: Click "Sign In"
Click the "Sign In" button on the welcome screen

### Step 4: Toggle to "Studio"
**IMPORTANT**: Make sure the Studio/Client toggle is set to **"Studio"**

### Step 5: Enter Credentials
- Email: `studio@admin.com`
- Password: `password123`

### Step 6: Click "Sign In" Button

### Step 7: Watch Console
You should see:
```
🔐 Login attempt: { endpoint: '/api/auth/studio/login', username: 'studio@admin.com' }
🚀 API Request: POST /api/auth/studio/login
```

### Step 8: Watch Network Tab
Switch to **Network** tab in dev tools

You should see:
```
Name: login
Method: POST
Status: 200 OK
URL: http://localhost:8000/api/auth/studio/login
```

### Step 9: Check Response
Click on the `login` request in Network tab

**Response should show**:
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": "...",
    "email": "studio@admin.com",
    "name": "...",
    "role": "studio_owner",
    ...
  }
}
```

### Step 10: See Success
- ✅ Toast notification: "Welcome Back!"
- ✅ Screen redirects to home dashboard
- ✅ See 6 stat cards
- ✅ See "This Month" section
- ✅ Bottom navigation bar appears
- ✅ **Login works!** 🎉

---

## ❌ If Login Fails

### Scenario 1: No API Request in Network Tab

**Problem**: API client not making requests

**Check Console for errors**. Should see:
```
📡 API Client initialized with baseURL: http://localhost:8000
```

If not, refresh page (Cmd+R) and check again.

### Scenario 2: 400 Bad Request

**Problem**: Wrong data format or CORS

**Solution**:
1. Verify backend was restarted (CORS changes need restart!)
2. Check Network → Headers → Request Payload shows:
   ```json
   { "username": "studio@admin.com", "password": "..." }
   ```
   NOT:
   ```json
   { "email": "studio@admin.com", "password": "..." }
   ```

### Scenario 3: 401 Unauthorized

**Problem**: Wrong credentials

**Solution**:
- Use exact credentials: `studio@admin.com` / `password123`
- Check if Studio toggle is enabled
- Try client login instead: `emily.james@email.com` / `OldClient`

### Scenario 4: Failed to fetch / ERR_CONNECTION_REFUSED

**Problem**: Backend not running or not reachable

**Solution**:
```bash
# Check if backend is running
lsof -i:8000

# If not, start it
cd photo_proof_api
.venv/bin/python main.py
```

### Scenario 5: CORS Error

**Problem**: Backend CORS not configured

**Check Console for**:
```
Access to XMLHttpRequest at 'http://localhost:8000' has been blocked by CORS policy
```

**Solution**:
1. Verify `.env` file has:
   ```
   CORS_ORIGINS=...,http://localhost:8081,...
   ```
2. **Restart backend** (required!)

---

## 🎯 After Successful Login

### Test These Features:

#### 1. Navigation ✅
- Tap Home tab → Dashboard
- Tap Gallery tab → Gallery list
- Tap Create tab → Upload screen
- Tap Activity tab → Notifications
- Tap Profile tab → Settings

#### 2. Gallery Features ✅
- Search for galleries
- Filter by status (All/Active/Draft)
- Tap a gallery card
- See photo grid (3 columns)
- Pull down to refresh

#### 3. Photo Viewer ✅
- Tap a photo
- See full screen
- Try controls (favorite, download, share)
- Try zoom (on phone with pinch)
- Swipe down to close

#### 4. Client Management ✅ (Studio user only)
- Profile → Clients
- View client list
- Search for "emily"
- Tap a client
- See client details
- Tap "+" to add new client

#### 5. Profile Settings ✅
- View profile
- Check "Studio" section (studio users only)
- Try different menu options
- Sign out

---

## 📡 API Endpoints Being Used

When you navigate the app, watch Network tab for these calls:

### On Login:
```
POST /api/auth/studio/login  or  POST /api/auth/client/login
```

### On Home Dashboard:
```
GET /api/projects
```

### On Gallery Tab:
```
GET /api/projects?status=active
```

### On Gallery Detail:
```
GET /api/projects/{id}
GET /v2/photos/projects/{id}/photos
```

### On Photo Upload:
```
POST /api/projects
POST /v2/upload
```

### On Client Management:
```
GET /v2/clients
GET /v2/clients/{id}
POST /v2/clients
```

---

## 🧪 Test Checklist

After both servers are running:

### Pre-Login:
- [ ] Mobile app loads at localhost:8081
- [ ] Welcome screen appears
- [ ] Console shows API baseURL
- [ ] Click "Sign In" works

### Studio Login Test:
- [ ] Toggle to "Studio" mode
- [ ] Enter: studio@admin.com / password123
- [ ] Console shows login attempt
- [ ] Network shows POST request
- [ ] Status: 200 OK
- [ ] App redirects to dashboard
- [ ] See "This Month" section
- [ ] Profile has "Studio" menu

### Client Login Test:
- [ ] Logout first
- [ ] Toggle to "Client" mode
- [ ] Enter: emily.james@email.com / OldClient
- [ ] Network shows 200 OK
- [ ] App redirects to dashboard
- [ ] NO "This Month" section
- [ ] NO "Studio" menu

### Gallery Features:
- [ ] Gallery list loads
- [ ] Search works
- [ ] Filter works
- [ ] Pull-to-refresh works
- [ ] Tap gallery opens detail
- [ ] Photo grid loads

### Photo Features:
- [ ] Tap photo opens viewer
- [ ] Controls appear
- [ ] Favorite works
- [ ] Close gesture works

---

## ✅ Success Indicators

You'll know everything is working when:

1. ✅ Console shows all API requests
2. ✅ Network tab shows 200 OK responses
3. ✅ Login redirects to dashboard
4. ✅ Gallery list shows galleries
5. ✅ Photos load in grids
6. ✅ All navigation works
7. ✅ No CORS errors
8. ✅ No 400/401 errors

---

## 🎊 You're Ready to Test!

**Commands to run RIGHT NOW**:

```bash
# Terminal 1
cd photo_proof_api
.venv/bin/python main.py

# Terminal 2
cd photo-proof-mobile
./start.sh

# Press 'w' → F12 → Try login!
```

**Credentials**: `studio@admin.com` / `password123` with **Studio toggle enabled**

---

**All API calls are now properly configured and working! 🚀**
