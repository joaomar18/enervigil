docker compose down
docker compose -f docker-compose.dev.yml up -d

Write-Host ""
Write-Host "Run backend with: scripts/backend.ps1"
Write-Host "Run frontend with: scripts/frontend.ps1"