#!/bin/bash

# Smart City AI Surveillance - Production Deployment Script
# This script prepares and deploys the application to Render

echo "🚀 Smart City AI Surveillance - Production Deployment"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if git is available
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install Git first."
    exit 1
fi

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Not in a Git repository. Please initialize Git first."
    exit 1
fi

print_status "Starting deployment preparation..."

# 1. Clean up any temporary files
print_status "Cleaning up temporary files..."
rm -rf frontend/dist
rm -rf frontend/node_modules/.cache
rm -rf backend/__pycache__
rm -rf backend/**/__pycache__

# 2. Verify frontend build
print_status "Testing frontend build..."
cd frontend
if npm run build; then
    print_success "Frontend build successful"
else
    print_error "Frontend build failed"
    exit 1
fi
cd ..

# 3. Verify backend dependencies
print_status "Checking backend dependencies..."
cd backend
if python -c "import fastapi, uvicorn, motor, pydantic"; then
    print_success "Backend dependencies verified"
else
    print_warning "Some backend dependencies may be missing"
fi
cd ..

# 4. Check for sensitive files
print_status "Checking for sensitive files..."
if [ -f "backend/.env" ]; then
    print_warning "Found .env file - make sure it's in .gitignore"
fi

# 5. Verify deployment files
print_status "Verifying deployment configuration..."
required_files=("render.yaml" "backend/Procfile" "backend/requirements.txt" "frontend/package.json")
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        print_success "✓ $file exists"
    else
        print_error "✗ $file is missing"
        exit 1
    fi
done

# 6. Git status check
print_status "Checking Git status..."
if [ -n "$(git status --porcelain)" ]; then
    print_warning "You have uncommitted changes. Commit them before deployment."
    git status --short
    
    read -p "Do you want to commit all changes now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        git commit -m "Production deployment preparation - $(date)"
        print_success "Changes committed"
    else
        print_warning "Proceeding with uncommitted changes..."
    fi
fi

# 7. Push to repository
print_status "Pushing to Git repository..."
current_branch=$(git branch --show-current)
print_status "Current branch: $current_branch"

if git push origin $current_branch; then
    print_success "Code pushed to repository"
else
    print_error "Failed to push to repository"
    exit 1
fi

# 8. Deployment instructions
echo ""
echo "=================================================="
print_success "🎉 DEPLOYMENT PREPARATION COMPLETE!"
echo "=================================================="
echo ""
print_status "Next steps for Render deployment:"
echo ""
echo "1. 🌐 Go to https://render.com"
echo "2. 📁 Connect your Git repository"
echo "3. 📋 Use the render.yaml file for automatic deployment"
echo "4. 🔧 Set environment variables if needed"
echo "5. 🚀 Deploy!"
echo ""
print_status "Your application will be available at:"
echo "   Frontend: https://smart-city-surveillance-frontend.onrender.com"
echo "   Backend:  https://smart-city-surveillance-backend.onrender.com"
echo ""
print_status "Features included in this deployment:"
echo "   ✅ Real AI Video Analysis (YOLO + OpenCV)"
echo "   ✅ 6 Permanent Surveillance Cameras"
echo "   ✅ Real-time WebSocket Alerts"
echo "   ✅ Interactive City Map with Heatmap"
echo "   ✅ Professional Control Room Interface"
echo "   ✅ Racing Accident Detection System"
echo "   ✅ Incident Management System"
echo "   ✅ Camera Management Dashboard"
echo "   ✅ Analytics and Reporting"
echo ""
print_success "🎯 Ready for production deployment!"