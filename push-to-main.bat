@echo off
git add .gitignore
set /p desc=Enter the description for this commit: 
git commit -m "%desc%"
git push origin main
pause