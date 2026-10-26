# A/B 테스트 한 번에 켜기: 백엔드(docker compose) → 정비자 · 파트장 화면(A/B 모드) → 브라우저.
# AB테스트_실행.bat이 부른다. 백엔드 레포는 이 레포 옆 폴더(..\c1a15-maint-guide)를 기본으로 쓰고, C1A15_DIR로 바꿀 수 있다.
$ErrorActionPreference = "Continue"
$front = (Resolve-Path "$PSScriptRoot\..\..").Path
$back = if ($env:C1A15_DIR) { $env:C1A15_DIR } else { Join-Path (Split-Path $front -Parent) "c1a15-maint-guide" }

function Step($t) { Write-Host ""; Write-Host "== $t" -ForegroundColor Cyan }
function Fail($t) { Write-Host ""; Write-Host "[실패] $t" -ForegroundColor Red; Read-Host "엔터를 누르면 닫힙니다"; exit 1 }
# Vite는 localhost를 IPv6(::1)로만 열 때가 있어 두 주소를 다 본다
function PortOpen($p) { foreach ($h in "127.0.0.1", "::1") { try { $c = New-Object Net.Sockets.TcpClient($h, $p); $c.Close(); return $true } catch {} }; $false }
function WaitPort($p, $sec) { for ($i = 0; $i -lt $sec; $i++) { if (PortOpen $p) { return $true }; Start-Sleep 1 }; $false }

Step "1/4 Docker 확인"
docker info *> $null
if ($LASTEXITCODE -ne 0) {
  $dd = "$env:ProgramFiles\Docker\Docker\Docker Desktop.exe"
  if (-not (Test-Path $dd)) { Fail "Docker Desktop이 없습니다. 설치 후 다시 실행하세요." }
  Write-Host "Docker Desktop을 켜는 중입니다(최대 2분)..."
  Start-Process $dd
  for ($i = 0; $i -lt 120; $i++) { Start-Sleep 1; docker info *> $null; if ($LASTEXITCODE -eq 0) { break } }
  if ($LASTEXITCODE -ne 0) { Fail "Docker Desktop이 켜지지 않았습니다." }
}
Write-Host "Docker 준비됨"

Step "2/4 백엔드 켜기 ($back)"
if (-not (Test-Path (Join-Path $back "docker-compose.yml"))) { Fail "백엔드 폴더를 찾지 못했습니다: $back  (C1A15_DIR 환경변수로 위치를 알려 주세요)" }
Push-Location $back
$hasApi = docker compose ps -a -q api 2>$null
if (-not $hasApi) {
  # 처음 한 번: db → init(적재) → api → web 전체를 만든다
  Write-Host "처음 실행이라 백엔드 전체를 만듭니다(몇 분 걸릴 수 있습니다)..."
  docker compose up -d --build --wait web
} else {
  # 이미 만든 적 있음: init은 로그인 기록이 있으면 실패하므로 건너뛰고 db · api · web만 켠다
  docker compose up -d --wait db
  docker compose up -d --no-deps api web
}
Pop-Location
if (-not (WaitPort 8081 60)) { Fail "백엔드(127.0.0.1:8081)가 열리지 않았습니다. Docker Desktop에서 c1a15-maint-guide 로그를 확인하세요." }
Write-Host "백엔드 준비됨 (정비자 8081 · 파트장 8082)"

Step "3/4 화면 켜기 (A/B 모드)"
Push-Location $front
if (-not (Test-Path "node_modules")) { Write-Host "처음 한 번 npm install..."; npm install }
foreach ($app in @(@{ name = "tech"; port = 5181 }, @{ name = "lead"; port = 5182 })) {
  if (PortOpen $app.port) {
    Write-Host "$($app.name) 화면이 이미 $($app.port) 포트에서 돌고 있습니다. 후보 전환 막대가 안 보이면 AB테스트_종료.bat 후 다시 실행하세요."
    continue
  }
  # 창 제목 'ab-tech' · 'ab-lead'로 띄워 종료 bat이 찾을 수 있게 한다
  Start-Process cmd -ArgumentList "/c title ab-$($app.name) && set VITE_AB_TEST=1&& npm run dev:$($app.name)" -WorkingDirectory $front -WindowStyle Minimized
}
Pop-Location
if (-not (WaitPort 5181 60)) { Fail "정비자 화면(5181)이 켜지지 않았습니다. 작업 표시줄의 ab-tech 창을 확인하세요." }
if (-not (WaitPort 5182 60)) { Fail "파트장 화면(5182)이 켜지지 않았습니다. 작업 표시줄의 ab-lead 창을 확인하세요." }

Step "4/4 브라우저 열기"
Start-Process "http://localhost:5181/?v=a"
Start-Process "http://localhost:5182/?v=a"

Write-Host ""
Write-Host "준비 끝! 화면 위쪽 막대에서 A · B · C · D 후보를 바꿔 가며 보세요." -ForegroundColor Green
Write-Host "  E 조장님 원본(c1a15-maint-guide 그대로): 막대의 'E' 또는 http://127.0.0.1:8081 · :8082 (따로 로그인)"
Write-Host "  정비자 http://localhost:5181  (아이디 tech.kim)"
Write-Host "  파트장 http://localhost:5182  (아이디 lead.park)"
Write-Host "  비밀번호는 백엔드 폴더 .env 의 C1A15_TECH_PASSWORD · C1A15_LEAD_PASSWORD"
Write-Host "  새 테스트 알람: AB테스트_알람만들기.bat  ·  끄기: AB테스트_종료.bat"
Write-Host "  백엔드 없이 화면만 비교: http://localhost:5181/preview.html · http://localhost:5182/preview.html"
Write-Host ""
Read-Host "엔터를 누르면 이 창만 닫힙니다(화면은 계속 켜져 있습니다)"
