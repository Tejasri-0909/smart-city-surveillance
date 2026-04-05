#!/bin/bash
# Render startup script for Smart City Surveillance Backend

echo "🚀 Starting Smart City Surveillance Backend..."

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Start the application
echo "🌟 Starting FastAPI application..."
uvicorn app:app --host 0.0.0.0 --port ${PORT:-10000} --log-level info