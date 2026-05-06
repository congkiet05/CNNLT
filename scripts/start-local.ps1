# Script chay toan bo he thong o local (Windows PowerShell)
# Chay: .\scripts\start-local.ps1

$ErrorActionPreference = "Stop"
$ROOT = Split-Path -Parent $PSScriptRoot

Write-Host ""
Write-Host "[1/4] Kiem tra Docker..." -ForegroundColor Cyan
docker info | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker chua chay. Hay mo Docker Desktop truoc." -ForegroundColor Red
    exit 1
}

# Buoc 1: Chay SQL Server
Write-Host ""
Write-Host "[2/4] Khoi dong SQL Server..." -ForegroundColor Cyan

$existing = docker ps -a --filter "name=food_sqlserver_local" --format "{{.Names}}" 2>$null
if ($existing -eq "food_sqlserver_local") {
    $status = docker inspect -f "{{.State.Running}}" food_sqlserver_local 2>$null
    if ($status -ne "true") {
        Write-Host "  Khoi dong lai container cu..."
        docker start food_sqlserver_local | Out-Null
    } else {
        Write-Host "  SQL Server dang chay roi."
    }
} else {
    Write-Host "  Tao container moi..."
    docker run -d `
        --name food_sqlserver_local `
        -e "ACCEPT_EULA=Y" `
        -e "SA_PASSWORD=YourStrong@Passw0rd" `
        -e "MSSQL_PID=Express" `
        -p 1433:1433 `
        mcr.microsoft.com/mssql/server:2022-latest
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  Loi: Khong the tao container SQL Server!" -ForegroundColor Red
        exit 1
    }
    Write-Host "  Container da tao thanh cong." -ForegroundColor Green
}

Write-Host "  Cho SQL Server san sang (40s)..."
Start-Sleep -Seconds 40

# Kiem tra container co dang chay khong
$running = docker inspect -f "{{.State.Running}}" food_sqlserver_local 2>$null
if ($running -ne "true") {
    Write-Host "  Loi: Container SQL Server khong chay duoc!" -ForegroundColor Red
    Write-Host "  Xem logs: docker logs food_sqlserver_local" -ForegroundColor Yellow
    exit 1
}
Write-Host "  SQL Server dang chay." -ForegroundColor Green

# Buoc 2: Chay schema SQL
Write-Host ""
Write-Host "[3/4] Khoi tao database schema..." -ForegroundColor Cyan
$sqlFile = Join-Path $ROOT "database\init.sql"

# Copy file SQL vao container de tranh loi encoding Unicode
docker cp $sqlFile food_sqlserver_local:/tmp/init.sql | Out-Null

docker exec food_sqlserver_local /opt/mssql-tools18/bin/sqlcmd `
    -S localhost -U sa -P "YourStrong@Passw0rd" -C `
    -i /tmp/init.sql 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "  Schema OK." -ForegroundColor Green
} else {
    Write-Host "  Schema co the da ton tai (binh thuong neu chay lan 2+)." -ForegroundColor Yellow
}

# Buoc 3: Install dependencies
Write-Host ""
Write-Host "[4/4] Cai dependencies..." -ForegroundColor Cyan

if (-not (Test-Path "$ROOT\services\auth-service\node_modules")) {
    Write-Host "  Installing auth-service..."
    npm install --prefix "$ROOT\services\auth-service" | Out-Null
}

if (-not (Test-Path "$ROOT\services\ingredient-service\node_modules")) {
    Write-Host "  Installing ingredient-service..."
    npm install --prefix "$ROOT\services\ingredient-service" | Out-Null
}

# Buoc 4: Copy .env.local vao tung service
Write-Host ""
Write-Host "Copy .env.local vao services..." -ForegroundColor Cyan
Copy-Item "$ROOT\.env.local" "$ROOT\services\auth-service\.env" -Force
Copy-Item "$ROOT\.env.local" "$ROOT\services\ingredient-service\.env" -Force

Write-Host ""
Write-Host "San sang! Chay tung service trong terminal rieng:" -ForegroundColor Green
Write-Host ""
Write-Host "  Terminal 1 (auth-service):" -ForegroundColor Yellow
Write-Host "    cd services\auth-service ; npm run dev"
Write-Host ""
Write-Host "  Terminal 2 (ingredient-service):" -ForegroundColor Yellow
Write-Host "    cd services\ingredient-service ; npm run dev"
Write-Host ""
Write-Host "  Terminal 3 (frontend):" -ForegroundColor Yellow
Write-Host "    cd Frontend ; pnpm dev"
Write-Host ""
Write-Host "  Sau do mo: http://localhost:3000" -ForegroundColor Cyan
