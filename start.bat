@echo off
echo Starting backend server...
start cmd /k "cd sales_management_backend && ..\envsmart\Scripts\activate && cd .. && python manage.py runserver"

echo Starting frontend server...
start cmd /k "cd sales-management-frontend && npm start"

echo Both servers are starting...
pause