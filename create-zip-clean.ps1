# สคริปต์สำหรับสร้าง ZIP ไฟล์โปรเจค
# วันที่: 10 สิงหาคม 2568

$OutputName = "paw-finder-project"
$ProjectPath = Get-Location

$ParentPath = Split-Path $ProjectPath -Parent
$ZipPath = Join-Path $ParentPath "$OutputName.zip"

Write-Host "📂 Project Path: $ProjectPath" -ForegroundColor Blue
Write-Host "📦 Zip Path: $ZipPath" -ForegroundColor Blue

# ลบ zip เก่า (ถ้ามี)
if (Test-Path $ZipPath) {
    Remove-Item $ZipPath -Force
    Write-Host "🗑️ ลบ zip เก่าแล้ว" -ForegroundColor Yellow
}

# รายการไฟล์/โฟลเดอร์ที่ต้องการรวม
$IncludeItems = @(
    "src",
    "public", 
    "supabase",
    "package.json",
    "package-lock.json",
    ".env",
    "*.config.js",
    "*.config.ts", 
    "*.json",
    "index.html",
    ".gitignore",
    "README.md"
)

# สร้างโฟลเดอร์ temp
$TempPath = Join-Path $env:TEMP "paw-finder-temp"
if (Test-Path $TempPath) {
    Remove-Item $TempPath -Recurse -Force
}
New-Item -ItemType Directory -Path $TempPath | Out-Null

Write-Host "📋 กำลังคัดลอกไฟล์ที่จำเป็น..." -ForegroundColor Yellow

# คัดลอกไฟล์ที่ต้องการ
foreach ($Item in $IncludeItems) {
    $SourcePath = Join-Path $ProjectPath $Item
    
    if ($Item.Contains("*")) {
        # Handle wildcard patterns
        Get-ChildItem $SourcePath -ErrorAction SilentlyContinue | ForEach-Object {
            $DestPath = Join-Path $TempPath $_.Name
            Copy-Item $_.FullName $DestPath -Force
            Write-Host "  ✅ $($_.Name)" -ForegroundColor Green
        }
    } elseif (Test-Path $SourcePath) {
        $DestPath = Join-Path $TempPath $Item
        if (Test-Path $SourcePath -PathType Container) {
            Copy-Item $SourcePath $DestPath -Recurse -Force
        } else {
            Copy-Item $SourcePath $DestPath -Force
        }
        Write-Host "  ✅ $Item" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️ ไม่พบ: $Item" -ForegroundColor Yellow
    }
}

# ตรวจสอบและคัดลอกไฟล์ deno.d.ts (ถ้ามี)
$DenoTypesPath = "supabase\functions\create-storage\deno.d.ts"
$SourceDenoTypes = Join-Path $ProjectPath $DenoTypesPath
if (Test-Path $SourceDenoTypes) {
    $DestDenoTypesDir = Join-Path $TempPath "supabase\functions\create-storage"
    if (!(Test-Path $DestDenoTypesDir)) {
        New-Item -ItemType Directory -Path $DestDenoTypesDir -Force | Out-Null
    }
    $DestDenoTypes = Join-Path $DestDenoTypesDir "deno.d.ts"
    Copy-Item $SourceDenoTypes $DestDenoTypes -Force
    Write-Host "  ✅ deno.d.ts (Deno type definitions)" -ForegroundColor Green
}

# สร้าง zip
Write-Host "📦 กำลังสร้าง zip file..." -ForegroundColor Yellow
Compress-Archive -Path "$TempPath\*" -DestinationPath $ZipPath -Force

# ลบโฟลเดอร์ temp
Remove-Item $TempPath -Recurse -Force

# แสดงผลลัพธ์
$ZipSize = (Get-Item $ZipPath).Length
$SizeMB = [math]::Round($ZipSize / 1MB, 2)

Write-Host "`n🎉 สร้าง zip เสร็จแล้ว!" -ForegroundColor Green
Write-Host "📦 ไฟล์: $ZipPath" -ForegroundColor Cyan
Write-Host "📏 ขนาด: $SizeMB MB" -ForegroundColor Cyan

Write-Host "`n💡 วิธีใช้งาน zip นี้:" -ForegroundColor Yellow
Write-Host "  1. แตก zip" -ForegroundColor White
Write-Host "  2. cd paw-finder-main" -ForegroundColor White  
Write-Host "  3. npm install" -ForegroundColor White
Write-Host "  4. ตั้งค่า .env ด้วย Supabase credentials" -ForegroundColor White
Write-Host "  5. npm run dev" -ForegroundColor White

Write-Host "`n📋 ไฟล์สำคัญที่รวมไว้:" -ForegroundColor Cyan
Write-Host "  ✅ deno.d.ts - Type definitions สำหรับ Edge Functions" -ForegroundColor Green
Write-Host "  ✅ .env - ไฟล์ environment variables" -ForegroundColor Green
Write-Host "  ✅ supabase/ - Migration files และ Edge Functions" -ForegroundColor Green
