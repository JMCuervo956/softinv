cd "C:\Dweb\SoftApl\src"  
start /b node app.js
timeout /t 10 /nobreak >nul
start "" http://localhost:3008
exit

