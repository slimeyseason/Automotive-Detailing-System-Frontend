# Test package creation
Write-Host "Testing Admin Package Creation..." -ForegroundColor Cyan

# Login as admin
$loginBody = @{
    username = 'admin'
    password = 'admin123'
} | ConvertTo-Json

$loginRes = Invoke-RestMethod -Uri 'http://localhost:5000/api/auth/login' -Method Post -Body $loginBody -ContentType 'application/json'
$token = $loginRes.token
Write-Host "✓ Logged in as admin" -ForegroundColor Green

# Create package
$headers = @{
    Authorization = "Bearer $token"
    'Content-Type' = 'application/json'
}

$packageBody = @{
    name = 'Premium Detail Package'
    price = 3500
    duration = '2 hours'
    description = 'Complete detail with wax and interior deep clean'
    type = 'Full Detail'
    active = $true
} | ConvertTo-Json

Write-Host "`nCreating package..." -ForegroundColor Yellow
$result = Invoke-RestMethod -Uri 'http://localhost:5000/api/admin/packages' -Method Post -Body $packageBody -Headers $headers

Write-Host "`n✓ Package created successfully!" -ForegroundColor Green
Write-Host "`nPackage Details:" -ForegroundColor Cyan
$result | ConvertTo-Json -Depth 5 | Write-Host

# List all packages
Write-Host "`nFetching all packages..." -ForegroundColor Yellow
$packages = Invoke-RestMethod -Uri 'http://localhost:5000/api/admin/packages' -Method Get -Headers $headers
Write-Host "Total packages: $($packages.Count)" -ForegroundColor Green
