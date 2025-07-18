#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "--- Starting EmailGenius ConvertKit Application Update ---"

# Optional: Navigate to your project directory if the script isn't run from there
# cd /path/to/your/emailgenius-convertkit || { echo "Failed to change directory"; exit 1; }

echo "[1/5] Pulling latest changes from Git repository (origin main)..."
sudo git pull origin main

echo "[2/5] Removing previous build directory (.next)..."
# Use -f to force removal without prompts and ignore if it doesn't exist
sudo rm -rf .next

echo "[3/5] Installing/updating dependencies..."
sudo npm ci

echo "[4/5] Building the EmailGenius ConvertKit application..."
sudo npm run build

echo "[5/5] Restarting PM2 process 'kit-app'..."
sudo pm2 restart kit-app

echo "[6/6] Saving current PM2 process list..."
sudo pm2 save

# Note: 'sudo pm2 startup' is typically a one-time setup command
# to ensure pm2 resurrects processes on server reboot.
# It's usually not needed in a regular deployment script.

echo "--- EmailGenius ConvertKit Application Update Finished Successfully ---"

exit 0
