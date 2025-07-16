@echo off
echo Creating preview package for Cleared Advisory Group website...
echo.

REM Create preview directory
if not exist "preview-package" mkdir preview-package

REM Copy all source files
echo Copying source files...
xcopy /E /I /Y "app" "preview-package\app"
xcopy /E /I /Y "components" "preview-package\components"
xcopy /E /I /Y "public" "preview-package\public"
copy package.json preview-package\
copy next.config.js preview-package\
copy tailwind.config.ts preview-package\
copy tsconfig.json preview-package\
copy README.md preview-package\

REM Create instructions file
echo Creating instructions...
(
echo Cleared Advisory Group Website Preview
echo =====================================
echo.
echo To view this website:
echo.
echo 1. Install Node.js from https://nodejs.org if not already installed
echo 2. Open a terminal/command prompt in this folder
echo 3. Run: npm install
echo 4. Run: npm run dev
echo 5. Open http://localhost:3000 in your browser
echo.
echo The website includes:
echo - Home page with hero section and features
echo - About page with team information
echo - Services page listing all offerings
echo - Jobs board with sample cleared IT positions
echo - AI-powered mock interview tool
echo - Resources section with guides
echo - User authentication (login/register/dashboard^)
echo - Live chat widget
echo.
echo Color scheme: Dynamic green and blue (no purple/magenta^)
echo Branding: American flag integrated, "The Trinity Team" as founder
echo.
echo For questions, contact the development team.
) > "preview-package\INSTRUCTIONS.txt"

echo.
echo Preview package created successfully!
echo.
echo The "preview-package" folder contains everything needed.
echo You can now:
echo   1. Zip the "preview-package" folder
echo   2. Send it to your colleague
echo   3. They can follow the instructions in INSTRUCTIONS.txt
echo.
pause