@echo off
echo Starting deployment process...

REM Add all changes
git add -A

REM Commit with timestamp
git commit -m "Auto-deploy: %date% %time%"

REM Push to GitHub
git push origin master

REM Deploy to Vercel
vercel --prod --yes

echo Deployment complete!
pause