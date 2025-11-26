# Stop Next.js dev server if running
Write-Host "Stopping Next.js dev server..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object {$_.Path -like "*node.exe*"} | Stop-Process -Force
Start-Sleep -Seconds 2

# Apply the migrations
Write-Host "`nApplying database migrations..." -ForegroundColor Cyan
npx prisma migrate deploy

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nMigrations applied successfully!" -ForegroundColor Green
    
    # Generate Prisma Client
    Write-Host "`nGenerating Prisma Client..." -ForegroundColor Cyan
    npx prisma generate
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`nPrisma Client generated successfully!" -ForegroundColor Green
        Write-Host "`nYou can now restart your dev server with: npm run dev" -ForegroundColor Yellow
    } else {
        Write-Host "`nFailed to generate Prisma Client" -ForegroundColor Red
    }
} else {
    Write-Host "`nFailed to apply migrations" -ForegroundColor Red
}

Write-Host "`nPress any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
