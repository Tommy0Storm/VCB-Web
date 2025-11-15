@echo off
REM VCB-Web Automated Deployment Script (Windows)
REM This script merges your feature branch to master and triggers deployment

echo.
echo 🚀 VCB-Web Deployment Automation
echo ================================
echo.

REM Get current branch
for /f "tokens=*" %%i in ('git branch --show-current') do set CURRENT_BRANCH=%%i
echo 📍 Current branch: %CURRENT_BRANCH%

REM Fetch latest changes
echo 📥 Fetching latest changes...
git fetch origin

REM Switch to master
echo 🔄 Switching to master branch...
git checkout master
git pull origin master

REM Merge feature branch
echo 🔗 Merging %CURRENT_BRANCH% into master...
git merge %CURRENT_BRANCH% -m "deploy: merge %CURRENT_BRANCH% to master"

REM Push to trigger deployment
echo 📤 Pushing to master (this will trigger GitHub Actions deployment)...
git push origin master

echo.
echo ✅ Deployment initiated!
echo 📊 Check deployment status: https://github.com/Tommy0Storm/VCB-Web/actions
echo 🌐 Site will be live at: https://tommy0storm.github.io/VCB-Web/
echo.
pause
