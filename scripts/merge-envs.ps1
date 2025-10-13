# Merge multiple env files into .env.local in project root (idempotent)
param(
  [string[]]$Sources = @('.env.local', '.env', '.env.local.example', '.env.example', '.env.local.sample')
)

$root = Split-Path -Parent $MyInvocation.MyCommand.Path | Split-Path -Parent
Set-Location $root

$envOut = '.env.local'
$seen = @{}

foreach ($src in $Sources) {
  if (Test-Path $src) {
    Get-Content $src | ForEach-Object {
      if ($_ -match '^[ \t]*#') { return }
      if ($_ -match '^[ \t]*$') { return }
      if ($_ -match '^[A-Za-z_][A-Za-z0-9_]*=') {
        $key = ($_ -split '=',2)[0]
        if (-not $seen.ContainsKey($key)) {
          Add-Content -Path $envOut -Value $_
          $seen[$key] = $true
        }
      }
    }
  }
}

Write-Host "Merged envs into $envOut. Verify values, especially NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL."