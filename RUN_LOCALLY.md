# 🚀 Smart City AI Surveillance - Local Development Guide

## 📋 Prerequisites

### Required Software
- **Python 3.8+** - [Download from python.org](https://python.org)
- **Node.js 18+** - [Download from nodejs.org](https://nodejs.org)
- **Git** - [Download from git-scm.com](https://git-scm.com)

### System Requirements
- **RAM**: 4GB minimum (8GB recommended for AI features)
- **Storage**: 2GB free space
- **OS**: Windows 10/11, macOS, or Linux

## 🎯 Quick Start (Recommended)

### Option 1: Automatic Startup (Windows)
```bash
# Double-click one of these files:
start_system.bat       # For Command Prompt
start_system.ps1       # For PowerShell (Recommended)
```

### Option 2: Manual Startup

#### Step 1: Start Backend
```bash
# Windows Command Prompt
start_backend.bat

# Windows PowerShell
./start_backend.ps1

# Manual (any OS)
cd backend
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

#### Step 2: Start Frontend (New Terminal)
```bash
# Windows Command Prompt
start_frontend.bat

# Windows PowerShell
./start_frontend.ps1

# Manual (any OS)
cd frontend
npm install
npm run dev
```

## 🌐 Access the Application

Once both servers are running:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🔧 Configuration

### Backend Configuration
The backend uses environment variables from `backend/.env`:

```env
MONGO_URL=mongodb+srv://admin:Admin1234@cluster0.xkdu0rp.mongodb.net/smart_city_surveillance?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
API_BASE_URL=http://127.0.0.1:8000
```

### Frontend Configuration
The frontend automatically detects localhost and uses development configuration:
- API: `http://localhost:8000`
- WebSocket: `ws://localhost:8000`

## 🎮 Features Available Locally

### ✅ Fully Functional Features
- **Dashboard** - Real-time monitoring interface
- **Live Camera Monitoring** - 6 camera surveillance feeds
- **City Map** - Interactive incident mapping with heatmaps
- **Video Upload Analysis** - AI-powered threat detection
- **Incident Management** - Create, update, and track incidents
- **Analytics** - Performance metrics and insights
- **Real-time Updates** - WebSocket-powered live updates

### 🤖 AI Detection Capabilities
- **Traffic Monitoring** - Heavy traffic detection
- **Weapon Detection** - Firearms and knives
- **Suspicious Activity** - Fighting and unusual behavior
- **Fire/Smoke Detection** - Emergency response triggers
- **Smart Analysis** - Context-aware threat assessment

## 🛠️ Troubleshooting

### Common Issues

#### Backend Won't Start
```bash
# Check Python installation
python --version

# Install dependencies manually
cd backend
pip install -r requirements.txt

# Try alternative Python command
python3 -m pip install -r requirements.txt
```

#### Frontend Won't Start
```bash
# Check Node.js installation
node --version
npm --version

# Clear npm cache and reinstall
cd frontend
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### Port Already in Use
```bash
# Backend (Port 8000)
netstat -ano | findstr :8000
# Kill the process using the port

# Frontend (Port 5173)
netstat -ano | findstr :5173
# Kill the process using the port
```

#### Database Connection Issues
The system works in **fallback mode** if MongoDB is unavailable:
- Uses local sample data
- All features remain functional
- No external database required for testing

### Performance Optimization

#### For Better AI Performance
```bash
# Install CUDA support (NVIDIA GPUs)
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118

# For CPU-only (slower but works everywhere)
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
```

## 📁 Project Structure

```
smart-city-surveillance/
├── backend/                 # FastAPI backend
│   ├── app.py              # Main application
│   ├── database.py         # Database operations
│   ├── ai_video_analyzer.py # AI detection system
│   ├── routes/             # API routes
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Application pages
│   │   ├── context/        # State management
│   │   └── config/         # Configuration
│   └── package.json        # Node.js dependencies
├── start_system.ps1        # Quick start script
└── RUN_LOCALLY.md         # This file
```

## 🔒 Security Notes

### Development Mode
- CORS is enabled for localhost
- Debug mode is active
- JWT secret is default (change for production)

### Production Deployment
- Use environment variables for secrets
- Enable HTTPS
- Configure proper CORS origins
- Use production database

## 📞 Support

### If You Need Help
1. **Check the logs** in the terminal windows
2. **Verify prerequisites** are installed correctly
3. **Try the manual startup** method
4. **Check firewall settings** (allow ports 8000 and 5173)

### System Status
- ✅ **Backend Health**: http://localhost:8000/health
- ✅ **Frontend Status**: Check browser console for errors
- ✅ **WebSocket Connection**: Shows in browser developer tools

## 🎉 Success!

When everything is working, you should see:
- Backend server running on port 8000
- Frontend development server on port 5173
- Browser opens to the Smart City Surveillance dashboard
- Real-time camera feeds and incident monitoring
- All AI detection features functional

**Enjoy your Smart City AI Surveillance System!** 🏙️🤖