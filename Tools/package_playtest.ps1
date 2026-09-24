$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
Push-Location $projectRoot
try {
    npm run build:playtest
    if ($LASTEXITCODE -ne 0) { throw 'Playtest build failed.' }
    $releasePath = Join-Path $projectRoot 'release'
    New-Item -ItemType Directory -Force -Path $releasePath | Out-Null
    Copy-Item -LiteralPath 'docs/PLAYTEST_HANDOFF.md' -Destination 'dist-playtest/README.md'
    Copy-Item -LiteralPath 'node_modules/@babylonjs/core/license.md' -Destination 'dist-playtest/BABYLON-LICENSE.md'
    @{ build = 'trinity-playtest-2026-09-23'; builtUtc = [DateTime]::UtcNow.ToString('o'); profile = 'playtest'; hosting = 'Serve files at the root of an HTTP(S) site' } | ConvertTo-Json | Set-Content -Encoding utf8 'dist-playtest/build-manifest.json'
    $archivePath = Join-Path $releasePath 'Trinity-Combat-Playtest-2026-09-23.zip'
    Compress-Archive -Path 'dist-playtest/*' -DestinationPath $archivePath -Force
    Get-FileHash -LiteralPath $archivePath -Algorithm SHA256 | Format-List
    Write-Output $archivePath
} finally { Pop-Location }
