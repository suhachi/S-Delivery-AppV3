# Generate a single Markdown file with the project's source code
# Windows PowerShell 5.1 compatible

param(
    [string]$RootPath = (Get-Location).Path,
    [string]$OutputFile = "PROJECT_CODE.md",
    [string[]]$ExcludeDirs = @(
        "node_modules","dist","build",".git",".vscode",".pnpm-store",
        "coverage",".cache",".next","out","generated-code-docs","project-code-docs","docs"
    ),
    [switch]$IncludeDocs
)

$ErrorActionPreference = "Stop"

# Normalize root path to have trailing backslash
if (-not $RootPath.EndsWith('\')) { $RootPath = $RootPath + '\' }

Write-Host "Generating single Markdown with project code..." -ForegroundColor Green
Write-Host "Root: $RootPath" -ForegroundColor Cyan

# Extensions to include (add .md only if IncludeDocs)
$includeExts = @(
    ".ts", ".tsx", ".js", ".jsx",
    ".css", ".scss", ".json", ".html",
    ".cjs", ".mjs", ".ps1", ".yaml", ".yml", ".rules"
)
if ($IncludeDocs) { $includeExts += ".md" }

# Names to exclude explicitly (huge or non-source files)
$excludeFilesByName = @(
    "pnpm-lock.yaml", "yarn.lock", "package-lock.json"
)

function Get-LanguageFromExtension([string]$ext) {
    switch ($ext.ToLower()) {
        ".ts"   { "typescript" }
        ".tsx"  { "typescript" }
        ".js"   { "javascript" }
        ".jsx"  { "javascript" }
        ".css"  { "css" }
        ".scss" { "scss" }
        ".json" { "json" }
        ".html" { "html" }
        ".cjs"  { "javascript" }
        ".mjs"  { "javascript" }
        ".ps1"  { "powershell" }
        ".yaml" { "yaml" }
        ".yml"  { "yaml" }
        ".rules" { "" }
        default  { "" }
    }
}

# Collect files
$files = Get-ChildItem -Path $RootPath -Recurse -File |
    Where-Object {
        # Exclude directories
        $excludeHit = $false
        foreach ($dir in $ExcludeDirs) {
            if ($_.FullName -match "\\$([regex]::Escape($dir))(\\|$)") { $excludeHit = $true; break }
        }
        if ($excludeHit) { return $false }
        # Include only selected extensions
        $includeExts -contains $_.Extension.ToLower()
    } |
    Where-Object { $excludeFilesByName -notcontains $_.Name } |
    Sort-Object FullName

Write-Host "Found $($files.Count) files to include." -ForegroundColor Yellow

# Prepare Markdown content
$md = New-Object System.Collections.Generic.List[string]
$timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
$md.Add("# Project Code Dump")
$md.Add("")
$md.Add("Generated: $timestamp")
$md.Add("Root: $RootPath")
$md.Add("")
$md.Add("- Total files: $($files.Count)")
$md.Add("")
$md.Add("---")
$md.Add("")

foreach ($file in $files) {
    $relative = $file.FullName.Replace($RootPath, "")
    $lang = Get-LanguageFromExtension $file.Extension
    $md.Add("## File: $relative")
    $md.Add("")
    try {
        $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
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

# Write to output file at root
$outPath = Join-Path $RootPath $OutputFile
$md | Out-File -FilePath $outPath -Encoding UTF8

Write-Host "Done. Output: $outPath" -ForegroundColor Green
