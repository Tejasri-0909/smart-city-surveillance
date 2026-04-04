# 🔧 SMART CITY SURVEILLANCE - CONFIGURATION DETAILS

## 🔑 **JWT & AUTHENTICATION**

### **JWT Secret Key**
```
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
```

**⚠️ SECURITY NOTE**: This is a default development key. For production deployment, you should:
1. Generate a strong, unique JWT secret (32+ characters)
2. Use a secure random string generator
3. Keep it confidential and never commit to public repositories

**Recommended Production JWT Secret Generation:**
```bash
# Generate a secure 64-character JWT secret
openssl rand -hex 32
# OR
python -c "import secrets; print(secrets.token_hex(32))"
```

---

## 🗄️ **DATABASE CONFIGURATION**

### **MongoDB Connection URL**
```
MONGO_URL=mongodb+srv://admin:Admin1234@cluster0.xkdu0rp.mongodb.net/smart_city_surveillance?retryWrites=true&w=majority
```

**Database Details:**
- **Provider**: MongoDB Atlas (Cloud)
- **Cluster**: cluster0.xkdu0rp.mongodb.net
- **Database Name**: smart_city_surveillance
- **Username**: admin
- **Password**: Admin1234
- **Features**: Retry writes enabled, Write concern majority

**⚠️ SECURITY NOTE**: This appears to be a development/demo database. For production:
1. Create a dedicated production database
2. Use strong, unique credentials
3. Configure proper network access restrictions
4. Enable database encryption
5. Set up regular backups

---

## 🌐 **PORT CONFIGURATION**

### **Backend Server Ports**
```python
# Default port configuration
port = int(os.environ.get("PORT", 8000))
```

**Port Details:**
- **Development**: 8000 (localhost:8000)
- **Production**: Uses environment variable `PORT` (set by hosting provider)
- **Protocol**: HTTP/HTTPS
- **WebSocket**: Same port as HTTP server

### **Frontend Server Ports**
```javascript
// Development
API_BASE_URL: 'http://localhost:8000'
WS_BASE_URL: 'ws://localhost:8000'

// Production  
API_BASE_URL: 'https://smart-city-surveillance-backend.onrender.com'
WS_BASE_URL: 'wss://smart-city-surveillance-backend.onrender.com'
```

**Frontend Details:**
- **Development**: 5173 (Vite default)
- **Production**: Determined by hosting provider
- **API Communication**: Port 8000 (development) or production URL

---

## 🔧 **ENVIRONMENT CONFIGURATION**

### **Backend Environment Variables (.env)**
```env
MONGO_URL=mongodb+srv://admin:Admin1234@cluster0.xkdu0rp.mongodb.net/smart_city_surveillance?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
API_BASE_URL=http://127.0.0.1:8000
```

### **Production Environment Variables (Required)**
```env
# Database
MONGO_URL=<your-production-mongodb-url>

# Security
JWT_SECRET=<your-secure-jwt-secret>

# Server
PORT=<port-assigned-by-hosting-provider>
API_BASE_URL=<your-production-api-url>

# Optional
NODE_ENV=production
PYTHONPATH=/app
```

---

## 🌍 **DEPLOYMENT URLS**

### **Local Development**
- **Frontend**: http://localhost:5173/
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **WebSocket**: ws://localhost:8000/ws

### **Production (Render.com)**
- **Frontend**: https://smart-city-surveillance-frontend.onrender.com
- **Backend API**: https://smart-city-surveillance-backend.onrender.com
- **API Docs**: https://smart-city-surveillance-backend.onrender.com/docs
- **WebSocket**: wss://smart-city-surveillance-backend.onrender.com/ws

---

## 🔒 **SECURITY CONFIGURATION**

### **CORS Settings**
```python
# Allowed origins for CORS
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://smart-city-surveillance-frontend.onrender.com"
]
```

### **JWT Configuration**
- **Algorithm**: HS256 (default)
- **Expiration**: Configurable (default: 24 hours)
- **Issuer**: Smart City Surveillance System
- **Secret**: Environment variable based

---

## 📊 **DATABASE SCHEMA**

### **Collections Used**
- **incidents**: Security incident records
- **cameras**: Camera configuration and status
- **users**: User authentication data
- **analytics**: System analytics and metrics

### **Fallback Mode**
When MongoDB is unavailable, the system runs in fallback mode with:
- In-memory data storage
- Sample data for demonstration
- Full functionality maintained
- Automatic recovery when database reconnects

---

## 🚀 **QUICK SETUP GUIDE**

### **1. Local Development Setup**
```bash
# Backend
cd backend
cp .env.example .env  # Edit with your values
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000 --reload

# Frontend
cd frontend
npm install
npm run dev
```

### **2. Production Environment Variables**
Set these in your hosting provider:
```env
MONGO_URL=<your-production-mongodb-connection-string>
JWT_SECRET=<your-secure-64-character-jwt-secret>
PORT=<auto-assigned-by-hosting-provider>
NODE_ENV=production
```

### **3. Security Checklist**
- [ ] Generate secure JWT secret for production
- [ ] Create production MongoDB database with strong credentials
- [ ] Configure CORS for your production domains
- [ ] Enable HTTPS/WSS for production
- [ ] Set up database backups
- [ ] Configure monitoring and logging

---

## 🔍 **CONFIGURATION VERIFICATION**

### **Check Current Configuration**
```bash
# Backend configuration
cd backend
python -c "import os; print('JWT_SECRET:', os.getenv('JWT_SECRET', 'Not set')); print('MONGO_URL:', os.getenv('MONGO_URL', 'Not set')[:50] + '...')"

# Frontend configuration  
cd frontend
npm run dev  # Check console for API configuration logs
```

### **Test Connectivity**
```bash
# Test backend API
curl http://localhost:8000/health

# Test MongoDB connection
# Check backend logs for database connection status
```

---

## 📝 **CONFIGURATION SUMMARY**

| Component | Development | Production |
|-----------|-------------|------------|
| **Backend Port** | 8000 | Environment Variable |
| **Frontend Port** | 5173 | Auto-assigned |
| **Database** | MongoDB Atlas | MongoDB Atlas/Production |
| **JWT Secret** | Development Key | Secure Generated Key |
| **Protocol** | HTTP/WS | HTTPS/WSS |
| **CORS** | Localhost | Production Domains |

---

**⚠️ IMPORTANT**: Always use secure, unique credentials for production deployment and never commit sensitive information to version control.

**Date**: March 25, 2026  
**Version**: Production Configuration v2.1  
**Status**: ✅ **CONFIGURATION DOCUMENTED**