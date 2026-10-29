# A/B 테스트 글꼴 중 재배포가 안 되는 브랜드 글꼴(Apple · Microsoft · Amazon)을 이 PC에서만 쓰도록 복사한다(결정 0006).
# 받아 둔 글꼴 모음(기본: %USERPROFILE%\Downloads\Brand_Font_Collection, FONT_COLLECTION으로 바꿈)에서 꺼내
# apps/tech · apps/lead의 public/fonts-local에 넣는다. 이 폴더는 .gitignore라 저장소에 올라가지 않는다. 모음이 없으면 건너뛴다.
$ErrorActionPreference = "Continue"
$front = (Resolve-Path "$PSScriptRoot\..\..").Path
$src = if ($env:FONT_COLLECTION) { $env:FONT_COLLECTION } else { Join-Path $env:USERPROFILE "Downloads\Brand_Font_Collection" }
if (-not (Test-Path $src)) { Write-Host "브랜드 글꼴 모음이 없어 건너뜁니다($src). 해당 글꼴은 프리텐다드로 보입니다."; exit 0 }

$tmp = Join-Path $env:TEMP "team4-fonts-local"
New-Item -ItemType Directory -Force $tmp | Out-Null
$files = @{}  # 저장할 이름 → 원본 경로

# Microsoft Segoe UI Variable (가변 글꼴 하나)
$seg = Join-Path $src "Microsoft\SegoeUI-VF.zip"
if (Test-Path $seg) { tar -xf $seg -C $tmp SegoeUI-VF.ttf; $files["SegoeUI-VF.ttf"] = Join-Path $tmp "SegoeUI-VF.ttf" }

# Amazon Ember (굵기 5개)
$amz = Join-Path $src "Amazon\Amazon_Typefaces_Complete_Font_Set_Mar2020.zip"
if (Test-Path $amz) {
  $names = "AmazonEmber_Lt.ttf", "AmazonEmber_Rg.ttf", "Amazon-Ember-Medium.ttf", "AmazonEmber_Bd.ttf", "AmazonEmber_He.ttf"
  tar -xf $amz -C $tmp ($names | ForEach-Object { "Amazon_Typefaces_Complete_Font_Set_Mar2020/Ember/$_" })
  foreach ($n in $names) { $files[$n] = Join-Path $tmp "Amazon_Typefaces_Complete_Font_Set_Mar2020\Ember\$n" }
}

# Apple SF Pro · SF Compact · New York(가변 글꼴 하나씩) · SF Mono(굵기별): DMG에서 꺼낸 글꼴이 Apple\extracted에 있을 때만
$apple = Join-Path $src "Apple\extracted"
if (Test-Path $apple) {
  $want = "SF-Pro.ttf", "SF-Compact.ttf", "NewYork.ttf", "SF-Mono-Light.otf", "SF-Mono-Regular.otf", "SF-Mono-Medium.otf", "SF-Mono-Semibold.otf", "SF-Mono-Bold.otf", "SF-Mono-Heavy.otf"
  foreach ($n in $want) { $files[$n] = Join-Path $apple $n }
}

$n = 0
foreach ($app in "tech", "lead") {
  $dst = Join-Path $front "apps\$app\public\fonts-local"
  New-Item -ItemType Directory -Force $dst | Out-Null
  foreach ($k in $files.Keys) {
    $to = Join-Path $dst $k
    if ((Test-Path $files[$k]) -and -not (Test-Path $to)) { Copy-Item -LiteralPath $files[$k] $to; $n++ }
  }
}
Write-Host "브랜드 글꼴 준비됨 (새로 복사 $n 개, 화면마다 public\fonts-local)"
