#!/bin/bash
# Deploy script for the project
# Simply SSH into the server, enter the repo folder and run this bad boy to get the latest changes
# ;)

set -e

APP_NAME="mine-bot" 

# Pull the latest changes from the git repository
git pull --tags origin production

# Install dependencies
npm install --production

# Restart the application using PM2
pm2 reload "$APP_NAME" || pm2 start index.js --name "$APP_NAME"

pm2 save

echo "✅ Deployment complete!"
