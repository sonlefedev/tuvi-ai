# cap-nhat.ps1 — Tu dong tim file zip moi nhat trong Downloads / D:\download, giai nen va push len GitHub/Netlify
$dirs = @("$env:USERPROFILE\Downloads", "D:\download", "D:\Downloads") | Where-Object { Test-Path $_ }
$zip = $dirs | ForEach-Object { Get-ChildItem -Path $_ -Filter "tuvi-ai*.zip" -ErrorAction SilentlyContinue } | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if (-not $zip) {
    Write-Host "Khong tim thay file tuvi-ai*.zip nao trong thu muc tai ve!" -ForegroundColor Red
    exit 1
}
Write-Host "Dang cap nhat tu: $($zip.FullName)" -ForegroundColor Cyan
Expand-Archive -Path $zip.FullName -DestinationPath $PSScriptRoot -Force
Set-Location $PSScriptRoot
git add .
git commit -m "Auto update from $($zip.Name)"
git push
Write-Host "Da day ban cap nhat len Netlify thanh cong!" -ForegroundColor Green
