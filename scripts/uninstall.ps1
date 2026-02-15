$ErrorActionPreference = "Stop"

Set-Location -Path (Join-Path $PSScriptRoot "..")

$currentIdentity = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = New-Object Security.Principal.WindowsPrincipal($currentIdentity)
$isAdmin = $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "This uninstall script must be run with elevated permissions."
    Write-Host "Please run PowerShell as Administrator and execute: ./scripts/uninstall.ps1"
    exit 1
}

function Ask-Keep([string]$Question) {
    while ($true) {
        $answer = Read-Host "$Question [Y/n]"
        if ([string]::IsNullOrWhiteSpace($answer)) { return $true }

        switch -Regex ($answer.Trim()) {
            "^(?i:y|yes)$" { return $true }
            "^(?i:n|no)$"  { return $false }
            default { Write-Host "Please answer with y or n." }
        }
    }
}

$toDelete = @()

if (-not (Ask-Keep "Keep SQLite configuration data (data/sqlite)?")) {
    $toDelete += "data/sqlite"
}

if (-not (Ask-Keep "Keep backend app data (data/app)?")) {
    $toDelete += "data/app"
}

if (-not (Ask-Keep "Keep InfluxDB measurements (data/influxdb)?")) {
    $toDelete += "data/influxdb"
}

if (-not (Ask-Keep "Keep logs (logs)?")) {
    $toDelete += "logs"
}

if (-not (Ask-Keep "Keep TLS certificates (cert)?")) {
    $toDelete += "cert"
}

Write-Host ""
Write-Host "Uninstall summary:"
Write-Host "  - Containers/images: WILL BE REMOVED"
if ($toDelete.Count -eq 0) {
    Write-Host "  - Local data: KEEP ALL"
}
else {
    Write-Host "  - Local data paths to remove:"
    $toDelete | ForEach-Object { Write-Host "      - $_" }
}

Write-Host ""
$confirm = Read-Host "Type DELETE to continue uninstall"
if ($confirm -ne "DELETE") {
    Write-Host "Canceled. No containers or data were changed."
    exit 0
}

Write-Host "Stopping Enervigil containers..."
try { docker compose down --remove-orphans --rmi local } catch {}
try { docker compose -f docker-compose.dev.yml down --remove-orphans --rmi local } catch {}

if ($toDelete.Count -eq 0) {
    Write-Host "No local data selected for deletion. Uninstall complete."
    exit 0
}

foreach ($path in $toDelete) {
    if (Test-Path -Path $path) {
        Remove-Item -Path $path -Recurse -Force
        Write-Host "Removed: $path"
    }
    else {
        Write-Host "Skipped (not found): $path"
    }
}

if ((Test-Path -Path "data" -PathType Container) -and ((Get-ChildItem -Path "data" -Force | Measure-Object).Count -eq 0)) {
    Remove-Item -Path "data" -Force
    Write-Host "Removed empty directory: data"
}

Write-Host "Uninstall complete."
