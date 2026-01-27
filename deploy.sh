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

# Ensure logs directory exists
mkdir -p logs

# Restart the application using PM2 ecosystem config
pm2 reload ecosystem.config.js --env production || pm2 start ecosystem.config.js --env production

pm2 save

echo "✅ Deployment complete!"
