#!/bin/bash

echo "🚀 Starting CineWave Deployment Process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_error "Vercel CLI is not installed. Installing now..."
    npm install -g vercel
fi

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    print_warning "You are not logged in to Vercel. Please login first."
    vercel login
fi

print_status "Starting backend deployment..."

# Deploy backend
cd backend
print_status "Deploying backend to Vercel..."
vercel --prod --yes

# Get the backend URL
BACKEND_URL=$(vercel ls --json | grep -o '"url":"[^"]*"' | head -1 | cut -d'"' -f4)
print_status "Backend deployed at: $BACKEND_URL"

cd ..

print_status "Starting frontend deployment..."

# Deploy frontend
cd frontend
print_status "Deploying frontend to Vercel..."
vercel --prod --yes

# Get the frontend URL
FRONTEND_URL=$(vercel ls --json | grep -o '"url":"[^"]*"' | head -1 | cut -d'"' -f4)
print_status "Frontend deployed at: $FRONTEND_URL"

cd ..

print_status "Deployment completed!"
echo ""
echo "📋 Next Steps:"
echo "1. Set environment variables in Vercel dashboard for both projects"
echo "2. Update CORS settings in backend with frontend URL: $FRONTEND_URL"
echo "3. Update frontend environment variables with backend URL: $BACKEND_URL"
echo "4. Test all features"
echo ""
echo "🔗 Your URLs:"
echo "Frontend: $FRONTEND_URL"
echo "Backend: $BACKEND_URL" 