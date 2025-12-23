# Project Code Volume 10

Generated: 2025-12-23 14:30:55
Root: D:\projectsing\S-Delivery-AppV3\

- Files in volume: 19
- Approx size: 0.07 MB

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

## File: src\components\common\NotificationGuide.tsx

```typescript
import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import Button from './Button';

const STORAGE_KEY = 'notification_guide_dismissed';

export default function NotificationGuide() {
  const [show, setShow] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // 브라우저가 알림을 지원하지 않으면 표시하지 않음
    if (!('Notification' in window)) {
      return;
    }

    // 이미 dismiss 했으면 표시하지 않음
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed === 'true') {
      return;
    }

    // 현재 권한 상태 확인
    setPermission(Notification.permission);

    // 권한이 default일 때만 배너 표시
    if (Notification.permission === 'default') {
      setShow(true);
    }
  }, []);

  const handleRequestPermission = async () => {
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        setShow(false);
        localStorage.setItem(STORAGE_KEY, 'true');
      } else if (result === 'denied') {
        setShow(false);
        localStorage.setItem(STORAGE_KEY, 'true');
      }
    } catch (error) {
      console.error('알림 권한 요청 실패:', error);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  if (!show) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg animate-slide-down">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold">주문 알림을 받으시겠습니까?</p>
              <p className="text-sm text-blue-100">주문 상태가 변경되면 실시간으로 알려드립니다</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={handleRequestPermission}
              variant="outline"
              size="sm"
              className="bg-white text-blue-600 hover:bg-blue-50 border-0"
            >
              허용
            </Button>
            <button
              onClick={handleDismiss}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

```

---

## File: src\components\menu\MenuDetailModal.tsx

```typescript
import { useState } from 'react';
import { X, Plus, Minus, ShoppingCart } from 'lucide-react';
import { Menu, MenuOption } from '../../types/menu';
import { useCart } from '../../contexts/CartContext';
import { toast } from 'sonner';
import Button from '../common/Button';
import Badge from '../common/Badge';

interface MenuDetailModalProps {
  menu: Menu;
  onClose: () => void;
}

export default function MenuDetailModal({ menu, onClose }: MenuDetailModalProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<MenuOption[]>([]);

  const toggleOption = (option: MenuOption) => {
    setSelectedOptions(prev => {
      const exists = prev.find(opt => opt.id === option.id);
      if (exists) {
        return prev.filter(opt => opt.id !== option.id);
      } else {
        return [...prev, { ...option, quantity: 1 }];
      }
    });
  };

  const updateOptionQuantity = (optionId: string, delta: number) => {
    setSelectedOptions(prev => {
      return prev.map(opt => {
        if (opt.id === optionId) {
          const newQuantity = (opt.quantity || 1) + delta;
          if (newQuantity < 1) return opt; // Minimum 1
          return { ...opt, quantity: newQuantity };
        }
        return opt;
      });
    });
  };

  const getTotalPrice = () => {
    const optionsPrice = selectedOptions.reduce((sum, opt) => sum + (opt.price * (opt.quantity || 1)), 0);
    return (menu.price + optionsPrice) * quantity;
  };

  const handleAddToCart = () => {
    if (menu.soldout) {
      toast.error('품절된 메뉴입니다');
      return;
    }

    addItem({
      menuId: menu.id,
      name: menu.name,
      price: menu.price,
      quantity,
      options: selectedOptions,
      imageUrl: menu.imageUrl,
    });

    toast.success(`${menu.name}을(를) 장바구니에 담았습니다`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <div className="overflow-y-auto max-h-[90vh]">
          {/* Image */}
          <div className="relative aspect-[16/9] bg-gray-100">
            {menu.imageUrl ? (
              <img
                src={menu.imageUrl}
                alt={menu.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <span className="text-8xl">🍜</span>
              </div>
            )}

            {menu.soldout && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Badge variant="danger" size="lg">
                  품절
                </Badge>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Header */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-2 mb-2">
                {menu.category.map((cat) => (
                  <Badge key={cat} variant="primary">
                    {cat}
                  </Badge>
                ))}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{menu.name}</h2>
              <p className="text-gray-600">{menu.description}</p>
            </div>

            {/* Price */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <span className="text-3xl font-bold text-blue-600">
                {menu.price.toLocaleString()}
              </span>
              <span className="text-lg text-gray-600 ml-2">원</span>
            </div>

            {/* Options */}
            {menu.options && menu.options.length > 0 && (
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">옵션 선택</h3>
                <div className="space-y-2">
                  {menu.options.map((option) => {
                    const selected = selectedOptions.find(opt => opt.id === option.id);
                    return (
                      <div
                        key={option.id}
                        className={`
                          w-full rounded-lg border-2 transition-all overflow-hidden
                          ${selected
                            ? 'border-blue-500 bg-white'
                            : 'border-gray-200 hover:border-gray-300'
                          }
                        `}
                      >
                        <button
                          onClick={() => toggleOption(option)}
                          className="w-full flex items-center justify-between p-4 text-left"
                        >
                          <span className="font-medium text-gray-900">{option.name}</span>
                          <span className={`${selected ? 'text-blue-600' : 'text-gray-900'} font-semibold`}>
                            +{option.price.toLocaleString()}원
                          </span>
                        </button>

                        {selected && option.quantity !== undefined && (
                          <div className="flex items-center justify-between bg-blue-50 p-3 border-t border-blue-100 animate-slide-down">
                            <span className="text-sm text-blue-800 font-medium ml-1">수량</span>
                            <div className="flex items-center bg-white rounded-lg border border-blue-200 shadow-sm">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateOptionQuantity(option.id, -1);
                                }}
                                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:bg-gray-50 rounded-l-lg transition-colors"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-8 text-center text-sm font-bold text-gray-900">
                                {selected.quantity || 1}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateOptionQuantity(option.id, 1);
                                }}
                                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:bg-gray-50 rounded-r-lg transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">수량</h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="text-2xl font-bold text-gray-900 min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Total & Add to Cart */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">총 금액</p>
                <p className="text-2xl font-bold text-blue-600">
                  {getTotalPrice().toLocaleString()}원
                </p>
              </div>
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={menu.soldout}
                className="flex-1"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                장바구니 담기
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## File: src\components\review\ReviewList.test.tsx

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ReviewList from './ReviewList';
import { useStore } from '../../contexts/StoreContext';
import { useFirestoreCollection } from '../../hooks/useFirestoreCollection';

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
}));

describe('ReviewList', () => {
    const mockStore = { id: 'store_1' };

    beforeEach(() => {
        vi.clearAllMocks();
        (useStore as any).mockReturnValue({ store: mockStore });
        // Default safe return
        (useFirestoreCollection as any).mockReturnValue({ data: [], loading: false });
    });

    it('should render nothing if no store', () => {
        (useStore as any).mockReturnValue({ store: null });
        // Even with null store, hook might be called or component returns early. 
        // If hook is called, it needs return value.
        const { container } = render(<ReviewList />);
        expect(container).toBeEmptyDOMElement();
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

    it('should render reviews and statistics', () => {
        const mockReviews = [
            {
                id: 'review_1',
                rating: 5,
                comment: 'Great!',
                userDisplayName: 'User A',
                createdAt: '2024-01-01',
                images: []
            },
            {
                id: 'review_2',
                rating: 3,
                comment: 'Okay',
                userDisplayName: 'User B',
                createdAt: '2024-01-02',
                images: ['img.jpg']
            }
        ];

        (useFirestoreCollection as any).mockReturnValue({
            data: mockReviews,
            loading: false,
        });

        render(<ReviewList />);

        // Statistics: Avg (5+3)/2 = 4.0
        expect(screen.getByText('4.0')).toBeInTheDocument();
        expect(screen.getByText('총 2개의 리뷰')).toBeInTheDocument();

        // Review content
        expect(screen.getByText('Great!')).toBeInTheDocument();
        expect(screen.getByText('Okay')).toBeInTheDocument();

        // Check "1개" (rating count) appears
        const countElements = screen.getAllByText('1개');
        expect(countElements.length).toBeGreaterThanOrEqual(1);
    });
});

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

## File: src\components\ui\input.tsx

```typescript
import * as React from "react";

import { cn } from "./utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base bg-input-background transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className,
      )}
      {...props}
    />
  );
}

export { Input };

```

---

## File: src\components\ui\scroll-area.tsx

```typescript
"use client";

import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area@1.2.3";

import { cn } from "./utils";

function ScrollArea({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Root>) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn("relative", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        className="focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1"
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(
        "flex touch-none p-px transition-colors select-none",
        orientation === "vertical" &&
          "h-full w-2.5 border-l border-l-transparent",
        orientation === "horizontal" &&
          "h-2.5 flex-col border-t border-t-transparent",
        className,
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className="bg-border relative flex-1 rounded-full"
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
}

export { ScrollArea, ScrollBar };

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

## File: src\firebase.json

```json
{
  "hosting": {
    "public": "dist",
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
    ],
    "headers": [
      {
        "source": "/index.html",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache, no-store, must-revalidate"
          }
        ]
      },
      {
        "source": "/static/**",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      }
    ]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}

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

## File: src\pages\WelcomePage.tsx

```typescript
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../contexts/StoreContext';

/**
 * 인트로 페이지 (Intro / Splash Screen)
 * 앱 실행 시 잠시 로고와 상점 이름을 보여주고 메인 페이지로 이동
 */
export default function WelcomePage() {
  const navigate = useNavigate();
  const { store } = useStore();

  useEffect(() => {
    // 2초 후 메뉴 페이지로 자동 이동
    const timer = setTimeout(() => {
      navigate('/menu');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4 animate-fade-in">
      {/* 로고 또는 대표 이미지 */}
      {/* 로고 또는 대표 이미지 */}
      {store?.logoUrl ? (
        <img
          src={store.logoUrl}
          alt={store.name}
          className="w-48 h-48 md:w-64 md:h-64 mb-8 rounded-3xl object-cover shadow-lg transform hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="w-48 h-48 md:w-64 md:h-64 mb-8 rounded-3xl gradient-primary flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-500">
          <span className="text-8xl md:text-9xl">🍜</span>
        </div>
      )}

      {/* 상점 이름 */}
      <h1 className="text-4xl md:text-5xl font-bold text-primary-600 text-center mb-2">
        {store?.name || 'Simple Delivery'}
      </h1>

      {/* 로딩 인디케이터 (선택) */}
      <div className="mt-8 flex gap-2">
        <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}
```

---

## File: src\services\delivery\mockProvider.ts

```typescript
import { DeliveryProvider, DeliveryRequestData, DeliveryResponse } from './types';
import { DeliverySettings } from '../../types/store';

export class MockDeliveryProvider implements DeliveryProvider {
    async createOrder(data: DeliveryRequestData, settings: DeliverySettings): Promise<DeliveryResponse> {
        console.log('[MockDelivery] Creating Order:', data);
        console.log('[MockDelivery] Using Settings:', settings);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Basic Validation Mock
        if (!settings.apiKey && settings.provider !== 'manual') {
            return { success: false, message: 'API Key가 설정되지 않았습니다.' };
        }

        return {
            success: true,
            deliveryId: `MOCK-${Date.now()}`,
            estimatedCost: 3500,
            message: '배달 대행 요청이 접수되었습니다. (테스트)'
        };
    }

    async cancelOrder(deliveryId: string, settings: DeliverySettings): Promise<DeliveryResponse> {
        console.log('[MockDelivery] Cancelling Order:', deliveryId);
        await new Promise(resolve => setTimeout(resolve, 500));

        return {
            success: true,
            message: '배달 요청이 취소되었습니다.'
        };
    }

    async checkStatus(deliveryId: string, settings: DeliverySettings): Promise<string> {
        return 'PICKUP_PENDING';
    }
}

```

---

## File: src\types\coupon.ts

```typescript
export interface Coupon {
  id: string;
  code: string;
  name: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  createdAt: Date;
  // 특정 회원에게만 발급된 쿠폰인 경우
  assignedUserId?: string;
  assignedUserName?: string;
  assignedUserPhone?: string;
  // 사용 여부 (1회만 사용 가능)
  isUsed: boolean;
  usedAt?: Date;
  usedByUserIds?: string[]; // 이 쿠폰을 사용한 사용자 ID 목록
}

export const DISCOUNT_TYPE_LABELS = {
  percentage: '퍼센트 할인',
  fixed: '금액 할인',
};
```

---

## File: src\utils\formatDate.ts

```typescript
/**
 * 날짜 포맷 유틸리티
 */

/**
 * Firestore Timestamp 또는 Date를 "YYYY-MM-DD HH:mm:ss" 형식으로 변환
 */
export function formatDate(date: Date | { toDate?: () => Date }): string {
  const d = date instanceof Date ? date : date.toDate?.() || new Date();
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * "MM/DD HH:mm" 형식으로 변환
 */
export function formatDateShort(date: Date | { toDate?: () => Date }): string {
  const d = date instanceof Date ? date : date.toDate?.() || new Date();
  
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return `${month}/${day} ${hours}:${minutes}`;
}

/**
 * 상대적 시간 표시 ("방금", "5분 전", "1시간 전", "어제", "MM/DD")
 */
export function formatDateRelative(date: Date | { toDate?: () => Date }): string {
  const d = date instanceof Date ? date : date.toDate?.() || new Date();
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (seconds < 60) return '방금';
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days === 1) return '어제';
  if (days < 7) return `${days}일 전`;
  
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${month}/${day}`;
}

/**
 * 날짜를 "YYYY년 MM월 DD일" 형식으로 변환
 */
export function formatDateKorean(date: Date | { toDate?: () => Date }): string {
  const d = date instanceof Date ? date : date.toDate?.() || new Date();
  
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  
  return `${year}년 ${month}월 ${day}일`;
}

export default {
  formatDate,
  formatDateShort,
  formatDateRelative,
  formatDateKorean,
};

```

---

