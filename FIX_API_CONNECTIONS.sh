#!/bin/bash
# Fix API Connection Issues
# This script will clean up everything and restart properly

set -e

echo "🔧 FIXING API CONNECTION ISSUES"
echo "================================"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_step() {
    echo -e "${BLUE}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# ============================================================================
# STEP 1: Kill ALL running processes
# ============================================================================
print_step "STEP 1: Killing all running processes..."

# Kill backend (uvicorn)
pkill -f "uvicorn" || true
sleep 1

# Kill React Native Metro
pkill -f "node.*metro" || true

# Kill React Native
pkill -f "react-native" || true

# Kill any process on port 8000
lsof -ti:8000 | xargs kill -9 2>/dev/null || true

# Kill any process on port 3000 (dashboard)
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

sleep 2
print_success "All processes killed"

# ============================================================================
# STEP 2: Verify backend configuration
# ============================================================================
print_step "STEP 2: Verifying backend configuration..."

cd /Users/gaurav/Elda/backend

# Check if .env exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found!"
    exit 1
fi

# Check CORS settings
echo "Current CORS settings:"
grep "CORS_ORIGINS" .env || echo "CORS_ORIGINS not set"

print_success "Backend configuration verified"

# ============================================================================
# STEP 3: Start backend cleanly
# ============================================================================
print_step "STEP 3: Starting backend server..."

# Start backend in background
source venv/bin/activate
nohup uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 > /tmp/elda-backend-clean.log 2>&1 &
BACKEND_PID=$!

print_success "Backend started (PID: $BACKEND_PID)"
print_warning "Backend logs: tail -f /tmp/elda-backend-clean.log"

# Wait for backend to start
echo "Waiting for backend to start..."
sleep 5

# Test backend
if curl -s http://localhost:8000/docs > /dev/null; then
    print_success "Backend is responding at http://localhost:8000"
else
    print_warning "Backend might not be fully started yet"
fi

# ============================================================================
# STEP 4: Show current mobile app API configuration
# ============================================================================
print_step "STEP 4: Mobile app API configuration..."

cd /Users/gaurav/Elda/elder-companion-mobile

echo "Mobile app will use:"
echo "  • iOS Simulator: http://localhost:8000"
echo "  • iOS Real Device: http://10.72.1.235:8000"

print_success "API configuration updated"

# ============================================================================
# STEP 5: Clean and rebuild mobile app
# ============================================================================
print_step "STEP 5: Cleaning mobile app..."

# Clean iOS build
rm -rf ios/build
print_success "iOS build cleaned"

# Clean metro cache
rm -rf /tmp/metro-* /tmp/react-* 2>/dev/null || true
rm -rf node_modules/.cache 2>/dev/null || true
print_success "Metro cache cleaned"

# Clean watchman
watchman watch-del-all 2>/dev/null || true
print_success "Watchman cleared"

# ============================================================================
# STEP 6: Reinstall iOS pods
# ============================================================================
print_step "STEP 6: Reinstalling iOS pods..."

cd ios
pod install
cd ..
print_success "Pods installed"

# ============================================================================
# STEP 7: Build and run app
# ============================================================================
print_step "STEP 7: Building and running mobile app..."

echo ""
echo "Choose where to run the app:"
echo "  1) iPhone Simulator (recommended - uses localhost:8000)"
echo "  2) Physical iPhone (uses 10.72.1.235:8000)"
echo "  3) Skip mobile app build (fix later)"
echo ""
read -p "Choose option (1-3): " choice

case $choice in
    1)
        print_step "Building for iPhone Simulator..."
        npx react-native run-ios &
        print_success "Simulator build started"
        ;;
    2)
        print_warning "Note: Physical device will use IP: 10.72.1.235:8000"
        print_step "Building for Physical iPhone..."
        npx react-native run-ios --device "Gaurav's iphone" &
        print_success "Physical device build started"
        ;;
    3)
        print_warning "Skipping mobile app build"
        ;;
    *)
        print_warning "Invalid choice, skipping mobile app build"
        ;;
esac

# ============================================================================
# STEP 8: Start dashboard (optional)
# ============================================================================
echo ""
read -p "Do you want to start the dashboard? (y/n): " start_dashboard

if [ "$start_dashboard" = "y" ] || [ "$start_dashboard" = "Y" ]; then
    print_step "STEP 8: Starting dashboard..."

    cd /Users/gaurav/Elda/caregiver-dashboard

    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_warning "node_modules not found, running npm install..."
        npm install
    fi

    # Start dashboard in background
    nohup npm run dev > /tmp/elda-dashboard.log 2>&1 &
    DASHBOARD_PID=$!

    print_success "Dashboard started (PID: $DASHBOARD_PID)"
    print_warning "Dashboard logs: tail -f /tmp/elda-dashboard.log"
    print_warning "Dashboard URL: http://localhost:3000"
else
    print_warning "Skipping dashboard"
fi

# ============================================================================
# STEP 9: Summary
# ============================================================================
sleep 3

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "🎉 FIX COMPLETE!"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "📋 Services Running:"
echo "  • Backend API: http://localhost:8000"
echo "  • Backend Docs: http://localhost:8000/docs"
if [ "$start_dashboard" = "y" ] || [ "$start_dashboard" = "Y" ]; then
    echo "  • Dashboard: http://localhost:3000"
fi
echo ""
echo "📱 Mobile App:"
echo "  • Simulator: Using http://localhost:8000 ✅"
echo "  • Real Device: Using http://10.72.1.235:8000 ✅"
echo ""
echo "🔍 Debugging:"
echo "  • Backend logs: tail -f /tmp/elda-backend-clean.log"
if [ "$start_dashboard" = "y" ] || [ "$start_dashboard" = "Y" ]; then
    echo "  • Dashboard logs: tail -f /tmp/elda-dashboard.log"
fi
echo "  • Test backend: curl http://localhost:8000/docs"
echo ""
echo "🧪 Testing:"
echo "  1. Wait for mobile app build to complete (2-3 minutes)"
echo "  2. Open app in simulator"
echo "  3. Try to set up with patient credentials"
echo "  4. Check if API calls work"
echo ""
echo "💡 If mobile app still doesn't connect:"
echo "  1. Check Metro bundler is running (separate terminal)"
echo "  2. Reload app: Cmd+R in simulator"
echo "  3. Check backend logs for errors"
echo "  4. Try rebuilding: npx react-native run-ios"
echo ""
echo "════════════════════════════════════════════════════════════════"
