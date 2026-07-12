param(
    [switch] $DryRun
)

$ErrorActionPreference = "Stop"
$envFile = Join-Path $PSScriptRoot "..\.env"

if (-not (Test-Path -LiteralPath $envFile)) {
    throw "Missing .env file. Copy .env.example to .env and fill in the Cloudflare deployment values."
}

foreach ($rawLine in Get-Content -LiteralPath $envFile) {
    $line = $rawLine.Trim()
    if (-not $line -or $line.StartsWith("#") -or -not $line.Contains("=")) {
        continue
    }

    $name, $value = $line -split "=", 2
    $name = $name.Trim()
    $value = $value.Trim()

    if (($value.StartsWith('"') -and $value.EndsWith('"')) -or
        ($value.StartsWith("'") -and $value.EndsWith("'"))) {
        $value = $value.Substring(1, $value.Length - 2)
    }

    [Environment]::SetEnvironmentVariable($name, $value, "Process")
}

$requiredVariables = @(
    "CLOUDFLARE_ACCOUNT_ID",
    "CLOUDFLARE_API_TOKEN",
    "CLOUDFLARE_PROJECT_NAME",
    "CUSTOM_DOMAIN"
)

$missingVariables = $requiredVariables | Where-Object {
    [string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable($_, "Process"))
}

if ($missingVariables) {
    throw "Missing required .env variables: $($missingVariables -join ', ')"
}

$workerName = $env:CLOUDFLARE_PROJECT_NAME.Trim()
$customDomain = $env:CUSTOM_DOMAIN.Trim()

if ($workerName -notmatch '^[a-z0-9][a-z0-9-]*[a-z0-9]$') {
    throw "CLOUDFLARE_PROJECT_NAME must contain lowercase letters, numbers, or hyphens."
}

if ($customDomain -match '^https?://' -or $customDomain.Contains('/')) {
    throw "CUSTOM_DOMAIN must be a hostname such as awards.example.com, without a protocol or path."
}

Write-Host "Building Worker '$workerName' for Cloudflare..."
& npm run build
if ($LASTEXITCODE -ne 0) {
    throw "Next.js static export failed with exit code $LASTEXITCODE."
}

$deployArguments = @(
    "wrangler",
    "deploy",
    "--name", $workerName,
    "--domain", $customDomain
)

if ($DryRun) {
    $deployArguments += "--dry-run"
}

Write-Host $(if ($DryRun) { "Validating Cloudflare deployment..." } else { "Deploying to Cloudflare..." })
& npx @deployArguments
if ($LASTEXITCODE -ne 0) {
    throw "Wrangler deployment failed with exit code $LASTEXITCODE."
}
