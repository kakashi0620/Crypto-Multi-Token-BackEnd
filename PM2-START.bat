@echo off
REM Set the path to your Node.js and PM2 installation
SET PATH=%PATH%;C:\Users\%USERNAME%\AppData\Roaming\npm
echo %PATH%

REM Start PM2 and resurrect saved processes
pm2 resurrect
