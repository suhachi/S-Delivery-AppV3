# S-Delivery-App - Volume 09

Generated: 2025-12-23 19:23:22
Project Path: D:\projectsing\S-Delivery-App\

- Files in volume: 19
- Approx size: 0.07 MB

---

## File: src\App.tsx

```typescript
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import MyPage from './pages/MyPage';
import StoreSetupWizard from './pages/StoreSetupWizard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMenuManagement from './pages/admin/AdminMenuManagement';
import AdminOrderManagement from './pages/admin/AdminOrderManagement';
import AdminCouponManagement from './pages/admin/AdminCouponManagement';
import AdminReviewManagement from './pages/admin/AdminReviewManagement';
import AdminNoticeManagement from './pages/admin/AdminNoticeManagement';
import AdminEventManagement from './pages/admin/AdminEventManagement';
import AdminMemberPage from './pages/admin/AdminMemberPage';
import AdminStatsPage from './pages/admin/AdminStatsPage';
import AdminStoreSettings from './pages/admin/AdminStoreSettings';
import NoticePage from './pages/NoticePage';
import EventsPage from './pages/EventsPage';
import ReviewBoardPage from './pages/ReviewBoardPage';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { StoreProvider, useStore } from './contexts/StoreContext';
import TopBar from './components/common/TopBar';
import AdminOrderAlert from './components/admin/AdminOrderAlert';
import NicepayReturnPage from './pages/NicepayReturnPage';
import './styles/globals.css';

// Protected Route Component
function RequireAuth({ children, requireAdmin = false }: { children: React.ReactNode; requireAdmin?: boolean }) {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { store, loading: storeLoading } = useStore();
  const location = useLocation();

  if (authLoading || (requireAdmin && storeLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // 상점이 생성되지 않은 상태에서 관리자가 접속하면 상점 생성 페이지로 리다이렉트
  if (requireAdmin && isAdmin && !store && !storeLoading) {
    if (location.pathname !== '/store-setup') {
      return <Navigate to="/store-setup" replace />;
    }
  }

  return <>{children}</>;
}

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const { store, loading: storeLoading } = useStore();

  // 테마 색상 적용
  React.useEffect(() => {
    if (store?.primaryColor) {
      const root = document.documentElement;
      const primary = store.primaryColor;

      // 메인 색상 적용
      root.style.setProperty('--color-primary-500', primary);

      // 그라데이션 등을 위한 파생 색상 생성 (간단히 조금 더 어두운 색상으로 설정)
      // 실제로는 더 정교한 색상 팔레트 생성 로직이 필요할 수 있음
      root.style.setProperty('--color-primary-600', adjustBrightness(primary, -10));
    }
  }, [store?.primaryColor]);

  // 상점 이름으로 타이틀 변경
  React.useEffect(() => {
    if (store?.name) {
      document.title = store.name;
    } else {
      document.title = 'Simple Delivery App';
    }
  }, [store?.name]);

  // 디버깅: 로딩 상태 확인
  if (authLoading || storeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <CartProvider>
      <div className="min-h-screen bg-gray-50">
        {user && <TopBar />}
        <AdminOrderAlert />
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/menu" element={<RequireAuth><MenuPage /></RequireAuth>} />

          <Route path="/cart" element={<RequireAuth><CartPage /></RequireAuth>} />
          <Route path="/payment/nicepay/return" element={<NicepayReturnPage />} />
          <Route path="/nicepay/return" element={<NicepayReturnPage />} />
          <Route path="/notices" element={<NoticePage />} />
          <Route path="/events" element={<EventsPage />} />

          {/* ... (imports remain the same) */}

          {/* ... inside AppContent routes ... */}
          <Route path="/orders" element={<RequireAuth><OrdersPage /></RequireAuth>} />
          <Route path="/orders/:orderId" element={<RequireAuth><OrderDetailPage /></RequireAuth>} />
          <Route path="/reviews" element={<ReviewBoardPage />} />
          <Route path="/checkout" element={<RequireAuth><CheckoutPage /></RequireAuth>} />

          <Route path="/mypage" element={<RequireAuth><MyPage /></RequireAuth>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<RequireAuth requireAdmin><AdminDashboard /></RequireAuth>} />
          <Route path="/admin/menus" element={<RequireAuth requireAdmin><AdminMenuManagement /></RequireAuth>} />
          <Route path="/admin/orders" element={<RequireAuth requireAdmin><AdminOrderManagement /></RequireAuth>} />
          <Route path="/admin/coupons" element={<RequireAuth requireAdmin><AdminCouponManagement /></RequireAuth>} />
          <Route path="/admin/reviews" element={<RequireAuth requireAdmin><AdminReviewManagement /></RequireAuth>} />
          <Route path="/admin/notices" element={<RequireAuth requireAdmin><AdminNoticeManagement /></RequireAuth>} />
          <Route path="/admin/events" element={<RequireAuth requireAdmin><AdminEventManagement /></RequireAuth>} />
          <Route path="/admin/members" element={<RequireAuth requireAdmin><AdminMemberPage /></RequireAuth>} />
          <Route path="/admin/stats" element={<RequireAuth requireAdmin><AdminStatsPage /></RequireAuth>} />
          <Route path="/admin/store-settings" element={<RequireAuth requireAdmin><AdminStoreSettings /></RequireAuth>} />

          {/* Store Setup */}
          <Route path="/store-setup" element={<RequireAuth requireAdmin><StoreSetupWizard /></RequireAuth>} />
        </Routes>
      </div>
      <Toaster position="bottom-center" richColors duration={2000} />
    </CartProvider>
  );
}

// 색상 밝기 조절 유틸리티
function adjustBrightness(hex: string, percent: number) {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <StoreProvider>
          <AppContent />
        </StoreProvider>
      </AuthProvider>
    </BrowserRouter>
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

## File: src\components\ui\button.tsx

```typescript
import * as React from "react";
import { Slot } from "@radix-ui/react-slot@1.1.2";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background text-foreground hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };

```

---

## File: src\components\ui\checkbox.tsx

```typescript
"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox@1.1.4";
import { CheckIcon } from "lucide-react@0.487.0";

import { cn } from "./utils";

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer border bg-input-background dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-none"
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };

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

## File: src\components\ui\command.tsx

```typescript
"use client";

import * as React from "react";
import { Command as CommandPrimitive } from "cmdk@1.1.1";
import { SearchIcon } from "lucide-react@0.487.0";

import { cn } from "./utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./dialog";

function Command({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        "bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md",
        className,
      )}
      {...props}
    />
  );
}

function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string;
  description?: string;
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent className="overflow-hidden p-0">
        <Command className="[&_[cmdk-group-heading]]:text-muted-foreground **:data-[slot=command-input-wrapper]:h-12 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
}

function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div
      data-slot="command-input-wrapper"
      className="flex h-9 items-center gap-2 border-b px-3"
    >
      <SearchIcon className="size-4 shrink-0 opacity-50" />
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(
          "placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    </div>
  );
}

function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn(
        "max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto",
        className,
      )}
      {...props}
    />
  );
}

function CommandEmpty({
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className="py-6 text-center text-sm"
      {...props}
    />
  );
}

function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        "text-foreground [&_[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium",
        className,
      )}
      {...props}
    />
  );
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn("bg-border -mx-1 h-px", className)}
      {...props}
    />
  );
}

function CommandItem({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className,
      )}
      {...props}
    />
  );
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};

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

## File: src\data\mockOrders.ts

```typescript
import { Order } from '../types/order';

// This would be replaced with actual Firestore/Supabase data
export const mockOrders: Order[] = [
  {
    id: 'order-1',
    userId: 'user-1',
    items: [
      {
        menuId: '1',
        name: '소고기 쌀국수',
        price: 9500,
        quantity: 2,
        options: [{ name: '면 추가', price: 2000 }],
        imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&q=80',
      },
      {
        menuId: '8',
        name: '베트남 커피',
        price: 4500,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=800&q=80',
      },
    ],
    totalPrice: 29500,
    status: '배달중',
    address: '서울시 강남구 테헤란로 123',
    phone: '010-1234-5678',
    memo: '문 앞에 놔주세요',
    paymentType: '앱결제',
    createdAt: new Date('2024-12-04T12:30:00'),
  },
  {
    id: 'order-2',
    userId: 'user-1',
    items: [
      {
        menuId: '2',
        name: '해물 쌀국수',
        price: 11000,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=800&q=80',
      },
    ],
    totalPrice: 14000,
    status: '완료',
    address: '서울시 강남구 테헤란로 123',
    phone: '010-1234-5678',
    paymentType: '만나서카드',
    createdAt: new Date('2024-12-03T18:20:00'),
  },
  {
    id: 'order-3',
    userId: 'user-1',
    items: [
      {
        menuId: '5',
        name: '월남쌈',
        price: 7000,
        quantity: 2,
        imageUrl: 'https://images.unsplash.com/photo-1559054663-e8fbaa5b6c53?w=800&q=80',
      },
      {
        menuId: '7',
        name: '짜조',
        price: 6000,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&q=80',
      },
    ],
    totalPrice: 23000,
    status: '완료',
    address: '서울시 강남구 테헤란로 123',
    phone: '010-1234-5678',
    paymentType: '만나서현금',
    createdAt: new Date('2024-12-01T19:45:00'),
  },
];

```

---

## File: src\pages\admin\AdminDashboard.tsx

```typescript
import { Package, DollarSign, Clock, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { useFirestoreCollection } from '../../hooks/useFirestoreCollection';
import { getAllOrdersQuery } from '../../services/orderService';
import { getAllMenusQuery } from '../../services/menuService';
import { Order, ORDER_STATUS_LABELS } from '../../types/order';
import { Menu } from '../../types/menu';

import AdminSidebar from '../../components/admin/AdminSidebar';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';

export default function AdminDashboard() {
  const { store } = useStore();

  const { data: orders, loading: ordersLoading } = useFirestoreCollection<Order>(
    store?.id ? getAllOrdersQuery(store.id) : null
  );

  const { data: menus, loading: menusLoading } = useFirestoreCollection<Menu>(
    store?.id ? getAllMenusQuery(store.id) : null
  );

  const isLoading = ordersLoading || menusLoading;

  // Calculate statistics based on real data
  const totalOrders = orders?.length || 0;
  const activeOrders = orders?.filter(o => ['접수', '조리중', '배달중'].includes(o.status)).length || 0;
  const completedOrders = orders?.filter(o => o.status === '완료').length || 0;
  const cancelledOrders = orders?.filter(o => o.status === '취소').length || 0;

  const totalRevenue = orders
    ?.filter(o => o.status === '완료')
    .reduce((sum, o) => sum + o.totalPrice, 0) || 0;

  const todayOrders = orders?.filter(o => {
    const today = new Date();
    const orderDate = new Date(o.createdAt);
    return orderDate.toDateString() === today.toDateString();
  }).length || 0;

  const stats = [
    {
      label: '오늘 주문',
      value: todayOrders,
      icon: <Package className="w-6 h-6" />,
      color: 'blue',
      suffix: '건',
    },
    {
      label: '총 매출',
      value: totalRevenue.toLocaleString(),
      icon: <DollarSign className="w-6 h-6" />,
      color: 'green',
      suffix: '원',
    },
    {
      label: '진행중 주문',
      value: activeOrders,
      icon: <Clock className="w-6 h-6" />,
      color: 'orange',
      suffix: '건',
    },
    {
      label: '완료 주문',
      value: completedOrders,
      icon: <CheckCircle2 className="w-6 h-6" />,
      color: 'purple',
      suffix: '건',
    },
  ];

  const recentOrders = orders?.slice(0, 5) || [];
  const registeredMenusCount = menus?.length || 0;
  const soldoutMenusCount = menus?.filter(m => m.soldout).length || 0;

  // Calculate average order value (avoid division by zero)
  const avgOrderValue = completedOrders > 0
    ? Math.round(totalRevenue / completedOrders)
    : 0;

  // Calculate cancellation rate
  const cancelRate = totalOrders > 0
    ? ((cancelledOrders / totalOrders) * 100).toFixed(1)
    : '0';

  if (!store && !isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <p className="text-gray-500">상점 정보를 불러오는 중...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl mb-2">
              <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                대시보드
              </span>
            </h1>
            <p className="text-gray-600">매장 현황을 한눈에 확인하세요</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, idx) => (
              <StatCard key={idx} {...stat} loading={isLoading} />
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent Orders */}
            <Card className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">최근 주문</h2>
                <Badge variant="primary">{totalOrders}건</Badge>
              </div>

              {isLoading ? (
                <div className="py-8 text-center text-gray-500">로딩 중...</div>
              ) : recentOrders.length > 0 ? (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-1">주문 #{order.id.slice(0, 8)}</p>
                        <p className="text-sm text-gray-600">
                          {order.items.length}개 상품 · {order.totalPrice.toLocaleString()}원
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(order.createdAt).toLocaleString('ko-KR')}
                        </p>
                      </div>
                      <Badge
                        variant={
                          order.status === '완료' ? 'success' :
                            order.status === '취소' ? 'danger' :
                              order.status === '배달중' ? 'secondary' :
                                'primary'
                        }
                      >
                        {ORDER_STATUS_LABELS[order.status]}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500">최근 주문 내역이 없습니다.</div>
              )}
            </Card>

            {/* Quick Stats */}
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-6">빠른 통계</h2>
              <div className="space-y-4">
                <QuickStat
                  label="등록된 메뉴"
                  value={isLoading ? '-' : registeredMenusCount}
                  suffix="개"
                  color="blue"
                />
                <QuickStat
                  label="품절 메뉴"
                  value={isLoading ? '-' : soldoutMenusCount}
                  suffix="개"
                  color="red"
                />
                <QuickStat
                  label="평균 주문 금액"
                  value={isLoading ? '-' : avgOrderValue.toLocaleString()}
                  suffix="원"
                  color="green"
                />
                <QuickStat
                  label="취소율"
                  value={isLoading ? '-' : cancelRate}
                  suffix="%"
                  color="orange"
                />
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

import { StatCardProps, QuickStatProps } from '../../types/dashboard';

// ... (existing imports)

// ... (existing AdminDashboard component)

function StatCard({ label, value, icon, color, suffix, loading }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    purple: 'bg-purple-500',
  }[color];

  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-2">{label}</p>
          <p className="text-3xl font-bold text-gray-900">
            {loading ? '-' : value}
            {!loading && suffix && <span className="text-lg text-gray-600 ml-1">{suffix}</span>}
          </p>
        </div>
        <div className={`w-12 h-12 ${colorClasses} rounded-xl flex items-center justify-center text-white`}>
          {icon}
        </div>
      </div>
      <div className={`absolute bottom-0 left-0 right-0 h-1 ${colorClasses}`} />
    </Card>
  );
}

function QuickStat({ label, value, suffix, color }: QuickStatProps) {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    orange: 'text-orange-600',
    purple: 'text-purple-600',
  }[color];

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <span className="text-sm text-gray-700">{label}</span>
      <span className={`font-bold ${colorClasses}`}>
        {value}{suffix}
      </span>
    </div>
  );
}
```

---

## File: src\pages\admin\AdminEventManagement.tsx

```typescript
import { useState } from 'react';
import { Plus, Edit2, Trash2, X, Eye, EyeOff } from 'lucide-react';
import { Event } from '../../types/event';
import { toast } from 'sonner';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import { formatDateShort } from '../../utils/formatDate';
import { useStore } from '../../contexts/StoreContext';
import { useFirestoreCollection } from '../../hooks/useFirestoreCollection';
import { createEvent, updateEvent, deleteEvent, toggleEventActive, getAllEventsQuery } from '../../services/eventService';
import { uploadEventImage } from '../../services/storageService';
import ImageUpload from '../../components/common/ImageUpload';

export default function AdminEventManagement() {
  const { store } = useStore();
  const { data: events, loading } = useFirestoreCollection<Event>(
    store?.id ? getAllEventsQuery(store.id) : null
  );

  if (!store || !store.id) return null;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const handleAddEvent = () => {
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await deleteEvent(store.id, eventId);
        toast.success('이벤트가 삭제되었습니다');
      } catch (error) {
        toast.error('이벤트 삭제에 실패했습니다');
      }
    }
  };

  const handleToggleActive = async (eventId: string, currentActive: boolean) => {
    try {
      await toggleEventActive(store.id, eventId, !currentActive);
      toast.success('활성화 상태가 변경되었습니다');
    } catch (error) {
      toast.error('활성화 상태 변경에 실패했습니다');
    }
  };

  const handleSaveEvent = async (eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingEvent) {
        await updateEvent(store.id, editingEvent.id, eventData);
        toast.success('이벤트가 수정되었습니다');
      } else {
        await createEvent(store.id, eventData);
        toast.success('이벤트가 추가되었습니다');
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error('이벤트 저장에 실패했습니다');
    }
  };

  const formatDateForInput = (date: any) => {
    if (!date) return '';
    try {
      // date가 이미 Date 객체가 아닐 수 있음 (Firestore Timestamp)
      const d = date.toDate ? date.toDate() : new Date(date);
      return d.toISOString().split('T')[0];
    } catch (e) {
      return '';
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
                <span className="bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                  이벤트 배너 관리
                </span>
              </h1>
              <p className="text-gray-600">총 {events?.length || 0}개의 이벤트</p>
            </div>
            <Button onClick={handleAddEvent}>
              <Plus className="w-5 h-5 mr-2" />
              이벤트 추가
            </Button>
          </div>

          {/* Event Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events?.map((event) => (
              <Card key={event.id} padding="none" className="overflow-hidden">
                {/* Preview Image */}
                <div className="relative aspect-[16/9] bg-gray-100">
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x450?text=Image+Load+Failed';
                    }}
                  />
                  {!event.active && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Badge variant="danger" size="lg">비활성</Badge>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={event.active ? 'success' : 'gray'} size="sm">
                      {event.active ? '활성' : '비활성'}
                    </Badge>
                    <h3 className="font-semibold text-gray-900 line-clamp-1">
                      {event.title}
                    </h3>
                  </div>

                  <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                    {event.link || '링크 없음'}
                  </p>

                  <p className="text-xs text-gray-500 mb-4">
                    {formatDateShort(event.startDate)} ~ {formatDateShort(event.endDate)}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant={event.active ? 'secondary' : 'outline'}
                      size="sm"
                      fullWidth
                      onClick={() => handleToggleActive(event.id, event.active)}
                    >
                      {event.active ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                      {event.active ? '비활성' : '활성화'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditEvent(event)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteEvent(event.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {(!events || events.length === 0) && (
              <div className="col-span-full text-center py-10 text-gray-500 bg-white rounded-lg shadow-sm border border-gray-100">
                등록된 이벤트가 없습니다.
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Event Form Modal */}
      {isModalOpen && (
        <EventFormModal
          event={editingEvent}
          onSave={handleSaveEvent}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

interface EventFormModalProps {
  event: Event | null;
  onSave: (event: Omit<Event, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

function EventFormModal({ event, onSave, onClose }: EventFormModalProps) {
  const [formData, setFormData] = useState<Partial<Event>>(
    event || {
      title: '',
      imageUrl: '',
      link: '',
      active: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30일 후
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.imageUrl) {
      toast.error('필수 항목을 모두 입력해주세요');
      return;
    }

    onSave(formData as Omit<Event, 'id' | 'createdAt'>);
  };

  const formatDateForInput = (date: any) => {
    if (!date) return '';
    try {
      // date가 Firestore Timestamp일 수도 있고 Date 객체일 수도 있음
      const d = date.toDate ? date.toDate() : new Date(date);
      // 유효한 날짜인지 확인
      if (isNaN(d.getTime())) return '';
      return d.toISOString().split('T')[0];
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {event ? '이벤트 수정' : '이벤트 추가'}
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
            label="이벤트 제목"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div className="mb-4">
            <ImageUpload
              label="이벤트 배너 이미지"
              currentImageUrl={formData.imageUrl}
              onImageUploaded={(url) => setFormData({ ...formData, imageUrl: url })}
              onUpload={(file) => uploadEventImage(file)}
              aspectRatio="wide"
            />
          </div>

          <Input
            label="링크 URL (선택)"
            value={formData.link}
            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            placeholder="/menu 또는 https://example.com"
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                시작일
              </label>
              <input
                type="date"
                value={formatDateForInput(formData.startDate)}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) setFormData({ ...formData, startDate: new Date(val) });
                }}
                className="w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                종료일
              </label>
              <input
                type="date"
                value={formatDateForInput(formData.endDate)}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) setFormData({ ...formData, endDate: new Date(val) });
                }}
                className="w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="active" className="ml-2 text-sm text-gray-700">
              활성화
            </label>
          </div>

          {/* 미리보기 */}
          {formData.imageUrl && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                미리보기
              </label>
              <div className="relative aspect-[16/9] rounded-lg overflow-hidden">
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x450?text=Invalid+URL';
                  }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" fullWidth onClick={onClose}>
              취소
            </Button>
            <Button type="submit" fullWidth>
              {event ? '수정' : '추가'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
```

---

## File: src\pages\MyPage.tsx

```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../contexts/StoreContext';
import { User, ShoppingBag, Ticket, Bell, Store, ChevronRight, LogOut, Package } from 'lucide-react';
import Card from '../components/common/Card';
import { Order } from '../types/order';
import { Coupon } from '../types/coupon';
import { useFirestoreCollection } from '../hooks/useFirestoreCollection';
import { getUserOrdersQuery } from '../services/orderService';
import { getActiveCouponsQuery } from '../services/couponService';
import { toast } from 'sonner';

export default function MyPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { store } = useStore();
  const [notificationEnabled, setNotificationEnabled] = useState(false);

  // 상점 정보 (store가 로딩 중이거나 없으면 안전하게 처리)
  const storeInfo = store || {
    id: 'demo-store',
    name: '상점 정보 로딩 중...',
    phone: '',
    address: '',
    businessHours: undefined,
  };

  // 1. 최근 주문 조회 (실데이터)
  // user와 store가 있을 때만 쿼리 생성
  const ordersQuery = (store?.id && user?.id)
    ? getUserOrdersQuery(store.id, user.id)
    : null;

  const { data: allOrders, loading: ordersLoading } = useFirestoreCollection<Order>(ordersQuery);

  // 헬퍼 함수: Firestore Timestamp 처리를 위한 toDate
  const toDate = (date: any): Date => {
    if (date?.toDate) return date.toDate();
    if (date instanceof Date) return date;
    if (typeof date === 'string') return new Date(date);
    return new Date();
  };

  // 최근 3개만 잘라서 표시 (결제대기 상태는 제외 - 미결제 주문 건)
  const recentOrders = allOrders
    ? allOrders.filter(o => o.status !== '결제대기').slice(0, 3)
    : [];

  // 2. 사용 가능한 쿠폰 조회 (실데이터)
  const couponsQuery = store?.id ? getActiveCouponsQuery(store.id) : null;
  const { data: availableCoupons, loading: couponsLoading } = useFirestoreCollection<Coupon>(couponsQuery);

  // 사용한 쿠폰 필터링 (사용자 요청: 사용한 쿠폰은 숨김 처리)
  const myCoupons = availableCoupons?.filter(coupon =>
    !coupon.usedByUserIds?.includes(user?.id || '')
  ) || [];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast.success('로그아웃되었습니다');
    } catch (error) {
      toast.error('로그아웃 실패');
    }
  };

  const handleNotificationToggle = () => {
    setNotificationEnabled(!notificationEnabled);
    toast.success(`알림이 ${!notificationEnabled ? '켜졌습니다' : '꺼졌습니다'}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 mb-20">
        {/* 프로필 섹션 */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-gray-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {user?.displayName || '고객'}님
            </h1>
            <p className="text-gray-500">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* 최근 주문 내역 */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg">최근 주문 내역</h2>
              </div>
              <button
                onClick={() => navigate('/orders')}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
              >
                전체보기 <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>

            {ordersLoading ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">로딩 중...</p>
              </div>
            ) : recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {order.items[0]?.name} {order.items.length > 1 ? `외 ${order.items.length - 1}개` : ''}
                      </p>
                      <p className="text-xs text-gray-500">
                        {toDate(order.createdAt).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{order.totalPrice.toLocaleString()}원</p>
                      <p className="text-xs text-blue-600">{order.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">주문 내역이 없습니다</p>
              </div>
            )}
          </Card>

          {/* 쿠폰함 */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Ticket className="w-5 h-5 text-orange-600" />
              <h2 className="text-lg">쿠폰함</h2>
              <span className="text-sm text-gray-500">
                ({myCoupons.length}장)
              </span>
            </div>

            {couponsLoading ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">로딩 중...</p>
              </div>
            ) : (myCoupons.length > 0) ? (
              <div className="space-y-2">
                {myCoupons.map((coupon) => (
                  <div
                    key={coupon.id}
                    className="flex justify-between items-center p-3 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{coupon.name}</p>
                      <p className="text-xs text-gray-500">
                        {coupon.validUntil ? toDate(coupon.validUntil).toLocaleDateString('ko-KR') + '까지' : '유효기간 없음'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-orange-600 font-bold">
                        {coupon.discountType === 'percentage'
                          ? `${coupon.discountValue}%`
                          : `${coupon.discountValue.toLocaleString()}원`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">사용 가능한 쿠폰이 없습니다</p>
              </div>
            )}
          </Card>

          {/* 알림 설정 */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-green-600" />
                <div>
                  <h2 className="text-lg">알림 설정</h2>
                  <p className="text-sm text-gray-500">주문 상태 변경 시 알림을 받습니다</p>
                </div>
              </div>
              <button
                onClick={handleNotificationToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notificationEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notificationEnabled ? 'translate-x-6' : 'translate-x-1'}`}
                />
              </button>
            </div>
          </Card>

          {/* 가게 정보 */}
          {storeInfo && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Store className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg">가게 정보</h2>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">상점명</p>
                  <p className="font-medium">{storeInfo.name}</p>
                </div>

                {storeInfo.phone && (
                  <div>
                    <p className="text-sm text-gray-500">전화번호</p>
                    <p className="font-medium">{storeInfo.phone}</p>
                  </div>
                )}

                {storeInfo.address && (
                  <div>
                    <p className="text-sm text-gray-500">주소</p>
                    <p className="font-medium">{storeInfo.address}</p>
                  </div>
                )}

                {storeInfo.businessHours && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">영업시간</p>
                    <div className="space-y-1 text-sm">
                      {Object.entries(storeInfo.businessHours).map(([day, hours]) => {
                        if (!hours) return null;
                        const dayLabel: Record<string, string> = {
                          monday: '월',
                          tuesday: '화',
                          wednesday: '수',
                          thursday: '목',
                          friday: '금',
                          saturday: '토',
                          sunday: '일',
                        };
                        return (
                          <div key={day} className="flex justify-between">
                            <span className="text-gray-600">{dayLabel[day]}</span>
                            <span>
                              {hours.closed ? '휴무' : `${hours.open} - ${hours.close}`}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* 로그아웃 */}
          <Card className="p-6 mt-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 text-red-600 hover:text-red-700 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>로그아웃</span>
            </button>
          </Card>

          {/* 개발사 정보 */}
          <div className="mt-8 mb-4 text-center">
            <p className="text-xs text-gray-400 font-medium">Powered by KS Company</p>
            <div className="flex items-center justify-center gap-2 mt-1 text-[10px] text-gray-400">
              <span>개발사: KS컴퍼니</span>
              <span className="w-px h-2 bg-gray-300"></span>
              <span>대표: 석경선, 배종수</span>
            </div>
            <p className="text-[10px] text-gray-300 mt-1">© 2024 Simple Delivery App Template. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
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

## File: src\services\orderService.ts

```typescript
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Order, OrderStatus } from '../types/order';

// 컬렉션 참조 헬퍼 (stores/{storeId}/orders)
const getOrderCollection = (storeId: string) => collection(db, 'stores', storeId, 'orders');

// 주문 생성
export async function createOrder(storeId: string, orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const docRef = await addDoc(getOrderCollection(storeId), {
      ...orderData,
      status: orderData.status || '접수', // status가 있으면 사용, 없으면 '접수'
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('주문 생성 실패:', error);
    throw error;
  }
}

// 주문 상태 변경
export async function updateOrderStatus(storeId: string, orderId: string, status: OrderStatus) {
  try {
    const orderRef = doc(db, 'stores', storeId, 'orders', orderId);
    await updateDoc(orderRef, {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('주문 상태 변경 실패:', error);
    throw error;
  }
}

// 주문 취소
export async function cancelOrder(storeId: string, orderId: string) {
  try {
    const orderRef = doc(db, 'stores', storeId, 'orders', orderId);
    await updateDoc(orderRef, {
      status: '취소' as OrderStatus,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('주문 취소 실패:', error);
    throw error;
  }
}

// 주문 삭제 (Hard Delete)
export async function deleteOrder(storeId: string, orderId: string) {
  try {
    const { deleteDoc } = await import('firebase/firestore');
    const orderRef = doc(db, 'stores', storeId, 'orders', orderId);
    await deleteDoc(orderRef);
  } catch (error) {
    console.error('주문 삭제 실패:', error);
    throw error;
  }
}

// Query 헬퍼 함수들
export function getUserOrdersQuery(storeId: string, userId: string) {
  return query(
    getOrderCollection(storeId),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
}

export function getAllOrdersQuery(storeId: string) {
  return query(
    getOrderCollection(storeId),
    orderBy('createdAt', 'desc')
  );
}

export function getOrdersByStatusQuery(storeId: string, status: OrderStatus) {
  return query(
    getOrderCollection(storeId),
    where('status', '==', status),
    orderBy('createdAt', 'desc')
  );
}
```

---

