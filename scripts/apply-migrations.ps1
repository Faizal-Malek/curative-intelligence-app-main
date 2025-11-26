# Stop Next.js dev server
Write-Host "Stopping Next.js dev server..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Apply migrations
Write-Host "`nApplying database migrations..." -ForegroundColor Cyan
npx prisma migrate dev --name add_admin_and_payment_features

# Generate Prisma Client
Write-Host "`nGenerating Prisma Client..." -ForegroundColor Cyan
npx prisma generate

Write-Host "`nMigrations complete! You can now restart your dev server with 'npm run dev'" -ForegroundColor Green
