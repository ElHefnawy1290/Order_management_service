$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$python = Join-Path $root '.venv\Scripts\python.exe'

if (-not (Test-Path $python)) {
    throw "Python environment not found at $python"
}

$apiCommand = "Set-Location '$root'; & '$python' -m uvicorn main:app --host 127.0.0.1 --port 8000"
Start-Process powershell.exe -ArgumentList '-NoExit', '-Command', $apiCommand

Set-Location (Join-Path $root 'frontend')
npm run dev
