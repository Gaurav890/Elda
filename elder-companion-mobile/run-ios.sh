#!/bin/bash

# Elder Companion Mobile - iOS Run Script
# This script bypasses the Xcode scheme destination issue

set -e

echo "🚀 Building Elder Companion Mobile for iOS..."

# Navigate to project root
cd "$(dirname "$0")"

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cd ios
xcodebuild clean -workspace ElderCompanionTemp.xcworkspace -scheme ElderCompanionTemp > /dev/null 2>&1

# Build for generic iOS Simulator
echo "🔨 Building app..."
xcodebuild \
  -workspace ElderCompanionTemp.xcworkspace \
  -scheme ElderCompanionTemp \
  -configuration Debug \
  -sdk iphonesimulator \
  -destination 'generic/platform=iOS Simulator' \
  CODE_SIGN_IDENTITY="" \
  CODE_SIGNING_REQUIRED=NO \
  build \
  | grep -v "^$" \
  | grep -E "(Building|Compiling|Linking|^\\*\\*|error|warning:.*failed)" \
  || true

cd ..

# Check if build succeeded
APP_PATH=$(find ~/Library/Developer/Xcode/DerivedData/ElderCompanionTemp-*/Build/Products/Debug-iphonesimulator -name "ElderCompanionTemp.app" -type d 2>/dev/null | head -1)

if [ -z "$APP_PATH" ]; then
    echo "❌ Build failed! App not found."
    exit 1
fi

echo "✅ Build successful!"
echo "📱 App location: $APP_PATH"

# Get iPhone simulator UDID (prefer iPhone 17)
SIMULATOR_UDID=$(xcrun simctl list devices | grep "iPhone 17 " | grep -v "Pro" | head -1 | grep -oE '\([0-9A-F-]{36}\)' | tr -d '()')

if [ -z "$SIMULATOR_UDID" ]; then
    # Fallback to any iPhone simulator
    SIMULATOR_UDID=$(xcrun simctl list devices | grep "iPhone" | head -1 | grep -oE '\([0-9A-F-]{36}\)' | tr -d '()')
fi

echo "📱 Using simulator: $SIMULATOR_UDID"

# Boot simulator if not already booted
echo "🔄 Booting simulator..."
xcrun simctl boot "$SIMULATOR_UDID" 2>/dev/null || echo "Simulator already booted"

# Wait for simulator to boot
sleep 3

# Uninstall old version (if exists)
echo "🗑️  Uninstalling old version..."
xcrun simctl uninstall "$SIMULATOR_UDID" com.eldercompanion.patient 2>/dev/null || true

# Install app
echo "📦 Installing app..."
xcrun simctl install "$SIMULATOR_UDID" "$APP_PATH"

echo ""
echo "✅ App installed successfully!"
echo ""
echo "🎯 Next steps:"
echo "   1. Start Metro bundler in another terminal:"
echo "      npm start"
echo ""
echo "   2. Launch the app:"
echo "      xcrun simctl launch $SIMULATOR_UDID com.eldercompanion.patient"
echo ""
echo "Or run this to launch now:"
echo "   xcrun simctl launch $SIMULATOR_UDID com.eldercompanion.patient"
echo ""
