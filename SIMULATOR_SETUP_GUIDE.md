# Mobile App Simulator Testing Setup

## Prerequisites for Simulator Testing

Unfortunately, Replit's browser environment doesn't support Android/iOS simulators. To test your mobile app in simulators, you'll need a local development setup.

## Option 1: Android Simulator Setup

### Requirements
- Windows, Mac, or Linux computer
- At least 8GB RAM (16GB recommended)
- 10GB+ free disk space

### Step-by-Step Setup

1. **Download the Project**
   ```bash
   git clone <your-repo-url>
   cd your-project
   npm install
   ```

2. **Install Android Studio**
   - Download from: https://developer.android.com/studio
   - Install with default settings
   - Accept all license agreements

3. **Set Up Android SDK**
   ```bash
   # Open Android Studio
   # Go to Tools > SDK Manager
   # Install: Android SDK Platform 34, Android SDK Build-Tools
   ```

4. **Create Virtual Device**
   - Open Android Studio
   - Go to Tools > AVD Manager
   - Click "Create Virtual Device"
   - Choose: Pixel 6 or similar modern device
   - Select: API Level 34 (Android 14)
   - Click Finish

5. **Configure Capacitor**
   ```bash
   # Update server URL in capacitor.config.ts
   npx cap sync android
   ```

6. **Run in Simulator**
   ```bash
   # Start the Android emulator first
   npx cap open android
   # In Android Studio, click the green play button
   ```

## Option 2: iOS Simulator Setup (Mac Only)

### Requirements
- Mac computer with macOS 12+
- Xcode 14+ (free from App Store)
- 15GB+ free disk space

### Step-by-Step Setup

1. **Install Xcode**
   - Download from Mac App Store
   - Accept license agreements
   - Install command line tools

2. **Set Up iOS Simulator**
   ```bash
   # Configure Capacitor
   npx cap sync ios
   ```

3. **Run in Simulator**
   ```bash
   # Open iOS project
   npx cap open ios
   # In Xcode, select simulator device and click play
   ```

## Option 3: Cloud-Based Testing (Alternative)

### BrowserStack App Testing
- Upload your APK/IPA to BrowserStack
- Test on real devices in the cloud
- Monthly subscription required

### Firebase Test Lab
- Google's cloud testing platform
- Free tier available
- Test on real Android devices

## Current Working Alternatives

While setting up simulators, you can still test your mobile app:

### 1. Browser Mobile View
- Visit: https://workspace.ikramashaikh.replit.app/mobile-login
- Press F12 → Click mobile device icon
- Test responsive design and functionality

### 2. Physical Device Testing
- Open your phone browser
- Navigate to: https://workspace.ikramashaikh.replit.app/mobile-login
- Test real touch interactions and mobile features

### 3. PWA Installation
- Visit the site on your phone
- Add to home screen when prompted
- Get app-like experience without app store

## Mobile Features You Can Test

✅ **Available in Browser:**
- Mobile-optimized UI/UX
- Touch-friendly navigation
- Responsive layouts
- Role-based access (student/parent)
- Mobile-specific routing

⚠️ **Requires Simulator/Device:**
- Camera integration
- Push notifications
- Native sharing
- Haptic feedback
- Device-specific features

## Demo Credentials for Testing

- **Student**: username: `student`, password: `student123`
- **Parent**: username: `parent`, password: `parent123`

## Next Steps

1. **Immediate**: Test mobile interface in browser
2. **Short-term**: Set up local Android Studio or Xcode
3. **Long-term**: Deploy to app stores for production testing

The mobile app is fully functional and ready - you just need the right testing environment!