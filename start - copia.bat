@echo off

REM Ejecutar la aplicación Node.js
start node app.js

REM Esperar un momento para que el servidor inicie
timeout /t 2 /nobreak >nul

REM Abrir el navegador en la URL correspondiente
start http://localhost:3008
