# Starts Next.js dev with Supabase Root CA trusted
# Usage: powershell -ExecutionPolicy Bypass -File .\scripts\dev-with-ca.ps1

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$caPath = Join-Path $repoRoot 'prod-ca-2021.crt'

if (!(Test-Path $caPath)) {
  Write-Error "CA file not found: $caPath. Place your Supabase root CA PEM there."
}

# Export cert path for Node.js and libpq/Prisma
$env:NODE_EXTRA_CA_CERTS = $caPath
$env:PGSSLROOTCERT = $caPath
$env:PGSSLMODE = 'require'

Write-Host "Using CA: $caPath" -ForegroundColor Green
Write-Host "Starting dev server with trusted CA..." -ForegroundColor Green

npm run dev
