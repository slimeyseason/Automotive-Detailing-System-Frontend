$ErrorActionPreference = 'SilentlyContinue'

$port = 5173
$owningProcesses = Get-NetTCPConnection -LocalPort $port -State Listen | Select-Object -ExpandProperty OwningProcess -Unique

if ($owningProcesses) {
  Write-Host "Stopping process(es) on port ${port}: $($owningProcesses -join ', ')"
  foreach ($processId in $owningProcesses) {
    Stop-Process -Id $processId -Force
  }
  Start-Sleep -Milliseconds 400
}

Write-Host "Starting Vite on fixed port $port..."
npm run dev -- --port $port --strictPort
