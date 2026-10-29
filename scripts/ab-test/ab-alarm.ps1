# 테스트 알람 하나 만들기(같은 시나리오를 후보마다 반복해 비교한다). 인자로 시나리오를 줄 수 있다: DEMO-01 ~ DEMO-10.
param([string]$scenario = "")
$front = (Resolve-Path "$PSScriptRoot\..\..").Path
$back = if ($env:C1A15_DIR) { $env:C1A15_DIR } else { Join-Path (Split-Path $front -Parent) "c1a15-maint-guide" }
if (-not $scenario) {
  $in = Read-Host "시나리오 번호(1~10, 엔터 = 1)"
  $n = if ($in -match '^\d+$' -and [int]$in -ge 1 -and [int]$in -le 10) { [int]$in } else { 1 }
  $scenario = "DEMO-{0:D2}" -f $n
}
Push-Location $back
docker compose exec api python -m c1a15.alarms $scenario
$ok = $LASTEXITCODE -eq 0
Pop-Location
if ($ok) { Write-Host "$scenario 알람을 만들었습니다. 정비자 화면 홈(5초 안에)에 새 알람이 보입니다." -ForegroundColor Green }
else { Write-Host "알람을 만들지 못했습니다. 먼저 AB테스트_실행.bat으로 백엔드를 켜 주세요." -ForegroundColor Red }
Read-Host "엔터를 누르면 닫힙니다"
