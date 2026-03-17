# Smart City AI Surveillance System - Installation Guide

## Architecture Overview
```
CCTV Video Feed → AI Detection → FastAPI Backend → MongoDB → WebSocket → React Dashboard → Alerts + Alarm
```

## Prerequisites
- Python 3.8+
- Node.js 16+
- MongoDB Atlas account (or local MongoDB)
- Git

## Backend Setup

### 1. Navigate to backend directory
```bash
cd backend
```

### 2. Create virtual environment
```bash
python -m venv venv
```

### 3. Activate virtual environment
**Windows:**
```bash
venv\Scripts\activate
```
**macOS/Linux:**
```bash
source venv/bin/activate
```

### 4. Install dependencies
```bash
pip install -r requirements.txt
```

### 5. Configure environment variables
Create `.env` file in backend directory:
```env
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/
JWT_SECRET=your-secret-key-here
```

### 6. Start the backend server
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Frontend Setup

### 1. Navigate to frontend directory
```bash
cd frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the development server
```bash
npm run dev
```

## Media Files Setup

### 1. CCTV Video Files
Download 6 CCTV-style video files and place them in `frontend/public/cctv/`:
- cam1.mp4 (CAM001 - City Center)
- cam2.mp4 (CAM002 - Metro Station)
- cam3.mp4 (CAM003 - Airport Gate)
- cam4.mp4 (CAM004 - Shopping Mall)
- cam5.mp4 (CAM005 - Park Entrance)
- cam6.mp4 (CAM006 - Highway Bridge)

**Video Sources:**
- [Pexels CCTV videos](https://www.pexels.com/search/videos/security%20camera/)
- [Pixabay surveillance videos](https://pixabay.com/videos/search/security%20camera/)
- [EarthCam live cameras](https://www.earthcam.com/)

**Requirements:**
- MP4 format
- 30-60 seconds duration
- Under 50MB each

### 2. Alarm Sound File
Download an alarm sound file and place it as `frontend/public/alarm.mp3`:
- [Freesound.org](https://freesound.org/)
- [Zapsplat](https://www.zapsplat.com/)
- Recommended: 2-3 second alert/alarm sound

## System Access

### Default Login Credentials
- **Username:** admin
- **Password:** admin@123

### Application URLs
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs

## Features

### Real-time Surveillance Dashboard
- 6 CCTV camera feeds in 3x2 grid layout
- Live AI threat detection using YOLOv8
- Real-time WebSocket alerts with alarm sound
- Interactive city map with camera markers
- Incident management and tracking
- Analytics and reporting

### AI Detection Capabilities
- Weapon detection
- Fire/smoke detection
- Suspicious activity monitoring
- Crowd detection
- Vandalism detection

### Alert System
- Real-time WebSocket notifications
- Audio alarm on threat detection
- Visual alerts in dashboard
- Incident status tracking (active, resolved, false-alarm)

## Troubleshooting

### Backend Issues
1. **MongoDB Connection Error:** Verify MONGO_URL in .env file
2. **YOLOv8 Installation:** Run `pip install ultralytics` separately if needed
3. **Port 8000 in use:** Change port in uvicorn command

### Frontend Issues
1. **WebSocket Connection Failed:** Ensure backend is running on port 8000
2. **Video Files Not Loading:** Check that MP4 files are in correct directory
3. **Alarm Sound Not Playing:** Verify alarm.mp3 exists in public directory

### Performance Optimization
1. **Video File Size:** Keep video files under 50MB each
2. **AI Detection:** Adjust detection frequency in camera_processor.py
3. **Database:** Use MongoDB indexes for better query performance

## Development Notes

### File Structure
```
├── backend/
│   ├── ai_detection.py          # YOLOv8 AI detection
│   ├── camera_processor.py      # Video processing
│   ├── websocket_manager.py     # Real-time alerts
│   ├── database.py              # MongoDB operations
│   ├── main.py                  # FastAPI application
│   └── routes/                  # API endpoints
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── pages/               # Application pages
│   │   ├── context/             # Alert context
│   │   └── utils/               # Utilities
│   └── public/
│       ├── cctv/                # Video files
│       └── alarm.mp3            # Alarm sound
```

### Key Technologies
- **Backend:** FastAPI, MongoDB, YOLOv8, OpenCV, WebSockets
- **Frontend:** React, Vite, Leaflet Maps, WebSocket Client
- **AI:** Ultralytics YOLOv8 for object detection
- **Database:** MongoDB Atlas with Motor async driver

## Production Deployment

### Backend Deployment
1. Use production WSGI server (Gunicorn + Uvicorn)
2. Configure proper MongoDB connection string
3. Set up SSL certificates for HTTPS
4. Configure environment variables securely

### Frontend Deployment
1. Build production bundle: `npm run build`
2. Deploy to CDN or static hosting
3. Update API endpoints for production backend
4. Configure proper CORS settings

### Security Considerations
1. Change default login credentials
2. Use strong JWT secrets
3. Implement proper authentication middleware
4. Set up rate limiting for API endpoints
5. Use HTTPS in production

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review console logs for error messages
3. Verify all dependencies are installed correctly
4. Ensure all media files are in place