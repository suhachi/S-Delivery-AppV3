# Generate code volumes for multiple projects
# Windows PowerShell 5.1 compatible

param(
    [string[]]$ProjectPaths = @(
        "D:\projectsing\S-Delivery-App",
        "D:\projectsing\hyun-poong\simple-delivery-app"
    ),
    [int]$VolumeCount = 10,
    [string]$OutputRootFolder = "multi-project-code-volumes",
    [string[]]$ExcludeDirs = @(
        "node_modules","dist","build",".git",".vscode",".pnpm-store",
        "coverage",".cache",".next","out","generated-code-docs","project-code-docs","docs"
    ),
    [switch]$IncludeDocs,
    [switch]$IncludeLocks
)

$ErrorActionPreference = "Stop"

Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host "Multi-Project Code Volume Generator" -ForegroundColor Green
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host ""

# Extensions to include
$includeExts = @(
    ".ts", ".tsx", ".js", ".jsx",
    ".cjs", ".mjs",
    ".json", ".html",
    ".css", ".scss", ".less",
    ".ps1", ".psm1", ".psd1",
    ".yaml", ".yml",
    ".rules"
)
if ($IncludeDocs) { $includeExts += ".md" }

# Binary extensions to exclude
$excludeBinaryExts = @(
    ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".webp", ".bmp", ".tiff",
    ".woff", ".woff2", ".ttf", ".eot",
    ".mp4", ".mp3", ".webm"
)

# Names to exclude explicitly
$excludeFilesByName = @()
if (-not $IncludeLocks) {
    $excludeFilesByName += @("pnpm-lock.yaml", "yarn.lock", "package-lock.json")
}

function Get-LanguageFromExtension([string]$ext) {
    switch ($ext.ToLower()) {
        ".ts"   { "typescript" }
        ".tsx"  { "typescript" }
        ".js"   { "javascript" }
        ".jsx"  { "javascript" }
        ".cjs"  { "javascript" }
        ".mjs"  { "javascript" }
        ".json" { "json" }
        ".html" { "html" }
        ".css"  { "css" }
        ".scss" { "scss" }
        ".less" { "less" }
        ".ps1"  { "powershell" }
        ".psm1" { "powershell" }
        ".psd1" { "powershell" }
        ".yaml" { "yaml" }
        ".yml"  { "yaml" }
        ".rules" { "" }
        ".md"   { "markdown" }
        default  { "" }
    }
}

function Get-SafeFolderName([string]$path) {
    $basename = Split-Path -Leaf $path
    return $basename -replace '[\\/:*?"<>|]', '_'
}

function Process-Project([string]$projectPath, [string]$outputRoot, [int]$volCount) {
    Write-Host ""
    Write-Host "-----------------------------------------------------------" -ForegroundColor Yellow
    Write-Host "Processing Project: $projectPath" -ForegroundColor Green
    Write-Host "-----------------------------------------------------------" -ForegroundColor Yellow

    if (-not (Test-Path $projectPath)) {
        Write-Host "ERROR: Project path does not exist: $projectPath" -ForegroundColor Red
        return
    }

    $safeName = Get-SafeFolderName $projectPath
    $projectOutputFolder = Join-Path $outputRoot $safeName

    # Normalize path
    if (-not $projectPath.EndsWith('\')) { $projectPath = $projectPath + '\' }

    # Collect files
    $files = Get-ChildItem -Path $projectPath -Recurse -File -ErrorAction SilentlyContinue |
        Where-Object {
            # Exclude directories
            $excludeHit = $false
            foreach ($dir in $ExcludeDirs) {
                if ($_.FullName -match "\\$([regex]::Escape($dir))(\\|$)") { $excludeHit = $true; break }
            }
            if ($excludeHit) { return $false }
            # Include only selected extensions and exclude binaries
            ($includeExts -contains $_.Extension.ToLower()) -and -not ($excludeBinaryExts -contains $_.Extension.ToLower())
        } |
        Where-Object { $excludeFilesByName -notcontains $_.Name } |
        Sort-Object FullName

    if ($files.Count -eq 0) {
        Write-Host "WARNING: No files found in project: $projectPath" -ForegroundColor Yellow
        return
    }

    Write-Host "Found $($files.Count) files to include." -ForegroundColor Cyan

    # Ensure output folder fresh
    if (Test-Path $projectOutputFolder) {
        Remove-Item $projectOutputFolder -Recurse -Force
    }
    New-Item -ItemType Directory -Path $projectOutputFolder | Out-Null

    # Prepare volume containers with greedy size balancing
    $volumes = @()
    for ($i = 1; $i -le $volCount; $i++) {
        $volumes += [PSCustomObject]@{ Index = $i; Files = New-Object System.Collections.Generic.List[object]; Size = [long]0 }
    }

    # Sort files by size descending for better balancing
    $filesInfo = $files | Select-Object FullName, Length, Extension
    $filesSorted = $filesInfo | Sort-Object Length -Descending

    foreach ($f in $filesSorted) {
        # pick the volume with the smallest current size
        $minIdx = 0
        $minSize = [long]::MaxValue
        for ($i = 0; $i -lt $volumes.Count; $i++) {
            if ($volumes[$i].Size -lt $minSize) { $minSize = $volumes[$i].Size; $minIdx = $i }
        }
        $volumes[$minIdx].Files.Add($f)
        $volumes[$minIdx].Size += [long]$f.Length
    }

    # Write each volume markdown
    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'

    foreach ($v in $volumes) {
        $indexStr = "{0:D2}" -f $v.Index
        $outFile = Join-Path $projectOutputFolder "$indexStr-PROJECT_CODE.md"
        $md = New-Object System.Collections.Generic.List[string]

        $md.Add("# $safeName - Volume $indexStr")
        $md.Add("")
        $md.Add("Generated: $timestamp")
        $md.Add("Project Path: $projectPath")
        $md.Add("")
        $md.Add("- Files in volume: $($v.Files.Count)")
        $md.Add("- Approx size: $([Math]::Round($v.Size / 1MB, 2)) MB")
        $md.Add("")
        $md.Add("---")
        $md.Add("")

        foreach ($fi in $v.Files | Sort-Object FullName) {
            $relative = $fi.FullName.Replace($projectPath, "")
            $lang = Get-LanguageFromExtension $fi.Extension
            $md.Add("## File: $relative")
            $md.Add("")
            try {
                $content = Get-Content -Path $fi.FullName -Raw -Encoding UTF8
                $md.Add('```' + $lang)
                $md.Add($content)
                $md.Add('```')
            } catch {
                $md.Add("Warning: Cannot read file - $($_.Exception.Message)")
            }
            $md.Add("")
            $md.Add("---")
            $md.Add("")
        }

        $md | Out-File -FilePath $outFile -Encoding UTF8
        Write-Host "  Created: $outFile" -ForegroundColor Green
    }

    # Write index file for this project
    $indexMd = New-Object System.Collections.Generic.List[string]
    $indexMd.Add("# $safeName - Code Volumes Index")
    $indexMd.Add("")
    $indexMd.Add("Generated: $timestamp")
    $indexMd.Add("Project Path: $projectPath")
    $indexMd.Add("")
    $indexMd.Add("## Volumes")
    $indexMd.Add("")
    foreach ($v in ($volumes | Sort-Object Index)) {
        $indexStr = "{0:D2}" -f $v.Index
        $indexMd.Add("- [$indexStr-PROJECT_CODE.md](./$indexStr-PROJECT_CODE.md) — Files: $($v.Files.Count), Size: $([Math]::Round($v.Size / 1MB, 2)) MB")
    }
    $indexMd.Add("")
    $indexMd.Add("## Totals")
    $indexMd.Add("")
    $totalFiles = ($volumes | ForEach-Object { $_.Files.Count } | Measure-Object -Sum).Sum
    $totalSize = ($volumes | ForEach-Object { $_.Size } | Measure-Object -Sum).Sum
    $indexMd.Add("- Total Files: $totalFiles")
    $indexMd.Add("- Total Size: $([Math]::Round($totalSize / 1MB, 2)) MB")
    $indexMd.Add("- Volume Count: $volCount")

    $indexFile = Join-Path $projectOutputFolder "00-INDEX.md"
    $indexMd | Out-File -FilePath $indexFile -Encoding UTF8
    Write-Host "  Index written: $indexFile" -ForegroundColor Cyan
    Write-Host ""
}

# Ensure root output folder exists
if (Test-Path $OutputRootFolder) {
    Remove-Item $OutputRootFolder -Recurse -Force
}
New-Item -ItemType Directory -Path $OutputRootFolder | Out-Null

# Process each project
foreach ($proj in $ProjectPaths) {
    Process-Project -projectPath $proj -outputRoot $OutputRootFolder -volCount $VolumeCount
}

# Write master index
$masterIndexMd = New-Object System.Collections.Generic.List[string]
$masterTimestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
$masterIndexMd.Add("# Multi-Project Code Volumes - Master Index")
$masterIndexMd.Add("")
$masterIndexMd.Add("Generated: $masterTimestamp")
$masterIndexMd.Add("")
$masterIndexMd.Add("## Projects")
$masterIndexMd.Add("")

foreach ($proj in $ProjectPaths) {
    $safeName = Get-SafeFolderName $proj
    $projectFolder = Join-Path $OutputRootFolder $safeName
    if (Test-Path $projectFolder) {
        $masterIndexMd.Add("### $safeName")
        $masterIndexMd.Add("")
        $masterIndexMd.Add("Path: ``$proj``")
        $masterIndexMd.Add("")
        $masterIndexMd.Add("Index: [$safeName/00-INDEX.md](./$safeName/00-INDEX.md)")
        $masterIndexMd.Add("")
    }
}

$masterIndexFile = Join-Path $OutputRootFolder "00-MASTER-INDEX.md"
$masterIndexMd | Out-File -FilePath $masterIndexFile -Encoding UTF8

Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host "All projects processed!" -ForegroundColor Green
Write-Host "Master Index: $masterIndexFile" -ForegroundColor Cyan
Write-Host "Output Folder: $OutputRootFolder" -ForegroundColor Cyan
Write-Host "===========================================================" -ForegroundColor Cyan
