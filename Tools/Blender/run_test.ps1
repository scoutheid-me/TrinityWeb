param(
    [string]$BlenderPath = 'C:\Program Files\Blender Foundation\Blender 5.2\blender.exe'
)

$ErrorActionPreference = 'Stop'
if (-not (Test-Path -LiteralPath $BlenderPath -PathType Leaf)) {
    throw "Blender executable not found: $BlenderPath. Supply -BlenderPath to override."
}

$testScript = Join-Path $PSScriptRoot 'headless_test.py'
& $BlenderPath --background --factory-startup --python-exit-code 1 --python $testScript
if ($LASTEXITCODE -ne 0) {
    throw "Blender headless test failed with exit code $LASTEXITCODE."
}
