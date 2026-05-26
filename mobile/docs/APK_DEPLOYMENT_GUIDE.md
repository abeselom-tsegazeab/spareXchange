# SpareXChange Mobile — APK Deployment Guide

This guide explains how to produce an installable **Android APK/AAB** from the Expo project in `mobile/`.

## Deployment options

| Method | Output | Best for |
|--------|--------|----------|
| **EAS Build** (recommended) | APK or AAB | Production, Play Store |
| **Local prebuild + Gradle** | APK | Offline / advanced control |
| **Expo export** | JS bundle only | CI verification, not installable alone |

The app uses native modules (`expo-camera`, `expo-notifications`, `expo-location`, etc.), so a **development or production build** is required for full functionality — Expo Go alone is insufficient for production push and some permissions.

---

## Option A — EAS Build (recommended)

### 1. Install EAS CLI

```bash
npm install -g eas-cli
eas login
```

### 2. Configure the project

From `mobile/`:

```bash
eas build:configure
```

This creates `eas.json`. Example profile for a test APK:

```json
{
  "cli": { "version": ">= 12.0.0" },
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

### 3. Set production API URL

In `app.json`, set the deployed backend URL:

```json
"extra": {
  "apiUrl": "https://your-api.example.com"
}
```

Or use EAS secrets:

```bash
eas secret:create --name EXPO_PUBLIC_API_URL --value https://your-api.example.com
```

### 4. Build APK (internal testing)

```bash
cd mobile
eas build -p android --profile preview
```

When complete, EAS provides a download link for the **APK**. Install on device:

```bash
adb install path/to/app.apk
```

Enable **Install from unknown sources** if sideloading without adb.

### 5. Play Store release (AAB)

```bash
eas build -p android --profile production
eas submit -p android
```

Requires Google Play Console app record and service account key for `eas submit`.

---

## Option B — Local Android build

### 1. Prebuild native projects

```bash
cd mobile
npx expo prebuild --platform android
```

### 2. Open in Android Studio

Open `mobile/android/` in Android Studio. Sync Gradle, then:

- **Build → Build Bundle(s) / APK(s) → Build APK(s)**

Or from CLI:

```bash
cd android
./gradlew assembleRelease
```

APK output: `android/app/build/outputs/apk/release/app-release.apk`

### 3. Signing

Release builds require a keystore. Generate once:

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore sparexchange-release.keystore -alias sparexchange -keyalg RSA -keysize 2048 -validity 10000
```

Configure `android/app/build.gradle` signingConfigs or use EAS credentials management.

---

## App identity (`app.json`)

Verify before release:

```json
{
  "expo": {
    "name": "SpareXChange",
    "slug": "sparexchange",
    "version": "1.0.0",
    "android": {
      "package": "com.sparexchange.mobile",
      "versionCode": 1,
      "permissions": [
        "CAMERA",
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "POST_NOTIFICATIONS"
      ]
    },
    "plugins": [
      "expo-camera",
      "expo-image-picker",
      "expo-location",
      ["expo-notifications", { "icon": "./assets/icon.png", "color": "#10B981" }]
    ]
  }
}
```

Increment `version` and `versionCode` for each store upload.

---

## Push notifications in production

1. Backend must implement FCM (currently stubbed in repo).
2. Add `google-services.json` to the Android project (via EAS or prebuild).
3. Configure Expo push credentials:

```bash
eas credentials
```

4. Test with a **development build** or release APK — not Expo Go.

---

## Pre-release checklist

- [ ] `extra.apiUrl` points to production HTTPS backend
- [ ] Backend CORS allows mobile origins if applicable
- [ ] Socket.io reachable on same host (WSS in production)
- [ ] `npx expo export --platform android` succeeds
- [ ] Sign in, browse, exchange, and messaging tested on physical device
- [ ] Push token registration (`POST /api/notifications/push/register`) returns 200
- [ ] App icon and splash assets present in `mobile/assets/`
- [ ] Privacy policy URL ready (required for Play Store)

---

## Bundle verification (CI)

```bash
cd mobile
npx expo export --platform android
```

Success indicator: ~1500 modules, `dist/` folder created. Use this in CI before triggering EAS builds.

---

## Troubleshooting builds

| Issue | Solution |
|-------|----------|
| Gradle OOM | Increase heap in `gradle.properties` |
| Duplicate class / dependency conflict | Run `npx expo install --fix` |
| API unreachable in release APK | Hardcoded emulator URL — set `extra.apiUrl` |
| Notifications not received | FCM not configured on backend; use dev build + Expo push tool for token test |
| Play Store rejects permissions | Declare usage in store listing; remove unused permissions |

---

## Quick reference commands

```bash
# Dev
cd mobile && npx expo start

# Verify bundle
npx expo export --platform android

# EAS internal APK
eas build -p android --profile preview

# EAS Play Store AAB
eas build -p android --profile production
```

For environment setup and feature testing, see [SETUP_AND_TESTING.md](./SETUP_AND_TESTING.md).
