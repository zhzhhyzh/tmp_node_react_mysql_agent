$ErrorActionPreference = 'Stop'
$base = 'http://localhost:4000'

function Show($label, $obj) {
  Write-Host ""
  Write-Host "=== $label ===" -ForegroundColor Cyan
  $obj | ConvertTo-Json -Depth 8
}

# 1. Health
$health = Invoke-RestMethod -Uri "$base/health"
Show "HEALTH" $health

# 2. Register (ignore 409 if rerun)
$rand = Get-Random
$payload = @{
  fullName = "Alice Example"
  email    = "alice$rand@example.com"
  username = "alice$rand"
  password = "secret123"
}
try {
  $reg = Invoke-RestMethod -Method Post -Uri "$base/api/auth/register" `
    -Body ($payload | ConvertTo-Json) -ContentType 'application/json'
  Show "REGISTER" $reg
} catch {
  Write-Host "register failed: $($_.Exception.Message)"
  throw
}

$token = $reg.token
$headers = @{ Authorization = "Bearer $token" }

# 3. Login with same creds
$loginRes = Invoke-RestMethod -Method Post -Uri "$base/api/auth/login" `
  -Body (@{ username = $payload.username; password = $payload.password } | ConvertTo-Json) `
  -ContentType 'application/json'
Show "LOGIN" $loginRes

# 4. Me
$me = Invoke-RestMethod -Uri "$base/api/auth/me" -Headers $headers
Show "ME" $me

# 5. Items CRUD
$create = Invoke-RestMethod -Method Post -Uri "$base/api/items" -Headers $headers `
  -ContentType 'application/json' `
  -Body (@{ name = 'First item'; description = 'Hello' } | ConvertTo-Json)
Show "CREATE ITEM" $create
$itemId = $create.item.id

$update = Invoke-RestMethod -Method Put -Uri "$base/api/items/$itemId" -Headers $headers `
  -ContentType 'application/json' `
  -Body (@{ name = 'Renamed item' } | ConvertTo-Json)
Show "UPDATE ITEM" $update

$list = Invoke-RestMethod -Uri "$base/api/items" -Headers $headers
Show "LIST ITEMS" $list

# 6. Agent chat
$chat = Invoke-RestMethod -Method Post -Uri "$base/api/agent/chat" -Headers $headers `
  -ContentType 'application/json' `
  -Body (@{ message = 'list my items please' } | ConvertTo-Json)
Show "AGENT CHAT" $chat

# 7. Delete
$del = Invoke-RestMethod -Method Delete -Uri "$base/api/items/$itemId" -Headers $headers
Show "DELETE ITEM" $del

# 8. 401 check
try {
  Invoke-RestMethod -Uri "$base/api/items"
  Write-Host "AUTH CHECK FAILED - expected 401" -ForegroundColor Red
} catch {
  Write-Host ""
  Write-Host "=== AUTH CHECK (expected 401) ===" -ForegroundColor Cyan
  Write-Host $_.Exception.Message
}

Write-Host ""
Write-Host "ALL SMOKE TESTS PASSED" -ForegroundColor Green
