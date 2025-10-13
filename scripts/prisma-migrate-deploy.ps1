Param(
  [switch]$VerboseOutput
)

# Ensure we're in repo root regardless of invocation
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Join-Path $scriptDir '..')

Write-Host "Prisma migrate deploy starting..." -ForegroundColor Cyan

function Load-EnvVarFromFile {
  param(
    [Parameter(Mandatory=$true)][string]$FilePath,
    [Parameter(Mandatory=$true)][string]$Key
  )
  if (Test-Path $FilePath) {
    $line = (Select-String -Path $FilePath -Pattern "^\s*$Key\s*=\s*(.+)\s*$" -SimpleMatch:$false -ErrorAction SilentlyContinue | Select-Object -First 1)
    if ($line) {
      $value = $line.Matches.Groups[1].Value.Trim()
      # Trim surrounding quotes
      if ($value.StartsWith('"') -and $value.EndsWith('"')) { $value = $value.Trim('"') }
      if ($value.StartsWith("'") -and $value.EndsWith("'")) { $value = $value.Trim("'") }
      return $value
    }
  }
  return $null
}

# Ensure DATABASE_URL exists; attempt to read from .env.local then .env if not in env
if (-not $env:DATABASE_URL) {
  $dbUrl = Load-EnvVarFromFile -FilePath ".env.local" -Key "DATABASE_URL"
  if (-not $dbUrl) { $dbUrl = Load-EnvVarFromFile -FilePath ".env" -Key "DATABASE_URL" }
  if ($dbUrl) {
    $env:DATABASE_URL = $dbUrl
    Write-Host "DATABASE_URL loaded from .env/.env.local" -ForegroundColor DarkGray
  }
}

if (-not $env:DATABASE_URL) {
  Write-Error "DATABASE_URL is not set. Please set it in .env/.env.local or your environment."
  exit 1
}

# Derive DIRECT_URL for Supabase (non-pooled, port 5432) when not provided
if (-not $env:DIRECT_URL -or [string]::IsNullOrWhiteSpace($env:DIRECT_URL)) {
  $direct = $env:DATABASE_URL
  # Remove PgBouncer pooler subdomain and switch to direct Postgres port
  $direct = $direct -replace 'pooler\.', ''
  $direct = $direct -replace ':6543', ':5432'
  $env:DIRECT_URL = $direct
  Write-Host "DIRECT_URL derived from DATABASE_URL" -ForegroundColor DarkGray
}

if ($VerboseOutput) {
  Write-Host "Using DIRECT_URL=$env:DIRECT_URL" -ForegroundColor DarkGray
}

# Try migration deploy over DIRECT_URL (non-pooled)
npx prisma migrate deploy

if ($LASTEXITCODE -ne 0) {
  Write-Warning "Prisma migrate deploy failed with exit code $LASTEXITCODE. Falling back to prisma db execute over pooled connection..."
  # Fallback: use pooled connection for direct SQL execution of critical migrations
  $env:DIRECT_URL = $env:DATABASE_URL

  $migrations = @(
    "prisma/migrations/20251006_fix_user_clerkid_column/migration.sql",
    "prisma/migrations/20251006_ensure_brandprofile_userid/migration.sql"
  )

  foreach ($mig in $migrations) {
    if (Test-Path $mig) {
      Write-Host "Applying $mig via prisma db execute..." -ForegroundColor Yellow
      npx prisma db execute --file $mig --schema .\prisma\schema.prisma
      if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed executing $mig with exit code $LASTEXITCODE"
        exit $LASTEXITCODE
      }
    } else {
      Write-Host "Skipping missing migration file: $mig" -ForegroundColor DarkGray
    }
  }

  Write-Host "Fallback SQL migrations applied successfully." -ForegroundColor Green
  exit 0
}

Write-Host "Prisma migrations applied successfully." -ForegroundColor Green
