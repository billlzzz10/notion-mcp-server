#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status.

echo "--- Navigating to backend directory ---"
cd backend

echo "--- Installing backend dependencies ---"
npm install --ignore-scripts

echo "--- Building backend ---"
npm run build
