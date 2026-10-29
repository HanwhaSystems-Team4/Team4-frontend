# A/B 테스트 끄기: 화면 개발 서버 두 개(ab-tech · ab-lead 창)를 닫고, 원하면 백엔드도 멈춘다(데이터는 남는다).
$front = (Resolve-Path "$PSScriptRoot\..\..").Path
$back = if ($env:C1A15_DIR) { $env:C1A15_DIR } else { Join-Path (Split-Path $front -Parent) "c1a15-maint-guide" }
foreach ($t in "ab-tech", "ab-lead") {
  taskkill /F /T /FI "WINDOWTITLE eq $t*" *> $null
}
Write-Host "화면(5181 · 5182)을 껐습니다."
$a = Read-Host "백엔드(docker)도 멈출까요? (y/N)"
if ($a -match '^[yY]') {
  Push-Location $back
  docker compose stop
  Pop-Location
  Write-Host "백엔드를 멈췄습니다. 다음 실행 때 그대로 다시 켜집니다."
}
Read-Host "엔터를 누르면 닫힙니다"
