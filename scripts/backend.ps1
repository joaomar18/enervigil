$ErrorActionPreference = "Stop"

cd app

$VenvPath = ".venv"
$PythonPath = ".\.venv\Scripts\python.exe"
$ActivatePath = ".\.venv\Scripts\Activate.ps1"

if (!(Test-Path $ActivatePath) -or !(Test-Path $PythonPath)) {
    Write-Host "Virtual environment missing or incomplete. Recreating..."

    if (Test-Path $VenvPath) {
        Remove-Item -Recurse -Force $VenvPath
    }

    python -m venv $VenvPath
}

. $ActivatePath

python -m pip install -e .
python main.py