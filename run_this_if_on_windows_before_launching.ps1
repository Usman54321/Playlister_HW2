# Evaluate node -v and check if it is greater or equal to 17.0.0

$nodeVersion = node -v
$nodeVersion = $nodeVersion -replace "v", ""

# debug print out the node version
# Write-Host "Node version: $nodeVersion"

if ($nodeVersion -ge "17.0.0") {
    $env:NODE_OPTIONS = "--openssl-legacy-provider"
    Write-Host "Node version is greater than or equal to 17.0.0"
}

# Run npm start
npm start