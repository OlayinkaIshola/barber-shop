#!/bin/bash

# Build script for Render deployment

echo "🚀 Starting Elite Barber Shop build process..."

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Build frontend for production
echo "🏗️ Building frontend for production..."
npm run build

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install --production

echo "✅ Build process completed successfully!"
echo "🎉 Elite Barber Shop is ready for deployment!"
