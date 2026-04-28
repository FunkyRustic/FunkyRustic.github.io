@echo off
setlocal

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0preview.ps1" %*
