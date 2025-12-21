# Makarska Dining

Restaurant tracker app for Makarska, Croatia.

## Version
1.0.0

## Setup

```bash
# Install dependencies
npm install

# Add iOS platform
npx cap add ios

# Add Android platform  
npx cap add android

# Sync web code to native projects
npx cap sync
```

## Build

### iOS (requires Mac or Codemagic)
```bash
npx cap open ios
# Build in Xcode
```

### Android
```bash
npx cap open android
# Build in Android Studio
```

## Codemagic CI/CD

This project is configured for Codemagic cloud builds. Push to GitHub and connect to Codemagic to build iOS and Android apps without a Mac.

## Features

- 🍽️ Track restaurants in Makarska
- 🗺️ Map view with pins
- ⭐ Rate food and service
- 📸 Photo gallery
- 🔍 Address geocoding (Google Maps API)
- 💾 Local storage persistence

## Tech Stack

- HTML/CSS/JavaScript
- Leaflet.js (maps)
- Capacitor (native wrapper)
- Google Geocoding API
