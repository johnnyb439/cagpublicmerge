@echo off
echo ====================================
echo Deploying to Vercel via GitHub
echo ====================================

echo.
echo Step 1: Checking git status...
git status

echo.
echo Step 2: Adding all changes...
git add -A

echo.
echo Step 3: Creating commit...
set /p message="Enter commit message: "
git commit -m "%message%"

echo.
echo Step 4: Pushing to GitHub...
git push origin master

echo.
echo Step 5: Verifying push...
git log --oneline -1

echo.
echo ====================================
echo Deployment initiated!
echo Vercel will auto-deploy in 1-3 minutes
echo Check: https://caglive.vercel.app
echo ====================================
pause