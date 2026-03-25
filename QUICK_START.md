# 🚀 Quick Start Guide - Smart City AI Surveillance

## ⚡ Super Quick Start (1 Command)

```powershell
# Install everything and start the system
./install.ps1
```

Then run:
```powershell
./start_system.ps1
```

**That's it!** Open http://localhost:5173 in your browser.

---

## 📋 What You Need

- **Python 3.8+** (Download: https://python.org)
- **Node.js 18+** (Download: https://nodejs.org)

---

## 🎯 Step-by-Step (5 Minutes)

### 1. Install Dependencies
```powershell
./install.ps1
```

### 2. Start the System
```powershell
./start_system.ps1
```

### 3. Open Your Browser
Go to: **http://localhost:5173**

---

## 🔧 Manual Method (If Scripts Don't Work)

### Terminal 1 - Backend:
```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

### Terminal 2 - Frontend:
```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 Access Points

- **Main App**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## ✅ System Check

Run this to verify everything is working:
```powershell
./check_system.ps1
```

---

## 🎮 Features You'll See

- **Dashboard** - Real-time monitoring
- **Live Cameras** - 6 surveillance feeds
- **City Map** - Interactive incident mapping
- **AI Analysis** - Upload videos for threat detection
- **Incident Management** - Track and resolve incidents
- **Analytics** - Performance metrics

---

## 🆘 Need Help?

1. **Check Prerequisites**: Make sure Python and Node.js are installed
2. **Run System Check**: `./check_system.ps1`
3. **Check Logs**: Look at the terminal output for errors
4. **Manual Start**: Try the manual method above

---

## 🎉 Success!

When working, you'll see:
- ✅ Backend server running on port 8000
- ✅ Frontend server running on port 5173
- ✅ Browser opens to surveillance dashboard
- ✅ Real-time camera feeds and AI detection

**Enjoy your Smart City AI Surveillance System!** 🏙️🤖