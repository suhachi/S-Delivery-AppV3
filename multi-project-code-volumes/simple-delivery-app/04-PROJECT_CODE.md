# simple-delivery-app - Volume 04

Generated: 2025-12-23 19:23:29
Project Path: D:\projectsing\hyun-poong\simple-delivery-app\

- Files in volume: 18
- Approx size: 0.07 MB

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

## File: src\components\admin\AdminOrderAlert.tsx

```typescript
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../contexts/StoreContext';
import { useAuth } from '../../contexts/AuthContext';
import { useFirestoreCollection } from '../../hooks/useFirestoreCollection';
import { getAllOrdersQuery } from '../../services/orderService';
import { Order } from '../../types/order';
import { toast } from 'sonner';

export default function AdminOrderAlert() {
    const { store } = useStore();
    const { isAdmin } = useAuth();
    const navigate = useNavigate();
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [lastOrderCount, setLastOrderCount] = useState<number>(0);

    // 전체 주문을 구독하여 새 주문 감지
    // 관리자가 아니거나 상점이 없으면 query는 null이 되어 구독하지 않음
    const { data: orders } = useFirestoreCollection<Order>(
        (isAdmin && store?.id) ? getAllOrdersQuery(store.id) : null
    );

    useEffect(() => {
        // Initialize audio with custom file source
        audioRef.current = new Audio('/notification.mp3');
        // Preload to ensure readiness
        audioRef.current.load();
    }, []);

    useEffect(() => {
        if (!orders || !isAdmin) return;

        // 초기 로딩 시에는 알림 울리지 않음
        if (lastOrderCount === 0 && orders.length > 0) {
            setLastOrderCount(orders.length);
            return;
        }

        // 새 주문이 추가된 경우
        if (orders.length > lastOrderCount) {
            const newOrdersCount = orders.length - lastOrderCount;
            const latestOrder = orders[0]; // 정렬이 최신순이라면

            // 알림음 재생 시도
            // 알림음 반복 재생 설정
            if (audioRef.current) {
                audioRef.current.loop = true; // 반복 재생
                audioRef.current.currentTime = 0;

                const playPromise = audioRef.current.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.error('Audio playback failed:', error);
                    });
                }
            }

            // 지속적인 팝업 (확인 버튼 누를 때까지 유지)
            toast.message('새로운 주문이 도착했습니다! 🔔', {
                description: `${latestOrder.items[0].name} 외 ${latestOrder.items.length - 1}건 (${latestOrder.totalPrice.toLocaleString()}원)`,
                duration: Infinity, // 무한 지속
                action: {
                    label: '확인',
                    onClick: () => {
                        // 확인 버튼 클릭 시 소리 끄기 및 페이지 이동
                        if (audioRef.current) {
                            audioRef.current.pause();
                            audioRef.current.currentTime = 0;
                        }
                        navigate('/admin/orders');
                    }
                },
                // 닫기 버튼 등으로 닫혔을 때 소리 끄기 (Sonner API에 따라 동작 다를 수 있음. 안전장치)
                onDismiss: () => {
                    if (audioRef.current) {
                        audioRef.current.pause();
                        audioRef.current.currentTime = 0;
                    }
                },
                onAutoClose: () => { // 혹시나 자동 닫힘 발생 시
                    if (audioRef.current) {
                        audioRef.current.pause();
                        audioRef.current.currentTime = 0;
                    }
                }
            });
        }
        setLastOrderCount(orders.length); // Update count
    }, [orders, lastOrderCount, isAdmin, navigate]);

    if (!isAdmin) return null;

    return null; // UI 없음
}

```

---

## File: src\components\figma\ImageWithFallback.tsx

```typescript
import React, { useState } from 'react'

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [didError, setDidError] = useState(false)

  const handleError = () => {
    setDidError(true)
  }

  const { src, alt, style, className, ...rest } = props

  return didError ? (
    <div
      className={`inline-block bg-gray-100 text-center align-middle ${className ?? ''}`}
      style={style}
    >
      <div className="flex items-center justify-center w-full h-full">
        <img src={ERROR_IMG_SRC} alt="Error loading image" {...rest} data-original-url={src} />
      </div>
    </div>
  ) : (
    <img src={src} alt={alt} className={className} style={style} {...rest} onError={handleError} />
  )
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

## File: src\components\ui\aspect-ratio.tsx

```typescript
"use client";

import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio@1.1.2";

function AspectRatio({
  ...props
}: React.ComponentProps<typeof AspectRatioPrimitive.Root>) {
  return <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props} />;
}

export { AspectRatio };

```

---

## File: src\components\ui\calendar.tsx

```typescript
"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react@0.487.0";
import { DayPicker } from "react-day-picker@8.10.1";

import { cn } from "./utils";
import { buttonVariants } from "./button";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-4",
        caption: "flex justify-center pt-1 relative items-center w-full",
        caption_label: "text-sm font-medium",
        nav: "flex items-center gap-1",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "size-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-x-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-range-end)]:rounded-r-md",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md",
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "size-8 p-0 font-normal aria-selected:opacity-100",
        ),
        day_range_start:
          "day-range-start aria-selected:bg-primary aria-selected:text-primary-foreground",
        day_range_end:
          "day-range-end aria-selected:bg-primary aria-selected:text-primary-foreground",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("size-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("size-4", className)} {...props} />
        ),
      }}
      {...props}
    />
  );
}

export { Calendar };

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

## File: src\components\ui\sidebar.tsx

```typescript
"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot@1.1.2";
import { VariantProps, cva } from "class-variance-authority@0.7.1";
import { PanelLeftIcon } from "lucide-react@0.487.0";

import { useIsMobile } from "./use-mobile";
import { cn } from "./utils";
import { Button } from "./button";
import { Input } from "./input";
import { Separator } from "./separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./sheet";
import { Skeleton } from "./skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

type SidebarContextProps = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextProps | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }

  return context;
}

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);

  // This is the internal state of the sidebar.
  // We use openProp and setOpenProp for control from outside the component.
  const [_open, _setOpen] = React.useState(defaultOpen);
  const open = openProp ?? _open;
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        _setOpen(openState);
      }

      // This sets the cookie to keep the sidebar state.
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    },
    [setOpenProp, open],
  );

  // Helper to toggle the sidebar.
  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open);
  }, [isMobile, setOpen, setOpenMobile]);

  // Adds a keyboard shortcut to toggle the sidebar.
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  // We add a state so that we can do data-state="expanded" or "collapsed".
  // This makes it easier to style the sidebar with Tailwind classes.
  const state = open ? "expanded" : "collapsed";

  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar],
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          data-slot="sidebar-wrapper"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH,
              "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
              ...style,
            } as React.CSSProperties
          }
          className={cn(
            "group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full",
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  );
}

function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  side?: "left" | "right";
  variant?: "sidebar" | "floating" | "inset";
  collapsible?: "offcanvas" | "icon" | "none";
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

  if (collapsible === "none") {
    return (
      <div
        data-slot="sidebar"
        className={cn(
          "bg-sidebar text-sidebar-foreground flex h-full w-(--sidebar-width) flex-col",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetContent
          data-sidebar="sidebar"
          data-slot="sidebar"
          data-mobile="true"
          className="bg-sidebar text-sidebar-foreground w-(--sidebar-width) p-0 [&>button]:hidden"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
            } as React.CSSProperties
          }
          side={side}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>Displays the mobile sidebar.</SheetDescription>
          </SheetHeader>
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      className="group peer text-sidebar-foreground hidden md:block"
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      data-side={side}
      data-slot="sidebar"
    >
      {/* This is what handles the sidebar gap on desktop */}
      <div
        data-slot="sidebar-gap"
        className={cn(
          "relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear",
          "group-data-[collapsible=offcanvas]:w-0",
          "group-data-[side=right]:rotate-180",
          variant === "floating" || variant === "inset"
            ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)",
        )}
      />
      <div
        data-slot="sidebar-container"
        className={cn(
          "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex",
          side === "left"
            ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
            : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
          // Adjust the padding for floating and inset variants.
          variant === "floating" || variant === "inset"
            ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
          className,
        )}
        {...props}
      >
        <div
          data-sidebar="sidebar"
          data-slot="sidebar-inner"
          className="bg-sidebar group-data-[variant=floating]:border-sidebar-border flex h-full w-full flex-col group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:shadow-sm"
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon"
      className={cn("size-7", className)}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      <PanelLeftIcon />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}

function SidebarRail({ className, ...props }: React.ComponentProps<"button">) {
  const { toggleSidebar } = useSidebar();

  return (
    <button
      data-sidebar="rail"
      data-slot="sidebar-rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={cn(
        "hover:after:bg-sidebar-border absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] sm:flex",
        "in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        "hover:group-data-[collapsible=offcanvas]:bg-sidebar group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full",
        "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
        "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
        className,
      )}
      {...props}
    />
  );
}

function SidebarInset({ className, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn(
        "bg-background relative flex w-full flex-1 flex-col",
        "md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2",
        className,
      )}
      {...props}
    />
  );
}

function SidebarInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <Input
      data-slot="sidebar-input"
      data-sidebar="input"
      className={cn("bg-background h-8 w-full shadow-none", className)}
      {...props}
    />
  );
}

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      data-sidebar="header"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  );
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      data-sidebar="footer"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  );
}

function SidebarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="sidebar-separator"
      data-sidebar="separator"
      className={cn("bg-sidebar-border mx-2 w-auto", className)}
      {...props}
    />
  );
}

function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-content"
      data-sidebar="content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        className,
      )}
      {...props}
    />
  );
}

function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group"
      data-sidebar="group"
      className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
      {...props}
    />
  );
}

function SidebarGroupLabel({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      data-slot="sidebar-group-label"
      data-sidebar="group-label"
      className={cn(
        "text-sidebar-foreground/70 ring-sidebar-ring flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium outline-hidden transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

function SidebarGroupAction({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="sidebar-group-action"
      data-sidebar="group-action"
      className={cn(
        "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 md:after:hidden",
        "group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  );
}

function SidebarGroupContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group-content"
      data-sidebar="group-content"
      className={cn("w-full text-sm", className)}
      {...props}
    />
  );
}

function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu"
      data-sidebar="menu"
      className={cn("flex w-full min-w-0 flex-col gap-1", className)}
      {...props}
    />
  );
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      className={cn("group/menu-item relative", className)}
      {...props}
    />
  );
}

const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline:
          "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:p-0!",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function SidebarMenuButton({
  asChild = false,
  isActive = false,
  variant = "default",
  size = "default",
  tooltip,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean;
  isActive?: boolean;
  tooltip?: string | React.ComponentProps<typeof TooltipContent>;
} & VariantProps<typeof sidebarMenuButtonVariants>) {
  const Comp = asChild ? Slot : "button";
  const { isMobile, state } = useSidebar();

  const button = (
    <Comp
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      data-size={size}
      data-active={isActive}
      className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
      {...props}
    />
  );

  if (!tooltip) {
    return button;
  }

  if (typeof tooltip === "string") {
    tooltip = {
      children: tooltip,
    };
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        side="right"
        align="center"
        hidden={state !== "collapsed" || isMobile}
        {...tooltip}
      />
    </Tooltip>
  );
}

function SidebarMenuAction({
  className,
  asChild = false,
  showOnHover = false,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean;
  showOnHover?: boolean;
}) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="sidebar-menu-action"
      data-sidebar="menu-action"
      className={cn(
        "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground peer-hover/menu-button:text-sidebar-accent-foreground absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 md:after:hidden",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        showOnHover &&
          "peer-data-[active=true]/menu-button:text-sidebar-accent-foreground group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 md:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

function SidebarMenuBadge({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-menu-badge"
      data-sidebar="menu-badge"
      className={cn(
        "text-sidebar-foreground pointer-events-none absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums select-none",
        "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  );
}

function SidebarMenuSkeleton({
  className,
  showIcon = false,
  ...props
}: React.ComponentProps<"div"> & {
  showIcon?: boolean;
}) {
  // Random width between 50 to 90%.
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`;
  }, []);

  return (
    <div
      data-slot="sidebar-menu-skeleton"
      data-sidebar="menu-skeleton"
      className={cn("flex h-8 items-center gap-2 rounded-md px-2", className)}
      {...props}
    >
      {showIcon && (
        <Skeleton
          className="size-4 rounded-md"
          data-sidebar="menu-skeleton-icon"
        />
      )}
      <Skeleton
        className="h-4 max-w-(--skeleton-width) flex-1"
        data-sidebar="menu-skeleton-text"
        style={
          {
            "--skeleton-width": width,
          } as React.CSSProperties
        }
      />
    </div>
  );
}

function SidebarMenuSub({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu-sub"
      data-sidebar="menu-sub"
      className={cn(
        "border-sidebar-border mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l px-2.5 py-0.5",
        "group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  );
}

function SidebarMenuSubItem({
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-sub-item"
      data-sidebar="menu-sub-item"
      className={cn("group/menu-sub-item relative", className)}
      {...props}
    />
  );
}

function SidebarMenuSubButton({
  asChild = false,
  size = "md",
  isActive = false,
  className,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean;
  size?: "sm" | "md";
  isActive?: boolean;
}) {
  const Comp = asChild ? Slot : "a";

  return (
    <Comp
      data-slot="sidebar-menu-sub-button"
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground [&>svg]:text-sidebar-accent-foreground flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 outline-hidden focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
        "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        "group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  );
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
};

```

---

## File: src\components\ui\slider.tsx

```typescript
"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider@1.2.3";

import { cn } from "./utils";

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max],
  );

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          "bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-4 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5",
        )}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            "bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full",
          )}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className="border-primary bg-background ring-ring/50 block size-4 shrink-0 rounded-full border shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };

```

---

## File: src\contexts\StoreContext.tsx

```typescript
/**
 * StoreContext - 단일 상점 데이터 관리
 * 앱 실행 시 'store/default' 문서를 로드하여 전역 상태로 제공
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Store } from '../types/store';

interface StoreContextValue {
  // 단일 상점 데이터
  store: Store | null;
  loading: boolean;
  error: Error | null;
  refreshStore: () => Promise<void>;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

interface StoreProviderProps {
  children: ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // 단일 상점 문서 'stores/default' 구독
    const storeRef = doc(db, 'stores', 'default');

    const unsubscribe = onSnapshot(storeRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setStore({
            id: snapshot.id,
            ...snapshot.data(),
          } as Store);
          setError(null);
        } else {
          console.warn('Default store document does not exist!');
          setStore(null);
          // 스토어가 없을 때에 대한 에러 처리는 별도로 하지 않음 (초기 설정 마법사 등이 처리)
        }
        setLoading(false);
      },
      (err) => {
        console.error('Store subscription error:', err);
        if (err.code === 'permission-denied') {
          console.warn('⚠️ Permission denied: Please ensure Firestore security rules are deployed.');
        }
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const refreshStore = async () => {
    // onSnapshot이 자동으로 업데이트하므로 수동 리프레시는 크게 필요 없으나 인터페이스 유지
    setLoading(true);
    // 실제로는 구독이 유지되므로 로딩 상태만 잠깐 변경하거나 생략 가능
    setTimeout(() => setLoading(false), 500);
  };

  const value: StoreContextValue = {
    store,
    loading,
    error,
    refreshStore,
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}

/**
 * StoreContext Hook
 */
export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
```

---

## File: src\hooks\useFirestoreCollection.ts

```typescript
import { useState, useEffect, useRef } from 'react';
import {
  Query,
  onSnapshot,
  DocumentData,
  queryEqual
} from 'firebase/firestore';

interface UseFirestoreCollectionResult<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
}

export function useFirestoreCollection<T extends DocumentData>(
  query: Query | null
): UseFirestoreCollectionResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // 쿼리 객체 참조 안정화 (Deep Compare)
  const queryRef = useRef<Query | null>(query);

  // 렌더링 도중에 ref 업데이트 (useEffect보다 먼저 실행되어야 함)
  if (!queryEqual(queryRef.current, query)) {
    queryRef.current = query;
  }

  // 이제 useEffect는 안정화된 queryRef.current가 변경될 때만 실행됨
  // 즉, 쿼리의 내용이 실제로 바뀌었을 때만 재구독 발생
  useEffect(() => {
    const activeQuery = queryRef.current;

    if (!activeQuery) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const unsubscribe = onSnapshot(
        activeQuery,
        (snapshot) => {
          const items = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as T[];

          setData(items);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error(`Firestore collection error:`, err);
          setError(err as Error);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  }, [queryRef.current]); // query 대신 queryRef.current 사용

  return { data, loading, error };
}

```

---

## File: src\hooks\useIsAdmin.ts

```typescript
import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

export function useIsAdmin(userId: string | null | undefined) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // 데모 모드 확인
  const isDemoMode = auth.app.options.apiKey === 'demo-api-key';

  useEffect(() => {
    if (!userId) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    // 데모 모드인 경우 로컬 스토리지에서 확인
    if (isDemoMode) {
      const demoIsAdmin = localStorage.getItem('demoIsAdmin') === 'true';
      setIsAdmin(demoIsAdmin);
      setLoading(false);
      return;
    }

    // Firestore에서 관리자 권한 확인 (System Admin OR Store Owner)
    // 1. System Admin 체크
    const adminRef = doc(db, 'admins', userId);

    // 2. Store Owner 체크 (단일 상점 모드: 'default')
    const adminStoreRef = doc(db, 'adminStores', `${userId}_default`);

    // 두 경로 중 하나라도 존재하면 관리자로 인정
    // 실시간 리스너를 각각 연결하는 대신, 편의상 하나씩 확인하거나
    // 여기서는 onSnapshot을 두 번 호출하여 상태를 합칩니다.

    let isSystemAdmin = false;
    let isStoreOwner = false;

    // 리스너 관리를 위한 클린업 함수 배열
    const unsubscribes: (() => void)[] = [];

    const updateAdminStatus = () => {
      setIsAdmin(isSystemAdmin || isStoreOwner);
      setLoading(false);
    };

    const unsubAdmin = onSnapshot(adminRef, (doc) => {
      isSystemAdmin = doc.exists() && doc.data()?.isAdmin === true;
      updateAdminStatus();
    }, (err) => {
      console.error('System admin check failed:', err);
      // 에러 시 무시 (false)
    });
    unsubscribes.push(unsubAdmin);

    const unsubStore = onSnapshot(adminStoreRef, (doc) => {
      isStoreOwner = doc.exists(); // adminStores에 레코드가 있으면 권한 보유로 간주 (role 체크 추가 가능)
      updateAdminStatus();
    }, (err) => {
      console.error('Store owner check failed:', err);
    });
    unsubscribes.push(unsubStore);

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [userId, isDemoMode]);

  return { isAdmin, loading };
}
```

---

## File: src\lib\firebase.ts

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging, isSupported } from 'firebase/messaging';

// Firebase 설정
// 실제 프로젝트에서는 .env 파일에서 불러옵니다
const firebaseConfig = {
  apiKey: "AIzaSyCKS_ilGLymEaBjdF6oVKPKKkPc2dNCxQU",
  authDomain: "simple-delivery-app-9d347.firebaseapp.com",
  projectId: "simple-delivery-app-9d347",
  storageBucket: "simple-delivery-app-9d347.firebasestorage.app",
  messagingSenderId: "665529206596",
  appId: "1:665529206596:web:6e5542c21b7fe765a0b911",
  measurementId: "G-FZ74JXV42S"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// Firebase 서비스 초기화
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  ignoreUndefinedProperties: true
});
export const storage = getStorage(app);

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

## File: src\pages\CartPage.tsx

```typescript
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, AlertCircle } from 'lucide-react';
import { useCart, CartItem as CartItemType } from '../contexts/CartContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { toast } from 'sonner';

export default function CartPage() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCart();

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('장바구니가 비어 있습니다');
      return;
    }
    navigate('/checkout');
  };

  const handleClearCart = () => {
    if (window.confirm('장바구니를 비우시겠습니까?')) {
      clearCart();
      toast.success('장바구니가 비워졌습니다');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 gradient-primary rounded-full flex items-center justify-center">
            <ShoppingCart className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl mb-3">
            장바구니가 비어 있습니다
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-8">
            맛있는 메뉴를 장바구니에 담아보세요
          </p>
          <Button size="lg" onClick={() => navigate('/menu')} className="w-full sm:w-auto">
            메뉴 둘러보기
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="container mx-auto px-4">
        {/* Header - 모바일 최적화 */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl mb-2">
              <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                장바구니
              </span>
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              총 {items.length}개의 상품
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearCart}
            className="text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">전체 삭제</span>
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onRemove={removeItem}
                onUpdateQuantity={updateQuantity}
              />
            ))}
          </div>

          {/* Order Summary - 모바일에서는 하단 고정 */}
          <div className="lg:col-span-1">
            {/* 데스크톱: sticky 카드 */}
            <Card className="hidden lg:block sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">주문 요약</h2>

              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center justify-between text-gray-600">
                  <span>상품 금액</span>
                  <span>{getTotalPrice().toLocaleString()}원</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span>배달비</span>
                  <span>3,000원</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-6 text-xl font-bold">
                <span>총 결제 금액</span>
                <span className="text-blue-600">
                  {(getTotalPrice() + 3000).toLocaleString()}원
                </span>
              </div>

              <Button
                fullWidth
                size="lg"
                onClick={handleCheckout}
                className="group"
              >
                주문하기
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-900">
                  최소 주문 금액은 10,000원입니다
                </p>
              </div>
            </Card>

            {/* 모바일: 하단 고정 바 */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-40">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-600">총 결제 금액</span>
                <span className="text-xl text-blue-600">
                  {(getTotalPrice() + 3000).toLocaleString()}원
                </span>
              </div>
              <Button
                fullWidth
                size="lg"
                onClick={handleCheckout}
                className="group"
              >
                주문하기
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* 모바일: 하단 여백 추가 (고정 바 공간 확보) */}
            <div className="lg:hidden h-32"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CartItemProps {
  item: CartItemType;
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
}

function CartItem({ item, onRemove, onUpdateQuantity }: CartItemProps) {
  const optionsPrice = item.options?.reduce((sum, opt) => sum + (opt.price * (opt.quantity || 1)), 0) || 0;
  const itemTotal = (item.price + optionsPrice) * item.quantity;

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="w-full sm:w-32 h-48 sm:h-32 flex-shrink-0 bg-gray-100">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span className="text-5xl sm:text-3xl">🍜</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 pr-2">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">{item.name}</h3>
              {item.options && item.options.length > 0 && (
                <div className="space-y-0.5">
                  {item.options.map((opt, idx) => (
                    <p key={idx} className="text-xs sm:text-sm text-gray-600">
                      + {opt.name} {(opt.quantity || 1) > 1 ? `x${opt.quantity}` : ''} (+{(opt.price * (opt.quantity || 1)).toLocaleString()}원)
                    </p>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => onRemove(item.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
            >
              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          <div className="mt-auto flex items-center justify-between">
            {/* Quantity Controls */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors"
              >
                <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
              <span className="text-base sm:text-lg font-semibold text-gray-900 min-w-[2rem] text-center">
                {item.quantity}
              </span>
              <button
                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>

            {/* Price */}
            <div className="text-right">
              <p className="text-lg sm:text-xl text-blue-600">
                {itemTotal.toLocaleString()}원
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
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

## File: src\pages\NicepayReturnPage.tsx

```typescript
/// <reference types="vite/client" />
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useStore } from '../contexts/StoreContext';

// 개발용 임시 Cloud Functions URL (로컬 또는 프로덕션)
// 실제 배포 시에는 자동으로 Functions 도메인을 사용하거나 프록시 설정 필요
const FUNCTIONS_URL = import.meta.env.VITE_FUNCTIONS_URL || 'https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/nicepayConfirm';

interface NicepayConfirmResponse {
    success: boolean;
    data?: any;
    error?: string;
    code?: string;
}

export default function NicepayReturnPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { store } = useStore();

    const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
    const [message, setMessage] = useState('결제 결과를 확인하고 있습니다...');

    useEffect(() => {
        const verifyPayment = async () => {
            // URL 파라미터 파싱
            const orderId = searchParams.get('orderId');
            const tid = searchParams.get('tid') || searchParams.get('TxTid');
            const authToken = searchParams.get('authToken') || searchParams.get('AuthToken');
            const resultCode = searchParams.get('resultCode') || searchParams.get('ResultCode');
            const resultMsg = searchParams.get('resultMsg') || searchParams.get('ResultMsg');
            const amount = searchParams.get('amt') || searchParams.get('Amt');

            console.log('NICEPAY Return Params:', { orderId, tid, resultCode, resultMsg });

            if (resultCode !== '0000') {
                setStatus('failed');
                setMessage(resultMsg || '결제가 취소되었거나 승인되지 않았습니다.');
                return;
            }

            if (!orderId || !tid || !authToken) {
                setStatus('failed');
                setMessage('필수 결제 정보가 누락되었습니다.');
                return;
            }

            try {
                // Cloud Function 호출
                // 주의: 배포 전에는 로컬 에뮬레이터나 배포된 URL을 정확히 지정해야 함.
                // 여기서는 fetch 사용. (T2-4-2 Task에서 URL은 .env 등으로 관리 권장)

                // **************************************************************************
                // [중요] 실제 운영 환경에서는 Functions URL을 동적으로 주입해야 합니다.
                // 현재는 예시로 상대 경로 또는 하드코딩된 URL을 사용할 수 있습니다.
                // **************************************************************************

                const response = await fetch('/nicepayConfirm', { // 리버스 프록시 사용 시
                    // const response = await fetch('http://127.0.0.1:5001/YOUR_PROJECT/us-central1/nicepayConfirm', { // 로컬 테스트
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        tid,
                        authToken,
                        orderId,
                        storeId: store?.id,
                        amount: Number(amount)
                    })
                });

                const result: NicepayConfirmResponse = await response.json();

                if (result.success) {
                    setStatus('success');
                    setMessage('결제가 정상적으로 완료되었습니다.');
                } else {
                    setStatus('failed');
                    setMessage(result.error || '결제 승인 중 오류가 발생했습니다.');
                }
            } catch (error) {
                console.error('Payment Confirmation Error:', error);
                setStatus('failed');
                setMessage('서버 통신 중 오류가 발생했습니다.');
            }
        };

        if (store?.id) {
            verifyPayment();
        }
    }, [searchParams, store]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full text-center py-10 px-6">
                {status === 'loading' && (
                    <div className="flex flex-col items-center">
                        <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-6" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">결제 승인 중...</h2>
                        <p className="text-gray-600 animate-pulse">{message}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center">
                        <CheckCircle2 className="w-16 h-16 text-green-500 mb-6" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">결제 성공!</h2>
                        <p className="text-gray-600 mb-8">{message}</p>
                        <Button
                            fullWidth
                            size="lg"
                            onClick={() => navigate('/orders')}
                        >
                            주문 내역 보기
                        </Button>
                    </div>
                )}

                {status === 'failed' && (
                    <div className="flex flex-col items-center">
                        <XCircle className="w-16 h-16 text-red-500 mb-6" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">결제 실패</h2>
                        <p className="text-gray-600 mb-8">{message}</p>
                        <div className="flex gap-3 w-full">
                            <Button
                                variant="outline"
                                fullWidth
                                onClick={() => navigate('/')}
                            >
                                홈으로
                            </Button>
                            <Button
                                fullWidth
                                onClick={() => navigate('/checkout')}
                            >
                                다시 시도
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}

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

