# Assets Folder

This folder contains all static assets for the Photo Proof mobile app.

## 📂 Folder Structure

```
assets/
├── icon.png              - App icon (1024x1024)
├── splash.png            - Splash screen (2048x3840)
├── adaptive-icon.png     - Android adaptive icon (1024x1024)
├── favicon.png           - Web favicon (48x48)
├── images/               - Custom images (logos, placeholders)
└── fonts/                - Custom fonts (optional)
```

## ⚠️ Missing Assets

Currently, the following assets are **missing** and need to be added before building:

### Required for Build:
- [ ] `icon.png` - App icon (1024x1024 PNG)
- [ ] `splash.png` - Splash screen (2048x3840 PNG)
- [ ] `adaptive-icon.png` - Android icon (1024x1024 PNG)

### Optional:
- [ ] `favicon.png` - Web favicon (48x48 PNG)
- [ ] `images/logo.png` - Studio logo
- [ ] `images/logo-white.png` - Logo for dark backgrounds

## 🎨 Design Guidelines

### App Icon (`icon.png`)
- Size: 1024x1024 pixels
- Format: PNG with transparency
- Design: Simple, recognizable, works at small sizes
- Suggestion: Camera icon with brand colors (#667EEA)

### Splash Screen (`splash.png`)
- Size: 2048x3840 pixels (9:16 aspect ratio)
- Format: PNG
- Design: Logo centered, brand colors
- Background: White or gradient (#667EEA to #764BA2)

### Adaptive Icon (`adaptive-icon.png`)
- Size: 1024x1024 pixels
- Format: PNG with transparency
- Design: Icon only (no background)
- Note: Android will add various shaped masks

## 🚀 Quick Start

### Option 1: Generate Placeholder Icons
```bash
# From project root
npm run generate-icons
```

### Option 2: Use Online Generator
1. Go to https://www.appicon.co
2. Upload your 1024x1024 icon design
3. Download iOS/Android assets
4. Extract to this folder

### Option 3: Create Manually
1. Design icon in Figma/Photoshop (1024x1024)
2. Export as PNG
3. Save to `assets/icon.png`
4. Generate splash: https://www.appicon.co

## 📸 Image Assets

### Custom Images
Place custom images in `assets/images/`:
```
images/
├── logo.png              - Main logo
├── logo-white.png        - Logo for dark backgrounds
├── placeholder.png       - Image placeholder
└── empty-state.png       - Empty state illustration
```

### Usage in Code
```typescript
import { Image } from 'expo-image';

// Use require() for local assets
<Image
  source={require('@/assets/images/logo.png')}
  style={{ width: 100, height: 100 }}
/>
```

## 🔤 Fonts

### Custom Fonts (Optional)
Place custom fonts in `assets/fonts/`:
```
fonts/
├── Inter-Regular.ttf
├── Inter-Medium.ttf
├── Inter-SemiBold.ttf
└── Inter-Bold.ttf
```

### Load Fonts in Code
Uncomment in `app/_layout.tsx`:
```typescript
await Font.loadAsync({
  'Inter-Regular': require('@/assets/fonts/Inter-Regular.ttf'),
  'Inter-Bold': require('@/assets/fonts/Inter-Bold.ttf'),
});
```

## ✅ App Works Without Custom Assets!

**Note**: The app currently uses:
- ✅ **Ionicons** for all UI icons (no files needed)
- ✅ **expo-image** for backend photos (dynamic URLs)
- ✅ Default Expo icon/splash (auto-generated)

You can run and test the app right now without custom assets. They're only required before publishing to app stores.

---

For detailed information, see `ICONS_AND_IMAGES_GUIDE.md` in the project root.
