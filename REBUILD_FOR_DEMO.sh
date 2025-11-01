#!/bin/bash

set -e  # Exit on any error

echo "════════════════════════════════════════════════════════════════"
echo "🎬 ELDER COMPANION AI - DEMO SETUP"
echo "════════════════════════════════════════════════════════════════"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# ============================================================================
# STEP 1: Kill All Running Processes
# ============================================================================
print_step "STEP 1: Cleaning up running processes..."

# Kill React Native Metro
pkill -f "node.*metro" || true
print_success "Metro bundler stopped"

# Kill React Native processes
pkill -f "react-native" || true
print_success "React Native processes stopped"

# Kill any running simulators (optional)
# xcrun simctl shutdown all || true

# Kill backend if running
pkill -f "uvicorn.*elda" || true
print_success "Backend processes stopped"

sleep 2

# ============================================================================
# STEP 2: Clean Mobile App Build
# ============================================================================
print_step "STEP 2: Cleaning mobile app build..."

cd /Users/gaurav/Elda/elder-companion-mobile

# Clean iOS build
rm -rf ios/build
rm -rf ios/Pods
rm -rf ~/Library/Developer/Xcode/DerivedData/*ElderCompanion* || true
print_success "iOS build cleaned"

# Clean node modules cache
rm -rf node_modules/.cache
print_success "Node cache cleaned"

# Clean metro cache
rm -rf /tmp/metro-* || true
rm -rf /tmp/react-* || true
print_success "Metro cache cleaned"

# Clean watchman
watchman watch-del-all 2>/dev/null || true
print_success "Watchman cleared"

# ============================================================================
# STEP 3: Install Dependencies
# ============================================================================
print_step "STEP 3: Installing dependencies..."

# Install npm packages (if needed)
if [ ! -d "node_modules" ]; then
    print_warning "node_modules not found, running npm install..."
    npm install
else
    print_success "node_modules already installed"
fi

# Install pods
cd ios
pod install
cd ..
print_success "Pods installed"

# ============================================================================
# STEP 4: Start Backend Server
# ============================================================================
print_step "STEP 4: Starting backend server..."

cd /Users/gaurav/Elda/backend

# Check if venv exists
if [ ! -d "venv" ]; then
    print_error "Virtual environment not found! Please create it first."
    exit 1
fi

# Start backend in background
source venv/bin/activate
nohup uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 > /tmp/elda-backend.log 2>&1 &
BACKEND_PID=$!

print_success "Backend started (PID: $BACKEND_PID)"
print_warning "Backend logs: tail -f /tmp/elda-backend.log"

# Wait for backend to start
sleep 3

# Check if backend is responding
if curl -s http://localhost:8000/docs > /dev/null; then
    print_success "Backend is responding at http://localhost:8000"
else
    print_error "Backend is not responding! Check logs."
fi

# ============================================================================
# STEP 5: Verify Test Data
# ============================================================================
print_step "STEP 5: Verifying test data..."

cd /Users/gaurav/Elda/backend

# Check for test patients
python3 -c "
from app.database.session import SessionLocal
from app.models.patient import Patient

db = SessionLocal()
patients = db.query(Patient).filter(Patient.setup_token.isnot(None)).all()
print(f'Found {len(patients)} patients with setup tokens:')
for p in patients:
    letta_status = '✅' if p.letta_agent_id else '❌'
    print(f'  • {p.full_name} (Letta: {letta_status})')
    print(f'    ID: {p.id}')
    print(f'    Token: {p.setup_token}')
db.close()
" || print_warning "Could not verify test data"

# ============================================================================
# STEP 6: Generate QR Code Page
# ============================================================================
print_step "STEP 6: Generating QR code page..."

python3 generate_qr_page.py || print_warning "Could not generate QR codes"

if [ -f "patient_qr_codes.html" ]; then
    print_success "QR code page ready: backend/patient_qr_codes.html"

    # Open QR code page in browser
    open patient_qr_codes.html
    print_success "QR code page opened in browser"
else
    print_warning "QR code page not found"
fi

# ============================================================================
# STEP 7: Build and Run Mobile App
# ============================================================================
print_step "STEP 7: Building and running mobile app..."

cd /Users/gaurav/Elda/elder-companion-mobile

# Ask user which target
echo ""
echo "How do you want to run the app?"
echo "  1) iPhone Simulator (recommended for demo recording)"
echo "  2) Physical iPhone"
echo "  3) Both"
echo ""
read -p "Choose option (1-3): " choice

case $choice in
    1)
        print_step "Starting iPhone Simulator..."
        npx react-native run-ios &
        SIMULATOR_PID=$!
        print_success "Simulator build started (PID: $SIMULATOR_PID)"
        ;;
    2)
        print_step "Starting on Physical iPhone..."
        npx react-native run-ios --device "Gaurav's iphone" &
        DEVICE_PID=$!
        print_success "Physical device build started (PID: $DEVICE_PID)"
        ;;
    3)
        print_step "Starting on both Simulator and Physical iPhone..."
        npx react-native run-ios &
        SIMULATOR_PID=$!
        sleep 5
        npx react-native run-ios --device "Gaurav's iphone" &
        DEVICE_PID=$!
        print_success "Both builds started"
        ;;
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

# ============================================================================
# STEP 8: Setup Complete - Show Summary
# ============================================================================
sleep 5

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "🎉 SETUP COMPLETE!"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "📋 Services Running:"
echo "  • Backend API: http://localhost:8000"
echo "  • Backend Docs: http://localhost:8000/docs"
echo "  • Backend Logs: tail -f /tmp/elda-backend.log"
echo "  • QR Code Page: Open in browser (already opened)"
echo "  • Mobile App: Building... (wait 2-3 minutes)"
echo "🛠️  Troubleshooting:"
echo "  • Check backend logs: tail -f /tmp/elda-backend.log"
echo "  • Check metro bundler: It will open in a new terminal"
echo "  • Rebuild app: npx react-native run-ios"
echo ""
echo "════════════════════════════════════════════════════════════════"
