# 🚀 Smart City AI Surveillance System - Quick Start Guide

## 📋 Prerequisites

### Required Software:
- **Python 3.8+** - [Download from python.org](https://python.org/)
- **Node.js 16+** - [Download from nodejs.org](https://nodejs.org/)
- **Git** - [Download from git-scm.com](https://git-scm.com/)

## 🎯 Quick Start (Recommended)

### Option 1: Windows Users
```bash
# Double-click or run in Command Prompt/PowerShell
start.bat
```

### Option 2: Linux/macOS Users
```bash
# Make executable and run
chmod +x start.sh
./start.sh
```

### Option 3: Cross-Platform Python
```bash
# Start complete system (backend + frontend)
python start_system.py

# OR start individually:
python start_backend.py    # Backend only
python start_frontend.py   # Frontend only
```

## 📍 Access Points

Once started, access the system at:

- **🎨 Frontend Application**: http://localhost:5173
- **🔧 Backend API**: http://localhost:8000
- **📊 API Documentation**: http://localhost:8000/docs
- **🔌 WebSocket**: ws://localhost:8000/ws

## 🛠️ Manual Setup (If Needed)

### Backend Setup:
```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Setup:
```bash
cd frontend
npm install
npm run dev
```

## 🎯 System Features

### 🏠 Dashboard
- Real-time monitoring with 6 camera feeds
- Live incident alerts and statistics
- System status indicators

### 📹 Live Monitoring
- Professional 3x2 camera grid layout
- Real HTML5 video players with controls
- Camera status indicators

### 🗺️ City Map
- Interactive Leaflet map with incident markers
- Real-time heatmap visualization
- Incident history panel

### 🤖 AI Video Analysis
- Upload videos for threat detection
- YOLO-powered object detection
- Real-time analysis results with bounding boxes

### 📊 Analytics
- Performance metrics and insights
- Incident trends and statistics
- System health monitoring

### ⚙️ Camera Management
- 6 permanent surveillance cameras
- Camera status and configuration
- Professional control interface

## 🔧 Troubleshooting

### Common Issues:

**Port Already in Use:**
```bash
# Kill processes on ports 8000 and 5173
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/macOS:
lsof -ti:8000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

**Python Dependencies:**
```bash
# Upgrade pip and reinstall
pip install --upgrade pip
pip install -r backend/requirements.txt --force-reinstall
```

**Node.js Dependencies:**
```bash
# Clear cache and reinstall
cd frontend
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**AI Model Download:**
- First run will download YOLO model (~6MB)
- Ensure internet connection for initial setup

## 🌟 System Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │
│   React + Vite  │◄──►│   FastAPI       │
│   Port: 5173    │    │   Port: 8000    │
└─────────────────┘    └─────────────────┘
         │                       │
         │              ┌─────────────────┐
         │              │   Database      │
         └──────────────►│   MongoDB       │
                        │   (Optional)    │
                        └─────────────────┘
```

## 🎯 Development Mode

The system runs in development mode with:
- ✅ Hot reload for frontend changes
- ✅ Auto-restart for backend changes
- ✅ Real-time WebSocket connections
- ✅ Comprehensive error logging
- ✅ Fallback data when database unavailable

## 🚀 Production Deployment

For production deployment, see `DEPLOYMENT_GUIDE_FINAL.md`

## 📞 Support

If you encounter issues:
1. Check the console output for error messages
2. Ensure all prerequisites are installed
3. Try the manual setup steps
4. Check firewall/antivirus settings

---

**🌟 Smart City AI Surveillance System is ready to run!**