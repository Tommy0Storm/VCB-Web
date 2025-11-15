#!/bin/bash
# VCB-Web Automated Deployment Script
# This script merges your feature branch to master and triggers deployment

set -e  # Exit on error

echo "🚀 VCB-Web Deployment Automation"
echo "================================"

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"

# Fetch latest changes
echo "📥 Fetching latest changes..."
git fetch origin

# Switch to master
echo "🔄 Switching to master branch..."
git checkout master
git pull origin master

# Merge feature branch
echo "🔗 Merging $CURRENT_BRANCH into master..."
git merge $CURRENT_BRANCH -m "deploy: merge $CURRENT_BRANCH to master"

# Push to trigger deployment
echo "📤 Pushing to master (this will trigger GitHub Actions deployment)..."
git push origin master

echo ""
echo "✅ Deployment initiated!"
echo "📊 Check deployment status: https://github.com/Tommy0Storm/VCB-Web/actions"
echo "🌐 Site will be live at: https://tommy0storm.github.io/VCB-Web/"
echo ""
