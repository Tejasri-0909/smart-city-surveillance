# Smart City Surveillance System - Troubleshooting Guide

## 🔴 WebSocket DISCONNECTED Error

If you see "WebSocket: DISCONNECTED" in the status bar, this means the frontend cannot connect to the backend server.

### Quick Fix Steps:

#### 1. Check if Backend Server is Running
```bash
# Navigate to backend directory
cd backend

# Check if server is running (should show process)
netstat -an | findstr :8000
# OR
curl http://localhost:8000/health
```

#### 2. Start the Backend Server
```bash
# Method 1: Using the startup script (recommended)
cd backend
python start_server.py

# Method 2: Direct uvicorn command
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Method 3: Using Python module
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### 3. Verify Backend is Working
Open your browser and go to:
- **Health Check:** http://localhost:8000/health
- **API Documentation:** http://localhost:8000/docs
- **Basic Endpoint:** http://localhost:8000/

You should see JSON responses, not error pages.

#### 4. Check Dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### 5. Check Environment Configuration
Make sure you have a `.env` file in the backend directory:
```env
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/
JWT_SECRET=your-secret-key-here
```

## 🟡 Common Issues and Solutions

### Issue: "Module not found" errors
**Solution:**
```bash
cd backend
pip install -r requirements.txt
```

### Issue: MongoDB connection errors
**Solution:**
1. Check your `MONGO_URL` in the `.env` file
2. Verify MongoDB Atlas credentials
3. Ensure your IP is whitelisted in MongoDB Atlas

### Issue: Port 8000 already in use
**Solution:**
```bash
# Find what's using port 8000
netstat -ano | findstr :8000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or use a different port
uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

### Issue: CORS errors in browser console
**Solution:** The backend already includes CORS middleware. If you still see CORS errors:
1. Make sure backend is running on port 8000
2. Check browser developer tools for specific error messages
3. Try clearing browser cache

### Issue: Frontend shows black screen
**Solution:**
1. Check browser developer console for JavaScript errors
2. Verify frontend is running: `npm run dev`
3. Make sure you're accessing http://localhost:5173

## 🔧 Development Setup Checklist

### Backend Setup:
- [ ] Python 3.8+ installed
- [ ] Virtual environment created and activated
- [ ] Dependencies installed: `pip install -r requirements.txt`
- [ ] `.env` file configured with MongoDB URL
- [ ] Server running on port 8000
- [ ] Health check returns 200 OK

### Frontend Setup:
- [ ] Node.js 16+ installed
- [ ] Dependencies installed: `npm install`
- [ ] Development server running: `npm run dev`
- [ ] Accessing http://localhost:5173
- [ ] No console errors in browser

### Database Setup:
- [ ] MongoDB Atlas account created
- [ ] Database cluster running
- [ ] Connection string added to `.env`
- [ ] IP address whitelisted
- [ ] Database user has read/write permissions

## 🚀 Quick Start Commands

### Terminal 1 (Backend):
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
python start_server.py
```

### Terminal 2 (Frontend):
```bash
cd frontend
npm install
npm run dev
```

## 📊 System Status Indicators

### Status Bar Meanings:
- **WebSocket: CONNECTED** ✅ - Everything working
- **WebSocket: CONNECTING...** 🟡 - Attempting connection
- **WebSocket: DISCONNECTED** 🔴 - Backend not running
- **WebSocket: ERROR** 🔴 - Connection failed

### Dashboard Indicators:
- **System Status: ONLINE** - Frontend operational
- **Database: CONNECTED** - MongoDB accessible
- **AI Engine: ACTIVE** - Detection system ready

## 🔍 Debug Mode

### Enable Detailed Logging:
```bash
# Backend with debug logging
cd backend
python -c "import logging; logging.basicConfig(level=logging.DEBUG)"
uvicorn main:app --reload --log-level debug

# Frontend with connection testing
# Check browser console for connection test results
```

### Test WebSocket Connection:
```javascript
// Run in browser console
const ws = new WebSocket('ws://localhost:8000/ws');
ws.onopen = () => console.log('✅ WebSocket connected');
ws.onerror = (e) => console.error('❌ WebSocket error:', e);
ws.onclose = (e) => console.log('🔌 WebSocket closed:', e.code, e.reason);
```

## 📞 Still Having Issues?

### Check These Files:
1. **Backend logs** - Look for error messages when starting server
2. **Browser console** - Check for JavaScript errors
3. **Network tab** - Verify API calls are reaching backend
4. **MongoDB logs** - Check database connection issues

### Common Error Messages:
- `ECONNREFUSED` - Backend server not running
- `404 Not Found` - Wrong URL or server not responding
- `CORS error` - Cross-origin request blocked
- `WebSocket connection failed` - Backend WebSocket endpoint not available

### Reset Everything:
```bash
# Stop all processes
# Ctrl+C in both terminals

# Backend reset
cd backend
deactivate  # if virtual env is active
rm -rf venv  # remove virtual environment
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

# Frontend reset
cd frontend
rm -rf node_modules
npm install

# Restart both servers
```

## ✅ Success Indicators

When everything is working correctly, you should see:
- ✅ Backend server starts without errors
- ✅ Health check returns JSON response
- ✅ Frontend loads without console errors
- ✅ WebSocket status shows "CONNECTED"
- ✅ Camera grid displays (with placeholder or video)
- ✅ No red error messages in status bar

The system is ready when the status bar shows all green indicators and no error messages appear in the browser console.