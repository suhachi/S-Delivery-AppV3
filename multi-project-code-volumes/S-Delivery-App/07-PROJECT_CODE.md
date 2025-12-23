# S-Delivery-App - Volume 07

Generated: 2025-12-23 19:23:22
Project Path: D:\projectsing\S-Delivery-App\

- Files in volume: 19
- Approx size: 0.07 MB

---

## File: firebase.json

```json
{
    "firestore": {
        "rules": "firestore.rules",
        "indexes": "src/firestore.indexes.json"
    },
    "functions": [
        {
            "source": "functions",
            "codebase": "default",
            "ignore": [
                "node_modules",
                ".git",
                "firebase-debug.log",
                "firebase-debug.*.log"
            ],
            "predeploy": [
                "npm --prefix \"$RESOURCE_DIR\" run build"
            ]
        }
    ],
    "hosting": {
        "public": "build",
        "ignore": [
            "firebase.json",
            "**/.*",
            "**/node_modules/**"
        ],
        "rewrites": [
            {
                "source": "**",
                "destination": "/index.html"
            }
        ]
    },
    "storage": {
        "rules": "storage.rules"
    }
}
```

---

## File: generate-code-docs.ps1

```powershell
# Project Code Documentation Generator
# Creates 10 MD files with all source code

$ErrorActionPreference = "Stop"

# Create output folder
$outputFolder = "generated-code-docs"
if (Test-Path $outputFolder) {
    Remove-Item $outputFolder -Recurse -Force
}
New-Item -ItemType Directory -Path $outputFolder | Out-Null

Write-Host "Starting code documentation generation..." -ForegroundColor Green

# Collect all source files (excluding node_modules, dist)
$files = Get-ChildItem -Path "src" -Recurse -File -Include "*.ts","*.tsx","*.js","*.jsx","*.css","*.json" |
    Where-Object { $_.FullName -notmatch "node_modules|dist|build" } |
    Sort-Object FullName

Write-Host "Found $($files.Count) files" -ForegroundColor Cyan

# 파일을 카테고리별로 그룹화
$categories = @{
    "01-Config-And-Entry" = @("main.tsx", "App.tsx", "index.css", "vite-env.d.ts", "package.json", "firebase.json", "firestore.indexes.json", "firestore.rules", "storage.rules")
    "02-Type-Definitions" = @("types\")
    "03-Context-State" = @("contexts\")
    "04-Custom-Hooks" = @("hooks\")
    "05-Service-Layer" = @("services\")
    "06-Library-Utils" = @("lib\", "utils\", "devtools\")
    "07-Page-Main" = @("pages\WelcomePage.tsx", "pages\LoginPage.tsx", "pages\SignupPage.tsx", "pages\MyPage.tsx", "pages\MenuPage.tsx", "pages\CartPage.tsx", "pages\CheckoutPage.tsx", "pages\OrdersPage.tsx", "pages\OrderDetailPage.tsx", "pages\NoticePage.tsx", "pages\StoreSetupWizard.tsx")
    "08-Page-Admin" = @("pages\admin\")
    "09-Component-Common-UI" = @("components\common\", "components\ui\")
    "10-Component-Features" = @("components\menu\", "components\review\", "components\notice\", "components\event\", "components\admin\", "components\figma\", "data\")
}

# Generate MD file for each category
$categoryIndex = 1
foreach ($category in $categories.Keys | Sort-Object) {
    $patterns = $categories[$category]
    $mdContent = @()
    $mdContent += "# $category"
    $mdContent += ""
    $currentDate = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    $mdContent += "Generated: $currentDate"
    $mdContent += ""
    $mdContent += "---"
    $mdContent += ""

    $categoryFiles = @()
    foreach ($pattern in $patterns) {
        if ($pattern.EndsWith("\")) {
            # 디렉토리 패턴
            $categoryFiles += $files | Where-Object { $_.FullName -like "*\$pattern*" }
        } else {
            # 파일 패턴
            $categoryFiles += $files | Where-Object { $_.FullName -like "*\$pattern" }
        }
    }

    $categoryFiles = $categoryFiles | Sort-Object FullName | Select-Object -Unique

    Write-Host "Category '$category': $($categoryFiles.Count) files" -ForegroundColor Yellow

    foreach ($file in $categoryFiles) {
        $relativePath = $file.FullName.Replace((Get-Location).Path + "\", "")
        $mdContent += "## File: $relativePath"
        $mdContent += ""
        
        # 파일 확장자에 따른 언어 지정
        $extension = $file.Extension.ToLower()
        $language = switch ($extension) {
            ".tsx" { "typescript" }
            ".ts" { "typescript" }
            ".jsx" { "javascript" }
            ".js" { "javascript" }
            ".css" { "css" }
            ".json" { "json" }
            default { "" }
        }

        try {
            $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
            $mdContent += '```' + $language
            $mdContent += $content
            $mdContent += '```'
            $mdContent += ""
            $mdContent += "---"
            $mdContent += ""
        } catch {
            $errorMsg = $_.Exception.Message
            $mdContent += "Warning: Cannot read file - $errorMsg"
            $mdContent += ""
            $mdContent += "---"
            $mdContent += ""
        }
    }

    # MD 파일 저장
    $outputFile = Join-Path $outputFolder "$category.md"
    $mdContent | Out-File -FilePath $outputFile -Encoding UTF8
    Write-Host "생성됨: $outputFile" -ForegroundColor Green
}

# Generate index file
$indexContent = @()
$indexContent += "# Project Code Documentation Index"
$indexContent += ""
$indexDate = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
$indexContent += "Generated: $indexDate"
$indexContent += ""
$indexContent += "## Document List"
$indexContent += ""

foreach ($category in $categories.Keys | Sort-Object) {
    $indexContent += "- [$category](./$category.md)"
}

$indexContent += ""
$indexContent += "## Project Statistics"
$indexContent += ""
$totalFiles = $files.Count
$totalDocs = $categories.Count
$indexContent += "- Total Files: $totalFiles"
$indexContent += "- Total Documents: $totalDocs"

$indexFile = Join-Path $outputFolder "00-INDEX.md"
$indexContent | Out-File -FilePath $indexFile -Encoding UTF8

Write-Host ""
Write-Host "Documentation generation completed!" -ForegroundColor Green
Write-Host "Output folder: $outputFolder" -ForegroundColor Cyan
$totalGenerated = $categories.Count + 1
Write-Host "Total $totalGenerated MD files generated." -ForegroundColor Cyan

```

---

## File: index.html

```html
<!DOCTYPE html>
<html lang="ko">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <title>Simple Delivery App</title>
</head>

<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>

</html>
```

---

## File: scripts\clear_orders_only.js

```javascript
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc } from 'firebase/firestore';
import 'dotenv/config';

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

async function clearOrders() {
    console.log('🧹 Clearing Order History & Stats...');

    try {
        // Target: stores/default/orders
        const ordersRef = collection(db, 'stores', 'default', 'orders');
        const snapshot = await getDocs(ordersRef);

        if (snapshot.empty) {
            console.log('✅ No orders to delete.');
            process.exit(0);
        }

        console.log(`Found ${snapshot.size} orders. Deleting...`);

        // Delete fake orders one by one (Client SDK limit)
        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);

        console.log('✅ All orders deleted successfully.');
        console.log('📊 Revenue stats should now be reset to 0.');
        console.log('🏪 Store settings and menus are PRESERVED.');

    } catch (e) {
        console.error('Error clearing orders:', e);
    }
    process.exit(0);
}

clearOrders();

```

---

## File: src\components\admin\AdminSidebar.tsx

```typescript
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, UtensilsCrossed, Package, Ticket, Star, Bell, Calendar, Settings, Home, TrendingUp, Users } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';

interface AdminSidebarProps {
  className?: string;
}

export default function AdminSidebar({ className = '' }: AdminSidebarProps) {
  const location = useLocation();
  const { store } = useStore();

  const menuItems = [
    { path: '/admin', icon: <LayoutDashboard className="w-5 h-5" />, label: '대시보드', exact: true },
    { path: '/admin/orders', icon: <Package className="w-5 h-5" />, label: '주문 관리' },
    { path: '/admin/menus', icon: <UtensilsCrossed className="w-5 h-5" />, label: '메뉴 관리' },
    { path: '/admin/coupons', icon: <Ticket className="w-5 h-5" />, label: '쿠폰 관리' },
    { path: '/admin/reviews', icon: <Star className="w-5 h-5" />, label: '리뷰 관리' },
    { path: '/admin/notices', icon: <Bell className="w-5 h-5" />, label: '공지사항 관리' },
    { path: '/admin/events', icon: <Calendar className="w-5 h-5" />, label: '이벤트 관리' },
    { path: '/admin/members', icon: <Users className="w-5 h-5" />, label: '회원 관리' },
    { path: '/admin/stats', icon: <TrendingUp className="w-5 h-5" />, label: '매출 통계' },
    { path: '/admin/store-settings', icon: <Settings className="w-5 h-5" />, label: '상점 설정' },
  ];

  const isActive = (path: string, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className={`w-52 bg-white border-r border-gray-200 min-h-screen flex-shrink-0 ${className}`}>
      <div className="p-4">
        {/* 로고 영역 */}
        {/* 로고 영역 제거됨 */}

        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center space-x-2 px-3 py-2.5 rounded-lg transition-all
                ${isActive(item.path, item.exact)
                  ? 'gradient-primary text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              {item.icon}
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <Link
            to="/"
            className="flex items-center space-x-2 px-3 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
          >
            <Home className="w-5 h-5" />
            <span className="font-medium text-sm">사용자 페이지</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
```

---

## File: src\components\admin\Receipt.tsx

```typescript
import { Order } from '../../types/order';
import { Store } from '../../types/store';

interface ReceiptProps {
    order: Order | null;
    store: Store | null;
}

export default function Receipt({ order, store }: ReceiptProps) {
    if (!order) return null;

    // 1. 날짜 포맷팅 (YYYY. MM. DD. 오후 h:mm)
    const formatDate = (date: any) => {
        const d = date?.toDate ? date.toDate() : new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0'); // User example uses 12 (no spacing, just number)
        // Actually user example: 25. 12. 10. 오후 01:08
        // Let's match typical Korean format: YYYY. MM. DD. 
        const day = String(d.getDate()).padStart(2, '0');
        const hour = d.getHours();
        const minute = String(d.getMinutes()).padStart(2, '0');
        const ampm = hour >= 12 ? '오후' : '오전';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;

        // User example uses 2-digit year "25". Let's stick to full year or 2-digit as per preference. 
        // User text example: "2025.12.10."
        return `${year}.${month}.${day}. ${ampm} ${displayHour}:${minute}`;
    };

    // 2. 결제방식 매핑
    const getPaymentText = (type: string, isPickup: boolean) => {
        // 배달: 앱결제, 만나서카드, 만나서현금
        // 포장: 앱결제, 방문시결제
        if (type === '만나서카드') return '만나서 카드';
        if (type === '만나서현금') return '만나서 현금';
        if (type === '방문시결제') return '방문 시 결제';
        return '앱 결제'; // Default for '앱결제'
    };

    // 계산 로직
    const itemsPrice = order.items.reduce((total, item) => {
        const optionsPrice = item.options?.reduce((optSum, opt) => optSum + (opt.price * (opt.quantity || 1)), 0) || 0;
        return total + ((item.price + optionsPrice) * item.quantity);
    }, 0);

    const discountAmount = order.discountAmount || 0;
    const deliveryFee = order.totalPrice - itemsPrice + discountAmount;

    return (
        <div id="receipt-container">
            <div className="w-[280px] mx-auto bg-white text-black font-mono text-[12px] leading-snug p-2 pb-8">

                {/* 상점 정보 */}
                <div className="text-center mb-4">
                    <h1 className="text-xl font-bold mb-1">{store?.name || '상점'}</h1>
                    <p className="mb-0.5">{store?.address || ''}</p>
                    <p>Tel: {store?.phone || ''}</p>
                </div>

                {/* 주문 타입 배지 */}
                <div className="text-center mb-2">
                    <span className="inline-block border border-black px-2 py-0.5 font-bold text-sm">
                        [{order.orderType}]
                    </span>
                </div>

                {/* 주문 번호 */}
                <div className="text-center mb-2">
                    <p className="font-bold text-sm">주문번호: {order.id.slice(0, 4).toUpperCase()}</p>
                </div>

                {/* 주문 기본 정보 */}
                <div className="mb-2 space-y-0.5">
                    <div className="flex justify-between">
                        <span>일시</span>
                        <span>{formatDate(order.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>결제</span>
                        <span>{getPaymentText(order.paymentType, order.orderType === '포장주문')}</span>
                    </div>
                </div>

                {/* 고객 정보 */}
                <div className="mb-2 mt-4">
                    <p className="font-bold mb-1">고객 정보</p>
                    {order.orderType === '배달주문' && (
                        <p className="mb-1 break-words">{order.address}</p>
                    )}
                    <p className="mb-1">{order.phone}</p>
                    {/* 포장주문시 이름, 전화번호만 노출인데 이름이 없으므로 전화번호만 노출됨 (배달시엔 주소 포함) */}
                </div>

                {/* 요청 사항 */}
                {order.memo && (
                    <div className="mb-2">
                        <p className="font-bold mb-1">요청사항:</p>
                        <p className="break-words">{order.memo}</p>
                    </div>
                )}

                <div className="border-b border-black my-2"></div>

                {/* 메뉴 헤더 */}
                <div className="flex mb-1 font-bold">
                    <span className="flex-1">메뉴명</span>
                    <span className="w-8 text-center">수량</span>
                    <span className="w-16 text-right">금액</span>
                </div>

                <div className="border-b border-black mb-2"></div>

                {/* 메뉴 리스트 */}
                <div className="mb-2">
                    {order.items.map((item, index) => {
                        const optionsPrice = item.options?.reduce((sum, opt) => sum + (opt.price * (opt.quantity || 1)), 0) || 0;
                        const itemTotal = (item.price + optionsPrice) * item.quantity;
                        // Format: 
                        // Item Name    Qty    Price
                        // - Option            Price
                        //                     Total (aligned right)

                        return (
                            <div key={index} className="mb-2">
                                {/* 메인 메뉴 */}
                                <div className="flex items-start mb-0.5">
                                    <span className="flex-1 break-words pr-1">{item.name}</span>
                                    <span className="w-8 text-center">{item.quantity}</span>
                                    <span className="w-16 text-right">{item.price.toLocaleString()}</span>
                                </div>

                                {/* 옵션 리스트 */}
                                {item.options && item.options.map((opt, optIdx) => (
                                    <div key={optIdx} className="flex text-gray-800 mb-0.5">
                                        <span className="flex-1 break-words pl-2 text-[11px]">- {opt.name}</span>
                                        <span className="w-8 text-center text-[11px]"></span> {/* 옵션 수량 표시는 보통 생략하거나 이름 옆에 */}
                                        <span className="w-16 text-right text-[11px]">+{(opt.price * (opt.quantity || 1)).toLocaleString()}</span>
                                    </div>
                                ))}

                                {/* 항목 소계 (옵션 포함 총액) */}
                                <div className="text-right font-bold mt-1">
                                    {itemTotal.toLocaleString()}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="border-b border-black my-2"></div>

                {/* 금액 집계 */}
                <div className="space-y-1 mb-2">
                    <div className="flex justify-between">
                        <span>주문금액</span>
                        <span>{itemsPrice.toLocaleString()}</span>
                    </div>
                    {deliveryFee > 0 && (
                        <div className="flex justify-between">
                            <span>배달팁</span>
                            <span>+{deliveryFee.toLocaleString()}</span>
                        </div>
                    )}
                    {discountAmount > 0 && (
                        <div className="flex justify-between">
                            <span>할인금액</span>
                            <span>-{discountAmount.toLocaleString()}</span>
                        </div>
                    )}
                </div>

                <div className="border-b border-black my-2"></div>

                {/* 최종 합계 */}
                <div className="flex justify-between text-lg font-bold mb-4">
                    <span>합계</span>
                    <span>{order.totalPrice.toLocaleString()}원</span>
                </div>

                <div className="border-b border-black my-4"></div>

                {/* 푸터 */}
                <div className="text-center">
                    <p className="mb-1 font-bold">* 이용해 주셔서 감사합니다 *</p>
                    <p className="text-[10px]">Powered by CusCom</p>
                </div>

            </div>
        </div>
    );
}

```

---

## File: src\components\ui\accordion.tsx

```typescript
"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion@1.2.3";
import { ChevronDownIcon } from "lucide-react@0.487.0";

import { cn } from "./utils";

function Accordion({
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-b last:border-b-0", className)}
      {...props}
    />
  );
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180",
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm"
      {...props}
    >
      <div className={cn("pt-0 pb-4", className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };

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

## File: src\components\ui\form.tsx

```typescript
"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label@2.1.2";
import { Slot } from "@radix-ui/react-slot@1.1.2";
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form@7.55.0";

import { cn } from "./utils";
import { Label } from "./label";

const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue,
);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name: fieldContext.name });
  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue,
);

function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        data-slot="form-item"
        className={cn("grid gap-2", className)}
        {...props}
      />
    </FormItemContext.Provider>
  );
}

function FormLabel({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  const { error, formItemId } = useFormField();

  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      className={cn("data-[error=true]:text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  );
}

function FormControl({ ...props }: React.ComponentProps<typeof Slot>) {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  return (
    <Slot
      data-slot="form-control"
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  );
}

function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { formDescriptionId } = useFormField();

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function FormMessage({ className, ...props }: React.ComponentProps<"p">) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? "") : props.children;

  if (!body) {
    return null;
  }

  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      className={cn("text-destructive text-sm", className)}
      {...props}
    >
      {body}
    </p>
  );
}

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
};

```

---

## File: src\data\mockMenus.ts

```typescript
import { Menu } from '../types/menu';

export const mockMenus: Menu[] = [
  {
    id: '1',
    name: '소고기 쌀국수',
    price: 9500,
    category: ['인기메뉴', '기본메뉴'],
    description: '부드러운 소고기와 신선한 야채가 들어간 정통 베트남 쌀국수입니다. 진한 육수가 일품입니다.',
    imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&q=80',
    soldout: false,
    options: [
      { id: 'opt1', name: '면 추가', price: 2000 },
      { id: 'opt2', name: '고기 추가', price: 3000 },
      { id: 'opt3', name: '야채 추가', price: 1500 },
    ],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: '해물 쌀국수',
    price: 11000,
    category: ['인기메뉴', '추천메뉴'],
    description: '신선한 새우, 오징어, 조개가 듬뿍 들어간 푸짐한 해물 쌀국수입니다.',
    imageUrl: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=800&q=80',
    soldout: false,
    options: [
      { id: 'opt1', name: '면 추가', price: 2000 },
      { id: 'opt4', name: '해물 추가', price: 4000 },
    ],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '3',
    name: '닭고기 쌀국수',
    price: 8500,
    category: ['기본메뉴'],
    description: '담백한 닭고기로 만든 건강한 쌀국수입니다. 깔끔한 맛을 원하시는 분께 추천합니다.',
    imageUrl: 'https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=800&q=80',
    soldout: false,
    options: [
      { id: 'opt1', name: '면 추가', price: 2000 },
      { id: 'opt5', name: '닭고기 추가', price: 2500 },
    ],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '4',
    name: '베지테리언 쌀국수',
    price: 8000,
    category: ['기본메뉴', '추천메뉴'],
    description: '신선한 야채만으로 만든 건강한 채식 쌀국수입니다.',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
    soldout: false,
    options: [
      { id: 'opt1', name: '면 추가', price: 2000 },
      { id: 'opt3', name: '야채 추가', price: 1500 },
    ],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '5',
    name: '월남쌈',
    price: 7000,
    category: ['사이드메뉴', '인기메뉴'],
    description: '신선한 야채와 새우를 라이스 페이퍼로 감싼 건강한 월남쌈입니다.',
    imageUrl: 'https://images.unsplash.com/photo-1559054663-e8fbaa5b6c53?w=800&q=80',
    soldout: false,
    options: [],
    createdAt: new Date('2024-01-02'),
  },
  {
    id: '6',
    name: '분짜',
    price: 10000,
    category: ['기본메뉴'],
    description: '숯불에 구운 돼지고기와 쌀국수를 특제 소스에 찍어 먹는 베트남 요리입니다.',
    imageUrl: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=800&q=80',
    soldout: false,
    options: [
      { id: 'opt6', name: '돼지고기 추가', price: 3000 },
    ],
    createdAt: new Date('2024-01-02'),
  },
  {
    id: '7',
    name: '짜조',
    price: 6000,
    category: ['사이드메뉴'],
    description: '바삭하게 튀긴 베트남식 스프링롤입니다.',
    imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&q=80',
    soldout: false,
    options: [],
    createdAt: new Date('2024-01-02'),
  },
  {
    id: '8',
    name: '베트남 커피',
    price: 4500,
    category: ['음료', '인기메뉴'],
    description: '진한 베트남식 연유 커피입니다.',
    imageUrl: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=800&q=80',
    soldout: false,
    options: [
      { id: 'opt7', name: '아이스', price: 500 },
    ],
    createdAt: new Date('2024-01-03'),
  },
  {
    id: '9',
    name: '코코넛 주스',
    price: 3500,
    category: ['음료'],
    description: '신선한 코코넛 주스입니다.',
    imageUrl: 'https://images.unsplash.com/photo-1608023136037-626dad6c6188?w=800&q=80',
    soldout: false,
    options: [],
    createdAt: new Date('2024-01-03'),
  },
  {
    id: '10',
    name: '사이공 맥주',
    price: 5000,
    category: ['주류'],
    description: '베트남 대표 맥주 사이공입니다.',
    imageUrl: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=800&q=80',
    soldout: false,
    options: [],
    createdAt: new Date('2024-01-03'),
  },
];

```

---

## File: src\hooks\useFirebaseAuth.ts

```typescript
import { useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface User {
  id: string;
  email: string;
  displayName?: string;
  phone?: string;
}

// 데모 계정 정보
const DEMO_ACCOUNTS = {
  'user@demo.com': {
    password: 'demo123',
    id: 'demo-user-001',
    email: 'user@demo.com',
    displayName: '데모 사용자',
    isAdmin: false,
  },
  'admin@demo.com': {
    password: 'admin123',
    id: 'demo-admin-001',
    email: 'admin@demo.com',
    displayName: '관리자',
    isAdmin: true,
  },
};

export function useFirebaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 데모 모드 확인
  const isDemoMode = auth.app.options.apiKey === 'demo-api-key';

  useEffect(() => {
    // 데모 모드인 경우 로컬 스토리지에서 사용자 정보 로드
    if (isDemoMode) {
      const demoUser = localStorage.getItem('demoUser');
      if (demoUser) {
        setUser(JSON.parse(demoUser));
      }
      setLoading(false);
      return;
    }

    // Firebase 인증 모드
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Firestore에서 추가 정보(phone 등) 가져오기
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();

        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: userData?.displayName || firebaseUser.displayName || undefined, // Firestore 데이터 우선
          phone: userData?.phone || undefined,
        });

        // Firestore에 사용자 문서 생성 (없으면)
        if (!userDoc.exists()) {
          await ensureUserDocument(firebaseUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isDemoMode]);

  const signup = async (email: string, password: string, displayName?: string, phone?: string) => {
    // 데모 모드
    if (isDemoMode) {
      // 데모 모드에서는 회원가입 시뮬레이션
      const newUser: User = {
        id: `demo-user-${Date.now()}`,
        email,
        displayName: displayName || email.split('@')[0],
        phone: phone || '010-0000-0000',
      };
      setUser(newUser);
      localStorage.setItem('demoUser', JSON.stringify(newUser));
      localStorage.setItem('demoIsAdmin', 'false');
      return;
    }

    // Firebase 모드
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // 프로필 업데이트
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }

      // Firestore에 사용자 문서 생성
      await createUserDocument(userCredential.user, displayName, phone);

      return userCredential.user;
    } catch (error) {
      const errorCode = (error as { code?: string }).code || 'unknown';
      throw new Error(getAuthErrorMessage(errorCode));
    }
  };

  const login = async (email: string, password: string) => {
    // 데모 모드
    if (isDemoMode) {
      const demoAccount = DEMO_ACCOUNTS[email as keyof typeof DEMO_ACCOUNTS];

      if (!demoAccount) {
        throw new Error('존재하지 않는 사용자입니다. 데모 계정을 사용해주세요:\n- user@demo.com / demo123\n- admin@demo.com / admin123');
      }

      if (demoAccount.password !== password) {
        throw new Error('잘못된 비밀번호입니다');
      }

      // 데모 계정 로그인
      const { id, email: demoEmail, displayName, isAdmin } = demoAccount;
      const demoUser: User = { id, email: demoEmail, displayName };

      setUser(demoUser);
      localStorage.setItem('demoUser', JSON.stringify(demoUser));
      localStorage.setItem('demoIsAdmin', String(isAdmin));

      return;
    }

    // Firebase 모드
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      const errorCode = (error as { code?: string }).code || 'unknown';
      throw new Error(getAuthErrorMessage(errorCode));
    }
  };

  const logout = async () => {
    // 데모 모드
    if (isDemoMode) {
      setUser(null);
      localStorage.removeItem('demoUser');
      localStorage.removeItem('demoIsAdmin');
      return;
    }

    // Firebase 모드
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      throw new Error('로그아웃에 실패했습니다');
    }
  };

  return { user, loading, signup, login, logout };
}

// Firestore에 사용자 문서 생성
async function createUserDocument(firebaseUser: FirebaseUser, displayName?: string, phone?: string) {
  const userRef = doc(db, 'users', firebaseUser.uid);

  await setDoc(userRef, {
    email: firebaseUser.email,
    displayName: displayName || firebaseUser.email?.split('@')[0] || '',
    phone: phone || '',
    createdAt: new Date(),
    updatedAt: new Date(),
  }, { merge: true });
}

// 사용자 문서 확인 및 생성
async function ensureUserDocument(firebaseUser: FirebaseUser) {
  const userRef = doc(db, 'users', firebaseUser.uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    await createUserDocument(firebaseUser, firebaseUser.displayName || undefined);
  }
}

// Firebase 에러 메시지 한글화
function getAuthErrorMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    'auth/email-already-in-use': '이미 사용 중인 이메일입니다',
    'auth/invalid-email': '올바른 이메일 형식이 아닙니다',
    'auth/operation-not-allowed': '이메일/비밀번호 로그인이 비활성화되어 있습니다',
    'auth/weak-password': '비밀번호는 최소 6자 이상이어야 합니다',
    'auth/user-disabled': '비활성화된 계정입니다',
    'auth/user-not-found': '존재하지 않는 사용자입니다',
    'auth/wrong-password': '잘못된 비밀번호입니다',
    'auth/too-many-requests': '너무 많은 시도가 있었습니다. 잠시 후 다시 시도해주세요',
    'auth/network-request-failed': '네트워크 오류가 발생했습니다',
  };

  return errorMessages[errorCode] || '인증 오류가 발생했습니다';
}
```

---

## File: src\pages\admin\AdminNoticeManagement.tsx

```typescript
import { useState } from 'react';
import { Plus, Edit2, Trash2, X, Pin } from 'lucide-react';
import { Notice, NOTICE_CATEGORIES } from '../../types/notice';
import { toast } from 'sonner';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import { formatDateShort } from '../../utils/formatDate';
import { useStore } from '../../contexts/StoreContext';
import { useFirestoreCollection } from '../../hooks/useFirestoreCollection';
import { createNotice, updateNotice, deleteNotice, toggleNoticePinned, getAllNoticesQuery } from '../../services/noticeService';

export default function AdminNoticeManagement() {
  const { store } = useStore();
  if (!store?.id) return null;

  const { data: notices, loading } = useFirestoreCollection<Notice>(
    getAllNoticesQuery(store.id)
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);

  const handleAddNotice = () => {
    setEditingNotice(null);
    setIsModalOpen(true);
  };

  const handleEditNotice = (notice: Notice) => {
    setEditingNotice(notice);
    setIsModalOpen(true);
  };

  const handleDeleteNotice = async (noticeId: string) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await deleteNotice(store.id, noticeId);
        toast.success('공지사항이 삭제되었습니다');
      } catch (error) {
        toast.error('공지사항 삭제에 실패했습니다');
      }
    }
  };

  const handleTogglePin = async (noticeId: string, currentPinned: boolean) => {
    try {
      await toggleNoticePinned(store.id, noticeId, !currentPinned);
      toast.success('고정 상태가 변경되었습니다');
    } catch (error) {
      toast.error('고정 상태 변경에 실패했습니다');
    }
  };

  const handleSaveNotice = async (noticeData: Omit<Notice, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingNotice) {
        await updateNotice(store.id, editingNotice.id, noticeData);
        toast.success('공지사항이 수정되었습니다');
      } else {
        await createNotice(store.id, noticeData);
        toast.success('공지사항이 추가되었습니다');
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error('공지사항 저장에 실패했습니다');
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '공지': return 'primary';
      case '이벤트': return 'secondary';
      case '점검': return 'danger';
      case '할인': return 'success';
      default: return 'default';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl mb-2">
                <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                  공지사항 관리
                </span>
              </h1>
              <p className="text-gray-600">총 {notices?.length || 0}개의 공지사항</p>
            </div>
            <Button onClick={handleAddNotice}>
              <Plus className="w-5 h-5 mr-2" />
              공지사항 추가
            </Button>
          </div>

          {/* Notice List */}
          <div className="space-y-4">
            {notices?.map((notice) => (
              <Card key={notice.id}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {notice.pinned && (
                        <Pin className="w-4 h-4 text-blue-600" />
                      )}
                      <Badge
                        variant={getCategoryColor(notice.category) as any}
                        size="sm"
                      >
                        {notice.category}
                      </Badge>
                      <h3 className="font-semibold text-gray-900">
                        {notice.title}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {notice.content}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDateShort(notice.createdAt)}
                    </p>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant={notice.pinned ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => handleTogglePin(notice.id, notice.pinned)}
                    >
                      <Pin className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditNotice(notice)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteNotice(notice.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {(!notices || notices.length === 0) && (
              <div className="text-center py-10 text-gray-500 bg-white rounded-lg shadow-sm border border-gray-100">
                등록된 공지사항이 없습니다.
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Notice Form Modal */}
      {isModalOpen && (
        <NoticeFormModal
          notice={editingNotice}
          onSave={handleSaveNotice}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

interface NoticeFormModalProps {
  notice: Notice | null;
  onSave: (notice: Omit<Notice, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

function NoticeFormModal({ notice, onSave, onClose }: NoticeFormModalProps) {
  const [formData, setFormData] = useState<Partial<Notice>>(
    notice || {
      title: '',
      content: '',
      category: '공지',
      pinned: false,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.content) {
      toast.error('필수 항목을 모두 입력해주세요');
      return;
    }

    onSave(formData as Omit<Notice, 'id' | 'createdAt' | 'updatedAt'>);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {notice ? '공지사항 수정' : '공지사항 추가'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="제목"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              카테고리
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
              className="w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
            >
              {NOTICE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              내용
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              rows={8}
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="pinned"
              checked={formData.pinned}
              onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="pinned" className="ml-2 text-sm text-gray-700">
              상단 고정
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" fullWidth onClick={onClose}>
              취소
            </Button>
            <Button type="submit" fullWidth>
              {notice ? '수정' : '추가'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
```

---

## File: src\pages\admin\AdminStoreSettings.tsx

```typescript
/**
 * 관리자 상점 설정 페이지
 * 상점 정보 수정, 브랜딩, 운영 시간 등 설정
 */

import { useState, useEffect } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useStore } from '../../contexts/StoreContext';
import { UpdateStoreFormData } from '../../types/store';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import ImageUpload from '../../components/common/ImageUpload';
import AddressSearchInput from '../../components/common/AddressSearchInput';
import { uploadStoreImage } from '../../services/storageService';
import { Store, Save, Plus } from 'lucide-react';

export default function AdminStoreSettings() {
  const navigate = useNavigate();
  const { store, loading } = useStore();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<UpdateStoreFormData>({
    name: '',
    description: '',
    phone: '',
    email: '',
    address: '',
    deliveryFee: 0,
    minOrderAmount: 0,
    logoUrl: '',
    bannerUrl: '',
    primaryColor: '#3b82f6',
  });

  useEffect(() => {
    if (store) {
      setFormData({
        name: store.name,
        description: store.description,
        phone: store.phone,
        email: store.email,
        address: store.address,
        deliveryFee: store.deliveryFee,
        minOrderAmount: store.minOrderAmount,
        logoUrl: store.logoUrl || '',
        bannerUrl: store.bannerUrl || '',
        primaryColor: store.primaryColor || '#3b82f6',
        settings: store.settings, // 기존 설정 유지
      });
    }
  }, [store]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!store) {
      toast.error('상점 정보를 불러올 수 없습니다');
      return;
    }

    setSaving(true);

    try {
      const storeRef = doc(db, 'stores', 'default');
      await updateDoc(storeRef, {
        ...formData,
        updatedAt: serverTimestamp(),
      });

      toast.success('상점 정보가 업데이트되었습니다');
    } catch (error) {
      console.error('Failed to update store:', error);
      toast.error('상점 정보 업데이트에 실패했습니다');
    } finally {
      setSaving(false);
    }
  };

  if (!store) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <div className="max-w-2xl mx-auto text-center py-16">
            {loading ? (
              // 로딩 중
              <div className="space-y-4">
                <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto animate-pulse">
                  <Store className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">상점 정보 로딩 중...</h2>
                <p className="text-gray-600">잠시만 기다려주세요</p>
              </div>
            ) : (
              // 상점이 없을 때
              <div className="space-y-6">
                <div className="w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto">
                  <Store className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">상점이 없습니다</h2>
                  <p className="text-gray-600 mb-6">
                    현재 운영 중인 상점이 없습니다.<br />
                    상점을 생성하여 배달 앱 운영을 시작하세요.
                  </p>
                  <Button
                    onClick={() => navigate('/store-setup')}
                    size="lg"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    새 상점 생성하기
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center">
                <Store className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl">
                <span className="bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                  상점 설정
                </span>
              </h1>
            </div>
            <p className="text-gray-600">
              상점 정보와 설정을 관리합니다
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 기본 정보 */}
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-6">기본 정보</h2>

              <div className="space-y-5">
                <Input
                  label="상점 이름"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    상점 설명
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none"
                    rows={4}
                  />
                </div>
              </div>
            </Card>

            {/* 연락처 정보 */}
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-6">연락처 정보</h2>

              <div className="space-y-5">
                <Input
                  label="전화번호"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />

                <Input
                  label="이메일"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />

                <AddressSearchInput
                  label="주소"
                  value={formData.address}
                  onChange={(address) => setFormData({ ...formData, address })}
                  required
                />
              </div>
            </Card>

            {/* 배달 설정 */}
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-6">배달 설정</h2>

              <div className="space-y-5">
                <Input
                  label="배달비 (원)"
                  type="number"
                  value={formData.deliveryFee}
                  onChange={(e) => setFormData({ ...formData, deliveryFee: parseInt(e.target.value) || 0 })}
                  required
                />

                <Input
                  label="최소 주문 금액 (원)"
                  type="number"
                  value={formData.minOrderAmount}
                  onChange={(e) => setFormData({ ...formData, minOrderAmount: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
            </Card>

            {/* 배달 대행 설정 (v2.0) */}
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-6">배달 대행 연동</h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    대행사 선택
                  </label>
                  <select
                    value={formData.settings?.deliverySettings?.provider || 'manual'}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: {
                        ...formData.settings!,
                        deliverySettings: {
                          ...formData.settings?.deliverySettings,
                          provider: e.target.value as any
                        }
                      }
                    })}
                    className="w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="manual">연동 안 함 (자체 배달/전화 호출)</option>
                    <option value="saenggagdaero">생각대로 (Thinking)</option>
                    <option value="barogo">바로고 (Barogo)</option>
                    <option value="vroong">부릉 (Vroong)</option>
                  </select>
                </div>

                {/* API 설정 (연동 시에만 표시) */}
                {formData.settings?.deliverySettings?.provider !== 'manual' && formData.settings?.deliverySettings?.provider && (
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <Input
                      label="상점 ID (Shop ID)"
                      value={formData.settings.deliverySettings.shopId || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        settings: {
                          ...formData.settings!,
                          deliverySettings: {
                            ...formData.settings?.deliverySettings!,
                            shopId: e.target.value
                          }
                        }
                      })}
                      placeholder="대행사에서 발급받은 상점 코드를 입력하세요"
                    />
                    <Input
                      label="API Key"
                      type="password"
                      value={formData.settings.deliverySettings.apiKey || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        settings: {
                          ...formData.settings!,
                          deliverySettings: {
                            ...formData.settings?.deliverySettings!,
                            apiKey: e.target.value
                          }
                        }
                      })}
                      placeholder="API Key 입력"
                    />
                    <Input
                      label="API Secret"
                      type="password"
                      value={formData.settings.deliverySettings.apiSecret || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        settings: {
                          ...formData.settings!,
                          deliverySettings: {
                            ...formData.settings?.deliverySettings!,
                            apiSecret: e.target.value
                          }
                        }
                      })}
                      placeholder="API Secret 입력"
                    />

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Webhook URL (대행사 등록용)</p>
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded select-all block break-all">
                        https://us-central1-{import.meta.env.VITE_FIREBASE_PROJECT_ID}.cloudfunctions.net/deliveryWebhook
                      </code>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* 브랜딩 */}
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-6">브랜딩</h2>

              <div className="space-y-5">
                <ImageUpload
                  label="상점 로고 (선택)"
                  currentImageUrl={formData.logoUrl}
                  onImageUploaded={(url) => {
                    setFormData(prev => ({ ...prev, logoUrl: url }));
                  }}
                  onUpload={(file) => uploadStoreImage(file, 'logo')}
                  aspectRatio="square"
                  circle
                />

                <ImageUpload
                  label="배너 이미지 (선택)"
                  currentImageUrl={formData.bannerUrl}
                  onImageUploaded={(url) => {
                    setFormData(prev => ({ ...prev, bannerUrl: url }));
                  }}
                  onUpload={(file) => uploadStoreImage(file, 'banner')}
                  aspectRatio="wide"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    메인 테마 색상
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <Input
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button
                type="submit"
                disabled={saving}
                size="lg"
              >
                <Save className="w-5 h-5 mr-2" />
                {saving ? '저장 중...' : '변경사항 저장'}
              </Button>
            </div>
          </form>
        </div>
      </main>
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

## File: src\services\userService.ts

```typescript
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User } from '../types/user';

// User 타입 정의 (기존 types/user.ts가 없다면 여기에 정의하거나 types 폴더에 추가해야 함)
// 일단 간단한 인터페이스 사용
export interface UserProfile {
    id: string;
    name: string;
    phone: string;
    email: string;
    createdAt: any;
}

const COLLECTION_NAME = 'users';

export async function searchUsers(keyword: string): Promise<UserProfile[]> {
    try {
        const usersRef = collection(db, COLLECTION_NAME);
        let q;

        // 전화번호로 검색 (정확히 일치하거나 시작하는 경우)
        if (/^[0-9-]+$/.test(keyword)) {
            q = query(
                usersRef,
                where('phone', '>=', keyword),
                where('phone', '<=', keyword + '\uf8ff'),
                limit(5)
            );
        } else {
            // 이름으로 검색
            q = query(
                usersRef,
                where('displayName', '>=', keyword),
                where('displayName', '<=', keyword + '\uf8ff'),
                limit(5)
            );
        }

        const snapshot = await getDocs(q);
        const users: UserProfile[] = [];

        snapshot.forEach((doc) => {
            const data = doc.data();
            users.push({
                id: doc.id,
                name: data.displayName || data.name || '이름 없음',
                phone: data.phone || '',
                email: data.email || '',
                createdAt: data.createdAt,
            });
        });

        return users;
    } catch (error) {
        console.error('사용자 검색 실패:', error);
        return [];
    }
}

// 전체 사용자 목록 가져오기 (최근 가입순 20명)
export async function getRecentUsers(): Promise<UserProfile[]> {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            orderBy('createdAt', 'desc'),
            limit(20)
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name || '이름 없음',
            phone: doc.data().phone || '',
            email: doc.data().email || '',
            createdAt: doc.data().createdAt,
        })) as UserProfile[];
    } catch (error) {
        console.error('사용자 목록 로드 실패:', error);
        return [];
    }
}

```

---

## File: src\storage.rules

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // 헬퍼 함수들
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
             firestore.get(/databases/(default)/documents/admins/$(request.auth.uid)).data.isAdmin == true;
    }
    
    function isImageFile() {
      return request.resource.contentType.matches('image/.*');
    }
    
    function isSizeValid() {
      // 최대 5MB
      return request.resource.size < 5 * 1024 * 1024;
    }
    
    // 메뉴 이미지
    match /menus/{menuId}/{fileName} {
      // 읽기: 로그인한 사용자
      allow read: if isAuthenticated();
      
      // 업로드: 관리자만, 이미지 파일, 5MB 이하
      allow write: if isAdmin() && 
                     isImageFile() && 
                     isSizeValid();
                     
      // 삭제: 관리자만
      allow delete: if isAdmin();
    }
    
    // 프로필 이미지
    match /profiles/{userId}/{fileName} {
      // 읽기: 로그인한 사용자
      allow read: if isAuthenticated();
      
      // 업로드: 본인만, 이미지 파일, 5MB 이하
      allow write: if isAuthenticated() && 
                     request.auth.uid == userId &&
                     isImageFile() && 
                     isSizeValid();
                     
      // 삭제: 본인 또는 관리자
      allow delete: if isAuthenticated() && 
                      (request.auth.uid == userId || isAdmin());
    }
    
    // 리뷰 이미지 (선택적)
    match /reviews/{reviewId}/{fileName} {
      // 읽기: 로그인한 사용자
      allow read: if isAuthenticated();
      
      // 업로드: 로그인한 사용자, 이미지 파일, 5MB 이하
      allow write: if isAuthenticated() && 
                     isImageFile() && 
                     isSizeValid();
                     
      // 삭제: 업로더 본인 또는 관리자 (추가 검증 필요)
      allow delete: if isAdmin();
    }
    
    // 이벤트 배너 이미지
    match /events/{eventId}/{fileName} {
      // 읽기: 로그인한 사용자
      allow read: if isAuthenticated();
      
      // 업로드: 관리자만, 이미지 파일, 5MB 이하
      allow write: if isAdmin() && 
                     isImageFile() && 
                     isSizeValid();
                     
      // 삭제: 관리자만
      allow delete: if isAdmin();
    }
    
    // 공지사항 이미지 (선택적)
    match /notices/{noticeId}/{fileName} {
      // 읽기: 로그인한 사용자
      allow read: if isAuthenticated();
      
      // 업로드: 관리자만, 이미지 파일, 5MB 이하
      allow write: if isAdmin() && 
                     isImageFile() && 
                     isSizeValid();
                     
      // 삭제: 관리자만
      allow delete: if isAdmin();
    }
    
    // 기본적으로 모든 다른 파일은 거부
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}

```

---

## File: src\types\global.d.ts

```typescript
export { };

declare global {
    interface Window {
        AUTHNICE?: {
            requestPay: (params: NicepayRequestParams) => void;
        };
    }
}

export interface NicepayRequestParams {
    clientId: string;
    method: string;
    orderId: string;
    amount: number;
    goodsName: string;
    returnUrl: string;
    fnError?: (result: any) => void; // 결제 실패 시 콜백
    // 필요한 경우 추가 필드 정의
    buyerName?: string;
    buyerEmail?: string;
    buyerTel?: string;
    mallReserved?: string; // 상점 예비정보
}

export interface NicepaySuccessResult {
    resultCode: string;
    resultMsg: string;
    authResultCode: string;
    authResultMsg: string;
    tid: string;
    clientId: string;
    orderId: string;
    amount: number;
    mallReserved?: string;
    authToken: string; // 승인 요청 시 필요
    signature: string; // 위변조 검증
}

```

---

## File: storage.rules

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // 기본적으로 모든 읽기/쓰기 거부
    match /{allPaths=**} {
      allow read, write: if false;
    }

    // 상점 이미지 (로고, 배너) - 읽기: 모두, 쓰기: 인증된 사용자
    match /store/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // 메뉴 이미지 - 읽기: 모두, 쓰기: 인증된 사용자
    match /menus/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // 이벤트 이미지 - 읽기: 모두, 쓰기: 인증된 사용자
    match /events/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // 리뷰 이미지 - 읽기: 모두, 쓰기: 인증된 사용자
    match /reviews/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // 프로필 이미지 - 읽기: 모두, 쓰기: 본인만 (간소화를 위해 인증된 사용자 허용)
    match /profiles/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}

```

---

## File: vitest.config.ts

```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/test/setup.ts',
        include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    },
});

```

---

