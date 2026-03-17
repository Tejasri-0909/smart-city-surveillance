# Smart City AI Surveillance System

A comprehensive real-time surveillance system with AI-powered threat detection, built with FastAPI, React, and MongoDB.

## 🚨 Quick Fix for WebSocket DISCONNECTED Error

If you see "WebSocket: DISCONNECTED" in the status bar, the backend server is not running. Follow these steps:

### Windows Users:
```bash
# Option 1: Use the startup script
cd backend
start_backend.bat

# Option 2: Manual startup
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python start_server.py
```

### macOS/Linux Users:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python start_server.py
```

### Verify Backend is Running:
Open http://localhost:8000/health in your browser. You should see a JSON response.

## 🏗️ System Architecture

```
CCTV Video Feed → AI Detection (YOLOv8) → FastAPI Backend → MongoDB → WebSocket → React Dashboard → Alerts + Alarm
```

## ✨ Features

### 🤖 AI-Powered Detection
- **YOLOv8 Integration** - Real-time object detection
- **Threat Classification** - Weapons, fire, suspicious activity, vandalism
- **Confidence Scoring** - Accuracy-based alert filtering
- **Multi-Camera Support** - Simultaneous processing of 6 camera feeds

### 📡 Real-Time Monitoring
- **WebSocket Alerts** - Instant threat notifications
- **Live Dashboard** - 3x2 camera grid with overlays
- **Audio Alarms** - Sound alerts on threat detection
- **Status Tracking** - Real-time system health monitoring

### 🗺️ Interactive Map
- **City Visualization** - Leaflet-based interactive map
- **Camera Markers** - GPS-positioned camera locations
- **Incident Heatmap** - Visual threat density mapping
- **Real-Time Updates** - Live incident marker updates

### 📊 Incident Management
- **Status Tracking** - Active, resolved, false-alarm states
- **Severity Levels** - Critical, high, medium, low classifications
- **Historical Data** - Complete incident audit trail
- **Analytics Dashboard** - Statistics and reporting

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- MongoDB Atlas account

### 1. Backend Setup
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create `.env` file:
```env
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/
JWT_SECRET=your-secret-key-here
```

Start backend:
```bash
python start_server.py
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Access the System
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

### 4. Default Login
- **Username:** admin
- **Password:** admin@123

## 📁 Project Structure

```
├── backend/
│   ├── ai_detection.py          # YOLOv8 AI detection engine
│   ├── camera_processor.py      # Video processing & analysis
│   ├── websocket_manager.py     # Real-time alert broadcasting
│   ├── database.py              # MongoDB async operations
│   ├── main.py                  # FastAPI application
│   ├── start_server.py          # Startup diagnostics script
│   ├── requirements.txt         # Python dependencies
│   └── routes/                  # API endpoints
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── pages/               # Application pages
│   │   ├── context/             # Global state management
│   │   └── utils/               # Utilities & helpers
│   └── public/
│       ├── cctv/                # Video files directory
│       └── alarm.mp3            # Alert sound file
└── docs/
    ├── INSTALLATION_GUIDE.md    # Detailed setup instructions
    ├── TROUBLESHOOTING.md       # Common issues & solutions
    └── AI_SURVEILLANCE_STATUS.md # Implementation status
```

## 🎥 Media Files Setup

### CCTV Video Files
Download 6 surveillance-style MP4 videos and place them in `frontend/public/cctv/`:
- `cam1.mp4` - CAM001 (City Center)
- `cam2.mp4` - CAM002 (Metro Station)
- `cam3.mp4` - CAM003 (Airport Gate)
- `cam4.mp4` - CAM004 (Shopping Mall)
- `cam5.mp4` - CAM005 (Park Entrance)
- `cam6.mp4` - CAM006 (Highway Bridge)

**Sources:**
- [Pexels CCTV Videos](https://www.pexels.com/search/videos/security%20camera/)
- [Pixabay Surveillance Videos](https://pixabay.com/videos/search/security%20camera/)

### Alarm Sound File
Download an alarm sound and save as `frontend/public/alarm.mp3`:
- [Freesound.org](https://freesound.org/)
- [Zapsplat](https://www.zapsplat.com/)

## 🔧 Configuration

### Camera Locations
```javascript
CAM001: City Center     (40.7128, -74.0060)
CAM002: Metro Station   (40.7589, -73.9851)
CAM003: Airport Gate    (40.6892, -74.1745)
CAM004: Shopping Mall   (40.7505, -73.9934)
CAM005: Park Entrance  (40.7829, -73.9654)
CAM006: Highway Bridge  (40.7282, -74.0776)
```

### Environment Variables
```env
# MongoDB connection string
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/

# JWT secret for authentication
JWT_SECRET=your-secret-key-here

# Optional: AI detection settings
DETECTION_CONFIDENCE=0.5
DETECTION_COOLDOWN=30
```

## 🧪 Testing

### Run System Tests
```bash
cd backend
python test_ai_system.py
```

### Manual Testing
1. **Backend Health:** http://localhost:8000/health
2. **WebSocket Test:** Open browser console and run:
   ```javascript
   const ws = new WebSocket('ws://localhost:8000/ws');
   ws.onopen = () => console.log('✅ Connected');
   ```
3. **AI Detection:** Click "Simulate Alert" in dashboard

## 🔍 Troubleshooting

### Common Issues

#### WebSocket DISCONNECTED
- **Cause:** Backend server not running
- **Solution:** Start backend with `python start_server.py`

#### Black Screen in Dashboard
- **Cause:** Frontend build issues or API connection failure
- **Solution:** Check browser console for errors, restart frontend

#### MongoDB Connection Error
- **Cause:** Invalid connection string or network issues
- **Solution:** Verify MONGO_URL in .env file, check IP whitelist

#### Video Files Not Loading
- **Cause:** Missing MP4 files in cctv directory
- **Solution:** Download and place video files as described above

### Debug Mode
```bash
# Backend with detailed logging
cd backend
python -c "import logging; logging.basicConfig(level=logging.DEBUG)"
uvicorn main:app --reload --log-level debug

# Frontend with connection testing
# Check browser console for detailed connection logs
```

## 📊 System Status Indicators

### Status Bar Meanings
- 🟢 **WebSocket: CONNECTED** - System operational
- 🟡 **WebSocket: CONNECTING** - Attempting connection
- 🔴 **WebSocket: DISCONNECTED** - Backend not running
- 🔴 **WebSocket: ERROR** - Connection failed

### Health Check Endpoint
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "websocket_connections": 1,
  "camera_status": {...},
  "incident_stats": {...}
}
```

## 🚀 Production Deployment

### Backend (Docker)
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Frontend (Build)
```bash
cd frontend
npm run build
# Deploy dist/ folder to CDN or static hosting
```

### Environment Setup
- Use production MongoDB cluster
- Set secure JWT secrets
- Configure HTTPS/SSL certificates
- Set up proper CORS origins
- Enable rate limiting

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Documentation
- [Installation Guide](INSTALLATION_GUIDE.md)
- [Troubleshooting Guide](TROUBLESHOOTING.md)
- [Implementation Status](AI_SURVEILLANCE_STATUS.md)

### Quick Help
1. **Backend not starting:** Run `python start_server.py` in backend directory
2. **WebSocket disconnected:** Verify backend is running on port 8000
3. **Database errors:** Check MongoDB connection string in .env
4. **Video not loading:** Add MP4 files to frontend/public/cctv/

---

**Built with ❤️ for smart city surveillance and public safety**