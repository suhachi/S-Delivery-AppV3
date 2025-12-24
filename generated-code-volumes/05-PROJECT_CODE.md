# Project Code Volume 05

Generated: 2025-12-24 14:30:56
Root: D:\projectsing\S-Delivery-AppV3\

- Files in volume: 21
- Approx size: 0.08 MB

---

## File: functions\lib\index.js

```javascript
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
const admin = require("firebase-admin");
admin.initializeApp();
__exportStar(require("./scheduled/statsDailyV3"), exports);
//# sourceMappingURL=index.js.map
```

---

## File: functions\lib\utils\dateKST.js

```javascript
"use strict";
/**
 * KST Date Helpers
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getYesterdayKSTRange = void 0;
function getYesterdayKSTRange() {
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
exports.getYesterdayKSTRange = getYesterdayKSTRange;
//# sourceMappingURL=dateKST.js.map
```

---

## File: src\components\common\AddressSearchModal.tsx

```typescript
import DaumPostcodeEmbed from 'react-daum-postcode';
import { X } from 'lucide-react';

interface AddressSearchModalProps {
    onComplete: (address: string) => void;
    onClose: () => void;
}

export default function AddressSearchModal({ onComplete, onClose }: AddressSearchModalProps) {
    const handleComplete = (data: any) => {
        let fullAddress = data.address;
        let extraAddress = '';

        if (data.addressType === 'R') {
            if (data.bname !== '') {
                extraAddress += data.bname;
            }
            if (data.buildingName !== '') {
                extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
            }
            fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
        }

        onComplete(fullAddress);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden animate-slide-up"
                onClick={(e) => e.stopPropagation()}
                style={{ height: '550px', display: 'flex', flexDirection: 'column' }}
            >
                <div className="flex justify-between items-center p-4 border-b bg-gray-50 flex-shrink-0">
                    <h3 className="text-lg font-bold text-gray-900">주소 검색</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
                <div className="flex-1 w-full relative">
                    <DaumPostcodeEmbed
                        onComplete={handleComplete}
                        style={{ width: '100%', height: '100%' }}
                        autoClose={false}
                    />
                </div>
            </div>
        </div>
    );
}

```

---

## File: src\components\common\ImageUpload.tsx

```typescript
import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { uploadMenuImage, validateImageFile } from '../../services/storageService';
import { toast } from 'sonner';

interface ImageUploadProps {
  label?: string;
  currentImageUrl?: string;
  onImageUploaded: (url: string) => void;
  // Optional specific props
  menuId?: string;
  onUpload?: (file: File, onProgress: (progress: number) => void) => Promise<string>;
  aspectRatio?: 'square' | 'wide' | 'standard'; // square=1:1, wide=16:9, standard=4:3
  circle?: boolean; // For profile/logo images
  defaultImage?: string; // Fallback or initial image
}

export default function ImageUpload({
  label = '이미지',
  currentImageUrl,
  onImageUploaded,
  menuId,
  onUpload,
  aspectRatio = 'standard',
  circle = false,
  defaultImage
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentImageUrl || defaultImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAspectRatioClass = () => {
    if (circle) return 'aspect-square rounded-full';
    switch (aspectRatio) {
      case 'square': return 'aspect-square rounded-lg';
      case 'wide': return 'aspect-[16/9] rounded-lg';
      case 'standard': default: return 'aspect-[4/3] rounded-lg';
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 유효성 검사
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    // 미리보기 생성
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // 업로드 실행
    setUploading(true);
    try {
      let downloadURL = '';

      if (onUpload) {
        // 커스텀 업로드 함수 사용
        downloadURL = await onUpload(file, (p) => setProgress(p));
      } else if (menuId) {
        // 기존 메뉴 이미지 업로드 (하위 호환)
        downloadURL = await uploadMenuImage(file, menuId, (p) => setProgress(p));
      } else {
        throw new Error('Upload handler is missing');
      }

      onImageUploaded(downloadURL);
      toast.success('이미지가 업로드되었습니다');
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      toast.error('이미지 업로드에 실패했습니다');
      setPreviewUrl(currentImageUrl || defaultImage);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(undefined);
    onImageUploaded('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      <div className="relative w-full">
        {previewUrl ? (
          <div className={`relative overflow-hidden bg-gray-100 border-2 border-gray-200 ${getAspectRatioClass()}`}>
            <img
              src={previewUrl}
              alt="미리보기"
              className="w-full h-full object-cover"
            />
            {uploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p>{Math.round(progress)}%</p>
                </div>
              </div>
            )}
            {!uploading && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-md transform hover:scale-105"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className={`w-full border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors flex flex-col items-center justify-center text-gray-500 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 ${getAspectRatioClass()}`}
          >
            <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
            <p className="text-sm font-medium">이미지 업로드</p>
            <p className="text-xs mt-1 text-gray-400">JPG, PNG, WebP (최대 5MB)</p>
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}

```

---

## File: src\components\common\Input.tsx

```typescript
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full px-4 py-2.5 
              ${icon ? 'pl-10' : ''} 
              text-gray-900 bg-white 
              border rounded-lg 
              ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} 
              focus:ring-2 focus:border-transparent 
              transition-all duration-200 
              placeholder:text-gray-400
              disabled:bg-gray-100 disabled:cursor-not-allowed
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-red-600 animate-fade-in">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

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

## File: src\components\ui\context-menu.tsx

```typescript
"use client";

import * as React from "react";
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu@2.2.6";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react@0.487.0";

import { cn } from "./utils";

function ContextMenu({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Root>) {
  return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />;
}

function ContextMenuTrigger({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Trigger>) {
  return (
    <ContextMenuPrimitive.Trigger data-slot="context-menu-trigger" {...props} />
  );
}

function ContextMenuGroup({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Group>) {
  return (
    <ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />
  );
}

function ContextMenuPortal({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Portal>) {
  return (
    <ContextMenuPrimitive.Portal data-slot="context-menu-portal" {...props} />
  );
}

function ContextMenuSub({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Sub>) {
  return <ContextMenuPrimitive.Sub data-slot="context-menu-sub" {...props} />;
}

function ContextMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.RadioGroup>) {
  return (
    <ContextMenuPrimitive.RadioGroup
      data-slot="context-menu-radio-group"
      {...props}
    />
  );
}

function ContextMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.SubTrigger> & {
  inset?: boolean;
}) {
  return (
    <ContextMenuPrimitive.SubTrigger
      data-slot="context-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto" />
    </ContextMenuPrimitive.SubTrigger>
  );
}

function ContextMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.SubContent>) {
  return (
    <ContextMenuPrimitive.SubContent
      data-slot="context-menu-sub-content"
      className={cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-context-menu-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg",
        className,
      )}
      {...props}
    />
  );
}

function ContextMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Content>) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content
        data-slot="context-menu-content"
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-context-menu-content-available-height) min-w-[8rem] origin-(--radix-context-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md",
          className,
        )}
        {...props}
      />
    </ContextMenuPrimitive.Portal>
  );
}

function ContextMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Item> & {
  inset?: boolean;
  variant?: "default" | "destructive";
}) {
  return (
    <ContextMenuPrimitive.Item
      data-slot="context-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function ContextMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.CheckboxItem>) {
  return (
    <ContextMenuPrimitive.CheckboxItem
      data-slot="context-menu-checkbox-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.CheckboxItem>
  );
}

function ContextMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.RadioItem>) {
  return (
    <ContextMenuPrimitive.RadioItem
      data-slot="context-menu-radio-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>
  );
}

function ContextMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Label> & {
  inset?: boolean;
}) {
  return (
    <ContextMenuPrimitive.Label
      data-slot="context-menu-label"
      data-inset={inset}
      className={cn(
        "text-foreground px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
        className,
      )}
      {...props}
    />
  );
}

function ContextMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Separator>) {
  return (
    <ContextMenuPrimitive.Separator
      data-slot="context-menu-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}

function ContextMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="context-menu-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className,
      )}
      {...props}
    />
  );
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
};

```

---

## File: src\components\ui\use-mobile.ts

```typescript
import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined,
  );

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
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

## File: src\hooks\useUpsell.ts

```typescript
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Menu } from '../types/menu';
import { CartItem } from '../contexts/CartContext';

export function useUpsell(storeId: string | undefined, cartItems: CartItem[]) {
    const [upsellItems, setUpsellItems] = useState<Menu[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!storeId || cartItems.length === 0) {
            setUpsellItems([]);
            return;
        }

        const fetchUpsellItems = async () => {
            setLoading(true);
            try {
                // 간단한 추천 로직:
                // 장바구니에 '음료' 카테고리가 없으면 음료 추천
                // 장바구니에 '사이드' 카테고리가 없으면 사이드 추천
                // (단, 현재 CartItem에는 category 정보가 없어서, 이름 기반이나 별도 확인 필요하지만
                //  MVP에서는 단순히 '사이드', '음료' 카테고리의 인기 메뉴를 가져와서
                //  이미 장바구니에 있는건 제외하고 보여주는 식으로 구현)

                // 1. 추천 후보 카테고리 선정
                const targetCategories = ['사이드', '음료', '디저트'];

                // 2. 해당 카테고리 메뉴 Fetch (각 카테고리별 2~3개씩 or 전체에서 인기순 10개)
                // 여기서는 'isRecommended' 필드가 있다면 좋겠지만, 없으므로 단순 조회
                const menusRef = collection(db, 'stores', storeId, 'menus');
                const q = query(
                    menusRef,
                    where('category', 'array-contains-any', targetCategories),
                    where('soldout', '==', false),
                    where('isHidden', '==', false), // 숨김 메뉴 제외
                    limit(10)
                );

                const snapshot = await getDocs(q);
                const candidates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Menu));

                // 3. 장바구니에 이미 있는 메뉴 제외
                const cartMenuIds = new Set(cartItems.map(item => item.menuId));
                const filtered = candidates.filter(menu => !cartMenuIds.has(menu.id));

                // 4. 최대 5개 랜덤 또는 순서대로 선택
                setUpsellItems(filtered.slice(0, 5));

            } catch (error) {
                console.error('Failed to fetch upsell items:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUpsellItems();
    }, [storeId, cartItems.length]); // cartItems 변경 시 재계산 (최적화 필요 시 length만 체크)

    return { upsellItems, loading };
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
                      {notice.createdAt ? formatDateShort(notice.createdAt) : '...'}
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
import Badge from '../../components/common/Badge';
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
    isOrderingPaused: false,
    pausedReason: '',
    settings: {
      autoAcceptOrders: false,
      estimatedDeliveryTime: 30,
      paymentMethods: ['앱결제', '만나서카드'],
      enableReviews: true,
      enableCoupons: false,
      enableNotices: true,
      enableEvents: true,
      deliverySettings: {
        provider: 'manual',
        shopId: '',
        apiKey: '',
        apiSecret: ''
      }
    }
  });

  useEffect(() => {
    if (store) {
      setFormData({
        name: store.name || '',
        description: store.description || '',
        phone: store.phone || '',
        email: store.email || '',
        address: store.address || '',
        deliveryFee: store.deliveryFee || 0,
        minOrderAmount: store.minOrderAmount || 0,
        logoUrl: store.logoUrl || '',
        bannerUrl: store.bannerUrl || '',
        primaryColor: store.primaryColor || '#3b82f6',
        isOrderingPaused: store.isOrderingPaused || false,
        pausedReason: store.pausedReason || '',
        settings: {
          autoAcceptOrders: store.settings?.autoAcceptOrders ?? false,
          estimatedDeliveryTime: store.settings?.estimatedDeliveryTime ?? 30,
          paymentMethods: store.settings?.paymentMethods ?? ['앱결제', '만나서카드'],
          enableReviews: store.settings?.enableReviews ?? true,
          enableCoupons: store.settings?.enableCoupons ?? false,
          enableNotices: store.settings?.enableNotices ?? true,
          enableEvents: store.settings?.enableEvents ?? true,
          deliverySettings: {
            provider: store.settings?.deliverySettings?.provider || 'manual',
            shopId: store.settings?.deliverySettings?.shopId || '',
            apiKey: store.settings?.deliverySettings?.apiKey || '',
            apiSecret: store.settings?.deliverySettings?.apiSecret || ''
          }
        }
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
      // formData contains isOrderingPaused which matches top-level Store interface
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
            {/* 매장 상태 (ATOM-131) */}
            <Card className={formData.isOrderingPaused ? "border-l-4 border-l-red-500" : "border-l-4 border-l-green-500"}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">매장 운영 상태</h2>
                <Badge variant={formData.isOrderingPaused ? "danger" : "success"} size="lg">
                  {formData.isOrderingPaused ? "영업 일시중지" : "정상 영업 중"}
                </Badge>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 mb-1">
                      {formData.isOrderingPaused ? "현재 주문을 받고 있지 않습니다" : "주문을 받을 준비가 되었습니다"}
                    </p>
                    <p className="text-sm text-gray-600">
                      매장이 바쁘거나 재료가 소진되었을 때 주문 접수를 일시적으로 중단할 수 있습니다.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={formData.isOrderingPaused || false}
                      onChange={(e) => setFormData({ ...formData, isOrderingPaused: e.target.checked })}
                    />
                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-500"></div>
                  </label>
                </div>

                {formData.isOrderingPaused && (
                  <div className="animate-fade-in">
                    <Input
                      label="중지 사유 (선택)"
                      placeholder="예: 주문 폭주로 인해 잠시 중단합니다"
                      value={formData.pausedReason || ''}
                      onChange={(e) => setFormData({ ...formData, pausedReason: e.target.value })}
                    />
                  </div>
                )}
              </div>
            </Card>

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

## File: src\pages\MenuPage.tsx

```typescript
import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import CategoryBar from '../components/menu/CategoryBar';
import MenuCard from '../components/menu/MenuCard';
import Input from '../components/common/Input';
import { useStore } from '../contexts/StoreContext';
import { useFirestoreCollection } from '../hooks/useFirestoreCollection';
import { getAllMenusQuery } from '../services/menuService';
import { Menu } from '../types/menu';
import ReviewPreview from '../components/review/ReviewPreview';

export default function MenuPage() {
  const { store } = useStore();
  const storeId = store?.id;
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');

  // Firestore에서 메뉴 조회
  const { data: menus, loading } = useFirestoreCollection<Menu>(
    storeId ? getAllMenusQuery(storeId) : null
  );

  const filteredMenus = useMemo(() => {
    if (!menus) return [];

    let filtered = menus;

    // Category filter
    if (selectedCategory !== '전체') {
      filtered = filtered.filter(menu => menu.category.includes(selectedCategory));
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(menu =>
        menu.name.toLowerCase().includes(query) ||
        menu.description.toLowerCase().includes(query)
      );
    }

    // IsHidden filter (ATOM-121: 완전 미노출)
    filtered = filtered.filter(menu => !menu.isHidden);

    return filtered;
  }, [menus, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <CategoryBar selected={selectedCategory} onSelect={setSelectedCategory} />

      <div className="py-6">
        {/* Header - 모바일 최적화 */}
        <div className="container mx-auto px-4 mb-6">
          <h1 className="text-2xl sm:text-3xl mb-2">
            <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              메뉴
            </span>
          </h1>
          <p className="text-sm sm:text-base text-gray-600">신선하고 맛있는 메뉴를 만나보세요</p>
        </div>

        {/* Search - 모바일 최적화 */}
        <div className="container mx-auto px-4 mb-6">
          <Input
            type="text"
            placeholder="메뉴를 검색해보세요"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-5 h-5" />}
          />
        </div>

        {/* Results Info */}
        <div className="container mx-auto px-4 mb-4">
          <p className="text-sm text-gray-600">
            총 <span className="font-semibold text-blue-600">{filteredMenus.length}</span>개의 메뉴
          </p>
        </div>

        {/* Menu List - 모바일 가로 스크롤, 데스크톱 그리드 */}
        {filteredMenus.length > 0 ? (
          <>
            {/* 모바일: 가로 스크롤 */}
            <div className="md:hidden">
              <div className="flex gap-4 overflow-x-auto hide-scrollbar px-4 snap-x snap-mandatory">
                {filteredMenus.map((menu) => (
                  <div key={menu.id} className="flex-shrink-0 w-[280px] snap-start">
                    <MenuCard menu={menu} />
                  </div>
                ))}
              </div>
            </div>

            {/* 데스크톱: 그리드 */}
            <div className="hidden md:block container mx-auto px-4">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMenus.map((menu) => (
                  <MenuCard key={menu.id} menu={menu} />
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="container mx-auto px-4">
            <div className="text-center py-16">
              <div className="text-5xl sm:text-6xl mb-4">🔍</div>
              <p className="text-lg sm:text-xl text-gray-600 mb-2">검색 결과가 없습니다</p>
              <p className="text-sm sm:text-base text-gray-500">다른 검색어를 시도해보세요</p>
            </div>
          </div>
        )}
      </div>

      {/* Review Preview Section */}
      <ReviewPreview />
    </div>
  );
}
```

---

## File: src\pages\OrderDetailPage.test.tsx

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import OrderDetailPage from './OrderDetailPage';
import { useStore } from '../contexts/StoreContext';
import { useFirestoreDocument } from '../hooks/useFirestoreDocument';
import { useParams, useNavigate } from 'react-router-dom';

// Mock dependencies
vi.mock('react-router-dom', () => ({
    useParams: vi.fn(),
    useNavigate: vi.fn(),
}));

vi.mock('../contexts/StoreContext', () => ({
    useStore: vi.fn(),
}));

vi.mock('../hooks/useFirestoreDocument', () => ({
    useFirestoreDocument: vi.fn(),
}));

vi.mock('../components/common/Card', () => ({
    default: ({ children }: any) => <div data-testid="card">{children}</div>,
}));

// Mock lucide icons
vi.mock('lucide-react', () => ({
    ArrowLeft: () => <span>ArrowLeft</span>,
    MapPin: () => <span>MapPin</span>,
    Phone: () => <span>Phone</span>,
    CreditCard: () => <span>CreditCard</span>,
    Clock: () => <span>Clock</span>,
    Package: () => <span>Package</span>,
    CheckCircle2: () => <span>CheckCircle2</span>,
    MessageSquare: () => <span>MessageSquare</span>,
    AlertCircle: () => <span>AlertCircle</span>,
}));

describe('OrderDetailPage', () => {
    const mockNavigate = vi.fn();
    const mockStore = { id: 'store_1' };

    beforeEach(() => {
        vi.clearAllMocks();
        (useNavigate as any).mockReturnValue(mockNavigate);
        (useStore as any).mockReturnValue({ store: mockStore });
        (useParams as any).mockReturnValue({ orderId: 'order_123' });
    });

    it('should render loading state', () => {
        (useFirestoreDocument as any).mockReturnValue({
            data: null,
            loading: true,
            error: null
        });

        render(<OrderDetailPage />);
        expect(screen.getByText('주문 정보를 불러오는 중...')).toBeInTheDocument();
    });

    it('should render error/not found state', () => {
        (useFirestoreDocument as any).mockReturnValue({
            data: null,
            loading: false,
            error: new Error('Failed')
        });

        render(<OrderDetailPage />);
        // Component renders one of these
        expect(screen.getByText('주문 정보를 불러오는데 실패했습니다')).toBeInTheDocument();
    });

    it('should render order details when loaded', () => {
        const mockOrder = {
            id: 'order_123',
            status: '접수',
            totalPrice: 15000,
            items: [
                { name: 'Pizza', price: 15000, quantity: 1, options: [] }
            ],
            createdAt: { toDate: () => new Date('2024-01-01T12:00:00') },
            address: 'Seoul Grid',
            phone: '010-1234-5678',
            paymentType: 'card',
            orderType: '배달'
        };

        (useFirestoreDocument as any).mockReturnValue({
            data: mockOrder,
            loading: false,
            error: null
        });

        render(<OrderDetailPage />);

        expect(screen.getByText('주문 상세')).toBeInTheDocument();
        expect(screen.getByText('주문번호: order_12')).toBeInTheDocument();
        expect(screen.getByText('Pizza')).toBeInTheDocument();
        // Price appears multiple times, check at least one
        expect(screen.getAllByText('15,000원').length).toBeGreaterThan(0);
    });

    it('should navigate back when button clicked', () => {
        (useFirestoreDocument as any).mockReturnValue({
            data: { id: '1', status: '접수', items: [], totalPrice: 0, createdAt: new Date() },
            loading: false,
            error: null
        });

        render(<OrderDetailPage />);

        const backButton = screen.getByText('주문 목록으로');
        fireEvent.click(backButton);

        expect(mockNavigate).toHaveBeenCalledWith('/orders');
    });
});

```

---

## File: src\services\couponService.ts

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
  orderBy,
  increment,
  arrayUnion
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Coupon } from '../types/coupon';

// 컬렉션 참조 헬퍼 (stores/{storeId}/coupons)
const getCouponCollection = (storeId: string) => collection(db, 'stores', storeId, 'coupons');

// 쿠폰 생성
export async function createCoupon(storeId: string, couponData: Omit<Coupon, 'id' | 'createdAt' | 'usedCount'>) {
  try {
    const docRef = await addDoc(getCouponCollection(storeId), {
      ...couponData,
      usedCount: 0,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('쿠폰 생성 실패:', error);
    throw error;
  }
}

// 쿠폰 수정
export async function updateCoupon(storeId: string, couponId: string, couponData: Partial<Coupon>) {
  try {
    const couponRef = doc(db, 'stores', storeId, 'coupons', couponId);
    await updateDoc(couponRef, {
      ...couponData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('쿠폰 수정 실패:', error);
    throw error;
  }
}

// 쿠폰 삭제
export async function deleteCoupon(storeId: string, couponId: string) {
  try {
    const couponRef = doc(db, 'stores', storeId, 'coupons', couponId);
    await deleteDoc(couponRef);
  } catch (error) {
    console.error('쿠폰 삭제 실패:', error);
    throw error;
  }
}

// 쿠폰 활성화/비활성화
export async function toggleCouponActive(storeId: string, couponId: string, isActive: boolean) {
  try {
    const couponRef = doc(db, 'stores', storeId, 'coupons', couponId);
    await updateDoc(couponRef, {
      isActive,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('쿠폰 상태 변경 실패:', error);
    throw error;
  }
}

// 쿠폰 사용
export async function useCoupon(storeId: string, couponId: string, userId: string) {
  try {
    const couponRef = doc(db, 'stores', storeId, 'coupons', couponId);
    await updateDoc(couponRef, {
      usedCount: increment(1),
      usedByUserIds: arrayUnion(userId)
    });
  } catch (error) {
    console.error('쿠폰 사용 처리 실패:', error);
    throw error;
  }
}

// Query 헬퍼 함수들
export function getAllCouponsQuery(storeId: string) {
  return query(
    getCouponCollection(storeId),
    orderBy('createdAt', 'desc')
  );
}

export function getActiveCouponsQuery(storeId: string) {
  return query(
    getCouponCollection(storeId),
    where('isActive', '==', true),
    orderBy('createdAt', 'desc')
  );
}
```

---

## File: src\services\userService.test.ts

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchUsers } from './userService';
import { getDocs, query, where, collection } from 'firebase/firestore';

// Mock dependencies
vi.mock('../lib/firebase', () => ({
    db: {},
}));

vi.mock('firebase/firestore', async () => {
    const actual = await vi.importActual('firebase/firestore');
    return {
        ...actual,
        collection: vi.fn(),
        query: vi.fn(),
        where: vi.fn(),
        getDocs: vi.fn(),
    };
});

describe('userService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('searchUsers', () => {
        it('should search by phone when input is numeric/hyphen', async () => {
            const mockResult = {
                docs: [
                    { id: 'u1', data: () => ({ name: 'Test', phone: '010-1234-5678' }) }
                ]
            };
            (getDocs as any).mockResolvedValue(mockResult);

            const result = await searchUsers('0101234');

            expect(where).toHaveBeenCalledWith('phone', '>=', '0101234');
            expect(result).toHaveLength(1);
        });

        it('should search by displayName when input is text', async () => {
            const mockResult = {
                docs: [
                    { id: 'u2', data: () => ({ displayName: 'Hong', phone: '010-0000-0000' }) }
                ]
            };
            (getDocs as any).mockResolvedValue(mockResult);

            const result = await searchUsers('Hong');

            expect(where).toHaveBeenCalledWith('displayName', '>=', 'Hong');
            expect(result).toHaveLength(1);
        });
    });
});

```

---

## File: src\types\event.ts

```typescript
export interface Event {
  id: string;
  title: string;
  imageUrl: string;
  link: string;
  active: boolean;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
}

```

---

## File: src\types\menu.ts

```typescript
export interface MenuOption {
  id: string;
  name: string;
  price: number;
  quantity?: number; // 옵션1용: 수량이 있는 옵션
}

export interface Menu {
  id: string;
  name: string;
  price: number;
  category: string[];
  description: string;
  imageUrl?: string;
  options?: MenuOption[];
  soldout: boolean;
  isHidden?: boolean; // 숨김 상태 (고객 화면 완전 미노출)
  createdAt: Date;
}

export const CATEGORIES = [
  '인기메뉴',
  '추천메뉴',
  '기본메뉴',
  '사이드메뉴',
  '음료',
  '주류',
] as const;

export type Category = typeof CATEGORIES[number];
```

---

## File: src\types\store.ts

```typescript
/**
 * 상점(Store) 타입 정의
 * 단일 레스토랑 앱을 위한 단순화된 구조
 */

export interface Store {
  id: string; // 단일 문서 ID (예: 'store')
  name: string;
  description: string;

  // 연락처 정보
  phone: string;
  email: string;
  address: string;

  // 브랜딩
  logoUrl?: string;
  bannerUrl?: string;
  primaryColor?: string; // 메인 테마 색상

  // 운영 정보
  businessHours?: BusinessHours;
  deliveryFee: number;
  minOrderAmount: number;

  // 설정
  settings: StoreSettings;

  // 메타데이터
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp

  // 매장 일시정지 (v3.0 - Top Level)
  isOrderingPaused?: boolean;
  pausedReason?: string;
}

export interface BusinessHours {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
}

export interface DayHours {
  open: string; // "09:00"
  close: string; // "22:00"
  closed: boolean; // 휴무일 여부
}

export interface StoreSettings {
  // 주문 설정
  autoAcceptOrders: boolean; // 자동 주문 접수
  estimatedDeliveryTime: number; // 예상 배달 시간 (분)

  // 결제 설정
  paymentMethods: PaymentMethod[];

  // 알림 설정
  notificationEmail?: string;
  notificationPhone?: string;

  // 기능 활성화
  enableReviews: boolean;
  enableCoupons: boolean;
  enableNotices: boolean;
  enableEvents: boolean;
  // 배달 대행 설정 (v2.0)
  deliverySettings?: DeliverySettings;

  // 매장 일시정지 (v3.0)
  isOrderingPaused?: boolean;
  pausedReason?: string;
}

export interface DeliverySettings {
  provider: 'manual' | 'barogo' | 'vroong' | 'mesh'; // 'manual' = 자체배달
  apiKey?: string;
  apiSecret?: string;
  shopId?: string; // 대행사측 상점 ID
  webhookUrl?: string; // 대행사 -> 앱 상태 업데이트용 (자동생성/표시용)
}

export type PaymentMethod = '앱결제' | '만나서카드' | '만나서현금' | '방문시결제';

/**
 * 상점 설정 폼 데이터
 */
export interface StoreFormData {
  name: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  deliveryFee: number;
  minOrderAmount: number;
  logoUrl?: string;
  bannerUrl?: string;
  businessHours?: BusinessHours;
  settings?: StoreSettings;
  isOrderingPaused?: boolean;
  pausedReason?: string;
}

export interface UpdateStoreFormData extends StoreFormData {
  primaryColor?: string;
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

