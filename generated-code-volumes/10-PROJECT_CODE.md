# Project Code Volume 10

Generated: 2025-12-24 14:30:56
Root: D:\projectsing\S-Delivery-AppV3\

- Files in volume: 21
- Approx size: 0.08 MB

---

## File: functions\src\utils\dateKST.ts

```typescript
/**
 * KST Date Helpers
 */

export function getYesterdayKSTRange() {
    const now = new Date();
    // UTC+9
    const kstOffset = 9 * 60 * 60 * 1000;
    const nowKST = new Date(now.getTime() + kstOffset);

    // Yesterday
    const yesterdayKST = new Date(nowKST);
    yesterdayKST.setDate(yesterdayKST.getDate() - 1);

    const yyyy = yesterdayKST.getFullYear();
    const mm = String(yesterdayKST.getMonth() + 1).padStart(2, '0');
    const dd = String(yesterdayKST.getDate()).padStart(2, '0');
    const dateKey = `${yyyy}-${mm}-${dd}`;

    // KST Start/End
    const startKST = new Date(`${dateKey}T00:00:00+09:00`);
    const endKST = new Date(`${dateKey}T23:59:59.999+09:00`);

    return { startKST, endKST, dateKey };
}

```

---

## File: scripts\generate-multi-project-code.ps1

```powershell
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

```

---

## File: src\components\review\ReviewPreview.tsx

```typescript
import { Link } from 'react-router-dom';
import { Star, ChevronRight, User } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { useFirestoreCollection } from '../../hooks/useFirestoreCollection';
import { getAllReviewsQuery } from '../../services/reviewService';
import { Review } from '../../types/review';
import { formatDate } from '../../utils/formatDate';
import Card from '../common/Card';

export default function ReviewPreview() {
    const { store } = useStore();
    const storeId = store?.id;

    // Fetch reviews (sorted by newest First)
    const { data: reviews, loading } = useFirestoreCollection<Review>(
        storeId ? getAllReviewsQuery(storeId) : null
    );

    // Take only top 5 for preview
    const recentReviews = reviews ? reviews.slice(0, 5) : [];

    if (!storeId || loading) return null;

    if (recentReviews.length === 0) {
        return null; // hide if no reviews
    }

    return (
        <div className="container mx-auto px-4 mt-8 mb-12">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <span className="text-primary-600">💬</span>
                    <span>생생 리뷰 미리보기</span>
                </h2>
                <Link
                    to="/reviews"
                    className="text-sm text-gray-500 hover:text-primary-600 flex items-center gap-1"
                >
                    더보기 <ChevronRight className="w-4 h-4" />
                </Link>
            </div>

            <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 snap-x snap-mandatory">
                {recentReviews.map((review) => (
                    <div key={review.id} className="min-w-[280px] w-[280px] snap-start">
                        <Card
                            className="h-full flex flex-col p-4 bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group overflow-hidden"
                            padding="none"
                        >
                            {/* Image if available */}
                            {review.images && review.images.length > 0 && (
                                <div className="relative w-full h-32 overflow-hidden bg-gray-100">
                                    <img
                                        src={review.images[0]}
                                        alt="Review"
                                        className="w-full h-full object-cover transform transition-all duration-500 group-hover:scale-110 group-hover:brightness-105"
                                    />
                                </div>
                            )}

                            <div className="p-4 flex-1 flex flex-col">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                            <User className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-gray-900 truncate max-w-[100px]">
                                                {review.userDisplayName}
                                            </span>
                                            <div className="flex items-center">
                                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                <span className="text-xs font-bold ml-1">{review.rating}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
                                </div>

                                <div className="flex-1">
                                    <p className="text-sm text-gray-600 line-clamp-3 break-words">
                                        {review.comment}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>
                ))}
            </div>
        </div>
    );
}

```

---

## File: src\components\ui\badge.tsx

```typescript
import * as React from "react";
import { Slot } from "@radix-ui/react-slot@1.1.2";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";

import { cn } from "./utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };

```

---

## File: src\components\ui\breadcrumb.tsx

```typescript
import * as React from "react";
import { Slot } from "@radix-ui/react-slot@1.1.2";
import { ChevronRight, MoreHorizontal } from "lucide-react@0.487.0";

import { cn } from "./utils";

function Breadcrumb({ ...props }: React.ComponentProps<"nav">) {
  return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />;
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        "text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm break-words sm:gap-2.5",
        className,
      )}
      {...props}
    />
  );
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("inline-flex items-center gap-1.5", className)}
      {...props}
    />
  );
}

function BreadcrumbLink({
  asChild,
  className,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot : "a";

  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn("hover:text-foreground transition-colors", className)}
      {...props}
    />
  );
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn("text-foreground font-normal", className)}
      {...props}
    />
  );
}

function BreadcrumbSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn("[&>svg]:size-3.5", className)}
      {...props}
    >
      {children ?? <ChevronRight />}
    </li>
  );
}

function BreadcrumbEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontal className="size-4" />
      <span className="sr-only">More</span>
    </span>
  );
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};

```

---

## File: src\components\ui\carousel.tsx

```typescript
"use client";

import * as React from "react";
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react@8.6.0";
import { ArrowLeft, ArrowRight } from "lucide-react@0.487.0";

import { cn } from "./utils";
import { Button } from "./button";

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

type CarouselProps = {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: "horizontal" | "vertical";
  setApi?: (api: CarouselApi) => void;
};

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
} & CarouselProps;

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }

  return context;
}

function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & CarouselProps) {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y",
    },
    plugins,
  );
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  const onSelect = React.useCallback((api: CarouselApi) => {
    if (!api) return;
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, []);

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const scrollNext = React.useCallback(() => {
    api?.scrollNext();
  }, [api]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext],
  );

  React.useEffect(() => {
    if (!api || !setApi) return;
    setApi(api);
  }, [api, setApi]);

  React.useEffect(() => {
    if (!api) return;
    onSelect(api);
    api.on("reInit", onSelect);
    api.on("select", onSelect);

    return () => {
      api?.off("select", onSelect);
    };
  }, [api, onSelect]);

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api: api,
        opts,
        orientation:
          orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}
    >
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn("relative", className)}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

function CarouselContent({ className, ...props }: React.ComponentProps<"div">) {
  const { carouselRef, orientation } = useCarousel();

  return (
    <div
      ref={carouselRef}
      className="overflow-hidden"
      data-slot="carousel-content"
    >
      <div
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className,
        )}
        {...props}
      />
    </div>
  );
}

function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
  const { orientation } = useCarousel();

  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className,
      )}
      {...props}
    />
  );
}

function CarouselPrevious({
  className,
  variant = "outline",
  size = "icon",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();

  return (
    <Button
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      className={cn(
        "absolute size-8 rounded-full",
        orientation === "horizontal"
          ? "top-1/2 -left-12 -translate-y-1/2"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        className,
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ArrowLeft />
      <span className="sr-only">Previous slide</span>
    </Button>
  );
}

function CarouselNext({
  className,
  variant = "outline",
  size = "icon",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollNext, canScrollNext } = useCarousel();

  return (
    <Button
      data-slot="carousel-next"
      variant={variant}
      size={size}
      className={cn(
        "absolute size-8 rounded-full",
        orientation === "horizontal"
          ? "top-1/2 -right-12 -translate-y-1/2"
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className,
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ArrowRight />
      <span className="sr-only">Next slide</span>
    </Button>
  );
}

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
};

```

---

## File: src\components\ui\collapsible.tsx

```typescript
"use client";

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible@1.1.3";

function Collapsible({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />;
}

function CollapsibleTrigger({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) {
  return (
    <CollapsiblePrimitive.CollapsibleTrigger
      data-slot="collapsible-trigger"
      {...props}
    />
  );
}

function CollapsibleContent({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) {
  return (
    <CollapsiblePrimitive.CollapsibleContent
      data-slot="collapsible-content"
      {...props}
    />
  );
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent };

```

---

## File: src\components\ui\dialog.tsx

```typescript
"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog@1.1.6";
import { XIcon } from "lucide-react@0.487.0";

import { cn } from "./utils";

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className,
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
          <XIcon />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};

```

---

## File: src\components\ui\drawer.tsx

```typescript
"use client";

import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul@1.1.2";

import { cn } from "./utils";

function Drawer({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) {
  return <DrawerPrimitive.Root data-slot="drawer" {...props} />;
}

function DrawerTrigger({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

function DrawerPortal({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />;
}

function DrawerClose({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Close>) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
}

function DrawerOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
  return (
    <DrawerPrimitive.Overlay
      data-slot="drawer-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className,
      )}
      {...props}
    />
  );
}

function DrawerContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Content>) {
  return (
    <DrawerPortal data-slot="drawer-portal">
      <DrawerOverlay />
      <DrawerPrimitive.Content
        data-slot="drawer-content"
        className={cn(
          "group/drawer-content bg-background fixed z-50 flex h-auto flex-col",
          "data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:rounded-b-lg data-[vaul-drawer-direction=top]:border-b",
          "data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=bottom]:rounded-t-lg data-[vaul-drawer-direction=bottom]:border-t",
          "data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=right]:sm:max-w-sm",
          "data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:border-r data-[vaul-drawer-direction=left]:sm:max-w-sm",
          className,
        )}
        {...props}
      >
        <div className="bg-muted mx-auto mt-4 hidden h-2 w-[100px] shrink-0 rounded-full group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  );
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props}
    />
  );
}

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
}

function DrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn("text-foreground font-semibold", className)}
      {...props}
    />
  );
}

function DrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};

```

---

## File: src\components\ui\skeleton.tsx

```typescript
import { cn } from "./utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  );
}

export { Skeleton };

```

---

## File: src\components\ui\switch.tsx

```typescript
"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch@1.1.3";

import { cn } from "./utils";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-switch-background focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "bg-card dark:data-[state=unchecked]:bg-card-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block size-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };

```

---

## File: src\components\ui\tabs.tsx

```typescript
"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs@1.1.3";

import { cn } from "./utils";

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-xl p-[3px] flex",
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "data-[state=active]:bg-card dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-xl border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };

```

---

## File: src\components\ui\toggle.tsx

```typescript
"use client";

import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle@1.1.2";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";

import { cn } from "./utils";

const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium hover:bg-muted hover:text-muted-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-9 px-2 min-w-9",
        sm: "h-8 px-1.5 min-w-8",
        lg: "h-10 px-2.5 min-w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Toggle({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Toggle, toggleVariants };

```

---

## File: src\lib\firestoreExamples.ts

```typescript
/**
 * Firestore 데이터 격리 사용 예제
 * 실제 코드에서 이렇게 사용하세요
 */

import { db } from '../config/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { getMenusPath, getOrdersPath, getCouponsPath, getReviewsPath } from './firestorePaths';

/**
 * ❌ 잘못된 방법 (멀티 테넌트 미지원)
 */
export async function getBadMenus() {
  const snapshot = await getDocs(collection(db, 'menus'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * ✅ 올바른 방법 (멀티 테넌트 지원)
 */
export async function getGoodMenus(storeId: string) {
  const snapshot = await getDocs(collection(db, getMenusPath(storeId)));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * 예제 1: 메뉴 조회
 */
export async function getMenusByStore(storeId: string) {
  // ❌ const menusRef = collection(db, 'menus');
  // ✅ 
  const menusRef = collection(db, getMenusPath(storeId));
  const snapshot = await getDocs(menusRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * 예제 2: 메뉴 추가
 */
export async function addMenu(storeId: string, menuData: any) {
  // ❌ const menusRef = collection(db, 'menus');
  // ✅
  const menusRef = collection(db, getMenusPath(storeId));
  return await addDoc(menusRef, menuData);
}

/**
 * 예제 3: 주문 조회 (사용자별)
 */
export async function getUserOrders(storeId: string, userId: string) {
  // ❌ const ordersRef = collection(db, 'orders');
  // ✅
  const ordersRef = collection(db, getOrdersPath(storeId));
  const q = query(ordersRef, where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * 예제 4: 쿠폰 조회
 */
export async function getActiveCoupons(storeId: string) {
  // ❌ const couponsRef = collection(db, 'coupons');
  // ✅
  const couponsRef = collection(db, getCouponsPath(storeId));
  const q = query(couponsRef, where('active', '==', true));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * 예제 5: 리뷰 추가
 */
export async function addReview(storeId: string, reviewData: any) {
  // ❌ const reviewsRef = collection(db, 'reviews');
  // ✅
  const reviewsRef = collection(db, getReviewsPath(storeId));
  return await addDoc(reviewsRef, reviewData);
}

/**
 * 사용 예시:
 * 
 * // StoreContext에서 storeId 가져오기
 * const { storeId } = useStore();
 * 
 * // 메뉴 조회
 * const menus = await getMenusByStore(storeId);
 * 
 * // 주문 조회
 * const orders = await getUserOrders(storeId, user.uid);
 */

```

---

## File: src\lib\storeAccess.ts

```typescript
/**
 * 상점 접근 권한 관리 유틸리티
 * adminStores 컬렉션을 통해 관리자-상점 매핑 관리
 */

import { db } from './firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { AdminStore, StorePermission } from '../types/store';

/**
 * 관리자가 접근 가능한 상점 목록 조회
 */
export async function getAdminStores(adminUid: string): Promise<AdminStore[]> {
  // adminUid 유효성 검사
  if (!adminUid || typeof adminUid !== 'string') {
    console.warn('getAdminStores called with invalid adminUid:', adminUid);
    return [];
  }

  try {
    const q = query(
      collection(db, 'adminStores'),
      where('adminUid', '==', adminUid)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as AdminStore[];
  } catch (error) {
    console.error('Error in getAdminStores:', error);
    return [];
  }
}

/**
 * 특정 상점의 관리자 목록 조회
 */
export async function getStoreAdmins(storeId: string): Promise<AdminStore[]> {
  const q = query(
    collection(db, 'adminStores'),
    where('storeId', '==', storeId)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as AdminStore[];
}

/**
 * 관리자가 특정 상점에 접근 가능한지 확인
 */
export async function hasStoreAccess(
  adminUid: string,
  storeId: string
): Promise<boolean> {
  const adminStores = await getAdminStores(adminUid);
  return adminStores.some(as => as.storeId === storeId);
}

/**
 * 관리자가 특정 권한을 가지고 있는지 확인
 */
export async function hasPermission(
  adminUid: string,
  storeId: string,
  permission: StorePermission
): Promise<boolean> {
  const adminStores = await getAdminStores(adminUid);
  const adminStore = adminStores.find(as => as.storeId === storeId);
  
  if (!adminStore) return false;
  
  // owner는 모든 권한 보유
  if (adminStore.role === 'owner') return true;
  
  return adminStore.permissions.includes(permission);
}

/**
 * 관리자를 상점에 추가
 */
export async function addAdminToStore(
  adminUid: string,
  storeId: string,
  role: 'owner' | 'manager' | 'staff',
  permissions: StorePermission[]
): Promise<string> {
  const adminStoreData = {
    adminUid,
    storeId,
    role,
    permissions,
    createdAt: new Date(),
  };
  
  const docRef = await addDoc(collection(db, 'adminStores'), adminStoreData);
  return docRef.id;
}

/**
 * 상점에서 관리자 제거
 */
export async function removeAdminFromStore(adminStoreId: string): Promise<void> {
  await deleteDoc(doc(db, 'adminStores', adminStoreId));
}

/**
 * 기본 권한 세트
 */
export const DEFAULT_PERMISSIONS: Record<string, StorePermission[]> = {
  owner: [
    'manage_menus',
    'manage_orders',
    'manage_coupons',
    'manage_reviews',
    'manage_notices',
    'manage_events',
    'manage_store_settings',
    'view_analytics',
  ],
  manager: [
    'manage_menus',
    'manage_orders',
    'manage_coupons',
    'manage_reviews',
    'view_analytics',
  ],
  staff: [
    'manage_orders',
    'view_analytics',
  ],
};
```

---

## File: src\pages\admin\AdminMemberPage.tsx

```typescript
import React, { useState } from 'react';
import { Search, User as UserIcon, Phone, Mail } from 'lucide-react';
import { useFirestoreCollection } from '../../hooks/useFirestoreCollection';
import { collection, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { User } from '../../types/user';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';

export default function AdminMemberPage() {
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch all users sorted by created time (descending if possible, or just all)
    // Note: For MVP we fetch all. For production, use server-side pagination/search.
    const { data: users, loading } = useFirestoreCollection<User>(
        query(collection(db, 'users'))
    );

    const filteredUsers = users?.filter(user => {
        const term = searchTerm.toLowerCase();
        const name = user.displayName?.toLowerCase() || '';
        const email = user.email?.toLowerCase() || '';
        const phone = user.phone?.toLowerCase() || '';

        return name.includes(term) || email.includes(term) || phone.includes(term);
    }) || [];

    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar />

            <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl mb-2 font-bold text-gray-900">회원 관리</h1>
                            <p className="text-gray-600">등록된 회원을 검색하고 조회합니다.</p>
                        </div>
                    </div>

                    <Card className="mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="이름, 전화번호, 또는 이메일로 검색..."
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </Card>

                    <Card className="p-0 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">회원 정보</th>
                                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">연락처</th>
                                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">가입일</th>
                                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">상태</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={4} className="py-8 text-center text-gray-500">로딩 중...</td>
                                        </tr>
                                    ) : filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="py-8 text-center text-gray-500">
                                                {searchTerm ? '검색 결과가 없습니다.' : '등록된 회원이 없습니다.'}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                                                            <UserIcon className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">{user.displayName || '이름 없음'}</p>
                                                            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">User</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <Phone className="w-3.5 h-3.5" />
                                                            {user.phone || '-'}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <Mail className="w-3.5 h-3.5" />
                                                            {user.email}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-sm text-gray-500">
                                                    {user.createdAt?.seconds
                                                        ? new Date(user.createdAt.seconds * 1000).toLocaleDateString()
                                                        : '-'
                                                    }
                                                </td>
                                                <td className="py-4 px-6">
                                                    <Badge variant="success">활동중</Badge>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    );
}

```

---

## File: src\pages\admin\AdminReviewManagement.tsx

```typescript
import { useState } from 'react';
import { Star, Trash2, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import TopBar from '../../components/common/TopBar';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { toast } from 'sonner';
import { Review } from '../../types/review';
import { useStore } from '../../contexts/StoreContext';
import { useFirestoreCollection } from '../../hooks/useFirestoreCollection';
import { getAllReviewsQuery, updateReview, deleteReview } from '../../services/reviewService';

export default function AdminReviewManagement() {
  const { store } = useStore();
  if (!store?.id) return null;

  const { data: reviews, loading } = useFirestoreCollection<Review>(
    getAllReviewsQuery(store.id)
  );

  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const filteredReviews = (reviews || []).filter((review) => {
    if (filterStatus === 'all') return true;
    return review.status === filterStatus;
  });

  const handleApprove = async (reviewId: string) => {
    try {
      await updateReview(store.id, reviewId, { status: 'approved' });
      toast.success('리뷰가 승인되었습니다');
    } catch (error) {
      toast.error('리뷰 승인 실패');
    }
  };

  const handleReject = async (reviewId: string) => {
    try {
      await updateReview(store.id, reviewId, { status: 'rejected' });
      toast.success('리뷰가 거부되었습니다');
    } catch (error) {
      toast.error('리뷰 거부 실패');
    }
  };

  const handleDelete = async (reviewId: string, orderId: string) => {
    if (confirm('정말 이 리뷰를 삭제하시겠습니까?')) {
      try {
        await deleteReview(store.id, reviewId, orderId);
        toast.success('리뷰가 삭제되었습니다');
      } catch (error) {
        toast.error('리뷰 삭제 실패');
      }
    }
  };

  const handleReply = async (reviewId: string) => {
    if (!replyText.trim()) {
      toast.error('답글을 입력해주세요');
      return;
    }

    try {
      await updateReview(store.id, reviewId, {
        adminReply: replyText,
        status: 'approved'
      });
      setReplyText('');
      setSelectedReview(null);
      toast.success('답글이 등록되었습니다');
    } catch (error) {
      toast.error('답글 등록 실패');
    }
  };

  const getStatusBadge = (status: Review['status']) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">승인됨</Badge>;
      case 'pending':
        return <Badge variant="warning">대기중</Badge>;
      case 'rejected':
        return <Badge variant="error">거부됨</Badge>;
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
              }`}
          />
        ))}
      </div>
    );
  };

  const averageRating = (reviews || []).length > 0
    ? ((reviews || []).reduce((sum, r) => sum + r.rating, 0) / (reviews || []).length).toFixed(1)
    : '0.0';

  const totalReviews = (reviews || []).length;
  const pendingReviews = (reviews || []).filter(r => r.status === 'pending').length;
  const approvedReviews = (reviews || []).filter(r => r.status === 'approved').length;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <div className="flex-1">


        <div className="p-6 max-w-7xl mx-auto">
          {/* 통계 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">전체 리뷰</p>
                  <p className="text-3xl mt-2">{totalReviews}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">대기중</p>
                  <p className="text-3xl mt-2">{pendingReviews}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">승인됨</p>
                  <p className="text-3xl mt-2">{approvedReviews}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">평균 평점</p>
                  <p className="text-3xl mt-2">{averageRating}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* 필터 */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${filterStatus === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
            >
              전체
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-4 py-2 rounded-lg transition-colors ${filterStatus === 'pending'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
            >
              대기중 ({pendingReviews})
            </button>
            <button
              onClick={() => setFilterStatus('approved')}
              className={`px-4 py-2 rounded-lg transition-colors ${filterStatus === 'approved'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
            >
              승인됨 ({approvedReviews})
            </button>
          </div>

          {/* 리뷰 목록 */}
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <Card key={review.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-gray-900">{review.userName}</h3>
                      {renderStars(review.rating)}
                      {getStatusBadge(review.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{review.menuName}</p>
                    <p className="text-xs text-gray-500">
                      {review.createdAt instanceof Date ? review.createdAt.toLocaleDateString() : new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {review.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleApprove(review.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          승인
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleReject(review.id)}
                        >
                          거부
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleDelete(review.id, review.orderId)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{review.comment}</p>

                {/* 관리자 답글 */}
                {review.adminReply ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <p className="text-sm text-blue-900 mb-1 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      관리자 답글
                    </p>
                    <p className="text-gray-700">{review.adminReply}</p>
                  </div>
                ) : (
                  <div className="mt-4">
                    {selectedReview?.id === review.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="답글을 입력하세요..."
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleReply(review.id)}
                          >
                            답글 등록
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setSelectedReview(null);
                              setReplyText('');
                            }}
                          >
                            취소
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setSelectedReview(review)}
                      >
                        <MessageSquare className="w-4 h-4 mr-1" />
                        답글 작성
                      </Button>
                    )}
                  </div>
                )}
              </Card>
            ))}

            {filteredReviews.length === 0 && (
              <Card className="p-12 text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">표시할 리뷰가 없습니다</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

```

---

## File: src\pages\OrderDetailPage.tsx

```typescript
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, CreditCard, Clock, Package, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, PAYMENT_TYPE_LABELS, OrderStatus, Order } from '../types/order';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import ReviewModal from '../components/review/ReviewModal';
import { toast } from 'sonner';
import { useStore } from '../contexts/StoreContext';
import { useFirestoreDocument } from '../hooks/useFirestoreDocument';

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { store } = useStore();
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Fetch real order data
  // Path: stores/{storeId}/orders/{orderId}
  // useFirestoreDocument는 이제 서브컬렉션 경로 배열을 지원함
  const collectionPath = store?.id && orderId
    ? ['stores', store.id, 'orders']
    : null;
  const { data: order, loading, error } = useFirestoreDocument<Order>(
    collectionPath,
    orderId || null
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">주문 정보를 불러오는 중...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600 mb-4">
            {error ? '주문 정보를 불러오는데 실패했습니다' : '주문을 찾을 수 없습니다'}
          </p>
          <Button onClick={() => navigate('/orders')}>주문 목록으로</Button>
        </div>
      </div>
    );
  }

  // 헬퍼 함수: Firestore Timestamp 처리를 위한 toDate
  const toDate = (date: any): Date => {
    if (date?.toDate) return date.toDate();
    if (date instanceof Date) return date;
    if (typeof date === 'string') return new Date(date);
    return new Date();
  };

  // 헬퍼 함수: 사용자용 상태 라벨 변환
  const getDisplayStatus = (status: OrderStatus) => {
    switch (status) {
      case '접수': return '접수중';
      case '접수완료': return '접수확인';
      case '조리완료': return '조리 완료';
      case '포장완료': return '포장 완료';
      default: return ORDER_STATUS_LABELS[status];
    }
  };

  const statusColor = ORDER_STATUS_COLORS[order.status as OrderStatus] || ORDER_STATUS_COLORS['접수'];

  const handleReorder = () => {
    // TODO: 장바구니에 담기 로직 구현 필요 (여기서는 메시지만 표시)
    toast.success('이 기능은 준비 중입니다 (재주문)');
    // navigate('/cart');
  };

  const deliverySteps: OrderStatus[] = ['접수', '접수완료', '조리중', '배달중', '완료'];
  const pickupSteps: OrderStatus[] = ['접수', '접수완료', '조리중', '조리완료', '포장완료'];

  const isPickup = order.orderType === '포장주문';
  const statusSteps = isPickup ? pickupSteps : deliverySteps;

  const currentStepIndex = statusSteps.indexOf(order.status as OrderStatus);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/orders')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            주문 목록으로
          </button>
          <h1 className="text-3xl mb-2">
            <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              주문 상세
            </span>
          </h1>
          <p className="text-gray-600">주문번호: {order.id.slice(0, 8)}</p>
        </div>

        <div className="space-y-6">
          {/* Order Status */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${statusColor.bg}`}>
                  <Package className={`w-8 h-8 ${statusColor.text}`} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {getDisplayStatus(order.status as OrderStatus)}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {toDate(order.createdAt).toLocaleString('ko-KR')}
                  </p>
                </div>
              </div>
              <Badge
                variant={
                  order.status === '완료' || order.status === '포장완료' ? 'success' :
                    order.status === '취소' ? 'danger' :
                      order.status === '배달중' || order.status === '조리완료' ? 'secondary' :
                        'primary'
                }
                size="lg"
              >
                {getDisplayStatus(order.status as OrderStatus)}
              </Badge>
            </div>

            {/* Status Progress */}
            {order.status !== '취소' && (
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  {statusSteps.map((step, idx) => (
                    <div key={step} className="flex-1 flex flex-col items-center relative">
                      <div className={`
                        w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mb-2 transition-all relative z-10 shadow-sm
                        ${idx <= currentStepIndex ? 'gradient-primary text-white ring-2 ring-white' : 'bg-gray-100 text-gray-300'}
                      `}>
                        {idx <= currentStepIndex ? (
                          <CheckCircle2 className="w-4 h-4 sm:w-6 sm:h-6" />
                        ) : (
                          <Clock className="w-4 h-4 sm:w-6 sm:h-6" />
                        )}
                      </div>
                      <p className={`text-[10px] sm:text-xs text-center font-medium whitespace-nowrap ${idx <= currentStepIndex ? 'text-gray-900' : 'text-gray-400'}`}>
                        {getDisplayStatus(step)}
                      </p>
                      {idx < statusSteps.length - 1 && (
                        <div className={`absolute h-[2px] w-full top-4 sm:top-5 left-1/2 -z-0 ${idx < currentStepIndex ? 'bg-primary-500' : 'bg-gray-100'}`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Order Items */}
          <Card>
            <h3 className="text-xl font-bold text-gray-900 mb-4">주문 상품</h3>
            <div className="space-y-4">
              {order.items.map((item, idx) => {
                const optionsPrice = item.options?.reduce((sum, opt) => sum + opt.price, 0) || 0;
                return (
                  <div key={idx} className="flex items-start space-x-4 pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                    {item.imageUrl && (
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{item.name}</h4>
                      {item.options && item.options.length > 0 && (
                        <div className="space-y-0.5 mb-2">
                          {item.options.map((opt, optIdx) => (
                            <p key={optIdx} className="text-sm text-gray-600">
                              + {opt.name} (+{opt.price.toLocaleString()}원)
                            </p>
                          ))}
                        </div>
                      )}
                      <p className="text-sm text-gray-600">수량: {item.quantity}개</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        {((item.price + optionsPrice) * item.quantity).toLocaleString()}원
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Delivery Info */}
          <Card>
            <h3 className="text-xl font-bold text-gray-900 mb-4">배달 정보</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">배달 주소</p>
                  <p className="font-medium text-gray-900">{order.address}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">연락처</p>
                  <p className="font-medium text-gray-900">{order.phone}</p>
                </div>
              </div>
              {order.requestMessage && (
                <div className="flex items-start space-x-3">
                  <MessageSquare className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">요청사항</p>
                    <p className="font-medium text-gray-900">{order.requestMessage}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Payment Info */}
          <Card>
            <h3 className="text-xl font-bold text-gray-900 mb-4">결제 정보</h3>
            <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <CreditCard className="w-5 h-5 text-gray-400" />
                <p className="font-medium text-gray-900">
                  {order.paymentType ? PAYMENT_TYPE_LABELS[order.paymentType] : '결제 정보 없음'}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-gray-600">
                <span>상품 금액</span>
                <span>{(order.totalPrice - 3000).toLocaleString()}원</span>
              </div>
              <div className="flex items-center justify-between text-gray-600">
                <span>배달비</span>
                <span>3,000원</span>
              </div>
              <div className="flex items-center justify-between text-xl font-bold pt-3 border-t border-gray-200">
                <span>총 결제 금액</span>
                <span className="text-blue-600">{order.totalPrice.toLocaleString()}원</span>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={handleReorder}>
              재주문하기
            </Button>
            {(order.status === '완료' || order.status === '포장완료') && (
              <Button fullWidth onClick={() => setShowReviewModal(true)}>
                리뷰 작성하기
              </Button>
            )}
          </div>
        </div>
      </div>

      {showReviewModal && (
        <ReviewModal
          orderId={order.id}
          onClose={() => setShowReviewModal(false)}
          onSubmit={async (review) => {
            console.log('Review submitted:', review);
            toast.success('리뷰가 등록되었습니다!');
            // 실제 저장은 ReviewModal 내부에서 처리하거나 여기서 handler를 연결해야 함
            // ReviewModal 구현을 확인해봐야 함.
          }}
        />
      )}
    </div>
  );
}
```

---

## File: src\services\menuService.ts

```typescript
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Menu } from '../types/menu';

// 컬렉션 참조 헬퍼 (stores/{storeId}/menus)
const getMenuCollection = (storeId: string) => collection(db, 'stores', storeId, 'menus');

// 메뉴 추가
export async function createMenu(storeId: string, menuData: Omit<Menu, 'id' | 'createdAt'>) {
  try {
    const docRef = await addDoc(getMenuCollection(storeId), {
      ...menuData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('메뉴 추가 실패:', error);
    throw error;
  }
}

// 메뉴 수정
export async function updateMenu(storeId: string, menuId: string, menuData: Partial<Menu>) {
  try {
    const menuRef = doc(db, 'stores', storeId, 'menus', menuId);
    await updateDoc(menuRef, {
      ...menuData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('메뉴 수정 실패:', error);
    throw error;
  }
}

// 메뉴 삭제
export async function deleteMenu(storeId: string, menuId: string) {
  try {
    const menuRef = doc(db, 'stores', storeId, 'menus', menuId);
    await deleteDoc(menuRef);
  } catch (error) {
    console.error('메뉴 삭제 실패:', error);
    throw error;
  }
}

// 품절 상태 변경
export async function toggleMenuSoldout(storeId: string, menuId: string, soldout: boolean) {
  try {
    const menuRef = doc(db, 'stores', storeId, 'menus', menuId);
    await updateDoc(menuRef, {
      soldout,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('품절 상태 변경 실패:', error);
    throw error;
  }
}

// 숨김 상태 변경
export async function toggleMenuHidden(storeId: string, menuId: string, isHidden: boolean) {
  try {
    const menuRef = doc(db, 'stores', storeId, 'menus', menuId);
    await updateDoc(menuRef, {
      isHidden,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('숨김 상태 변경 실패:', error);
    throw error;
  }
}

// Query 헬퍼 함수들
export function getAllMenusQuery(storeId: string) {
  return query(
    getMenuCollection(storeId),
    orderBy('createdAt', 'desc')
  );
}

export function getMenusByCategoryQuery(storeId: string, category: string) {
  return query(
    getMenuCollection(storeId),
    where('category', 'array-contains', category),
    orderBy('createdAt', 'desc')
  );
}
```

---

## File: src\types\notice.ts

```typescript
export interface Notice {
  id: string;
  title: string;
  content: string;
  category: '공지' | '이벤트' | '점검' | '할인';
  pinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const NOTICE_CATEGORIES = ['공지', '이벤트', '점검', '할인'] as const;
export type NoticeCategory = typeof NOTICE_CATEGORIES[number];

```

---

## File: tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: 'var(--color-primary-50)',
                    100: 'var(--color-primary-100)',
                    200: 'var(--color-primary-200)',
                    300: 'var(--color-primary-300)',
                    400: 'var(--color-primary-400)',
                    500: 'var(--color-primary-500)',
                    600: 'var(--color-primary-600)',
                    700: 'var(--color-primary-700)',
                    800: 'var(--color-primary-800)',
                    900: 'var(--color-primary-900)',
                },
                secondary: {
                    500: 'var(--color-secondary-500)',
                    600: 'var(--color-secondary-600)',
                }
            }
        },
    },
    plugins: [],
}

```

---

