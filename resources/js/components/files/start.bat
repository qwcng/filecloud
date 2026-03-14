@echo off
REM Ścieżka do XAMPP – dostosuj jeśli masz gdzie indziej
set XAMPP_PATH=C:\xampp

REM Uruchomienie MySQL
echo Uruchamianie MySQL...
start "" "%XAMPP_PATH%\mysql_start.bat"

REM Poczekaj 5 sekund, żeby MySQL miał czas się uruchomić
timeout /t 5 /nobreak >nul

REM Uruchomienie VS Code
echo Uruchamianie Visual Studio Code...
start "" "C:\Users\Krzysiek\AppData\Local\Programs\Microsoft VS Code\_\Code.exe"

echo Gotowe.
pause