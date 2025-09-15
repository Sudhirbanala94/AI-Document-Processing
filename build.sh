#!/bin/bash
# Build script for monolithic deployment

echo "Building React frontend..."
cd frontend
npm install
npm run build
cd ..

echo "Moving build files to root..."
rm -rf build
mv frontend/build .

echo "Build complete! Ready for deployment."