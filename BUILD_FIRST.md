# 🚨 IMPORTANT: You Need to Build First!

## What Just Happened

You ran `./start-clean.sh` which started **Expo Go** mode.

**The Problem**: Expo Go doesn't have your native modules!

## The Solution: 2-Step Process

### Step 1: BUILD the Development Build (First Time Only)

This creates your custom app with ALL native modules:

```bash
cd /Users/ns632@apac.comcast.com/Documents/v0_photo_proof/photo-proof-mobile

# This will take 10-15 minutes the first time
npx expo run:ios
```

**What this does:**
- ✅ Installs CocoaPods
- ✅ Installs all native dependencies (PDF, signatures, camera, etc.)
- ✅ Builds your custom app with Xcode
- ✅ Installs it on the simulator
- ✅ Starts Metro bundler
- ✅ Opens the app

**Wait for it to complete!** You'll see:
```
✅ Build Succeeded
✅ Installing on simulator
✅ App opening...
```

### Step 2: Daily Development (After First Build)

Once built, use this for fast starts:

```bash
# Start Metro bundler in dev-client mode
npx expo start --dev-client

# Then press 'i' to open simulator (app already installed)
```

## Visual Guide

```
❌ WRONG (What you just did):
   ./start-clean.sh  →  Uses Expo Go  →  Native modules fail!

✅ CORRECT (What you need to do):
   
   FIRST TIME:
   npx expo run:ios  →  Builds custom app  →  Everything works!
   
   AFTER THAT:
   npx expo start --dev-client  →  Uses your custom app  →  Fast & works!
```

## Quick Command

**Just copy and paste this:**

```bash
cd /Users/ns632@apac.comcast.com/Documents/v0_photo_proof/photo-proof-mobile && npx expo run:ios
```

Then go grab a coffee ☕ for 10-15 minutes while it builds.

## Why This Is Necessary

| Feature | Expo Go | Development Build |
|---------|---------|-------------------|
| Your PDF viewer | ❌ Not included | ✅ Works |
| Signature capture | ❌ Not included | ✅ Works |
| Camera access | ❌ Limited | ✅ Full access |
| Photo library | ❌ Limited | ✅ Full access |
| Build time | Instant | 10-15 min (once) |

## After the Build

Your workflow becomes:

1. **Daily development**: `npx expo start --dev-client`
2. **When adding new native modules**: `npx expo run:ios`

---

## TL;DR

**Stop what you're doing and run this:**

```bash
npx expo run:ios
```

**Wait 10-15 minutes.**

**Done!** After that, everything will work including hot reload.
