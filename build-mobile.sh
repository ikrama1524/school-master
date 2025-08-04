#!/bin/bash

echo "🏗️  Building EduManage Mobile App..."

# Build the web app
echo "📦 Building web application..."
npm run build

# Sync with Capacitor
echo "🔄 Syncing with Capacitor..."
npx cap sync

echo "✅ Mobile app build complete!"
echo ""
echo "📱 Next steps:"
echo "   Android: npx cap open android"
echo "   iOS: npx cap open ios"
echo ""
echo "🚀 To run on device:"
echo "   Android: npx cap run android"
echo "   iOS: npx cap run ios"