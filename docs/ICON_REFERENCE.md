# 🎨 Icon Reference - Where Every Icon Is Used

## Quick Reference: All Icons in the App

---

## 📱 **NAVIGATION BAR (Bottom Tabs)**

### Home Tab
```typescript
<Ionicons name="home" size={24} color="#667EEA" />          // Active
<Ionicons name="home-outline" size={24} color="#9CA3AF" />  // Inactive
```

### Gallery Tab
```typescript
<Ionicons name="images" size={24} color="#667EEA" />          // Active
<Ionicons name="images-outline" size={24} color="#9CA3AF" />  // Inactive
```

### Create Tab (Center Button)
```typescript
<Ionicons name="add" size={32} color="white" />  // Large plus icon
```

### Activity Tab
```typescript
<Ionicons name="notifications" size={24} color="#667EEA" />          // Active
<Ionicons name="notifications-outline" size={24} color="#9CA3AF" />  // Inactive
```

### Profile Tab
```typescript
<Ionicons name="person-circle" size={24} color="#667EEA" />          // Active
<Ionicons name="person-circle-outline" size={24} color="#9CA3AF" />  // Inactive
```

---

## 🏠 **HOME SCREEN** (`app/(tabs)/index.tsx`)

### Overview Stats Cards
```typescript
<Ionicons name="albums-outline" size={32} color="#667EEA" />    // Galleries
<Ionicons name="images-outline" size={32} color="#10B981" />    // Photos
<Ionicons name="people-outline" size={32} color="#F59E0B" />    // Clients
<Ionicons name="eye-outline" size={32} color="#8B5CF6" />       // Views
<Ionicons name="heart-outline" size={32} color="#EC4899" />     // Favorites
<Ionicons name="cloud-outline" size={32} color="#06B6D4" />     // Storage
```

### This Month Section
```typescript
<Ionicons name="add-circle" size={24} color="#10B981" />      // New galleries
<Ionicons name="trending-up" size={24} color="#667EEA" />     // Growth
```

### Recent Galleries Section
```typescript
<Ionicons name="chevron-forward" size={20} color="#667EEA" />  // "View All" arrow
```

---

## 🖼️ **GALLERY SCREEN** (`app/(tabs)/gallery.tsx`)

### Search Bar
```typescript
<Ionicons name="search" size={20} color="#9CA3AF" />           // Search icon
<Ionicons name="close-circle" size={20} color="#9CA3AF" />     // Clear search
```

### Filter Buttons
```typescript
<Ionicons name="filter-outline" size={20} color="#6B7280" />   // Filter icon
```

### Gallery Cards
```typescript
<Ionicons name="images-outline" size={16} color="white" />     // Photo count
<Ionicons name="folder-outline" size={16} color="white" />     // Folder indicator
<Ionicons name="lock-closed" size={16} color="white" />        // Private gallery
```

### Empty State
```typescript
<Ionicons name="images-outline" size={64} color="#D1D5DB" />   // No galleries
```

---

## 📸 **GALLERY DETAIL** (`app/gallery/[id].tsx`)

### Header
```typescript
<Ionicons name="arrow-back" size={24} color="white" />         // Back button
<Ionicons name="ellipsis-horizontal" size={24} color="white" /> // More options
```

### Action Bar
```typescript
<Ionicons name="heart-outline" size={24} color="white" />      // Favorite all
<Ionicons name="checkmark-circle" size={24} color="white" />   // Select mode
<Ionicons name="share-outline" size={24} color="white" />      // Share
<Ionicons name="download-outline" size={24} color="white" />   // Download
```

### Photo Grid
```typescript
<Ionicons name="heart" size={16} color="#EF4444" />           // Favorited photo
<Ionicons name="checkmark-circle" size={24} color="#667EEA" /> // Selected photo
```

---

## 🔍 **PHOTO VIEWER** (`app/photo/[id].tsx`)

### Top Controls
```typescript
<Ionicons name="close" size={28} color="white" />                    // Close button
<Ionicons name="information-circle-outline" size={28} color="white" /> // Info button
```

### Bottom Actions
```typescript
<Ionicons name="heart" size={28} color="#EF4444" />           // Favorite (filled)
<Ionicons name="heart-outline" size={28} color="white" />     // Not favorited
<Ionicons name="download-outline" size={28} color="white" />  // Download
<Ionicons name="share-outline" size={28} color="white" />     // Share
<Ionicons name="trash-outline" size={28} color="#EF4444" />   // Delete
```

### Photo Info Modal
```typescript
<Ionicons name="close" size={24} color="#6B7280" />          // Close modal
<Ionicons name="image-outline" size={20} color="#6B7280" />  // File size
<Ionicons name="calendar-outline" size={20} color="#6B7280" /> // Upload date
```

---

## ➕ **CREATE/UPLOAD SCREEN** (`app/(tabs)/create.tsx`)

### Photo Picker
```typescript
<Ionicons name="images-outline" size={48} color="#667EEA" />  // Pick photos
<Ionicons name="camera-outline" size={48} color="#667EEA" />  // Take photo
```

### Selected Photos
```typescript
<Ionicons name="close-circle" size={24} color="white" />     // Remove photo
<Ionicons name="add-circle" size={32} color="#667EEA" />     // Add more photos
```

### Upload Progress
```typescript
<Ionicons name="cloud-upload-outline" size={32} color="#667EEA" /> // Uploading
<Ionicons name="checkmark-circle" size={32} color="#10B981" />     // Success
<Ionicons name="close-circle" size={32} color="#EF4444" />         // Error
```

---

## 👥 **CLIENT MANAGEMENT** (`app/clients/`)

### Client List Header
```typescript
<Ionicons name="arrow-back" size={24} color="#111827" />     // Back button
<Ionicons name="add" size={24} color="white" />              // Add client button
```

### Search Bar
```typescript
<Ionicons name="search" size={20} color="#9CA3AF" />         // Search icon
<Ionicons name="close-circle" size={20} color="#9CA3AF" />   // Clear search
```

### Client Cards
```typescript
<Ionicons name="call-outline" size={14} color="#6B7280" />   // Phone number
<Ionicons name="images-outline" size={16} color="#667EEA" /> // Gallery count
<Ionicons name="chevron-forward" size={20} color="#9CA3AF" /> // Navigate
```

### Empty State
```typescript
<Ionicons name="people-outline" size={64} color="#D1D5DB" /> // No clients
```

---

## 📊 **CLIENT DETAIL** (`app/clients/[id].tsx`)

### Header Actions
```typescript
<Ionicons name="arrow-back" size={24} color="white" />       // Back button
<Ionicons name="create-outline" size={24} color="white" />   // Edit client
<Ionicons name="trash-outline" size={24} color="white" />    // Delete client
```

### Quick Actions
```typescript
<Ionicons name="call" size={24} color="#667EEA" />           // Call
<Ionicons name="mail" size={24} color="#667EEA" />           // Email
<Ionicons name="logo-whatsapp" size={24} color="#25D366" />  // WhatsApp
```

### Contact Info
```typescript
<Ionicons name="mail-outline" size={20} color="#6B7280" />      // Email
<Ionicons name="call-outline" size={20} color="#6B7280" />      // Phone
<Ionicons name="location-outline" size={20} color="#6B7280" />  // Address
<Ionicons name="calendar-outline" size={20} color="#6B7280" />  // Member since
```

---

## 📝 **ADD CLIENT** (`app/clients/add.tsx`)

### Form Fields
```typescript
<Ionicons name="person-outline" size={20} color="#9CA3AF" />    // Name
<Ionicons name="mail-outline" size={20} color="#9CA3AF" />      // Email
<Ionicons name="call-outline" size={20} color="#9CA3AF" />      // Phone
<Ionicons name="location-outline" size={20} color="#9CA3AF" />  // Address
```

### Communication Preferences
```typescript
<Ionicons name="mail" size={20} color="#667EEA" />              // Email opt-in
<Ionicons name="logo-whatsapp" size={20} color="#25D366" />     // WhatsApp opt-in
```

### Save Button
```typescript
<Ionicons name="checkmark-circle" size={24} color="white" />    // Save client
<Ionicons name="information-circle" size={20} color="#667EEA" /> // Info tooltip
```

---

## 👤 **PROFILE SCREEN** (`app/(tabs)/profile.tsx`)

### Profile Header
```typescript
<Ionicons name="person-circle" size={80} color="#D1D5DB" />  // Avatar placeholder
<Ionicons name="create" size={20} color="#667EEA" />         // Edit profile
```

### Menu Items
```typescript
// Account Section
<Ionicons name="person-outline" size={22} color="#6B7280" />         // Edit Profile
<Ionicons name="lock-closed-outline" size={22} color="#6B7280" />   // Change Password
<Ionicons name="notifications-outline" size={22} color="#6B7280" /> // Notifications

// Studio Section (studio users only)
<Ionicons name="people-outline" size={22} color="#6B7280" />        // Clients
<Ionicons name="analytics-outline" size={22} color="#6B7280" />     // Analytics
<Ionicons name="color-palette-outline" size={22} color="#6B7280" /> // Branding

// Preferences Section
<Ionicons name="moon-outline" size={22} color="#6B7280" />          // Dark Mode
<Ionicons name="language-outline" size={22} color="#6B7280" />      // Language
<Ionicons name="shield-checkmark-outline" size={22} color="#6B7280" /> // Privacy

// Support Section
<Ionicons name="help-circle-outline" size={22} color="#6B7280" />   // Help Center
<Ionicons name="chatbubble-outline" size={22} color="#6B7280" />    // Contact Support
<Ionicons name="star-outline" size={22} color="#6B7280" />          // Rate App

// Sign Out
<Ionicons name="log-out-outline" size={22} color="#EF4444" />       // Sign Out

// Navigation arrows
<Ionicons name="chevron-forward" size={20} color="#D1D5DB" />       // Menu arrow
```

---

## 🔐 **AUTH SCREENS** (`app/(auth)/`)

### Login Screen
```typescript
<Ionicons name="mail-outline" size={20} color="#9CA3AF" />      // Email field
<Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" /> // Password field
<Ionicons name="eye-outline" size={20} color="#9CA3AF" />       // Show password
<Ionicons name="eye-off-outline" size={20} color="#9CA3AF" />   // Hide password
```

### Register Screen
```typescript
<Ionicons name="person-outline" size={20} color="#9CA3AF" />    // Name field
<Ionicons name="mail-outline" size={20} color="#9CA3AF" />      // Email field
<Ionicons name="call-outline" size={20} color="#9CA3AF" />      // Phone field
<Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" /> // Password
<Ionicons name="checkmark-circle" size={20} color="#10B981" />  // Password valid
```

### Forgot Password
```typescript
<Ionicons name="mail-outline" size={20} color="#9CA3AF" />      // Email field
<Ionicons name="send-outline" size={24} color="white" />        // Send reset
```

---

## 🔔 **ACTIVITY SCREEN** (`app/(tabs)/activity.tsx`)

### Empty State
```typescript
<Ionicons name="notifications-outline" size={64} color="#D1D5DB" /> // No notifications
```

### Notification Items
```typescript
<Ionicons name="heart" size={24} color="#EC4899" />             // Like notification
<Ionicons name="chatbubble" size={24} color="#667EEA" />        // Comment notification
<Ionicons name="person-add" size={24} color="#10B981" />        // New client
<Ionicons name="image" size={24} color="#F59E0B" />             // Photo uploaded
```

---

## 🎨 **ICON PATTERNS**

### Active vs Inactive States
```typescript
// Inactive (outline)
<Ionicons name="heart-outline" />
<Ionicons name="home-outline" />
<Ionicons name="images-outline" />

// Active (filled)
<Ionicons name="heart" />
<Ionicons name="home" />
<Ionicons name="images" />
```

### Icon Sizes
```typescript
size={16}  // Small badges, labels
size={20}  // Input fields, small UI
size={22}  // Menu items
size={24}  // Navigation, standard buttons
size={28}  // Large buttons
size={32}  // Hero buttons
size={48}  // Empty states (small)
size={64}  // Empty states (large)
size={80}  // Profile avatars
```

### Icon Colors
```typescript
color="#667EEA"  // Primary (purple-blue)
color="#10B981"  // Success (green)
color="#EF4444"  // Error/Delete (red)
color="#F59E0B"  // Warning (orange)
color="#8B5CF6"  // Purple
color="#EC4899"  // Pink
color="#06B6D4"  // Cyan
color="#9CA3AF"  // Gray (inactive)
color="#6B7280"  // Dark gray
color="#D1D5DB"  // Light gray
color="white"    // White (on dark backgrounds)
color="#25D366"  // WhatsApp green
```

---

## 📦 **HOW TO USE ICONS**

### Basic Usage
```typescript
import { Ionicons } from '@expo/vector-icons';

<Ionicons 
  name="heart" 
  size={24} 
  color="#EF4444" 
/>
```

### With Dynamic States
```typescript
<Ionicons 
  name={isFavorite ? "heart" : "heart-outline"} 
  size={28} 
  color={isFavorite ? "#EF4444" : "white"} 
/>
```

### In Buttons
```typescript
<Pressable onPress={handleAction}>
  <Ionicons name="share-outline" size={24} color="white" />
</Pressable>
```

### Browse All Icons
Visit: https://icons.expo.fyi/Index/Ionicons

---

## ✅ **Icon Summary**

- **Total Icon Names Used**: ~50 different icons
- **Package**: `@expo/vector-icons` (included with Expo)
- **Icon Set**: Ionicons (8,000+ available)
- **No Files Needed**: All vector-based
- **Fully Customizable**: Size and color via props
- **Performance**: Extremely lightweight

---

**All icons are working and styled consistently throughout the app!** 🎨
