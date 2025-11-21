# 📱 Icons & Images Guide - Photo Proof Mobile App

## Overview
This guide explains where all icons and images are stored and how they're referenced in the app.

---

## 🎨 **1. ICONS (Currently Used)**

### Ionicons from Expo Vector Icons
We're using **Ionicons** from `@expo/vector-icons` throughout the app. These are **vector icons** (not image files) that come bundled with Expo.

#### Where They're Used:
```typescript
import { Ionicons } from '@expo/vector-icons';

// Example usage:
<Ionicons name="heart" size={24} color="red" />
<Ionicons name="camera-outline" size={32} color="#667EEA" />
<Ionicons name="person-circle" size={40} color="white" />
```

#### Icon Library
- **Package**: `@expo/vector-icons` (already installed)
- **Icon Set**: Ionicons (8,000+ icons)
- **Browse Icons**: https://icons.expo.fyi/Index/Ionicons

#### Examples in Our App:
```typescript
// Navigation icons
<Ionicons name="home-outline" size={24} />
<Ionicons name="images-outline" size={24} />
<Ionicons name="add-circle" size={24} />

// Action icons
<Ionicons name="heart" size={28} />
<Ionicons name="download-outline" size={28} />
<Ionicons name="share-outline" size={28} />
<Ionicons name="trash-outline" size={28} />

// UI icons
<Ionicons name="search" size={20} />
<Ionicons name="close" size={28} />
<Ionicons name="chevron-forward" size={20} />
<Ionicons name="checkmark-circle" size={24} />
```

#### Why Ionicons?
✅ **No storage needed** - Vector-based, scales perfectly
✅ **8,000+ icons** - Covers all common use cases
✅ **Zero setup** - Works out of the box with Expo
✅ **Customizable** - Change size and color on the fly
✅ **Performance** - Extremely lightweight

---

## 🖼️ **2. APP ASSETS (Need to Add)**

### Asset Folder Structure
```
assets/
├── icon.png              ❌ MISSING (App Icon)
├── splash.png            ❌ MISSING (Splash Screen)
├── adaptive-icon.png     ❌ MISSING (Android Adaptive Icon)
├── favicon.png           ❌ MISSING (Web Favicon)
├── images/
│   ├── logo.png         ⚠️  Placeholder needed
│   ├── logo-white.png   ⚠️  Placeholder needed
│   └── placeholder.png  ⚠️  Placeholder needed
└── fonts/
    └── (custom fonts)    ⚠️  Optional
```

### Required Assets

#### 1. **App Icon** (`assets/icon.png`)
- **Size**: 1024x1024 pixels
- **Format**: PNG with transparency
- **Used For**: iOS and Android home screen icon
- **Configuration**: `app.json` → `"icon": "./assets/icon.png"`

**Recommendation**: Create a simple icon with:
- 📸 Camera symbol
- 🎨 Brand colors (#667EEA - purple/blue)
- Clean, modern design

#### 2. **Splash Screen** (`assets/splash.png`)
- **Size**: 2048x3840 pixels (covers all devices)
- **Format**: PNG
- **Used For**: Loading screen when app starts
- **Configuration**: `app.json` → `"splash": { "image": "./assets/splash.png" }`

**Recommendation**: Simple design with:
- Logo/brand name in center
- White or gradient background
- Tagline: "Professional Photo Galleries"

#### 3. **Adaptive Icon** (`assets/adaptive-icon.png`) - Android Only
- **Size**: 1024x1024 pixels
- **Format**: PNG with transparency
- **Used For**: Android adaptive icon system
- **Configuration**: `app.json` → `"adaptiveIcon": { "foregroundImage": "./assets/adaptive-icon.png" }`

#### 4. **Favicon** (`assets/favicon.png`) - Web Only
- **Size**: 48x48 pixels
- **Format**: PNG
- **Used For**: Browser tab icon
- **Configuration**: `app.json` → `"favicon": "./assets/favicon.png"`

---

## 📸 **3. DYNAMIC IMAGES (From Backend)**

### Photo Display
We use **expo-image** for displaying photos from the backend API.

```typescript
import { Image } from 'expo-image';

// Example: Display gallery cover photo
<Image
  source={{ uri: photoUrl }}
  style={{ width: 200, height: 200 }}
  contentFit="cover"
  transition={300}
/>
```

#### How Photos Are Loaded:
```typescript
// From API service
import { photoService } from '@/services/api/photos';

// Get photo URL
const photoUrl = photoService.getPhotoUrl(photoId, 'large');
// Returns: https://your-backend.com/uploads/photos/123/variants/large.jpg

// Display it
<Image source={{ uri: photoUrl }} />
```

#### Photo Qualities Available:
- `thumbnail` - Small preview (150x150)
- `medium` - Medium size (800x600)
- `large` - High quality (1920x1080)
- `original` - Full resolution

---

## 🎭 **4. LOCAL IMAGES (Custom Assets)**

### How to Add Custom Images

#### Step 1: Add image to assets folder
```bash
# Example: Add studio logo
mv logo.png photo-proof-mobile/assets/images/logo.png
```

#### Step 2: Reference in code
```typescript
// Method 1: Using require()
<Image
  source={require('@/assets/images/logo.png')}
  style={{ width: 100, height: 100 }}
/>

// Method 2: Direct import (TypeScript)
import logoImage from '@/assets/images/logo.png';
<Image source={logoImage} style={{ width: 100, height: 100 }} />
```

### Common Use Cases for Local Images:

#### 1. **Logo Display**
```typescript
// In header or welcome screen
<Image
  source={require('@/assets/images/logo-white.png')}
  style={styles.logo}
  contentFit="contain"
/>
```

#### 2. **Empty States**
```typescript
// When no galleries exist
<Image
  source={require('@/assets/images/empty-gallery.png')}
  style={{ width: 200, height: 200 }}
/>
```

#### 3. **Placeholder Images**
```typescript
// While photo is loading
<Image
  source={require('@/assets/images/placeholder.png')}
  placeholder={require('@/assets/images/placeholder.png')}
  style={styles.photo}
/>
```

#### 4. **Branding Elements**
```typescript
// Studio branding
<Image
  source={{ uri: studioLogoUrl }}
  style={styles.studioBanner}
  fallback={require('@/assets/images/default-studio-logo.png')}
/>
```

---

## 🎨 **5. IMAGE CONFIGURATION**

### Expo Image Features (Already Configured)
```typescript
import { Image } from 'expo-image';

<Image
  source={{ uri: photoUrl }}
  
  // Caching (automatic)
  cachePolicy="memory-disk"
  
  // Loading placeholder
  placeholder={require('@/assets/images/placeholder.png')}
  
  // Transitions
  transition={300}
  
  // Content fit
  contentFit="cover"  // or "contain", "fill", "scale-down"
  
  // Priority
  priority="high"
  
  // Error handling
  onError={(error) => console.log('Image failed to load', error)}
/>
```

---

## 📦 **6. CURRENT SETUP SUMMARY**

### ✅ What's Working Now:

1. **Icons**: Ionicons from `@expo/vector-icons` ✅
   - Used throughout the app
   - No setup needed
   - 8,000+ icons available

2. **Dynamic Photos**: `expo-image` ✅
   - Photos from backend API
   - Automatic caching
   - Smooth transitions
   - Multiple quality variants

3. **Asset Folders**: Created ✅
   - `assets/images/` exists (empty)
   - `assets/fonts/` exists (empty)
   - Ready for custom assets

### ⚠️ What's Missing:

1. **App Icon** (`assets/icon.png`) - Required for build
2. **Splash Screen** (`assets/splash.png`) - Required for build
3. **Adaptive Icon** (`assets/adaptive-icon.png`) - Required for Android
4. **Favicon** (`assets/favicon.png`) - Optional for web
5. **Custom Logo** - Optional but recommended

---

## 🚀 **7. QUICK START: Add Your Assets**

### Option 1: Use Placeholder Icons (Quick Test)
```bash
cd photo-proof-mobile

# Generate placeholder icons
npx expo install expo-dev-client
npx expo prebuild --clean

# This will generate default Expo icons
# You can replace them later
```

### Option 2: Create Custom Icons
1. Design your app icon (1024x1024)
2. Save as `assets/icon.png`
3. Use online tool like https://www.appicon.co to generate splash screens
4. Save splash as `assets/splash.png`

### Option 3: Use Our Logo Generator Script
```bash
# Coming soon: Auto-generate icons from logo
npm run generate-icons
```

---

## 📱 **8. HOW IMAGES ARE DISPLAYED IN THE APP**

### Current Image Sources:

#### 1. **Gallery Cards** (Home & Gallery List)
```typescript
// app/(tabs)/index.tsx
<Image
  source={{ uri: photoService.getPhotoUrl(gallery.cover_photo_id, 'medium') }}
  style={styles.galleryCover}
/>
```

#### 2. **Gallery Detail** (Photo Grid)
```typescript
// app/gallery/[id].tsx
<Image
  source={{ uri: photoService.getPhotoUrl(photo.id, 'thumbnail') }}
  style={styles.photoThumbnail}
/>
```

#### 3. **Photo Viewer** (Full Screen)
```typescript
// app/photo/[id].tsx
<Image
  source={{ uri: photoService.getPhotoUrl(photo.id, 'large') }}
  style={styles.fullScreenPhoto}
  contentFit="contain"
/>
```

#### 4. **Client Avatars**
```typescript
// app/clients/[id].tsx
{client.avatar_url ? (
  <Image source={{ uri: client.avatar_url }} style={styles.avatar} />
) : (
  <View style={styles.avatarPlaceholder}>
    <Text style={styles.initials}>{initials}</Text>
  </View>
)}
```

#### 5. **Upload Preview**
```typescript
// app/(tabs)/create.tsx
<Image
  source={{ uri: photo.uri }}  // Local URI from image picker
  style={styles.previewThumbnail}
/>
```

---

## 🎯 **9. BEST PRACTICES**

### For Icons:
✅ Use Ionicons for all UI icons (search, heart, camera, etc.)
✅ Keep icon sizes consistent (24px for nav, 20px for small UI)
✅ Use `-outline` variants for inactive states
✅ Use filled variants for active states

### For Images:
✅ Use `expo-image` instead of React Native `Image`
✅ Always specify `contentFit` property
✅ Use `thumbnail` quality for lists/grids
✅ Use `large` quality for full-screen views
✅ Add `transition` for smooth loading
✅ Handle loading and error states

### For Custom Assets:
✅ Optimize images before adding (use compression)
✅ Use PNG for transparency needs
✅ Use JPG for photos without transparency
✅ Keep images in `assets/images/` folder
✅ Use descriptive filenames (`logo-white.png`, not `img1.png`)

---

## 🔍 **10. TROUBLESHOOTING**

### Icon Not Showing?
```typescript
// Check spelling (case-sensitive)
<Ionicons name="heart" />  ✅
<Ionicons name="Heart" />  ❌

// Check import
import { Ionicons } from '@expo/vector-icons';  ✅
```

### Image Not Loading?
```typescript
// Check URL is valid
console.log('Photo URL:', photoUrl);

// Add error handling
<Image
  source={{ uri: photoUrl }}
  onError={(error) => console.log('Failed:', error)}
/>
```

### Asset Not Found?
```bash
# Clear cache and restart
npx expo start --clear

# Check file exists
ls -la assets/icon.png
```

---

## 📚 **Resources**

- **Ionicons Library**: https://icons.expo.fyi/Index/Ionicons
- **Expo Image Docs**: https://docs.expo.dev/versions/latest/sdk/image/
- **App Icon Generator**: https://www.appicon.co
- **Expo Assets Docs**: https://docs.expo.dev/develop/user-interface/assets/

---

## ✅ **Summary**

### Icons
- ✅ Using Ionicons (8,000+ icons)
- ✅ No files needed
- ✅ Fully working

### Dynamic Images
- ✅ Photos from backend API
- ✅ Using expo-image
- ✅ Automatic caching
- ✅ Fully working

### Custom Assets
- ⚠️ Need to add app icon
- ⚠️ Need to add splash screen
- ⚠️ Optional: Add custom logo images

**The app works perfectly without custom assets, but you'll need them before publishing to app stores!**
