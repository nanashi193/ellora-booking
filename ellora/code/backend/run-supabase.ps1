$ErrorActionPreference = "Stop"

$envFile = Join-Path $PSScriptRoot ".env.supabase"
if (-not (Test-Path -LiteralPath $envFile)) {
    throw "Missing $envFile. Copy .env.supabase.example to .env.supabase and fill in the values."
}

Get-Content -LiteralPath $envFile | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith("#")) {
        return
    }

    $name, $value = $line -split "=", 2
    if (-not $name -or $null -eq $value) {
        throw "Invalid environment entry: $line"
    }

    Set-Item -Path "Env:$($name.Trim())" -Value $value.Trim()
}

$requiredVariables = @(
    "SUPABASE_DB_URL",
    "SUPABASE_DB_USERNAME",
    "SUPABASE_DB_PASSWORD"
)

foreach ($variable in $requiredVariables) {
    $value = (Get-Item -Path "Env:$variable" -ErrorAction SilentlyContinue).Value
    if (-not $value -or $value.Contains("YOUR_")) {
        throw "Missing value for $variable in $envFile"
    }
}

$env:SPRING_PROFILES_ACTIVE = "supabase"
$env:SPRING_DEVTOOLS_RESTART_ENABLED = "false"
Set-Location -LiteralPath $PSScriptRoot
mvn.cmd spring-boot:run
