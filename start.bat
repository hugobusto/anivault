@echo off
title AniVault Launcher
echo ========================================================
echo    🏯 AniVault - Gestor de Biblioteca Anime Otaku
echo ========================================================
echo.
echo Iniciando AniVault en tu navegador predeterminado...
echo.

:: Abre index.html directamente en el navegador por defecto
start "" "%~dp0index.html"

echo AniVault esta abierto y funcionando al 100%% en tu navegador.
echo Puedes cerrar esta ventana cuando lo desees.
timeout /t 3 >nul
exit
