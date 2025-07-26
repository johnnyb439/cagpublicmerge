@echo off
echo Deploying to caglive2.vercel.app...

:: Remove existing .vercel folder to create new project
rmdir /s /q .vercel 2>nul

:: Deploy with explicit project name
npx vercel --prod --yes --scope johnny-bouphavongs-projects

echo.
echo Deployment complete!
echo After deployment, go to your Vercel dashboard and:
echo 1. Find the new project
echo 2. Go to Settings - Domains
echo 3. Add caglive2.vercel.app as a custom domain
echo.
pause