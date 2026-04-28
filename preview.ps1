param(
    [int]$Port = 8080
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Url = "http://localhost:$Port/"

Set-Location $ScriptDir

Write-Host "Starting local preview at $Url"
Write-Host "Press Ctrl+C in this window to stop the server."

$pythonArgs = @()
$pythonCmd = $null

if (Get-Command py -ErrorAction SilentlyContinue) {
    $pythonCmd = "py"
    $pythonArgs = @("-3", "-m", "http.server", "$Port")
} elseif (Get-Command python -ErrorAction SilentlyContinue) {
    $pythonCmd = "python"
    $pythonArgs = @("-m", "http.server", "$Port")
} else {
    Write-Host ""
    Write-Host "Python was not found. Install Python 3 first:"
    Write-Host "https://www.python.org/downloads/windows/"
    exit 1
}

Start-Process $Url
& $pythonCmd @pythonArgs
