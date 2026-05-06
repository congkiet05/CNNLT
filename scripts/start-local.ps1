# ============================================================
# Script chạy toàn bộ hệ thống ở local (Windows PowerShell)
# Chạy: .\scripts\start-local.ps1
# ============================================================

$ErrorActionPreference = "Stop"
$ROOT = Split-Path -Parent $PSScriptRoot

Write-Host "`n[1/4] Kiểm tra Docker..." -ForegroundColor Cyan
docker info | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker chưa chạy. Hãy mở Docker Desktop trước." -ForegroundColor Red
    exit 1
}

# ─── Bước 1: Chạy SQL Server ─────────────────────────────────
Write-Host "`n[2/4] Khởi động SQL Server..." -ForegroundColor Cyan

$existing = docker ps -a --filter "name=food_sqlserver_local" --format "{{.Names}}" 2>$null
if ($existing -eq "food_sqlserver_local") {
    $status = docker inspect -f "{{.State.Running}}" food_sqlserver_local 2>$null
    if ($status -ne "true") {
        Write-Host "  Khởi động lại container cũ..."
        docker start food_sqlserver_local | Out-Null
    } else {
        Write-Host "  SQL Server đang chạy rồi."
    }
} else {
    Write-Host "  Tạo container mới..."
    docker run -d `
        --name food_sqlserver_local `
        -e "ACCEPT_EULA=Y" `
        -e "SA_PASSWORD=YourStrong@Passw0rd" `
        -e "MSSQL_PID=Express" `
        -p 1433:1433 `
        mcr.microsoft.com/mssql/server:2022-latest | Out-Null
}

Write-Host "  Chờ SQL Server sẵn sàng (30s)..."
Start-Sleep -Seconds 30

# ─── Bước 2: Chạy schema SQL ─────────────────────────────────
Write-Host "`n[3/4] Khởi tạo database schema..." -ForegroundColor Cyan
$sqlFile = Join-Path $ROOT "database\init.sql"

docker exec food_sqlserver_local /opt/mssql-tools18/bin/sqlcmd `
    -S localhost -U sa -P "YourStrong@Passw0rd" -C `
    -i /dev/stdin `
    -Q (Get-Content $sqlFile -Raw) 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "  Schema OK." -ForegroundColor Green
} else {
    Write-Host "  Schema có thể đã tồn tại (bình thường nếu chạy lần 2+)." -ForegroundColor Yellow
}

# ─── Bước 3: Install dependencies ────────────────────────────
Write-Host "`n[4/4] Cài dependencies..." -ForegroundColor Cyan

if (-not (Test-Path "$ROOT\services\auth-service\node_modules")) {
    Write-Host "  Installing auth-service..."
    npm install --prefix "$ROOT\services\auth-service" | Out-Null
}

if (-not (Test-Path "$ROOT\services\ingredient-service\node_modules")) {
    Write-Host "  Installing ingredient-service..."
    npm install --prefix "$ROOT\services\ingredient-service" | Out-Null
}

# ─── Bước 4: Copy .env.local vào từng service ────────────────
Write-Host "`nCopy .env.local vào services..." -ForegroundColor Cyan
Copy-Item "$ROOT\.env.local" "$ROOT\services\auth-service\.env" -Force
Copy-Item "$ROOT\.env.local" "$ROOT\services\ingredient-service\.env" -Force

Write-Host "`n✅ Sẵn sàng! Chạy từng service trong terminal riêng:" -ForegroundColor Green
Write-Host ""
Write-Host "  Terminal 1 (auth-service):" -ForegroundColor Yellow
Write-Host "    cd services\auth-service && npm run dev"
Write-Host ""
Write-Host "  Terminal 2 (ingredient-service):" -ForegroundColor Yellow
Write-Host "    cd services\ingredient-service && npm run dev"
Write-Host ""
Write-Host "  Terminal 3 (frontend):" -ForegroundColor Yellow
Write-Host "    cd Frontend && pnpm dev"
Write-Host ""
Write-Host "  Sau đó mở: http://localhost:3000" -ForegroundColor Cyan
