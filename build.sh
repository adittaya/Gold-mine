#!/bin/bash

# Build script for Goldmine Pro Investment Platform

echo "Building Goldmine Pro Investment Platform..."

# Build the frontend
echo "Building frontend..."
cd react-client
npm install
npm run build
cd ..

echo "Build completed successfully!"
echo "The application is ready for deployment."