@echo off
echo Cleaning up unused ports (keeping 3002 for current server)...

:: Kill port 3000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    echo Killing process on port 3000 with PID %%a
    taskkill /F /PID %%a 2>nul
)

:: Kill port 3001  
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001 ^| findstr LISTENING') do (
    echo Killing process on port 3001 with PID %%a
    taskkill /F /PID %%a 2>nul
)

:: Skip 3002 as it's currently in use

:: Kill ports 3003-3010
for /l %%i in (3003,1,3010) do (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%%i ^| findstr LISTENING') do (
        echo Killing process on port %%i with PID %%a
        taskkill /F /PID %%a 2>nul
    )
)

echo Done! Port 3002 is kept for the current server.
echo All other ports 3000-3001 and 3003-3010 have been cleared.