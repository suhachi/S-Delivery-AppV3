# S-Delivery-App - Volume 04

Generated: 2025-12-23 19:23:22
Project Path: D:\projectsing\S-Delivery-App\

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

## File: src\components\ui\sonner.tsx

```typescript
"use client";

import { useTheme } from "next-themes@0.4.6";
import { Toaster as Sonner, ToasterProps } from "sonner@2.0.3";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };

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

## File: src\hooks\useFirestoreDocument.ts

```typescript
import { useState, useEffect } from 'react';
import { doc, onSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface UseFirestoreDocumentResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useFirestoreDocument<T extends DocumentData>(
  collectionName: string | string[],
  documentId: string | null | undefined
): UseFirestoreDocumentResult<T> {
  // 안정적인 의존성 키 생성 (배열인 경우 문자열로 결합)
  const collectionPath = Array.isArray(collectionName)
    ? collectionName.join('/')
    : collectionName;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!documentId) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // collectionPath(문자열)를 사용하여 참조 생성
      const docRef = doc(db, collectionPath, documentId);

      const unsubscribe = onSnapshot(
        docRef,
        (snapshot) => {
          if (snapshot.exists()) {
            setData({
              id: snapshot.id,
              ...snapshot.data(),
            } as T);
          } else {
            setData(null);
          }
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error(`Firestore document error (${collectionPath}/${documentId}):`, err);
          setError(err as Error);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  }, [collectionPath, documentId]); // 안정된 문자열 키 사용

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

## File: src\pages\LoginPage.tsx

```typescript
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다';
    }

    if (!password) {
      newErrors.password = '비밀번호를 입력해주세요';
    } else if (password.length < 6) {
      newErrors.password = '비밀번호는 최소 6자 이상이어야 합니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);

    try {
      await login(email, password);
      toast.success('로그인 성공!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || '로그인에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <Link to="/" className="inline-flex items-center justify-center w-20 h-20 gradient-primary rounded-3xl mb-4 shadow-lg hover:scale-105 transition-transform">
            <span className="text-4xl">🍜</span>
          </Link>
          <h1 className="text-3xl mb-2">
            <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              로그인
            </span>
          </h1>
          <p className="text-gray-600">커스컴배달앱에 오신 것을 환영합니다</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 animate-scale-in">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="이메일"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              icon={<Mail className="w-5 h-5" />}
              autoComplete="email"
            />

            <Input
              label="비밀번호"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              icon={<Lock className="w-5 h-5" />}
              autoComplete="current-password"
            />

            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={isLoading}
              className="group"
            >
              {!isLoading && (
                <>
                  로그인
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              계정이 없으신가요?{' '}
              <Link
                to="/signup"
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
              >
                회원가입
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-gray-600 hover:text-gray-900 text-sm inline-flex items-center"
          >
            ← 홈으로 돌아가기
          </Link>
        </div>
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

## File: src\styles\globals.css

```css
@import 'tailwindcss';

/* Modern Design System */
:root {
  /* Primary Colors - Vibrant Blue */
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-200: #bfdbfe;
  --color-primary-300: #93c5fd;
  --color-primary-400: #60a5fa;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  --color-primary-800: #1e40af;
  --color-primary-900: #1e3a8a;
  
  /* Secondary Colors - Orange Accent */
  --color-secondary-50: #fff7ed;
  --color-secondary-100: #ffedd5;
  --color-secondary-200: #fed7aa;
  --color-secondary-300: #fdba74;
  --color-secondary-400: #fb923c;
  --color-secondary-500: #f97316;
  --color-secondary-600: #ea580c;
  --color-secondary-700: #c2410c;
  --color-secondary-800: #9a3412;
  --color-secondary-900: #7c2d12;
  
  /* Success Green */
  --color-success: #10b981;
  --color-success-light: #d1fae5;
  
  /* Warning */
  --color-warning: #f59e0b;
  --color-warning-light: #fef3c7;
  
  /* Error */
  --color-error: #ef4444;
  --color-error-light: #fee2e2;
  
  /* Neutrals */
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-300: #d1d5db;
  --color-gray-400: #9ca3af;
  --color-gray-500: #6b7280;
  --color-gray-600: #4b5563;
  --color-gray-700: #374151;
  --color-gray-800: #1f2937;
  --color-gray-900: #111827;
  
  /* Spacing */
  --spacing-xs: 0.5rem;
  --spacing-sm: 0.75rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;
  
  /* Border Radius */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-2xl: 1.5rem;
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  
  /* Transitions */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Typography */
h1 {
  font-size: 2.25rem;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.025em;
}

h2 {
  font-size: 1.875rem;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -0.025em;
}

h3 {
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.4;
}

h4 {
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.5;
}

h5 {
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.5;
}

p {
  font-size: 1rem;
  line-height: 1.625;
  color: var(--color-gray-700);
}

small {
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--color-gray-600);
}

/* Base Styles */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--color-gray-900);
  background-color: var(--color-gray-50);
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--color-gray-100);
  border-radius: var(--radius-full);
}

::-webkit-scrollbar-thumb {
  background: var(--color-gray-400);
  border-radius: var(--radius-full);
  transition: background var(--transition-base);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-gray-500);
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-fade-in {
  animation: fadeIn var(--transition-base) ease-out;
}

.animate-slide-up {
  animation: slideUp var(--transition-slow) ease-out;
}

.animate-scale-in {
  animation: scaleIn var(--transition-base) ease-out;
}

/* Utility Classes */
.glass-effect {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.gradient-primary {
  background: linear-gradient(135deg, var(--color-primary-600) 0%, var(--color-primary-500) 100%);
}

.gradient-secondary {
  background: linear-gradient(135deg, var(--color-secondary-600) 0%, var(--color-secondary-500) 100%);
}

.card-hover {
  transition: all var(--transition-base);
}

.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

/* Hide scrollbar utility */
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

/* Button Base Styles */
button {
  font-family: inherit;
  cursor: pointer;
  transition: all var(--transition-base);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Input Base Styles */
input, textarea, select {
  font-family: inherit;
  font-size: 1rem;
}

input:focus, textarea:focus, select:focus {
  outline: none;
  ring: 2px;
  ring-color: var(--color-primary-500);
  ring-offset: 2px;
}

/* Container */
.container {
  width: 100%;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  padding-left: var(--spacing-md);
  padding-right: var(--spacing-md);
}

@media (min-width: 640px) {
  .container {
    padding-left: var(--spacing-lg);
    padding-right: var(--spacing-lg);
  }
}

@media (min-width: 1024px) {
  .container {
    padding-left: var(--spacing-xl);
    padding-right: var(--spacing-xl);
  }
}
```

---

## File: src\utils\orderUtils.ts

```typescript
import { Order, OrderStatus } from '../types/order';

// 헬퍼 함수: 다음 주문 상태 계산
export function getNextStatus(order: Order): OrderStatus | null {
    const currentStatus = order.status;
    const isPickup = order.orderType === '포장주문';

    // 상태 흐름 정의
    const deliveryFlow: OrderStatus[] = ['접수', '접수완료', '조리중', '배달중', '완료'];
    const pickupFlow: OrderStatus[] = ['접수', '접수완료', '조리중', '조리완료', '포장완료'];

    const statusFlow = isPickup ? pickupFlow : deliveryFlow;
    const currentIndex = statusFlow.indexOf(currentStatus as OrderStatus);

    if (currentIndex >= 0 && currentIndex < statusFlow.length - 1) {
        return statusFlow[currentIndex + 1];
    }
    return null;
}

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

## File: vite.config.ts

```typescript

  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react-swc';
  import path from 'path';

  export default defineConfig({
    plugins: [react()],
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      alias: {
        'vaul@1.1.2': 'vaul',
        'sonner@2.0.3': 'sonner',
        'recharts@2.15.2': 'recharts',
        'react-resizable-panels@2.1.7': 'react-resizable-panels',
        'react-hook-form@7.55.0': 'react-hook-form',
        'react-day-picker@8.10.1': 'react-day-picker',
        'next-themes@0.4.6': 'next-themes',
        'lucide-react@0.487.0': 'lucide-react',
        'input-otp@1.4.2': 'input-otp',
        'embla-carousel-react@8.6.0': 'embla-carousel-react',
        'cmdk@1.1.1': 'cmdk',
        'class-variance-authority@0.7.1': 'class-variance-authority',
        '@radix-ui/react-tooltip@1.1.8': '@radix-ui/react-tooltip',
        '@radix-ui/react-toggle@1.1.2': '@radix-ui/react-toggle',
        '@radix-ui/react-toggle-group@1.1.2': '@radix-ui/react-toggle-group',
        '@radix-ui/react-tabs@1.1.3': '@radix-ui/react-tabs',
        '@radix-ui/react-switch@1.1.3': '@radix-ui/react-switch',
        '@radix-ui/react-slot@1.1.2': '@radix-ui/react-slot',
        '@radix-ui/react-slider@1.2.3': '@radix-ui/react-slider',
        '@radix-ui/react-separator@1.1.2': '@radix-ui/react-separator',
        '@radix-ui/react-select@2.1.6': '@radix-ui/react-select',
        '@radix-ui/react-scroll-area@1.2.3': '@radix-ui/react-scroll-area',
        '@radix-ui/react-radio-group@1.2.3': '@radix-ui/react-radio-group',
        '@radix-ui/react-progress@1.1.2': '@radix-ui/react-progress',
        '@radix-ui/react-popover@1.1.6': '@radix-ui/react-popover',
        '@radix-ui/react-navigation-menu@1.2.5': '@radix-ui/react-navigation-menu',
        '@radix-ui/react-menubar@1.1.6': '@radix-ui/react-menubar',
        '@radix-ui/react-label@2.1.2': '@radix-ui/react-label',
        '@radix-ui/react-hover-card@1.1.6': '@radix-ui/react-hover-card',
        '@radix-ui/react-dropdown-menu@2.1.6': '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-dialog@1.1.6': '@radix-ui/react-dialog',
        '@radix-ui/react-context-menu@2.2.6': '@radix-ui/react-context-menu',
        '@radix-ui/react-collapsible@1.1.3': '@radix-ui/react-collapsible',
        '@radix-ui/react-checkbox@1.1.4': '@radix-ui/react-checkbox',
        '@radix-ui/react-avatar@1.1.3': '@radix-ui/react-avatar',
        '@radix-ui/react-aspect-ratio@1.1.2': '@radix-ui/react-aspect-ratio',
        '@radix-ui/react-alert-dialog@1.1.6': '@radix-ui/react-alert-dialog',
        '@radix-ui/react-accordion@1.2.3': '@radix-ui/react-accordion',
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      target: 'esnext',
      outDir: 'build',
    },
    server: {
      port: 3000,
      open: true,
    },
  });
```

---

