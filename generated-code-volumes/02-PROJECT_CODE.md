# Project Code Volume 02

Generated: 2025-12-23 14:30:55
Root: D:\projectsing\S-Delivery-AppV3\

- Files in volume: 18
- Approx size: 0.07 MB

---

## File: firestore.rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check admin privileges
    function isAuthorizedAdmin() {
      return request.auth != null && (
        exists(/databases/$(database)/documents/admins/$(request.auth.uid)) || 
        exists(/databases/$(database)/documents/adminStores/$(request.auth.uid + '_default')) ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'
      );
    }

    // =========================================================================
    // 1. PUBLIC DATA (공개 데이터)
    // =========================================================================
    
    // 상점 정보
    match /stores/{storeId} {
      allow read: if true;
      allow write: if isAuthorizedAdmin();
      
      // 메뉴
      match /menus/{menuId} {
        allow read: if true;
        allow write: if isAuthorizedAdmin();
      }
      
      // 공지사항
      match /notices/{noticeId} {
        allow read: if true;
        allow write: if isAuthorizedAdmin();
      }
      
      // 이벤트
      match /events/{eventId} {
        allow read: if true;
        allow write: if isAuthorizedAdmin();
      }
      
      match /reviews/{reviewId} {
        allow read: if true;
        allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
        allow update, delete: if isAuthorizedAdmin() || (request.auth != null && resource.data.userId == request.auth.uid);
      }
      
      // 주문 (본인만)
      match /orders/{orderId} {
         allow read: if request.auth != null && (resource.data.userId == request.auth.uid || isAuthorizedAdmin());
         allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
         allow update: if isAuthorizedAdmin() || (
           request.auth != null && 
           resource.data.userId == request.auth.uid && 
           request.resource.data.diff(resource.data).affectedKeys().hasOnly(['reviewed', 'reviewText', 'reviewRating', 'reviewedAt', 'updatedAt'])
         );
         allow delete: if isAuthorizedAdmin(); // 삭제 기능 추가
      }
      
      // 쿠폰 (읽기는 공개, 생성/삭제는 관리자, 수정은 사용 처리 위해 로그인 유저 허용)
      match /coupons/{couponId} {
        allow read: if true;
        allow create, delete: if isAuthorizedAdmin();
        allow update: if isAuthorizedAdmin() || request.auth != null;
      }
    }

    // =========================================================================
    // 2. USER DATA (사용자 데이터)
    // =========================================================================
    
    // 사용자 프로필
    match /users/{userId} {
      allow read: if request.auth != null && (request.auth.uid == userId || isAuthorizedAdmin());
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 시스템 관리자 목록
    match /admins/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
    }
    
    // 관리자-상점 매핑
    match /adminStores/{docId} {
      allow read: if request.auth != null && docId.matches('^' + request.auth.uid + '_.*');
      allow write: if false;
    }

    // =========================================================================
    // 3. SYSTEM ADMIN (시스템 관리자)
    // =========================================================================
    
    match /{document=**} {
      allow read, write: if false;
    }
  }
}

```

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

## File: src\components\common\TopBar.tsx

```typescript
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, LogOut, User, Store, Menu, X, Bell, Gift, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useStore } from '../../contexts/StoreContext';

export default function TopBar() {
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  const { store } = useStore();
  const { getTotalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cartItemsCount = getTotalItems();

  const handleLogout = async () => {
    await logout();
    toast.success('로그아웃되었습니다');
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            {store?.logoUrl ? (
              <img
                src={store.logoUrl}
                alt={store.name}
                className="w-10 h-10 rounded-xl object-cover border border-gray-100 shadow-sm transform group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform">
                <span className="text-white text-xl">🍜</span>
              </div>
            )}
            <span className="text-lg font-bold text-primary-600 max-w-[160px] leading-tight text-left line-clamp-2">
              {store?.name || '배달앱'}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink to="/menu" icon={null}>메뉴</NavLink>
            <NavLink to="/events" icon={<Gift className="w-4 h-4" />}>이벤트</NavLink>
            <NavLink to="/reviews" icon={<MessageSquare className="w-4 h-4" />}>리뷰 게시판</NavLink>
            <NavLink to="/notices" icon={<Bell className="w-4 h-4" />}>공지사항</NavLink>
            <NavLink to="/orders" icon={null}>내 주문</NavLink>
            <NavLink to="/cart" icon={<ShoppingCart className="w-4 h-4" />} badge={cartItemsCount}>
              장바구니
            </NavLink>
            <NavLink to="/mypage" icon={<User className="w-4 h-4" />}>마이페이지</NavLink>
            {isAdmin && (
              <NavLink to="/admin" icon={<Store className="w-4 h-4" />}>
                관리자
              </NavLink>
            )}
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 rounded-full">
              <User className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-700">{user?.displayName || user?.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">로그아웃</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-gray-200 animate-slide-up">
            <MobileNavLink to="/menu" onClick={() => setMobileMenuOpen(false)}>
              메뉴
            </MobileNavLink>
            <MobileNavLink to="/events" onClick={() => setMobileMenuOpen(false)}>
              이벤트
            </MobileNavLink>
            <MobileNavLink to="/reviews" onClick={() => setMobileMenuOpen(false)}>
              리뷰 게시판
            </MobileNavLink>
            <MobileNavLink to="/notices" onClick={() => setMobileMenuOpen(false)}>
              공지사항
            </MobileNavLink>
            <MobileNavLink to="/orders" onClick={() => setMobileMenuOpen(false)}>
              내 주문
            </MobileNavLink>
            <MobileNavLink to="/cart" onClick={() => setMobileMenuOpen(false)} badge={cartItemsCount}>
              장바구니
            </MobileNavLink>
            <MobileNavLink to="/mypage" onClick={() => setMobileMenuOpen(false)}>
              마이페이지
            </MobileNavLink>
            {isAdmin && (
              <MobileNavLink to="/admin" onClick={() => setMobileMenuOpen(false)}>
                관리자
              </MobileNavLink>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

function NavLink({ to, icon, badge, children }: { to: string; icon?: React.ReactNode; badge?: number; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="relative flex items-center space-x-1 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors whitespace-nowrap"
    >
      {icon}
      <span>{children}</span>
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-[10px] text-white gradient-primary rounded-full">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  );
}

function MobileNavLink({ to, badge, onClick, children }: { to: string; badge?: number; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="relative flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
    >
      <span>{children}</span>
      {badge !== undefined && badge > 0 && (
        <span className="flex items-center justify-center min-w-[24px] h-6 px-2 text-xs text-white gradient-primary rounded-full">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  );
}
```

---

## File: src\components\ui\alert-dialog.tsx

```typescript
"use client";

import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog@1.1.6";

import { cn } from "./utils";
import { buttonVariants } from "./button";

function AlertDialog({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
}

function AlertDialogTrigger({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return (
    <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
  );
}

function AlertDialogPortal({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  return (
    <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
  );
}

function AlertDialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className,
      )}
      {...props}
    />
  );
}

function AlertDialogContent({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Content>) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
          className,
        )}
        {...props}
      />
    </AlertDialogPortal>
  );
}

function AlertDialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function AlertDialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn("text-lg font-semibold", className)}
      {...props}
    />
  );
}

function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function AlertDialogAction({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action>) {
  return (
    <AlertDialogPrimitive.Action
      className={cn(buttonVariants(), className)}
      {...props}
    />
  );
}

function AlertDialogCancel({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel>) {
  return (
    <AlertDialogPrimitive.Cancel
      className={cn(buttonVariants({ variant: "outline" }), className)}
      {...props}
    />
  );
}

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};

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

## File: src\components\ui\card.tsx

```typescript
import * as React from "react";

import { cn } from "./utils";

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <h4
      data-slot="card-title"
      className={cn("leading-none", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6 [&:last-child]:pb-6", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 pb-6 [.border-t]:pt-6", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};

```

---

## File: src\components\ui\dropdown-menu.tsx

```typescript
"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu@2.1.6";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react@0.487.0";

import { cn } from "./utils";

function DropdownMenu({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

function DropdownMenuPortal({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return (
    <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
  );
}

function DropdownMenuTrigger({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return (
    <DropdownMenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      {...props}
    />
  );
}

function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md",
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

function DropdownMenuGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return (
    <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
  );
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean;
  variant?: "default" | "destructive";
}) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
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

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
}

function DropdownMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
  return (
    <DropdownMenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  );
}

function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean;
}) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        "px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuSub({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />;
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean;
}) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </DropdownMenuPrimitive.SubTrigger>
  );
}

function DropdownMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    <DropdownMenuPrimitive.SubContent
      data-slot="dropdown-menu-sub-content"
      className={cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg",
        className,
      )}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};

```

---

## File: src\components\ui\radio-group.tsx

```typescript
"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group@1.2.3";
import { CircleIcon } from "lucide-react@0.487.0";

import { cn } from "./utils";

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid gap-3", className)}
      {...props}
    />
  );
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="relative flex items-center justify-center"
      >
        <CircleIcon className="fill-primary absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

export { RadioGroup, RadioGroupItem };

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

## File: src\contexts\CartContext.tsx

```typescript
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MenuOption } from '../types/menu';

export interface CartItem {
  id: string;
  menuId: string;
  name: string;
  price: number;
  quantity: number;
  options?: MenuOption[];
  imageUrl?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setItems(JSON.parse(storedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addItem = (item: Omit<CartItem, 'id'>) => {
    const id = 'cart-' + Date.now() + '-' + Math.random();
    setItems(prev => [...prev, { ...item, id }]);
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => {
      const optionsPrice = item.options?.reduce((sum, opt) => sum + (opt.price * (opt.quantity || 1)), 0) || 0;
      return total + (item.price + optionsPrice) * item.quantity;
    }, 0);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
```

---

## File: src\data\mockCoupons.ts

```typescript
import { Coupon } from '../types/coupon';

export const mockCoupons: Coupon[] = [
  {
    id: 'coupon-1',
    code: 'WELCOME2024',
    name: '신규 가입 환영 쿠폰',
    discountType: 'fixed',
    discountValue: 3000,
    minOrderAmount: 15000,
    validFrom: new Date('2024-01-01'),
    validUntil: new Date('2024-12-31'),
    isActive: true,
    createdAt: new Date('2024-01-01'),
    isUsed: false,
  },
  {
    id: 'coupon-2',
    code: 'PERCEN10',
    name: '10% 할인 쿠폰',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 20000,
    maxDiscountAmount: 5000,
    validFrom: new Date('2024-01-01'),
    validUntil: new Date('2024-12-31'),
    isActive: true,
    createdAt: new Date('2024-01-15'),
    isUsed: false,
  },
  {
    id: 'coupon-3',
    code: 'BIGDEAL',
    name: '대박 할인 5000원',
    discountType: 'fixed',
    discountValue: 5000,
    minOrderAmount: 30000,
    validFrom: new Date('2024-06-01'),
    validUntil: new Date('2024-06-30'),
    isActive: false,
    createdAt: new Date('2024-05-20'),
    isUsed: true,
    usedAt: new Date('2024-06-15'),
  },
];
```

---

## File: src\devtools\safeSnapshot.ts

```typescript
import { Query, onSnapshot, DocumentReference } from 'firebase/firestore';

/**
 * onSnapshot의 안전한 래퍼
 * - 권한 에러 시 조용히 실패
 * - enabled 옵션으로 구독 제어
 * - 에러 시 console.warn으로 로깅
 */
export function onSnapshotSafe<T = any>(
  query: Query<T> | DocumentReference<T>,
  callback: (snapshot: any) => void,
  options?: {
    enabled?: boolean;
    onError?: (error: Error) => void;
  }
) {
  const enabled = options?.enabled !== false;

  if (!enabled) {
    // 구독하지 않고 빈 unsubscribe 함수 반환
    return () => {};
  }

  try {
    return onSnapshot(
      query,
      callback,
      (error) => {
        // 권한 에러는 경고만 출력
        if (error.code === 'permission-denied') {
          console.warn('[safeSnapshot] 권한 없음:', error.message);
        } else {
          console.warn('[safeSnapshot] 에러 발생:', error);
        }

        // 커스텀 에러 핸들러 호출
        if (options?.onError) {
          options.onError(error);
        }
      }
    );
  } catch (error) {
    console.warn('[safeSnapshot] 구독 실패:', error);
    return () => {};
  }
}

export default onSnapshotSafe;

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

## File: src\services\orderService.test.ts

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createOrder, updateOrderStatus, cancelOrder, deleteOrder } from './orderService';
import { collection, addDoc, updateDoc, doc, serverTimestamp, deleteDoc } from 'firebase/firestore';

// Mock dependencies
vi.mock('../lib/firebase', () => ({
    db: {},
}));

vi.mock('firebase/firestore', async () => {
    const actual = await vi.importActual('firebase/firestore');
    return {
        ...actual,
        collection: vi.fn(),
        addDoc: vi.fn(),
        updateDoc: vi.fn(),
        deleteDoc: vi.fn(),
        doc: vi.fn(),
        serverTimestamp: vi.fn(() => 'MOCK_TIMESTAMP'),
        query: vi.fn(),
        where: vi.fn(),
        orderBy: vi.fn(),
    };
});

describe('orderService', () => {
    const mockStoreId = 'store_123';
    const mockOrderId = 'order_abc';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createOrder', () => {
        it('should create an order with default status "접수"', async () => {
            const mockDocRef = { id: 'new_order_id' };
            (addDoc as any).mockResolvedValue(mockDocRef);
            (collection as any).mockReturnValue('MOCK_COLLECTION_REF');

            const orderData = {
                userId: 'user_1',
                items: [],
                totalPrice: 10000,
                paymentType: 'card',
                address: 'Seoul',
                phone: '010-0000-0000'
            };

            const result = await createOrder(mockStoreId, orderData as any);

            expect(collection).toHaveBeenCalledWith(expect.anything(), 'stores', mockStoreId, 'orders');
            expect(addDoc).toHaveBeenCalledWith('MOCK_COLLECTION_REF', expect.objectContaining({
                ...orderData,
                status: '접수',
                createdAt: 'MOCK_TIMESTAMP',
                updatedAt: 'MOCK_TIMESTAMP',
            }));
            expect(result).toBe('new_order_id');
        });

        it('should use provided status if given', async () => {
            const mockDocRef = { id: 'new_order_id' };
            (addDoc as any).mockResolvedValue(mockDocRef);

            const orderData = {
                status: '조리중',
                totalPrice: 10000,
            };

            await createOrder(mockStoreId, orderData as any);

            expect(addDoc).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
                status: '조리중',
            }));
        });
    });

    describe('updateOrderStatus', () => {
        it('should update order status and timestamp', async () => {
            (doc as any).mockReturnValue('MOCK_DOC_REF');

            await updateOrderStatus(mockStoreId, mockOrderId, '배달중');

            expect(doc).toHaveBeenCalledWith(expect.anything(), 'stores', mockStoreId, 'orders', mockOrderId);
            expect(updateDoc).toHaveBeenCalledWith('MOCK_DOC_REF', {
                status: '배달중',
                updatedAt: 'MOCK_TIMESTAMP',
            });
        });
    });

    describe('cancelOrder', () => {
        it('should set status to "취소"', async () => {
            (doc as any).mockReturnValue('MOCK_DOC_REF');

            await cancelOrder(mockStoreId, mockOrderId);

            expect(updateDoc).toHaveBeenCalledWith('MOCK_DOC_REF', {
                status: '취소',
                updatedAt: 'MOCK_TIMESTAMP',
            });
        });
    });

    describe('deleteOrder', () => {
        it('should delete the order document', async () => {
            (doc as any).mockReturnValue('MOCK_DOC_REF');
            // deleteOrder 내부의 dynamic import도 결국 mocks를 사용할 것으로 예상됨
            // 하지만 테스트 환경에 따라 모킹 방식이 다를 수 있음.
            // 여기서는 vi.mock이 top-level이므로 dynamic import도 모킹된 버전을 받을 것임.

            await deleteOrder(mockStoreId, mockOrderId);

            expect(deleteDoc).toHaveBeenCalledWith('MOCK_DOC_REF');
        });
    });
});

```

---

## File: src\utils\labels.ts

```typescript
/**
 * 라벨 및 상수 관리
 */

export const ORDER_STATUS_LABELS = {
  '접수': '주문 접수',
  '조리중': '조리 중',
  '배달중': '배달 중',
  '완료': '배달 완료',
  '취소': '주문 취소',
} as const;

export const PAYMENT_TYPE_LABELS = {
  '앱결제': '앱 결제',
  '만나서카드': '만나서 카드 결제',
  '만나서현금': '만나서 현금 결제',
  '방문시결제': '방문 시 결제',
} as const;

export const CATEGORY_LABELS = [
  '인기메뉴',
  '추천메뉴',
  '기본메뉴',
  '사이드메뉴',
  '음료',
  '주류',
] as const;

export const NOTICE_CATEGORIES = [
  '공지',
  '이벤트',
  '점검',
  '할인',
] as const;

export const COUPON_TYPE_LABELS = {
  'percentage': '할인율',
  'fixed': '할인 금액',
} as const;

export default {
  ORDER_STATUS_LABELS,
  PAYMENT_TYPE_LABELS,
  CATEGORY_LABELS,
  NOTICE_CATEGORIES,
  COUPON_TYPE_LABELS,
};

```

---

