@echo off
echo Killing Node.js processes on ports 3000-3010...

for /l %%i in (3000,1,3010) do (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%%i ^| findstr LISTENING') do (
        echo Killing process on port %%i with PID %%a
        taskkill /F /PID %%a 2>nul
    )
)

echo Done! All ports 3000-3010 should now be free.
pause