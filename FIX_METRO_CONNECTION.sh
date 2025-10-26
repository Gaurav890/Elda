#!/bin/bash
# Fix Metro Connection Issues
# Completely clean and restart Metro bundler

echo "🔧 Fixing Metro Connection..."

# 1. Kill everything
echo "Step 1: Killing all processes..."
pkill -f "metro" || true
pkill -f "react-native" || true
lsof -ti:8081 | xargs kill -9 2>/dev/null || true

sleep 2

# 2. Clean caches
echo "Step 2: Cleaning caches..."
cd /Users/gaurav/Elda/elder-companion-mobile
rm -rf $TMPDIR/metro-* 2>/dev/null || true
rm -rf $TMPDIR/react-* 2>/dev/null || true
rm -rf $TMPDIR/haste-map-* 2>/dev/null || true
watchman watch-del-all 2>/dev/null || true

# 3. Start Metro
echo "Step 3: Starting Metro bundler..."
npx react-native start --reset-cache &
METRO_PID=$!

echo ""
echo "✅ Metro bundler started (PID: $METRO_PID)"
echo ""
echo "Metro is running in the background."
echo "Now reload your app:"
echo ""
echo "  In Simulator: Press Cmd+R"
echo "  OR"
echo "  In new terminal: npx react-native run-ios"
echo ""
echo "Metro logs: Check the terminal where Metro is running"
