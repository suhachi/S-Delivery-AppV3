# Project Code Volume 02

Generated: 2025-12-24 14:30:56
Root: D:\projectsing\S-Delivery-AppV3\

- Files in volume: 20
- Approx size: 0.08 MB

---

## File: scripts\client_reset.js

```javascript
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, deleteDoc, collection, getDocs, writeBatch } from 'firebase/firestore';
import 'dotenv/config'; // Load env vars

// Config specifically for this script's environment
const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function reset() {
    console.log('🔄 Resetting Database for Production...');

    try {
        // 1. Delete the main store document
        // This is the trigger for "Store Setup Wizard"
        await deleteDoc(doc(db, 'stores', 'default'));
        console.log('✅ Deleted stores/default');

        // 2. We can try to delete subcollections if rules allow (Admin might need to do this)
        // Since we are running this likely as a script, we might not be authenticated as Admin.
        // The previous seeding script ran in the browser? 
        // Ah, the user was editing `seed_v2_data.mjs` but running `npm run dev` and clicking a button.
        // There is no easy way to delete EVERYTHING from a node script without Service Account.

        console.log('⚠️  Note: Subcollections (orders, menus) remain. Firestore requires recursive delete.');
        console.log('⚠️  Please manually delete the "stores" collection in Firebase Console if you want a squeaky clean start.');
        console.log('ℹ️  However, deleting "stores/default" is enough to trigger the Setup Wizard.');

    } catch (e) {
        console.error('Error:', e);
    }
    process.exit(0);
}

reset();

```

---

## File: scripts\generate-project-code-volumes.ps1

```powershell
# Generate ~10 Markdown volumes containing the project's source code
# Windows PowerShell 5.1 compatible

param(
    [string]$RootPath = (Get-Location).Path,
    [int]$VolumeCount = 10,
    [string]$OutputFolder = "generated-code-volumes",
    [string[]]$ExcludeDirs = @(
        "node_modules","dist","build",".git",".vscode",".pnpm-store",
        "coverage",".cache",".next","out","generated-code-docs","project-code-docs","docs"
    ),
    [switch]$IncludeDocs,
    [switch]$IncludeLocks
)

$ErrorActionPreference = "Stop"

# Normalize root path to have trailing backslash
if (-not $RootPath.EndsWith('\')) { $RootPath = $RootPath + '\' }

Write-Host "Generating $VolumeCount Markdown volumes with project code..." -ForegroundColor Green
Write-Host "Root: $RootPath" -ForegroundColor Cyan

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

# Binary extensions to exclude from markdown
$excludeBinaryExts = @(
    ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".webp", ".bmp", ".tiff",
    ".woff", ".woff2", ".ttf", ".eot",
    ".mp4", ".mp3", ".webm"
)

# Names to exclude explicitly (huge or non-source files)
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

# Collect files (text code files)
$files = Get-ChildItem -Path $RootPath -Recurse -File |
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
    Write-Host "No files found for inclusion." -ForegroundColor Red
    exit 1
}

Write-Host "Found $($files.Count) files to include." -ForegroundColor Yellow

# Ensure output folder fresh
if (Test-Path $OutputFolder) {
    Remove-Item $OutputFolder -Recurse -Force
}
New-Item -ItemType Directory -Path $OutputFolder | Out-Null

# Prepare volume containers with greedy size balancing (bin packing heuristic)
$volumes = @()
for ($i = 1; $i -le $VolumeCount; $i++) {
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

function Write-VolumeMarkdown($volume, $root, $outFolder) {
    $indexStr = "{0:D2}" -f $volume.Index
    $outFile = Join-Path $outFolder "$indexStr-PROJECT_CODE.md"
    $md = New-Object System.Collections.Generic.List[string]

    $md.Add("# Project Code Volume $indexStr")
    $md.Add("")
    $md.Add("Generated: $timestamp")
    $md.Add("Root: $root")
    $md.Add("")
    $md.Add("- Files in volume: $($volume.Files.Count)")
    $md.Add("- Approx size: $([Math]::Round($volume.Size / 1MB, 2)) MB")
    $md.Add("")
    $md.Add("---")
    $md.Add("")

    foreach ($fi in $volume.Files | Sort-Object FullName) {
        $relative = $fi.FullName.Replace($root, "")
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
    Write-Host "Created: $outFile" -ForegroundColor Green
}

foreach ($v in $volumes) {
    Write-VolumeMarkdown -volume $v -root $RootPath -outFolder $OutputFolder
}

# Write index file
$indexMd = New-Object System.Collections.Generic.List[string]
$indexMd.Add("# Project Code Volumes Index")
$indexMd.Add("")
$indexMd.Add("Generated: $timestamp")
$indexMd.Add("Root: $RootPath")
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
$indexMd.Add("- Volume Count: $VolumeCount")

$indexFile = Join-Path $OutputFolder "00-INDEX.md"
$indexMd | Out-File -FilePath $indexFile -Encoding UTF8
Write-Host "Index written: $indexFile" -ForegroundColor Cyan

Write-Host "All volumes generated in folder: $OutputFolder" -ForegroundColor Cyan

```

---

## File: src\components\menu\CategoryBar.tsx

```typescript
import { CATEGORIES, Category } from '../../types/menu';

interface CategoryBarProps {
  selected: string;
  onSelect: (category: string) => void;
}

export default function CategoryBar({ selected, onSelect }: CategoryBarProps) {
  const allCategories = ['전체', ...CATEGORIES];
  
  return (
    <div className="sticky top-16 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        {/* 스크롤 힌트를 위한 그라데이션 오버레이 */}
        <div className="relative">
          {/* 오른쪽 그라데이션 (더 많은 항목이 있음을 표시) */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none z-10 md:hidden"></div>
          
          {/* 카테고리 버튼들 */}
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {allCategories.map((category) => (
              <button
                key={category}
                onClick={() => onSelect(category)}
                className={`
                  px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-200 flex-shrink-0
                  ${
                    selected === category
                      ? 'gradient-primary text-white shadow-md scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## File: src\components\menu\MenuCard.tsx

```typescript
import { useState } from 'react';
import { Plus, ShoppingCart } from 'lucide-react';
import { Menu } from '../../types/menu';
import { useCart } from '../../contexts/CartContext';
import { toast } from 'sonner';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import MenuDetailModal from './MenuDetailModal';

interface MenuCardProps {
  menu: Menu;
}

export default function MenuCard({ menu }: MenuCardProps) {
  const { addItem } = useCart();
  const [showDetail, setShowDetail] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (menu.soldout) {
      toast.error('품절된 메뉴입니다');
      return;
    }

    if (menu.options && menu.options.length > 0) {
      // 옵션이 있으면 상세 모달 열기
      setShowDetail(true);
    } else {
      // 옵션이 없으면 바로 추가
      addItem({
        menuId: menu.id,
        name: menu.name,
        price: menu.price,
        quantity: 1,
        imageUrl: menu.imageUrl,
      });
      toast.success('장바구니에 추가되었습니다');
    }
  };

  return (
    <>
      <Card
        hover
        padding="none"
        onClick={() => setShowDetail(true)}
        className={`overflow-hidden ${menu.soldout ? 'opacity-60' : ''}`}
      >
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 group">
          {menu.imageUrl ? (
            <img
              src={menu.imageUrl}
              alt={menu.name}
              className="w-full h-full object-cover transform transition-all duration-500 group-hover:scale-110 group-hover:brightness-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span className="text-5xl">🍜</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {menu.category.slice(0, 2).map((cat) => (
              <Badge key={cat} variant="primary" size="sm">
                {cat}
              </Badge>
            ))}
          </div>

          {menu.soldout && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="danger" size="lg">
                품절
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
            {menu.name}
          </h3>

          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {menu.description}
          </p>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-blue-600">
                {menu.price.toLocaleString()}
              </span>
              <span className="text-sm text-gray-600 ml-1">원</span>
            </div>

            <Button
              size="sm"
              onClick={handleQuickAdd}
              disabled={menu.soldout}
              className="group"
            >
              <ShoppingCart className="w-4 h-4 mr-1.5" />
              담기
            </Button>
          </div>

          {menu.options && menu.options.length > 0 && (
            <p className="mt-2 text-xs text-gray-500">
              {menu.options.length}개의 옵션 선택 가능
            </p>
          )}
        </div>
      </Card>

      {showDetail && (
        <MenuDetailModal
          menu={menu}
          onClose={() => setShowDetail(false)}
        />
      )}
    </>
  );
}

```

---

## File: src\components\ui\avatar.tsx

```typescript
"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar@1.1.3";

import { cn } from "./utils";

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-10 shrink-0 overflow-hidden rounded-full",
        className,
      )}
      {...props}
    />
  );
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className,
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };

```

---

## File: src\components\ui\popover.tsx

```typescript
"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover@1.1.6";

import { cn } from "./utils";

function Popover({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden",
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}

function PopoverAnchor({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };

```

---

## File: src\components\ui\separator.tsx

```typescript
"use client";

import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator@1.1.2";

import { cn } from "./utils";

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator-root"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className,
      )}
      {...props}
    />
  );
}

export { Separator };

```

---

## File: src\hooks\useReorder.ts

```typescript
import { useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useCart } from '../contexts/CartContext';
import { Order, OrderItem } from '../types/order';
import { Menu } from '../types/menu';
import { toast } from 'sonner';

type ReorderStatus = 'valid' | 'deleted' | 'hidden' | 'soldout' | 'error';

interface ReorderCheckResult {
    item: OrderItem;
    status: ReorderStatus;
    menuData?: Menu;
    firestoreMenuId?: string;
    reason?: string;
}

export function useReorder() {
    const { addItem, clearCart } = useCart();
    const [reordering, setReordering] = useState(false);

    const handleReorder = async (storeId: string, order: Order) => {
        if (!storeId || !order.items || order.items.length === 0) return;

        if (!window.confirm('장바구니를 비우고 이 주문을 다시 담으시겠습니까?\n(옵션은 초기화되므로 다시 선택해주세요)')) {
            return;
        }

        setReordering(true);
        try {
            const promises = order.items.map(async (item): Promise<ReorderCheckResult> => {
                try {
                    // R2-FIX-04: menuId fallback
                    const menuId = item.menuId ?? (item as any).id;
                    if (!menuId) return { item, status: 'error', reason: 'ID 없음' };

                    const menuRef = doc(db, 'stores', storeId, 'menus', menuId);
                    const menuSnap = await getDoc(menuRef);

                    if (!menuSnap.exists()) {
                        return { item, status: 'deleted', reason: '메뉴 삭제됨' };
                    }

                    const menuData = menuSnap.data() as Menu;

                    if (menuData.isHidden) {
                        return { item, status: 'hidden', reason: '메뉴 숨김 처리됨' };
                    }

                    if (menuData.soldout) {
                        return { item, status: 'soldout', reason: '품절됨' };
                    }

                    return { item, status: 'valid', menuData, firestoreMenuId: menuSnap.id };
                } catch (e) {
                    return { item, status: 'error', reason: '확인 불가' };
                }
            });

            const results = await Promise.all(promises);

            const validItems: ReorderCheckResult[] = [];
            const invalidItems: ReorderCheckResult[] = [];

            results.forEach(res => {
                if (res.status === 'valid') {
                    validItems.push(res);
                } else {
                    invalidItems.push(res);
                }
            });

            if (validItems.length === 0) {
                toast.error('담을 수 있는 메뉴가 없습니다. (전체 품절 또는 삭제됨)');
                return;
            }

            // 2. 장바구니 초기화 및 담기
            clearCart();

            validItems.forEach(({ item, menuData, firestoreMenuId }) => {
                if (!menuData || !firestoreMenuId) return;

                // R2-FIX-02: 옵션 제거 정책 (가장 안전한 방법)
                // 옵션 가격/구조 변경 리스크로 인해 옵션은 제외하고 기본 메뉴만 담음
                addItem({
                    menuId: firestoreMenuId,
                    name: menuData.name,
                    price: menuData.price,
                    quantity: item.quantity,
                    options: [], // 옵션 초기화
                    imageUrl: menuData.imageUrl,
                });
            });

            // 3. 결과 알림 (R2-FIX-04: 상세 통계)
            const soldoutCount = invalidItems.filter(i => i.status === 'soldout').length;
            const hiddenCount = invalidItems.filter(i => i.status === 'hidden').length;
            const deletedCount = invalidItems.filter(i => i.status === 'deleted').length; // error 포함

            if (invalidItems.length > 0) {
                let msg = `${validItems.length}개 메뉴 담기 성공`;
                const excluded = [];
                if (soldoutCount > 0) excluded.push(`품절 ${soldoutCount}`);
                if (hiddenCount > 0) excluded.push(`숨김 ${hiddenCount}`);
                if (deletedCount > 0) excluded.push(`삭제/기타 ${deletedCount}`);

                toast.warning(`${msg} (${excluded.join(', ')} 제외됨)`);
                toast.info('옵션은 초기화되었으니 다시 선택해주세요.');
            } else {
                toast.success('메뉴를 장바구니에 담았습니다! 옵션을 다시 선택해주세요.');
            }

        } catch (error) {
            console.error('Reorder error:', error);
            toast.error('재주문 처리 중 오류가 발생했습니다.');
        } finally {
            setReordering(false);
        }
    };

    return { handleReorder, reordering };
}

```

---

## File: src\lib\firebase.ts

```typescript
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging, isSupported } from 'firebase/messaging';

// Firebase 설정
// .env 파일에서 환경 변수를 불러옵니다
// .env.example 파일을 참고하여 .env.local 파일을 생성하세요
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// 필수 환경 변수 검증
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const;

const missingVars = requiredEnvVars.filter(
  (varName) => !import.meta.env[varName]
);

if (missingVars.length > 0) {
  console.error(
    '❌ Firebase 환경 변수가 설정되지 않았습니다:',
    missingVars.join(', ')
  );
  console.error(
    '💡 .env.example 파일을 참고하여 .env.local 파일을 생성하고 Firebase 설정을 추가하세요.'
  );
  throw new Error(
    `Firebase 환경 변수가 누락되었습니다: ${missingVars.join(', ')}`
  );
}

// Firebase 초기화
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error('❌ Firebase 초기화 실패:', error);
  throw new Error('Firebase 초기화에 실패했습니다. 환경 변수를 확인하세요.');
}

// Firebase 서비스 초기화
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  ignoreUndefinedProperties: true
});
export const storage = getStorage(app);

// Firebase Analytics (브라우저 환경에서만)
let analytics: any = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}
export { analytics };

// Firebase Cloud Messaging (FCM) - 선택적
let messaging: any = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      messaging = getMessaging(app);
    }
  });
}
export { messaging };

export default app;
```

---

## File: src\lib\nicepayClient.ts

```typescript
import { NicepayRequestParams } from '../types/global';

const NICEPAY_SCRIPT_URL = 'https://pay.nicepay.co.kr/v1/js/';

/**
 * NICEPAY JS SDK를 동적으로 로드합니다.
 */
export function loadNicepayScript(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (window.AUTHNICE) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = NICEPAY_SCRIPT_URL;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('NICEPAY Script load failed'));
        document.body.appendChild(script);
    });
}

/**
 * NICEPAY 결제창을 호출합니다.
 * @param params 결제 요청 파라미터
 */
export async function requestNicepayPayment(params: NicepayRequestParams): Promise<void> {
    await loadNicepayScript();

    if (!window.AUTHNICE) {
        throw new Error('NICEPAY SDK SDK not loaded');
    }

    window.AUTHNICE.requestPay({
        ...params,
        method: 'card', // 기본적으로 카드 결제
    });
}

```

---

## File: src\pages\admin\AdminOrderManagement.test.tsx

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import AdminOrderManagement from './AdminOrderManagement';
import { useStore } from '../../contexts/StoreContext';
import { useFirestoreCollection } from '../../hooks/useFirestoreCollection';
import { updateOrderStatus, deleteOrder } from '../../services/orderService';

// Mocks
vi.mock('../../contexts/StoreContext', () => ({
    useStore: vi.fn(),
}));

vi.mock('../../hooks/useFirestoreCollection', () => ({
    useFirestoreCollection: vi.fn(),
}));

vi.mock('../../services/orderService', () => ({
    updateOrderStatus: vi.fn(),
    deleteOrder: vi.fn(),
    getAllOrdersQuery: vi.fn(),
}));

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

// Mock child components
vi.mock('../../components/admin/AdminSidebar', () => ({
    default: () => <div data-testid="sidebar">Sidebar</div>,
}));
vi.mock('../../components/admin/Receipt', () => ({
    default: ({ order }: any) => order ? <div data-testid="receipt">Receipt for {order.id}</div> : null,
}));
vi.mock('../../components/admin/AdminOrderAlert', () => ({
    default: () => null,
}));

// Mock Lucide
vi.mock('lucide-react', () => ({
    Package: () => <span>Pkg</span>,
    MapPin: () => <span>Map</span>,
    Phone: () => <span>Phone</span>,
    CreditCard: () => <span>Card</span>,
    ChevronDown: () => <span>Down</span>,
}));

describe('AdminOrderManagement', () => {
    const mockStore = { id: 'store_1', name: 'Test Store' };

    const originalPrint = window.print;
    const originalConfirm = window.confirm;

    beforeEach(() => {
        vi.clearAllMocks();
        (useStore as any).mockReturnValue({ store: mockStore });
        window.print = vi.fn();
        window.confirm = vi.fn(() => true);
    });

    afterEach(() => {
        window.print = originalPrint;
        window.confirm = originalConfirm;
        vi.useRealTimers();
    });

    const mockOrders = [
        {
            id: 'order_1',
            status: '접수',
            totalPrice: 15000,
            items: [{ name: 'Pizza', quantity: 1, price: 15000, options: [] }],
            createdAt: { toDate: () => new Date('2024-01-01T10:00:00') },
            address: 'Seoul',
            orderType: '배달'
        },
        {
            id: 'order_2',
            status: '배달중',
            totalPrice: 20000,
            items: [{ name: 'Burger', quantity: 2, price: 10000, options: [] }],
            createdAt: { toDate: () => new Date('2024-01-01T11:00:00') },
            address: 'Busan',
            orderType: '배달'
        }
    ];

    it('should render empty state', () => {
        (useFirestoreCollection as any).mockReturnValue({ data: [] });
        render(<AdminOrderManagement />);
        expect(screen.getByText('주문이 없습니다')).toBeInTheDocument();
    });

    it('should render orders list', () => {
        (useFirestoreCollection as any).mockReturnValue({ data: mockOrders });
        render(<AdminOrderManagement />);
        expect(screen.getByText('주문 #order_1')).toBeInTheDocument();
    });

    it('should filter orders', async () => {
        (useFirestoreCollection as any).mockReturnValue({ data: mockOrders });
        render(<AdminOrderManagement />);

        expect(screen.getByText('주문 #order_1')).toBeInTheDocument();

        const buttons = screen.getAllByRole('button');
        const deliveryFilter = buttons.find(b => b.innerHTML.includes('배달중')); // innerHTML check for text + span

        expect(deliveryFilter).toBeDefined();
        fireEvent.click(deliveryFilter!);

        await waitFor(() => {
            expect(screen.queryByText('주문 #order_1')).not.toBeInTheDocument();
        });
        expect(screen.getByText('주문 #order_2')).toBeInTheDocument();
    });

    it('should handle status change', async () => {
        (useFirestoreCollection as any).mockReturnValue({ data: mockOrders });
        render(<AdminOrderManagement />);

        fireEvent.click(screen.getByText('주문 #order_1'));

        const nextBtn = await screen.findByRole('button', { name: /다음 단계로/ });
        fireEvent.click(nextBtn);

        expect(updateOrderStatus).toHaveBeenCalledWith(mockStore.id, 'order_1', '접수완료');
    });

    it('should handle print receipt', async () => {
        vi.useFakeTimers();
        (useFirestoreCollection as any).mockReturnValue({ data: mockOrders });
        render(<AdminOrderManagement />);

        fireEvent.click(screen.getByText('주문 #order_1'));
        await screen.findByText('주문 상품');

        const printBtn = screen.getByText('🖨️ 영수증 인쇄').closest('button');
        fireEvent.click(printBtn!);

        expect(await screen.findByTestId('receipt')).toBeInTheDocument();

        act(() => {
            vi.runAllTimers();
        });

        expect(window.print).toHaveBeenCalled();
    });
});

```

---

## File: src\pages\admin\AdminStatsPage.tsx

```typescript
import React, { useMemo, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line
} from 'recharts';
import { Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { useFirestoreCollection } from '../../hooks/useFirestoreCollection';
import { getAllOrdersQuery } from '../../services/orderService';
import { Order } from '../../types/order';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Card from '../../components/common/Card';

export default function AdminStatsPage() {
    const { store } = useStore();
    const [period, setPeriod] = useState<'week' | 'month'>('week');

    const { data: orders, loading } = useFirestoreCollection<Order>(
        store?.id ? getAllOrdersQuery(store.id) : null
    );

    const statsData = useMemo(() => {
        if (!orders) return [];

        const now = new Date();
        const days = period === 'week' ? 7 : 30;
        const result = [];

        // Initialize days
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(now.getDate() - i);
            const key = d.toISOString().split('T')[0]; // YYYY-MM-DD
            const label = period === 'week'
                ? ['일', '월', '화', '수', '목', '금', '토'][d.getDay()]
                : `${d.getMonth() + 1}/${d.getDate()}`;

            result.push({
                date: key,
                label: label,
                sales: 0,
                count: 0
            });
        }

        // Aggregate orders
        orders.forEach(order => {
            if (order.status !== '완료') return;

            const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
            const target = result.find(r => r.date === orderDate);
            if (target) {
                target.sales += order.totalPrice;
                target.count += 1;
            }
        });

        return result;
    }, [orders, period]);

    const totalSalesInPeriod = statsData.reduce((sum, d) => sum + d.sales, 0);
    const totalCountInPeriod = statsData.reduce((sum, d) => sum + d.count, 0);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">로딩 중...</div>;
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar />

            <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl mb-2 font-bold text-gray-900">매출 통계</h1>
                            <p className="text-gray-600">매장 매출 흐름을 분석합니다.</p>
                        </div>

                        <div className="flex bg-white p-1 rounded-lg border">
                            <button
                                onClick={() => setPeriod('week')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${period === 'week' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                최근 7일
                            </button>
                            <button
                                onClick={() => setPeriod('month')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${period === 'month' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                최근 30일
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <Card>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                                    <DollarSign className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">기간 내 총 매출</p>
                                    <h3 className="text-2xl font-bold">{totalSalesInPeriod.toLocaleString()}원</h3>
                                </div>
                            </div>
                        </Card>
                        <Card>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">기간 내 주문 수</p>
                                    <h3 className="text-2xl font-bold">{totalCountInPeriod}건</h3>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="p-6">
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-gray-500" />
                                일별 매출 추이
                            </h3>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={statsData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                                        <YAxis tickFormatter={(value) => `${value / 10000}만`} tick={{ fontSize: 12 }} />
                                        <Tooltip
                                            formatter={(value: number) => [`${value.toLocaleString()}원`, '매출']}
                                            labelStyle={{ color: '#374151' }}
                                        />
                                        <Bar dataKey="sales" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-gray-500" />
                                주문 건수 추이
                            </h3>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={statsData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                        <Tooltip
                                            formatter={(value: number) => [`${value}건`, '주문수']}
                                        />
                                        <Line type="monotone" dataKey="count" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}

```

---

## File: src\pages\CheckoutPage.tsx

```typescript
/// <reference types="vite/client" />
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, CreditCard, Wallet, DollarSign, ArrowLeft, CheckCircle2, ShoppingBag, Package, Ticket, X, Search } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../contexts/StoreContext';
import { toast } from 'sonner';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import AddressSearchInput from '../components/common/AddressSearchInput';
import { Coupon } from '../types/coupon';
import { createOrder } from '../services/orderService';
import { useCoupon } from '../services/couponService';
import { OrderStatus } from '../types/order';
import { useFirestoreCollection } from '../hooks/useFirestoreCollection';
import { getCouponsPath } from '../lib/firestorePaths';
import { collection } from 'firebase/firestore';
import { db } from '../lib/firebase';

type OrderType = '배달주문' | '포장주문';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { store } = useStore();
  const storeId = store?.id;

  // ATOM-132: 매장 일시정지 체크
  if (store?.isOrderingPaused) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center py-12">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <span className="text-4xl">⛔</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">현재 주문 접수가 중단되었습니다</h2>
          <p className="text-gray-600 mb-8 whitespace-pre-wrap">
            {store.pausedReason || "매장 사정으로 인해 잠시 주문을 받을 수 없습니다."}
            <br />
            <span className="text-sm text-gray-500 mt-2 block">잠시 후 다시 이용해주세요.</span>
          </p>
          <Button onClick={() => navigate('/')} fullWidth size="lg">
            홈으로 돌아가기
          </Button>
        </Card>
      </div>
    );
  }

  // Firestore에서 쿠폰 조회
  const { data: coupons } = useFirestoreCollection<Coupon>(
    storeId ? collection(db, getCouponsPath(storeId)) : null
  );

  const [orderType, setOrderType] = useState<OrderType>('배달주문');
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  // const [isAddressSearchOpen, setIsAddressSearchOpen] = useState(false); // Refactored to component inside AddressSearchInput
  const [formData, setFormData] = useState({
    address: '',
    detailAddress: '',
    phone: '',
    memo: '',
    paymentType: '앱결제' as '앱결제' | '만나서카드' | '만나서현금' | '방문시결제',
  });

  // 사용자 정보(전화번호) 자동 입력
  useEffect(() => {
    if (user?.phone && !formData.phone) {
      setFormData(prev => ({ ...prev, phone: user.phone! }));
    }
  }, [user]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // 주문 타입에 따른 배달비 계산
  const deliveryFee = orderType === '배달주문' ? 3000 : 0;

  // 사용 가능한 쿠폰 필터링
  // Firestore Timestamp 처리를 위한 헬퍼 함수
  const toDate = (date: any): Date => {
    if (date?.toDate) return date.toDate(); // Firestore Timestamp
    if (date instanceof Date) return date;
    if (typeof date === 'string') return new Date(date);
    return new Date(); // Fallback
  };

  // 사용 가능한 쿠폰 필터링
  const availableCoupons = (coupons || []).filter(coupon => {
    const now = new Date();
    const itemsTotal = getTotalPrice();
    const validFrom = toDate(coupon.validFrom);
    const validUntil = toDate(coupon.validUntil);
    const minOrderAmount = Number(coupon.minOrderAmount) || 0;

    // 만료일의 경우 해당 날짜의 23:59:59까지 유효하도록 설정 (선택사항, 필요시)
    // 여기서는 단순 시간 비교

    const isValidPeriod = validFrom <= now && validUntil >= now;
    const isValidAmount = itemsTotal >= minOrderAmount;
    const isNotUsed = !coupon.usedByUserIds?.includes(user?.id || '');
    // 발급 대상 확인: 지정된 사용자가 없거나(전체 발급), 해당 사용자에게 지정된 경우
    const isAssignedToUser = !coupon.assignedUserId || coupon.assignedUserId === user?.id;

    // 디버깅을 위해 로그 추가 (필요시 제거)
    // console.log(`Coupon ${coupon.name}: Active=${coupon.isActive}, Period=${isValidPeriod}, Amount=${isValidAmount}, Assigned=${isAssignedToUser}`);

    return coupon.isActive && isValidPeriod && isValidAmount && isNotUsed && isAssignedToUser;
  });

  // 쿠폰 할인 금액 계산
  const calculateDiscount = (coupon: Coupon | null): number => {
    if (!coupon) return 0;

    const itemsTotal = getTotalPrice();

    if (coupon.discountType === 'percentage') {
      const discount = Math.floor(itemsTotal * (coupon.discountValue / 100));
      return coupon.maxDiscountAmount
        ? Math.min(discount, coupon.maxDiscountAmount)
        : discount;
    } else {
      return coupon.discountValue;
    }
  };

  const discountAmount = calculateDiscount(selectedCoupon);
  const finalTotal = getTotalPrice() + deliveryFee - discountAmount;

  // 주문 타입에 따른 결제 방법
  const paymentTypes = orderType === '배달주문'
    ? [
      { value: '앱결제', label: '앱 결제', icon: <CreditCard className="w-5 h-5" /> },
      { value: '만나서카드', label: '만나서 카드', icon: <CreditCard className="w-5 h-5" /> },
      { value: '만나서현금', label: '만나서 현금', icon: <Wallet className="w-5 h-5" /> },
    ]
    : [
      { value: '앱결제', label: '앱 결제', icon: <CreditCard className="w-5 h-5" /> },
      { value: '방문시결제', label: '방문시 결제', icon: <DollarSign className="w-5 h-5" /> },
    ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!storeId) {
      toast.error('상점 정보를 찾을 수 없습니다');
      return;
    }

    if (!user) {
      toast.error('로그인이 필요합니다');
      navigate('/login');
      return;
    }

    // 배달주문 검증
    if (orderType === '배달주문' && (!formData.address || !formData.phone)) {
      toast.error('배달 주소와 연락처를 입력해주세요');
      return;
    }

    // 포장주문 검증
    if (orderType === '포장주문' && !formData.phone) {
      toast.error('연락처를 입력해주세요');
      return;
    }

    if (getTotalPrice() < 10000) {
      toast.error('최소 주문 금액은 10,000원입니다');
      return;
    }

    setIsSubmitting(true);

    try {
      // 결제 타입에 따른 초기 상태 설정
      // 앱결제: '결제대기' -> PG 결제 후 '접수'로 변경 (서버)
      // 그 외(만나서 결제 등): 바로 '접수' 상태로 생성
      const initialStatus: OrderStatus = formData.paymentType === '앱결제' ? '결제대기' : '접수';

      const pendingOrderData = {
        userId: user.id,
        userDisplayName: user.displayName || '사용자',
        items,
        orderType,
        itemsPrice: getTotalPrice(),
        deliveryFee,
        discountAmount,
        totalPrice: finalTotal,
        address: `${formData.address} ${formData.detailAddress}`.trim(),
        phone: formData.phone,
        memo: formData.memo,
        paymentType: formData.paymentType,
        couponId: selectedCoupon?.id || undefined,
        couponName: selectedCoupon?.name || undefined,
        adminDeleted: false,
        reviewed: false,
        paymentStatus: '결제대기' as const, // 결제 완료 여부와 별개
      };

      // 1. 주문 생성 (초기 상태 포함)
      const orderId = await createOrder(storeId, {
        ...pendingOrderData,
        status: initialStatus
      });

      // 2. 쿠폰 사용 처리 (주문 생성 성공 시)
      if (selectedCoupon && storeId && user?.id) {
        try {
          await useCoupon(storeId, selectedCoupon.id, user.id);
        } catch (couponError) {
          console.error('Failed to use coupon, rolling back order:', couponError);
          // 쿠폰 처리 실패 시 주문 삭제 (롤백)
          // 임시로 deleteDoc을 직접 사용하거나 cancelOrder로 대체 가능하지만, 아예 삭제하는 것이 맞음.
          // 여기서는 에러를 던져서 아래 catch 블록으로 이동시키되, 그 전에 삭제 로직 필요.
          // createOrder가 성공했으므로 orderId가 존재함.

          // 동적 import로 deleteDoc 등 가져와서 처리하기 보다는, 일단은 에러 메시지 명확히 하고
          // 사용자에게 '주문 실패 (쿠폰 오류)' 알림. 
          // 하지만 중복 주문 방지를 위해 여기서 삭제 api 호출이 이상적임.
          // 간단히는: 에러를 throw하고, 사용자가 다시 시도하게 함. 
          // 하지만 이미 생성된 주문이 남는게 문제.

          // 해결책: 주문 생성 후 쿠폰 사용이 아니라, 트랜잭션으로 묶는게 베스트지만 
          // Firestore 클라이언트 SDK에서 서로 다른 컬렉션(주문/쿠폰) 트랜잭션은 가능.
          // 하지만 지금 구조상 복잡하므로, 롤백 코드를 추가.

          const { doc, deleteDoc } = await import('firebase/firestore');
          const { db } = await import('../lib/firebase');
          await deleteDoc(doc(db, 'stores', storeId, 'orders', orderId));

          throw new Error('쿠폰 적용에 실패하여 주문이 취소되었습니다.');
        }
      }

      // 3. 결제 수단이 '앱결제'인 경우 NICEPAY 호출
      if (formData.paymentType === '앱결제') {
        const clientId = import.meta.env.VITE_NICEPAY_CLIENT_ID;
        if (!clientId) {
          toast.error('결제 시스템이 아직 설정되지 않았습니다. 관리자에게 문의하세요.');
          setIsSubmitting(false);
          return;
        }

        const { requestNicepayPayment } = await import('../lib/nicepayClient');

        await requestNicepayPayment({
          clientId: import.meta.env.VITE_NICEPAY_CLIENT_ID,
          method: 'card',
          orderId: orderId,
          amount: finalTotal,
          goodsName: items.length > 1 ? `${items[0].name} 외 ${items.length - 1}건` : items[0].name,
          buyerName: user.displayName || '고객',
          buyerEmail: user.email || '',
          buyerTel: formData.phone,
          returnUrl: import.meta.env.VITE_NICEPAY_RETURN_URL || `${window.location.origin}/nicepay/return`,
        });

      } else {
        // 만나서 결제인 경우: 이미 '접수' 상태로 생성되었으므로 추가 업데이트 불필요
        clearCart();
        toast.success('주문이 접수되었습니다! 🎉');
        navigate('/orders');
      }
    } catch (error) {
      console.error('Order creation error:', error);
      toast.error('주문 처리 중 오류가 발생했습니다');
      setIsSubmitting(false);
    }
    // finally: 앱결제 시에는 리다이렉트하므로 finally에서 submitting을 false로 돌리면 안될 수도 있음.
    // 하지만 에러 발생 시에는 꺼야 함. isSubmitting 상태 관리가 중요.
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            장바구니로 돌아가기
          </button>
          <h1 className="text-3xl mb-2">
            <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              주문하기
            </span>
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Order Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* 주문 타입 선택 */}
              <Card>
                <h2 className="text-xl font-bold text-gray-900 mb-4">주문 방법</h2>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setOrderType('배달주문');
                      setFormData({ ...formData, paymentType: '앱결제' });
                    }}
                    className={`
                      flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-all
                      ${orderType === '배달주문'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }
                    `}
                  >
                    <ShoppingBag className="w-8 h-8 mb-2" />
                    <span className="font-bold">배달주문</span>
                    <span className="text-xs mt-1">배달비 3,000원</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOrderType('포장주문');
                      setFormData({ ...formData, paymentType: '앱결제', address: '' });
                    }}
                    className={`
                      flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-all
                      ${orderType === '포장주문'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }
                    `}
                  >
                    <Package className="w-8 h-8 mb-2" />
                    <span className="font-bold">포장주문</span>
                    <span className="text-xs mt-1">배달비 없음</span>
                  </button>
                </div>
              </Card>

              {/* 주문 정보 입력 */}
              <Card>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  {orderType === '배달주문' ? (
                    <>
                      <MapPin className="w-6 h-6 mr-2 text-blue-600" />
                      배달 정보
                    </>
                  ) : (
                    <>
                      <Phone className="w-6 h-6 mr-2 text-blue-600" />
                      포장 정보
                    </>
                  )}
                </h2>
                <div className="space-y-4">
                  {orderType === '배달주문' && (
                    <div className="space-y-2">
                      <AddressSearchInput
                        label="배달 주소"
                        value={formData.address}
                        onChange={(address) => setFormData({ ...formData, address })}
                        required
                        className="mb-2"
                      />

                      {formData.address && (
                        <div className="animate-fade-in">
                          <Input
                            placeholder="상세 주소를 입력해주세요 (예: 101동 101호)"
                            value={formData.detailAddress}
                            onChange={(e) => setFormData({ ...formData, detailAddress: e.target.value })}
                            required
                          />
                        </div>
                      )}
                    </div>
                  )}
                  <Input
                    label="연락처"
                    type="tel"
                    placeholder="010-1234-5678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    icon={<Phone className="w-5 h-5" />}
                    required
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      요청사항 (선택)
                    </label>
                    <textarea
                      placeholder={orderType === '배달주문' ? '배달 시 요청사항을 입력해주세요' : '포장 시 요청사항을 입력해주세요'}
                      value={formData.memo}
                      onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                      className="w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-400 resize-none"
                      rows={3}
                    />
                  </div>
                </div>
              </Card>

              {/* 결제 방법 선택 */}
              <Card>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <CreditCard className="w-6 h-6 mr-2 text-blue-600" />
                  결제 방법
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {paymentTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, paymentType: type.value as any })}
                      className={`
                        flex items-center justify-center space-x-2 p-4 rounded-lg border-2 transition-all
                        ${formData.paymentType === type.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }
                      `}
                    >
                      {type.icon}
                      <span className="font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
              </Card>

              {/* 쿠폰 적용 */}
              <Card>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <Ticket className="w-6 h-6 mr-2 text-orange-600" />
                    쿠폰 적용
                  </div>
                  {selectedCoupon && (
                    <button
                      type="button"
                      onClick={() => setSelectedCoupon(null)}
                      className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      쿠폰 취소
                    </button>
                  )}
                </h2>

                {selectedCoupon && (
                  <div className="mb-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-orange-900">{selectedCoupon.name}</p>
                        <p className="text-sm text-orange-700">
                          {selectedCoupon.discountType === 'percentage'
                            ? `${selectedCoupon.discountValue}% 할인`
                            : `${selectedCoupon.discountValue.toLocaleString()}원 할인`}
                        </p>
                      </div>
                      <p className="text-xl font-bold text-orange-600">
                        -{discountAmount.toLocaleString()}원
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {availableCoupons.length > 0 ? (
                    <>
                      {availableCoupons.map(coupon => (
                        <button
                          key={coupon.id}
                          type="button"
                          onClick={() => setSelectedCoupon(coupon)}
                          className={`
                            w-full p-4 rounded-lg border-2 transition-all text-left
                            ${selectedCoupon?.id === coupon.id
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-200 hover:border-orange-300 bg-white hover:bg-orange-50/50'
                            }
                          `}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Ticket className={`w-5 h-5 ${selectedCoupon?.id === coupon.id ? 'text-orange-600' : 'text-gray-400'}`} />
                              <div>
                                <p className={`font-bold ${selectedCoupon?.id === coupon.id ? 'text-orange-900' : 'text-gray-900'}`}>
                                  {coupon.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  최소 주문 {coupon.minOrderAmount.toLocaleString()}원 · {' '}
                                  {toDate(coupon.validUntil).toLocaleDateString('ko-KR')}까지
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`font-bold ${selectedCoupon?.id === coupon.id ? 'text-orange-600' : 'text-gray-900'}`}>
                                {coupon.discountType === 'percentage'
                                  ? `${coupon.discountValue}%`
                                  : `${coupon.discountValue.toLocaleString()}원`}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <Ticket className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">사용 가능한 쿠폰이 없습니다</p>
                      <p className="text-xs text-gray-400 mt-1">
                        최소 주문 금액을 확인해주세요
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              {/* 주문 상품 요약 */}
              <Card>
                <h2 className="text-xl font-bold text-gray-900 mb-4">주문 상품</h2>
                <div className="space-y-3">
                  {items.map((item) => {
                    const optionsPrice = item.options?.reduce((sum, opt) => sum + (opt.price * (opt.quantity || 1)), 0) || 0;
                    return (
                      <div key={item.id} className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.name}</p>
                          {item.options && item.options.length > 0 && (
                            <p className="text-sm text-gray-600">
                              {item.options.map(opt => `${opt.name}${(opt.quantity || 1) > 1 ? ` x${opt.quantity}` : ''}`).join(', ')}
                            </p>
                          )}
                          <p className="text-sm text-gray-600">수량: {item.quantity}개</p>
                        </div>
                        <p className="font-semibold text-gray-900">
                          {((item.price + optionsPrice) * item.quantity).toLocaleString()}원
                        </p>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* 주문 요약 */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-4">결제 금액</h2>

                <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-center justify-between text-gray-600">
                    <span>상품 금액</span>
                    <span>{getTotalPrice().toLocaleString()}원</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-600">
                    <span>배달비</span>
                    <span className={deliveryFee === 0 ? 'text-green-600 font-medium' : ''}>
                      {deliveryFee === 0 ? '무료' : `${deliveryFee.toLocaleString()}원`}
                    </span>
                  </div>
                  {selectedCoupon && (
                    <div className="flex items-center justify-between text-gray-600">
                      <span>할인 금액</span>
                      <span className="text-red-600 font-medium">
                        {discountAmount.toLocaleString()}원
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mb-6 text-xl font-bold">
                  <span>총 결제 금액</span>
                  <span className="text-blue-600">
                    {finalTotal.toLocaleString()}원
                  </span>
                </div>

                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  isLoading={isSubmitting}
                  disabled={
                    (orderType === '배달주문' && (!formData.address || !formData.phone)) ||
                    (orderType === '포장주문' && !formData.phone)
                  }
                  className="group"
                >
                  {!isSubmitting && (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      {orderType === '배달주문' ? '배달 주문하기' : '포장 주문하기'}
                    </>
                  )}
                </Button>
              </Card>
            </div>
          </div>
        </form>
      </div>
      {/* Modal is now handled inside AddressSearchInput */}

    </div>
  );
}
```

---

## File: src\pages\ReviewBoardPage.test.tsx

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ReviewList from '../components/review/ReviewList';
import ReviewBoardPage from './ReviewBoardPage';
import { useStore } from '../contexts/StoreContext';
import { useFirestoreCollection } from '../hooks/useFirestoreCollection';

// Mocks
vi.mock('../../contexts/StoreContext', () => ({
    useStore: vi.fn(),
}));

vi.mock('../../hooks/useFirestoreCollection', () => ({
    useFirestoreCollection: vi.fn(),
}));

vi.mock('../../services/reviewService', () => ({
    getAllReviewsQuery: vi.fn(),
}));

vi.mock('../../utils/formatDate', () => ({
    formatDate: (date: any) => '2024-01-01',
}));

// Mock Lucide
vi.mock('lucide-react', () => ({
    Star: ({ className }: any) => <span className={className}>Star</span>,
    User: () => <span>User</span>,
    MessageSquare: () => <span>Msg</span>,
}));

describe('ReviewBoardPage', () => {
    it('should render header', () => {
        render(<ReviewBoardPage />);
        expect(screen.getByText('고객 후기')).toBeInTheDocument();
    });
});

describe('ReviewList', () => {
    const mockStore = { id: 'store_1' };

    beforeEach(() => {
        vi.clearAllMocks();
        (useStore as any).mockReturnValue({ store: mockStore });
        (useFirestoreCollection as any).mockReturnValue({ data: [], loading: false });
    });

    it('should render loading state', () => {
        (useFirestoreCollection as any).mockReturnValue({
            data: [],
            loading: true,
        });
        render(<ReviewList />);
        expect(screen.getByText('리뷰를 불러오는 중...')).toBeInTheDocument();
    });

    it('should render empty state', () => {
        (useFirestoreCollection as any).mockReturnValue({
            data: [],
            loading: false,
        });
        render(<ReviewList />);
        expect(screen.getByText('아직 작성된 리뷰가 없습니다')).toBeInTheDocument();
    });

    it('should render reviews', () => {
        const mockReviews = [
            {
                id: 'review_1',
                rating: 5,
                comment: 'Great!',
                userDisplayName: 'User A',
                createdAt: '2024-01-01',
                images: []
            }
        ];

        (useFirestoreCollection as any).mockReturnValue({
            data: mockReviews,
            loading: false,
        });

        render(<ReviewList />);
        expect(screen.getByText('Great!')).toBeInTheDocument();
        expect(screen.getByText('User A')).toBeInTheDocument();
    });
});

```

---

## File: src\services\couponService.test.ts

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateCoupon } from './couponService';

// Mock dependencies
vi.mock('../lib/firebase', () => ({
    db: {},
}));

describe('couponService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('validateCoupon', () => {
        it('should return valid if conditions met', () => {
            const coupon = {
                code: 'TEST',
                discountAmount: 1000,
                minOrderAmount: 10000,
                validUntil: { toDate: () => new Date('2099-12-31') }, // Future
                isActive: true,
                usedByUserIds: []
            };

            const result = validateCoupon(coupon as any, 15000, 'user1');
            expect(result.isValid).toBe(true);
        });

        it('should fail if order amount is too low', () => {
            const coupon = {
                code: 'TEST',
                minOrderAmount: 10000,
                validUntil: { toDate: () => new Date('2099-12-31') },
                isActive: true,
                usedByUserIds: []
            };
            // 5000 < 10000
            const result = validateCoupon(coupon as any, 5000, 'user1');
            expect(result.isValid).toBe(false);
            expect(result.reason).toContain('최소 주문 금액');
        });

        it('should fail if expired', () => {
            const coupon = {
                code: 'TEST',
                minOrderAmount: 0,
                validUntil: { toDate: () => new Date('2020-01-01') }, // Past
                isActive: true,
                usedByUserIds: []
            };
            const result = validateCoupon(coupon as any, 10000, 'user1');
            expect(result.isValid).toBe(false);
            expect(result.reason).toContain('유효기간');
        });

        it('should fail if already used by user', () => {
            const coupon = {
                code: 'TEST',
                minOrderAmount: 0,
                validUntil: { toDate: () => new Date('2099-12-31') },
                isActive: true,
                usedByUserIds: ['user1'] // Used
            };
            const result = validateCoupon(coupon as any, 10000, 'user1');
            expect(result.isValid).toBe(false);
            expect(result.reason).toContain('이미 사용');
        });
    });
});

```

---

## File: src\services\eventService.ts

```typescript
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Event } from '../types/event';

const getEventCollection = (storeId: string) => collection(db, 'stores', storeId, 'events');

/**
 * 이벤트 생성
 */
export async function createEvent(
  storeId: string,
  eventData: Omit<Event, 'id' | 'createdAt'>
): Promise<string> {
  try {
    const docRef = await addDoc(getEventCollection(storeId), {
      title: eventData.title,
      imageUrl: eventData.imageUrl,
      link: eventData.link,
      active: eventData.active,
      startDate: eventData.startDate instanceof Timestamp ? eventData.startDate : Timestamp.fromDate(new Date(eventData.startDate)),
      endDate: eventData.endDate instanceof Timestamp ? eventData.endDate : Timestamp.fromDate(new Date(eventData.endDate)),
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('이벤트 생성 실패:', error);
    throw error;
  }
}

/**
 * 이벤트 수정
 */
export async function updateEvent(
  storeId: string,
  eventId: string,
  eventData: Partial<Omit<Event, 'id' | 'createdAt'>>
): Promise<void> {
  try {
    const eventRef = doc(db, 'stores', storeId, 'events', eventId);
    const updateData: any = {};

    if (eventData.title !== undefined) updateData.title = eventData.title;
    if (eventData.imageUrl !== undefined) updateData.imageUrl = eventData.imageUrl;
    if (eventData.link !== undefined) updateData.link = eventData.link;
    if (eventData.active !== undefined) updateData.active = eventData.active;
    if (eventData.startDate !== undefined) {
      const start = eventData.startDate as any;
      updateData.startDate = start instanceof Timestamp ? start : Timestamp.fromDate(new Date(start));
    }
    if (eventData.endDate !== undefined) {
      const end = eventData.endDate as any;
      updateData.endDate = end instanceof Timestamp ? end : Timestamp.fromDate(new Date(end));
    }

    await updateDoc(eventRef, updateData);
  } catch (error) {
    console.error('이벤트 수정 실패:', error);
    throw error;
  }
}

/**
 * 이벤트 삭제
 */
export async function deleteEvent(
  storeId: string,
  eventId: string
): Promise<void> {
  try {
    const eventRef = doc(db, 'stores', storeId, 'events', eventId);
    await deleteDoc(eventRef);
  } catch (error) {
    console.error('이벤트 삭제 실패:', error);
    throw error;
  }
}

/**
 * 이벤트 활성화 토글
 */
export async function toggleEventActive(
  storeId: string,
  eventId: string,
  active: boolean
): Promise<void> {
  try {
    const eventRef = doc(db, 'stores', storeId, 'events', eventId);
    await updateDoc(eventRef, { active });
  } catch (error) {
    console.error('이벤트 활성화 상태 변경 실패:', error);
    throw error;
  }
}

/**
 * 모든 이벤트 쿼리 (생성일 내림차순)
 */
export function getAllEventsQuery(storeId: string) {
  return query(
    getEventCollection(storeId),
    orderBy('createdAt', 'desc')
  );
}

/**
 * 활성화된 이벤트만 조회
 */
export function getActiveEventsQuery(storeId: string) {
  return query(
    getEventCollection(storeId),
    where('active', '==', true),
    orderBy('startDate', 'asc')
  );
}

```

---

## File: src\services\reviewService.ts

```typescript
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Review, CreateReviewData, UpdateReviewData } from '../types/review';

// 컬렉션 참조 헬퍼
const getReviewCollection = (storeId: string) => collection(db, 'stores', storeId, 'reviews');

/**
 * 리뷰 생성
 */
export async function createReview(
  storeId: string,
  reviewData: CreateReviewData
): Promise<string> {
  try {
    // 1. 리뷰 생성
    const docRef = await addDoc(getReviewCollection(storeId), {
      ...reviewData,
      createdAt: serverTimestamp(),
    });

    // 2. 주문 문서에 리뷰 정보 미러링 (stores/{storeId}/orders/{orderId})
    const orderRef = doc(db, 'stores', storeId, 'orders', reviewData.orderId);
    await updateDoc(orderRef, {
      reviewed: true,
      reviewText: reviewData.comment,
      reviewRating: reviewData.rating,
      reviewedAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error('리뷰 생성 실패:', error);
    throw error;
  }
}

/**
 * 리뷰 수정
 */
export async function updateReview(
  storeId: string,
  reviewId: string,
  reviewData: UpdateReviewData
): Promise<void> {
  try {
    const reviewRef = doc(db, 'stores', storeId, 'reviews', reviewId);
    await updateDoc(reviewRef, {
      ...reviewData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('리뷰 수정 실패:', error);
    throw error;
  }
}

/**
 * 리뷰 삭제
 */
export async function deleteReview(
  storeId: string,
  reviewId: string,
  orderId: string
): Promise<void> {
  try {
    // 1. 리뷰 삭제
    const reviewRef = doc(db, 'stores', storeId, 'reviews', reviewId);
    await deleteDoc(reviewRef);

    // 2. 주문 문서 리뷰 필드 초기화 (주문이 존재할 경우에만)
    try {
      const orderRef = doc(db, 'stores', storeId, 'orders', orderId);
      await updateDoc(orderRef, {
        reviewed: false,
        reviewText: null,
        reviewRating: null,
        reviewedAt: null,
      });
    } catch (updateError: any) {
      // 주문이 이미 삭제된 경우(No document to update)는 무시
      if (updateError?.code === 'not-found' || updateError?.message?.includes('No document to update')) {
        console.warn('주문 문서를 찾을 수 없어 리뷰 상태를 업데이트하지 못했습니다 (주문 삭제됨).', orderId);
      } else {
        // 다른 에러는 로깅하되, 리뷰 삭제 자체는 성공했으므로 상위로 전파하지 않음 (선택 사항)
        // 상황에 따라 판단해야 하지만, 리뷰 삭제가 메인 의도이므로 경고만 남기겠습니다.
        console.error('주문 문서 업데이트 중 오류 발생:', updateError);
      }
    }
  } catch (error) {
    console.error('리뷰 삭제 실패:', error);
    throw error;
  }
}

/**
 * 특정 주문의 리뷰 조회
 */
export async function getReviewByOrder(
  storeId: string,
  orderId: string,
  userId: string
): Promise<Review | null> {
  try {
    const q = query(
      getReviewCollection(storeId),
      where('orderId', '==', orderId),
      where('userId', '==', userId)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as Review;
  } catch (error) {
    console.error('리뷰 조회 실패:', error);
    throw error;
  }
}

/**
 * 모든 리뷰 쿼리 (최신순)
 */
export function getAllReviewsQuery(storeId: string) {
  return query(
    getReviewCollection(storeId),
    orderBy('createdAt', 'desc')
  );
}

/**
 * 특정 평점 이상 리뷰 쿼리
 */
export function getReviewsByRatingQuery(storeId: string, minRating: number) {
  return query(
    getReviewCollection(storeId),
    where('rating', '>=', minRating),
    orderBy('rating', 'desc'),
    orderBy('createdAt', 'desc')
  );
}

```

---

## File: src\types\dashboard.ts

```typescript
import { BadgeVariant } from '../components/common/Badge';

export interface StatCardProps {
    label: string;
    value: number | string;
    icon: React.ReactNode;
    color: 'blue' | 'green' | 'orange' | 'purple';
    suffix?: string;
    loading?: boolean;
}

export interface QuickStatProps {
    label: string;
    value: number | string;
    suffix: string;
    color: 'blue' | 'green' | 'red' | 'orange' | 'purple';
}

export function getNoticeCategoryColor(category: string): BadgeVariant {
    switch (category) {
        case '공지': return 'primary';
        case '이벤트': return 'secondary';
        case '점검': return 'danger';
        case '할인': return 'success';
        default: return 'gray';
    }
}

```

---

## File: src\types\review.ts

```typescript
/**
 * 리뷰 타입 정의
 */

export interface Review {
  id: string;
  orderId: string;
  userId: string;
  userDisplayName: string;
  rating: number; // 1-5
  comment: string;
  images?: string[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface CreateReviewData extends Omit<Review, 'id' | 'createdAt' | 'updatedAt'> { }

export interface UpdateReviewData extends Partial<Omit<Review, 'id' | 'orderId' | 'userId' | 'createdAt'>> { }

```

---

## File: src\types\user.ts

```typescript
export interface User {
    id: string;
    email: string;
    displayName?: string;
    phone?: string;
    photoURL?: string;
    role?: 'user' | 'admin';
    createdAt?: any;
}

```

---

