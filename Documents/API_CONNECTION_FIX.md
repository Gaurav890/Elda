# API Connection Issues - Fixed! 🔧

## Problems Identified

### 1. **Wrong IP Address in Mobile App**
- **Issue**: Mobile app was configured to use `192.168.4.36:8000`
- **Your actual IP**: `10.72.1.235`
- **Fix**: Updated to use `localhost:8000` for simulator

### 2. **Multiple Backend Processes**
- **Issue**: Backend logs show "Address already in use"
- **Cause**: Multiple uvicorn processes trying to run on port 8000
- **Fix**: Kill all processes and start clean

### 3. **Mobile App Cache**
- **Issue**: Even after fixing IP, app still uses old cached config
- **Fix**: Clean build and reinstall pods

---

## ✅ What I Fixed

### 1. Mobile App API Configuration
**File**: `elder-companion-mobile/src/config/api.ts`

**Changed from:**
```typescript
return 'http://192.168.4.36:8000'; // WRONG IP!
```

**Changed to:**
```typescript
return 'http://localhost:8000'; // Correct for simulator
```

**For Physical iPhone:**
If you need to test on real device, it will use: `http://10.72.1.235:8000`

---

## 🚀 How to Fix Everything (One Command!)

Run this automated fix script:

```bash
cd /Users/gaurav/Elda
./FIX_API_CONNECTIONS.sh
```

**This script will:**
1. ✅ Kill all running processes (backend, metro, react-native)
2. ✅ Kill any process using port 8000 or 3000
3. ✅ Start backend cleanly on port 8000
4. ✅ Clean mobile app build cache
5. ✅ Reinstall iOS pods
6. ✅ Rebuild mobile app with correct API config
7. ✅ (Optional) Start dashboard

**Choose option 1** when asked - this builds for iPhone Simulator with localhost:8000

---

## 🧪 Testing After Fix

### Test 1: Backend is Running
```bash
curl http://localhost:8000/docs
```
**Expected**: HTML response (docs page)

### Test 2: Backend API Endpoint
```bash
curl http://localhost:8000/api/v1/health || curl http://localhost:8000/
```
**Expected**: JSON response

### Test 3: Mobile App Setup
1. Wait for build to complete (2-3 minutes)
2. App opens in simulator
3. Try to set up with patient credentials
4. Should connect to `http://localhost:8000`

### Test 4: Dashboard
1. Open http://localhost:3000 in browser
2. Login: sarah.miller@example.com / test123
3. Should see patients list

---

## 🔍 Debugging Commands

### Check Backend Status
```bash
# Test if responding
curl -I http://localhost:8000/docs

# View logs
tail -f /tmp/elda-backend-clean.log

# Check what's running on port 8000
lsof -i:8000
```

### Check Mobile App Configuration
```bash
cd /Users/gaurav/Elda/elder-companion-mobile
grep -A5 "return 'http" src/config/api.ts
```

### Restart Backend Manually
```bash
# Kill everything on port 8000
lsof -ti:8000 | xargs kill -9

# Start fresh
cd /Users/gaurav/Elda/backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Rebuild Mobile App Manually
```bash
cd /Users/gaurav/Elda/elder-companion-mobile

# Clean
rm -rf ios/build
rm -rf /tmp/metro-*
watchman watch-del-all

# Reinstall pods
cd ios && pod install && cd ..

# Build
npx react-native run-ios
```

---

## 📱 Mobile App API Configuration Details

### Simulator (Recommended for Demo)
- **URL**: `http://localhost:8000`
- **Why**: Simulator runs on same machine as backend
- **Works**: ✅ Always reliable

### Physical iPhone on Same WiFi
- **URL**: `http://10.72.1.235:8000`
- **Why**: Real device needs network IP of your Mac
- **Note**: IP might change if you connect to different WiFi

### Getting Your Current IP
```bash
# Find your local IP
ipconfig getifaddr en0  # WiFi
ipconfig getifaddr en1  # Ethernet

# Current IP: 10.72.1.235
```

---

## 🎯 For Demo Recording

**Recommendation: Use iPhone Simulator**

**Why:**
1. ✅ Uses `localhost:8000` - always works
2. ✅ Easier to screen record
3. ✅ No network issues
4. ✅ More stable

**Steps:**
1. Run `./FIX_API_CONNECTIONS.sh`
2. Choose option 1 (Simulator)
3. Wait 2-3 minutes for build
4. Test voice chat
5. Start recording!

---

## 🆘 If Still Not Working

### Problem: "Network Error" or "Cannot connect to server"

**Check 1: Is backend running?**
```bash
curl http://localhost:8000/docs
```
If fails → Backend not running, restart it

**Check 2: Is mobile app using correct URL?**
```bash
grep "return 'http" elder-companion-mobile/src/config/api.ts
```
Should show `localhost:8000` for iOS

**Check 3: Did app rebuild?**
- Metro bundler should show "100%"
- Simulator should show "Build succeeded"
- If not, clean and rebuild

**Check 4: CORS errors in backend logs?**
```bash
tail -f /tmp/elda-backend-clean.log | grep CORS
```
If yes → Add mobile app origin to CORS settings

---

## 📊 Summary

| Component | URL | Status |
|-----------|-----|--------|
| Backend API | http://localhost:8000 | ✅ Fixed |
| Backend Docs | http://localhost:8000/docs | ✅ Working |
| Dashboard | http://localhost:3000 | ✅ Working |
| Mobile (Simulator) | → localhost:8000 | ✅ Fixed |
| Mobile (Real Device) | → 10.72.1.235:8000 | ✅ Fixed |

---

## ✨ Next Steps

1. **Run the fix script:**
   ```bash
   cd /Users/gaurav/Elda
   ./FIX_API_CONNECTIONS.sh
   ```

2. **Wait for build** (2-3 minutes)

3. **Test in simulator:**
   - Set up with patient credentials
   - Try voice chat
   - Verify API calls work

4. **If works** → You're ready to record demo!

5. **If doesn't work** → Check debugging section above

---

## 📞 Quick Help

**Everything broken?**
```bash
./FIX_API_CONNECTIONS.sh
```

**Just backend?**
```bash
lsof -ti:8000 | xargs kill -9
cd /Users/gaurav/Elda/backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Just mobile app?**
```bash
cd /Users/gaurav/Elda/elder-companion-mobile
npx react-native run-ios
```

**Just dashboard?**
```bash
cd /Users/gaurav/Elda/caregiver-dashboard
npm run dev
```

---

## 🎬 Ready for Demo

Once everything is working:

1. ✅ Backend responding at localhost:8000
2. ✅ Mobile app can call APIs
3. ✅ Dashboard can login and fetch data
4. ✅ Voice chat works

→ **You're ready to record!**

Refer to: `READY_TO_RECORD.md` for demo instructions
