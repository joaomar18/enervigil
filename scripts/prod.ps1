Write-Host "Stopping development containers..."
docker compose -f docker-compose.dev.yml down 2>$null

Write-Host "Starting production stack..."

if (Test-Path "docker-compose.hardware.yml") {
    Write-Host "Hardware compose file detected."
    docker compose `
        -f docker-compose.yml `
        -f docker-compose.hardware.yml `
        up -d
}
else {
    docker compose -f docker-compose.yml up -d
}

Write-Host "Production environment is running."