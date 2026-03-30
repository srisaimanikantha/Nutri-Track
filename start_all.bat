@echo off
echo ==========================================
echo Starting AI Food Calorie Estimator...
echo ==========================================

echo [1/3] Starting ML Model API (Port 8000)...
cd ml-model
start cmd /k "py -m pip install -r requirements.txt && py app.py"
cd ..

echo [2/3] Starting Node.js Backend (Port 5000)...
cd backend
start cmd /k "npm install && node server.js"
cd ..

echo [3/3] Starting React Frontend (Port 5173)...
cd frontend
start cmd /k "npm install && npm run dev"
cd ..


echo.
echo All services are launching in separate windows!
echo - Frontend: http://localhost:5173
echo - Backend: http://localhost:5000
echo - ML API: http://localhost:8000
echo.
pause
