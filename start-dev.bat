@echo off
echo Starting development server...
echo.

REM Set environment variables
set NODE_ENV=development
set NODE_OPTIONS=--max-old-space-size=4096

REM Clear cache
echo Clearing Next.js cache...
if exist ".next" rmdir /s /q .next
if exist "node_modules\.cache" rmdir /s /q node_modules\.cache

REM Start development server with Webpack
echo Starting Next.js with Webpack...
npm run dev

pause
