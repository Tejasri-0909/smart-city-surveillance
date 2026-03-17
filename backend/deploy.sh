#!/bin/bash
# Simple deployment script for Render
echo "🚀 Starting Smart City Surveillance deployment..."

# Install dependencies without setuptools issues
echo "📦 Installing dependencies..."
pip install --no-deps fastapi==0.104.1
pip install --no-deps uvicorn==0.24.0
pip install --no-deps motor==3.3.2
pip install --no-deps python-dotenv==1.0.0
pip install --no-deps python-multipart==0.0.6
pip install --no-deps pydantic==2.5.0
pip install --no-deps websockets==12.0
pip install --no-deps python-jose==3.3.0
pip install --no-deps passlib==1.7.4
pip install --no-deps bcrypt==4.0.1

echo "✅ Dependencies installed successfully"

# Start the application
echo "🌟 Starting Smart City Surveillance Backend..."
python app.py