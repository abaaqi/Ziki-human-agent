@echo off
setlocal
title Deploy the Ziki prototype to Vercel
cd /d "%~dp0ziki-owner-mandates"
if errorlevel 1 (
  echo Could not find the ziki-owner-mandates folder next to this file. Extract the whole zip first, then run this file again.
  pause
  exit /b 1
)

where node >nul 2>&1
if errorlevel 1 (
  echo Node.js is needed to run the Vercel CLI. Install it from https://nodejs.org, then run this file again.
  pause
  exit /b 1
)

echo Checking your Vercel login...
call npx --yes vercel@latest whoami >nul 2>&1
if errorlevel 1 (
  echo You are not logged in to Vercel yet. Follow the prompts to log in in your browser.
  call npx --yes vercel@latest login
  if errorlevel 1 (
    echo Login did not finish. Run this file again to retry.
    pause
    exit /b 1
  )
)

echo Deploying the prototype to production...
call npx --yes vercel@latest deploy --prod --yes
if errorlevel 1 (
  echo The deploy did not finish. Read the message above, then run this file again.
  pause
  exit /b 1
)

echo.
echo Done. Share the link on the "Aliased" line above. It usually ends in .vercel.app
echo The longer "Production" link may ask visitors to log in to Vercel.
pause
