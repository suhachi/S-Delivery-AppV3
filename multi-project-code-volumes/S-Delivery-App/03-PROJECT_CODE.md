# S-Delivery-App - Volume 03

Generated: 2025-12-23 19:23:22
Project Path: D:\projectsing\S-Delivery-App\

- Files in volume: 18
- Approx size: 0.07 MB

---

## File: src\components\common\Button.tsx

```typescript
import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  children?: ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'gradient-primary text-white hover:shadow-lg hover:scale-[1.02] focus:ring-primary-500',
    secondary: 'gradient-secondary text-white hover:shadow-lg hover:scale-[1.02] focus:ring-orange-500',
    outline: 'border-2 border-primary-500 text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    danger: 'bg-red-500 text-white hover:bg-red-600 hover:shadow-lg focus:ring-red-500',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          처리중...
        </>
      ) : (
        children
      )}
    </button>
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

## File: src\components\notice\NoticeList.tsx

```typescript
import { useState } from 'react';
import { Clock, Pin, ChevronDown, ChevronUp } from 'lucide-react';
import { Notice } from '../../types/notice';
import { formatDateRelative } from '../../utils/formatDate';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { useStore } from '../../contexts/StoreContext';
import { useFirestoreCollection } from '../../hooks/useFirestoreCollection';
import { getAllNoticesQuery } from '../../services/noticeService';

export default function NoticeList() {
  const { store } = useStore();
  const storeId = store?.id;
  const { data: notices, loading } = useFirestoreCollection<Notice>(
    storeId ? getAllNoticesQuery(storeId) : null
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!storeId) {
    return null;
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">공지사항을 불러오는 중...</p>
      </div>
    );
  }

  // 고정 공지와 일반 공지 분류
  const pinnedNotices = (notices || []).filter(n => n.pinned);
  const regularNotices = (notices || []).filter(n => !n.pinned);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '공지': return 'primary';
      case '이벤트': return 'secondary';
      case '점검': return 'danger';
      case '할인': return 'success';
      default: return 'gray';
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const renderNotice = (notice: Notice) => {
    const isExpanded = expandedId === notice.id;
    const isPinned = notice.pinned;

    return (
      <Card
        key={notice.id}
        className={`${isPinned ? 'bg-blue-50 border-2 border-blue-200' : ''}`}
      >
        <div
          className="cursor-pointer"
          onClick={() => toggleExpand(notice.id)}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2 flex-1">
              {isPinned && (
                <Pin className="w-4 h-4 text-blue-600 flex-shrink-0" />
              )}
              <Badge
                variant={getCategoryColor(notice.category)}
                size="sm"
              >
                {notice.category}
              </Badge>
              <h3 className="font-semibold text-gray-900 line-clamp-1 flex-1">
                {notice.title}
              </h3>
            </div>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
            )}
          </div>

          {/* Preview */}
          {!isExpanded && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
              {notice.content}
            </p>
          )}

          {/* Date */}
          <div className="flex items-center text-xs text-gray-500">
            <Clock className="w-3 h-3 mr-1" />
            {formatDateRelative(notice.createdAt)}
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-gray-700 whitespace-pre-wrap">
              {notice.content}
            </p>
          </div>
        )}
      </Card>
    );
  };

  if (notices.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">📢</div>
        <p className="text-gray-600">등록된 공지사항이 없습니다</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 고정 공지 */}
      {pinnedNotices.length > 0 && (
        <div className="space-y-3">
          {pinnedNotices.map(renderNotice)}
        </div>
      )}

      {/* 일반 공지 */}
      {regularNotices.length > 0 && (
        <div className="space-y-3">
          {regularNotices.map(renderNotice)}
        </div>
      )}
    </div>
  );
}
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

## File: src\components\ui\input-otp.tsx

```typescript
"use client";

import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp@1.4.2";
import { MinusIcon } from "lucide-react@0.487.0";

import { cn } from "./utils";

function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string;
}) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(
        "flex items-center gap-2 has-disabled:opacity-50",
        containerClassName,
      )}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    />
  );
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn("flex items-center gap-1", className)}
      {...props}
    />
  );
}

function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  index: number;
}) {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        "data-[active=true]:border-ring data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:ring-destructive/20 dark:data-[active=true]:aria-invalid:ring-destructive/40 aria-invalid:border-destructive data-[active=true]:aria-invalid:border-destructive dark:bg-input/30 border-input relative flex h-9 w-9 items-center justify-center border-y border-r text-sm bg-input-background transition-all outline-none first:rounded-l-md first:border-l last:rounded-r-md data-[active=true]:z-10 data-[active=true]:ring-[3px]",
        className,
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-caret-blink bg-foreground h-4 w-px duration-1000" />
        </div>
      )}
    </div>
  );
}

function InputOTPSeparator({ ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="input-otp-separator" role="separator" {...props}>
      <MinusIcon />
    </div>
  );
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };

```

---

## File: src\components\ui\navigation-menu.tsx

```typescript
import * as React from "react";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu@1.2.5";
import { cva } from "class-variance-authority@0.7.1";
import { ChevronDownIcon } from "lucide-react@0.487.0";

import { cn } from "./utils";

function NavigationMenu({
  className,
  children,
  viewport = true,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Root> & {
  viewport?: boolean;
}) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      data-viewport={viewport}
      className={cn(
        "group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",
        className,
      )}
      {...props}
    >
      {children}
      {viewport && <NavigationMenuViewport />}
    </NavigationMenuPrimitive.Root>
  );
}

function NavigationMenuList({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.List>) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn(
        "group flex flex-1 list-none items-center justify-center gap-1",
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Item>) {
  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      className={cn("relative", className)}
      {...props}
    />
  );
}

const navigationMenuTriggerStyle = cva(
  "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=open]:hover:bg-accent data-[state=open]:text-accent-foreground data-[state=open]:focus:bg-accent data-[state=open]:bg-accent/50 focus-visible:ring-ring/50 outline-none transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1",
);

function NavigationMenuTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      className={cn(navigationMenuTriggerStyle(), "group", className)}
      {...props}
    >
      {children}{" "}
      <ChevronDownIcon
        className="relative top-[1px] ml-1 size-3 transition duration-300 group-data-[state=open]:rotate-180"
        aria-hidden="true"
      />
    </NavigationMenuPrimitive.Trigger>
  );
}

function NavigationMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Content>) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        "data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 top-0 left-0 w-full p-2 pr-2.5 md:absolute md:w-auto",
        "group-data-[viewport=false]/navigation-menu:bg-popover group-data-[viewport=false]/navigation-menu:text-popover-foreground group-data-[viewport=false]/navigation-menu:data-[state=open]:animate-in group-data-[viewport=false]/navigation-menu:data-[state=closed]:animate-out group-data-[viewport=false]/navigation-menu:data-[state=closed]:zoom-out-95 group-data-[viewport=false]/navigation-menu:data-[state=open]:zoom-in-95 group-data-[viewport=false]/navigation-menu:data-[state=open]:fade-in-0 group-data-[viewport=false]/navigation-menu:data-[state=closed]:fade-out-0 group-data-[viewport=false]/navigation-menu:top-full group-data-[viewport=false]/navigation-menu:mt-1.5 group-data-[viewport=false]/navigation-menu:overflow-hidden group-data-[viewport=false]/navigation-menu:rounded-md group-data-[viewport=false]/navigation-menu:border group-data-[viewport=false]/navigation-menu:shadow group-data-[viewport=false]/navigation-menu:duration-200 **:data-[slot=navigation-menu-link]:focus:ring-0 **:data-[slot=navigation-menu-link]:focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuViewport({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Viewport>) {
  return (
    <div
      className={cn(
        "absolute top-full left-0 isolate z-50 flex justify-center",
      )}
    >
      <NavigationMenuPrimitive.Viewport
        data-slot="navigation-menu-viewport"
        className={cn(
          "origin-top-center bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border shadow md:w-[var(--radix-navigation-menu-viewport-width)]",
          className,
        )}
        {...props}
      />
    </div>
  );
}

function NavigationMenuLink({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Link>) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(
        "data-[active=true]:focus:bg-accent data-[active=true]:hover:bg-accent data-[active=true]:bg-accent/50 data-[active=true]:text-accent-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:ring-ring/50 [&_svg:not([class*='text-'])]:text-muted-foreground flex flex-col gap-1 rounded-sm p-2 text-sm transition-all outline-none focus-visible:ring-[3px] focus-visible:outline-1 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuIndicator({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Indicator>) {
  return (
    <NavigationMenuPrimitive.Indicator
      data-slot="navigation-menu-indicator"
      className={cn(
        "data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden",
        className,
      )}
      {...props}
    >
      <div className="bg-border relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm shadow-md" />
    </NavigationMenuPrimitive.Indicator>
  );
}

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
};

```

---

## File: src\components\ui\toggle-group.tsx

```typescript
"use client";

import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group@1.1.2";
import { type VariantProps } from "class-variance-authority@0.7.1";

import { cn } from "./utils";
import { toggleVariants } from "./toggle";

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants>
>({
  size: "default",
  variant: "default",
});

function ToggleGroup({
  className,
  variant,
  size,
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      className={cn(
        "group/toggle-group flex w-fit items-center rounded-md data-[variant=outline]:shadow-xs",
        className,
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  );
}

function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> &
  VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext);

  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={context.variant || variant}
      data-size={context.size || size}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        "min-w-0 flex-1 shrink-0 rounded-none shadow-none first:rounded-l-md last:rounded-r-md focus:z-10 focus-visible:z-10 data-[variant=outline]:border-l-0 data-[variant=outline]:first:border-l",
        className,
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
}

export { ToggleGroup, ToggleGroupItem };

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

## File: src\main.tsx

```typescript

  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./index.css";

  createRoot(document.getElementById("root")!).render(<App />);
  
```

---

## File: src\pages\admin\AdminCouponManagement.tsx

```typescript
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Ticket, TrendingUp, Search, User } from 'lucide-react';
import { Coupon, DISCOUNT_TYPE_LABELS } from '../../types/coupon';
import { toast } from 'sonner';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import { useStore } from '../../contexts/StoreContext';
import { useFirestoreCollection } from '../../hooks/useFirestoreCollection';
import { createCoupon, updateCoupon, deleteCoupon, toggleCouponActive, getAllCouponsQuery } from '../../services/couponService';
import { searchUsers, UserProfile } from '../../services/userService';

export default function AdminCouponManagement() {
  const { store } = useStore();
  const { data: coupons, loading } = useFirestoreCollection<Coupon>(
    store?.id ? getAllCouponsQuery(store.id) : null
  );

  if (!store || !store.id) return null;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const handleAddCoupon = () => {
    setEditingCoupon(null);
    setIsModalOpen(true);
  };

  const handleEditCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setIsModalOpen(true);
  };

  const handleDeleteCoupon = async (couponId: string) => {
    if (!store?.id) return;
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await deleteCoupon(store.id, couponId);
        toast.success('쿠폰이 삭제되었습니다');
      } catch (error) {
        toast.error('쿠폰 삭제에 실패했습니다');
      }
    }
  };

  const handleToggleActive = async (couponId: string, currentActive: boolean) => {
    if (!store?.id) return;
    try {
      await toggleCouponActive(store.id, couponId, !currentActive);
      toast.success('쿠폰 상태가 변경되었습니다');
    } catch (error) {
      toast.error('쿠폰 상태 변경에 실패했습니다');
    }
  };

  const handleSaveCoupon = async (couponData: Omit<Coupon, 'id' | 'createdAt' | 'usedCount'>) => {
    if (!store?.id) return;
    try {
      if (editingCoupon) {
        await updateCoupon(store.id, editingCoupon.id, couponData);
        toast.success('쿠폰이 수정되었습니다');
      } else {
        await createCoupon(store.id, couponData);
        toast.success('쿠폰이 추가되었습니다');
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error('쿠폰 저장에 실패했습니다');
    }
  };

  const activeCoupons = (coupons || []).filter(c => c.isActive).length;
  const totalCoupons = (coupons || []).length;

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
                  쿠폰 관리
                </span>
              </h1>
              <p className="text-gray-600">총 {totalCoupons}개의 쿠폰</p>
            </div>
            <Button onClick={handleAddCoupon}>
              <Plus className="w-5 h-5 mr-2" />
              쿠폰 추가
            </Button>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">전체 쿠폰</p>
                  <p className="text-3xl font-bold text-gray-900">{totalCoupons}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Ticket className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">활성 쿠폰</p>
                  <p className="text-3xl font-bold text-green-600">{activeCoupons}</p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <Ticket className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          </div>

          {/* Coupons List */}
          <div className="space-y-4">
            {coupons && coupons.map((coupon) => (
              <CouponCard
                key={coupon.id}
                coupon={coupon}
                onEdit={handleEditCoupon}
                onDelete={handleDeleteCoupon}
                onToggleActive={handleToggleActive}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Coupon Form Modal */}
      {isModalOpen && (
        <CouponFormModal
          coupon={editingCoupon}
          onSave={handleSaveCoupon}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

interface CouponCardProps {
  coupon: Coupon;
  onEdit: (coupon: Coupon) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, currentActive: boolean) => void;
}

function CouponCard({ coupon, onEdit, onDelete, onToggleActive }: CouponCardProps) {
  const isExpired = new Date() > new Date(coupon.validUntil);

  return (
    <Card className={coupon.isActive && !isExpired ? '' : 'opacity-60'}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${coupon.isActive && !isExpired ? 'gradient-primary' : 'bg-gray-300'
            }`}>
            <Ticket className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-xl font-bold text-gray-900">{coupon.name}</h3>
              <Badge variant={coupon.isActive && !isExpired ? 'success' : 'gray'}>
                {isExpired ? '만료됨' : coupon.isActive ? '활성' : '비활성'}
              </Badge>
            </div>

            <div className="grid md:grid-cols-2 gap-x-8 gap-y-2 mb-3">
              <div>
                <p className="text-sm text-gray-600">쿠폰 코드</p>
                <p className="font-mono font-semibold text-blue-600">{coupon.code}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">할인</p>
                <p className="font-semibold text-gray-900">
                  {coupon.discountType === 'percentage'
                    ? `${coupon.discountValue}%`
                    : `${coupon.discountValue.toLocaleString()}원`
                  }
                  {coupon.maxDiscountAmount && ` (최대 ${coupon.maxDiscountAmount.toLocaleString()}원)`}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">최소 주문 금액</p>
                <p className="font-semibold text-gray-900">{coupon.minOrderAmount.toLocaleString()}원</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">유효 기간</p>
                <p className="text-sm text-gray-900">
                  {new Date(coupon.validFrom).toLocaleDateString()} ~ {new Date(coupon.validUntil).toLocaleDateString()}
                </p>
              </div>
              {coupon.assignedUserId && (
                <>
                  <div>
                    <p className="text-sm text-gray-600">발급 대상</p>
                    <p className="font-semibold text-gray-900">{coupon.assignedUserName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">전화번호</p>
                    <p className="font-semibold text-gray-900">{coupon.assignedUserPhone}</p>
                  </div>
                </>
              )}
            </div>

            {/* 사용 상태 */}
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${coupon.isUsed
                ? 'bg-gray-100 text-gray-600'
                : 'bg-green-100 text-green-700'
                }`}>
                {coupon.isUsed ? '1회 사용 완료' : '사용 가능 (1회)'}
              </div>
              {coupon.isUsed && coupon.usedAt && (
                <span className="text-xs text-gray-500">
                  {new Date(coupon.usedAt).toLocaleDateString()} 사용
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 ml-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(coupon)}
            disabled={coupon.isUsed}
          >
            <Edit2 className="w-4 h-4 mr-1.5" />
            수정
          </Button>
          <Button
            variant={coupon.isActive ? 'ghost' : 'secondary'}
            size="sm"
            onClick={() => onToggleActive(coupon.id, coupon.isActive)}
            disabled={isExpired || coupon.isUsed}
          >
            {coupon.isActive ? '비활성화' : '활성화'}
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(coupon.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

interface CouponFormModalProps {
  coupon: Coupon | null;
  onSave: (coupon: Omit<Coupon, 'id' | 'createdAt' | 'usedCount'>) => void;
  onClose: () => void;
}

function CouponFormModal({ coupon, onSave, onClose }: CouponFormModalProps) {
  const [formData, setFormData] = useState<Partial<Coupon>>(
    coupon || {
      code: '',
      name: '',
      discountType: 'fixed',
      discountValue: 0,
      minOrderAmount: 0,
      maxDiscountAmount: undefined,
      validFrom: new Date(),
      validUntil: new Date(),
      isActive: true,
    }
  );

  const [customNameMode, setCustomNameMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(
    coupon?.assignedUserId && coupon.assignedUserName
      ? {
        id: coupon.assignedUserId,
        name: coupon.assignedUserName,
        phone: coupon.assignedUserPhone || '',
        email: '',
        createdAt: null
      }
      : null
  );

  // 회원 검색 (Debounce 적용 없이 간단히 Enter 키나 버튼으로 트리거해도 되지만, 여기선 useEffect로 처리)
  useEffect(() => {
    const search = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const results = await searchUsers(searchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(search, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleUserSelect = (user: UserProfile) => {
    setSelectedUser(user);
    setFormData({
      ...formData,
      assignedUserId: user.id,
      assignedUserName: user.name,
      assignedUserPhone: user.phone,
    });
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleUserRemove = () => {
    setSelectedUser(null);
    setFormData({
      ...formData,
      assignedUserId: undefined,
      assignedUserName: undefined,
      assignedUserPhone: undefined,
    });
  };

  // 쿠폰 코드 자동 생성 함수
  const generateCouponCode = () => {
    const prefix = formData.name === '회원가입축하쿠폰' ? 'WELCOME' :
      formData.name === '이벤트쿠폰' ? 'EVENT' :
        formData.name === '감사쿠폰' ? 'THANKS' : 'COUPON';
    const randomNum = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}${randomNum}`;
  };

  // 쿠폰명 선택 시 자동으로 코드 생성
  const handleNameSelect = (name: string) => {
    setFormData({
      ...formData,
      name,
      code: generateCouponCode()
    });
    setCustomNameMode(false);
  };

  // 직접 입력 모드
  const handleCustomName = () => {
    setCustomNameMode(true);
    setFormData({ ...formData, name: '', code: '' });
  };

  // 직접 입력 시에도 코드 자동 생성
  const handleCustomNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      code: name ? generateCouponCode() : ''
    });
  };

  const predefinedNames = [
    { value: '회원가입축하쿠폰', label: '회원가입축하쿠폰', emoji: '🎉' },
    { value: '이벤트쿠폰', label: '이벤트쿠폰', emoji: '🎁' },
    { value: '감사쿠폰', label: '감사쿠폰', emoji: '💝' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code || !formData.name || !formData.discountValue) {
      toast.error('필수 항목을 모두 입력해주세요');
      return;
    }

    onSave(formData as Omit<Coupon, 'id' | 'createdAt' | 'usedCount'>);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {coupon ? '쿠폰 수정' : '쿠폰 추가'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 쿠폰명 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              쿠폰명 *
            </label>

            {!customNameMode ? (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  {predefinedNames.map(name => (
                    <button
                      key={name.value}
                      type="button"
                      onClick={() => handleNameSelect(name.value)}
                      className={`
                        p-4 rounded-lg border-2 transition-all text-center
                        ${formData.name === name.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }
                      `}
                    >
                      <div className="text-2xl mb-1">{name.emoji}</div>
                      <div className="text-sm font-medium">{name.label}</div>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleCustomName}
                  className="w-full px-4 py-2.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  ✏️ 직접 입력하기
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Input
                  placeholder="쿠폰명을 입력하세요"
                  value={formData.name}
                  onChange={(e) => handleCustomNameChange(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => {
                    setCustomNameMode(false);
                    setFormData({ ...formData, name: '', code: '' });
                  }}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  ← 기본 쿠폰명으로 돌아가기
                </button>
              </div>
            )}
          </div>

          {/* 쿠폰 코드 (자동 생성) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              쿠폰 코드 (자동 생성)
            </label>
            <div className="flex items-center gap-2">
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="자동으로 생성됩니다"
                required
                disabled={!formData.name}
              />
              {formData.name && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData({ ...formData, code: generateCouponCode() })}
                >
                  재생성
                </Button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              쿠폰명을 선택하면 자동으로 생성됩니다
            </p>
          </div>

          {/* 발급 대상 지정 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              발급 대상 (선택)
            </label>

            {selectedUser ? (
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{selectedUser.name}</p>
                    <p className="text-sm text-gray-600">{selectedUser.phone}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleUserRemove}
                  className="p-2 hover:bg-white rounded-full transition-colors text-gray-500 hover:text-red-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="이름 또는 전화번호로 회원 검색"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* 검색 결과 */}
                {searchQuery && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {isSearching ? (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        검색 중...
                      </div>
                    ) : searchResults.length > 0 ? (
                      <ul>
                        {searchResults.map(user => (
                          <li key={user.id}>
                            <button
                              type="button"
                              onClick={() => handleUserSelect(user)}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                            >
                              <p className="font-medium text-gray-900">{user.name}</p>
                              <p className="text-sm text-gray-600">{user.phone}</p>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        검색 결과가 없습니다
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              할인 유형
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, discountType: 'fixed' })}
                className={`
                  p-4 rounded-lg border-2 transition-all
                  ${formData.discountType === 'fixed'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }
                `}
              >
                금액 할인
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, discountType: 'percentage' })}
                className={`
                  p-4 rounded-lg border-2 transition-all
                  ${formData.discountType === 'percentage'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }
                `}
              >
                퍼센트 할인
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label={formData.discountType === 'percentage' ? '할인율 (%)' : '할인 금액 (원)'}
              type="number"
              value={formData.discountValue}
              onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
              required
            />
            {formData.discountType === 'percentage' && (
              <Input
                label="최대 할인 금액 (원, 선택)"
                type="number"
                value={formData.maxDiscountAmount || ''}
                onChange={(e) => setFormData({ ...formData, maxDiscountAmount: Number(e.target.value) || undefined })}
              />
            )}
          </div>

          <Input
            label="최소 주문 금액 (원)"
            type="number"
            value={formData.minOrderAmount}
            onChange={(e) => setFormData({ ...formData, minOrderAmount: Number(e.target.value) })}
            required
          />

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                시작일
              </label>
              <input
                type="date"
                value={formData.validFrom ? new Date(formData.validFrom).toISOString().split('T')[0] : ''}
                onChange={(e) => setFormData({ ...formData, validFrom: new Date(e.target.value) })}
                className="w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                종료일
              </label>
              <input
                type="date"
                value={formData.validUntil ? new Date(formData.validUntil).toISOString().split('T')[0] : ''}
                onChange={(e) => setFormData({ ...formData, validUntil: new Date(e.target.value) })}
                className="w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900 font-medium">💡 쿠폰 사용 규칙</p>
            <p className="text-xs text-blue-700 mt-1">
              모든 쿠폰은 1회만 사용 가능합니다
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" fullWidth onClick={onClose}>
              취소
            </Button>
            <Button type="submit" fullWidth>
              {coupon ? '수정' : '추가'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
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

## File: src\pages\EventsPage.tsx

```typescript
import { Gift } from 'lucide-react';
import EventList from '../components/event/EventList';

export default function EventsPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center">
                            <Gift className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-3xl">
                            <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                                이벤트
                            </span>
                        </h1>
                    </div>
                    <p className="text-gray-600">
                        놓치지 마세요! 현재 진행 중인 다양한 혜택
                    </p>
                </div>

                {/* Event List */}
                <EventList />
            </div>
        </div>
    );
}

```

---

## File: src\pages\NoticePage.tsx

```typescript
import { Bell } from 'lucide-react';
import NoticeList from '../components/notice/NoticeList';

export default function NoticePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl">
              <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                공지사항
              </span>
            </h1>
          </div>
          <p className="text-gray-600">
            중요한 소식과 이벤트를 확인하세요
          </p>
        </div>

        {/* Notice List */}
        <NoticeList />
      </div>
    </div>
  );
}
```

---

## File: src\pages\ReviewBoardPage.tsx

```typescript
import { MessageSquare } from 'lucide-react';
import ReviewList from '../components/review/ReviewList';

export default function ReviewBoardPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <MessageSquare className="w-8 h-8 text-primary-600" />
                    <span>고객 후기</span>
                </h1>
                <p className="text-gray-600">
                    우리 가게를 이용해주신 고객님들의 솔직한 후기를 만나보세요.
                </p>
            </div>

            <ReviewList />
        </div>
    );
}

```

---

## File: src\services\menuService.test.ts

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMenu, updateMenu, deleteMenu, toggleMenuSoldout } from './menuService';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';

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

describe('menuService', () => {
    const mockStoreId = 'store_123';
    const mockMenuId = 'menu_xyz';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createMenu', () => {
        it('should create menu with timestamp', async () => {
            const mockDocRef = { id: 'new_menu_id' };
            (addDoc as any).mockResolvedValue(mockDocRef);
            (collection as any).mockReturnValue('MOCK_COLLECTION_REF');

            const menuData = {
                name: 'Pho',
                price: 10000,
                category: ['Noodle'], // Correct as string[]
                description: 'Delicious',
                imageUrl: 'http://example.com/img.jpg',
                isBest: true,
                soldout: false,
                options: []
            };

            const result = await createMenu(mockStoreId, menuData);

            expect(collection).toHaveBeenCalledWith(expect.anything(), 'stores', mockStoreId, 'menus');
            expect(addDoc).toHaveBeenCalledWith('MOCK_COLLECTION_REF', {
                ...menuData,
                createdAt: 'MOCK_TIMESTAMP',
            });
            expect(result).toBe('new_menu_id');
        });
    });

    describe('updateMenu', () => {
        it('should update menu fields and timestamp', async () => {
            (doc as any).mockReturnValue('MOCK_DOC_REF');

            await updateMenu(mockStoreId, mockMenuId, { price: 12000 });

            expect(doc).toHaveBeenCalledWith(expect.anything(), 'stores', mockStoreId, 'menus', mockMenuId);
            expect(updateDoc).toHaveBeenCalledWith('MOCK_DOC_REF', {
                price: 12000,
                updatedAt: 'MOCK_TIMESTAMP',
            });
        });
    });

    describe('deleteMenu', () => {
        it('should delete menu document', async () => {
            (doc as any).mockReturnValue('MOCK_DOC_REF');

            await deleteMenu(mockStoreId, mockMenuId);

            expect(deleteDoc).toHaveBeenCalledWith('MOCK_DOC_REF');
        });
    });

    describe('toggleMenuSoldout', () => {
        it('should update soldout status and timestamp', async () => {
            (doc as any).mockReturnValue('MOCK_DOC_REF');

            await toggleMenuSoldout(mockStoreId, mockMenuId, true);

            expect(updateDoc).toHaveBeenCalledWith('MOCK_DOC_REF', {
                soldout: true,
                updatedAt: 'MOCK_TIMESTAMP',
            });
        });
    });
});

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

## File: src\types\order.ts

```typescript
export interface OrderItem {
  menuId: string;
  name: string;
  price: number;
  quantity: number;
  options?: { name: string; price: number; quantity?: number }[];
  imageUrl?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalPrice: number;
  discountAmount?: number;
  couponId?: string;
  couponName?: string;
  status: OrderStatus;
  address: string;
  phone: string;
  memo?: string;
  paymentType: PaymentType;
  // 결제 관련 필드 추가
  paymentStatus?: '결제대기' | '결제완료' | '결제실패';
  payment?: {
    pg: string;
    tid?: string;
    amount?: number;
    paidAt?: any;
    error?: string;
    code?: string;
  };
  createdAt: Date;
  updatedAt?: Date;
  reviewed?: boolean;
  reviewRating?: number;
  orderType?: '배달주문' | '포장주문'; // 주문 타입 추가
}

export type OrderStatus = '결제대기' | '결제실패' | '접수' | '접수완료' | '조리중' | '조리완료' | '배달중' | '포장완료' | '완료' | '취소';
export type PaymentType = '앱결제' | '만나서카드' | '만나서현금' | '방문시결제';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  '결제대기': '결제 대기',
  '결제실패': '결제 실패',
  '접수': '주문 접수',
  '접수완료': '접수 완료',
  '조리중': '조리 중',
  '조리완료': '조리 완료',
  '배달중': '배달 중',
  '포장완료': '포장 완료',
  '완료': '배달 완료',
  '취소': '주문 취소',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, { bg: string; text: string }> = {
  '결제대기': { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  '결제실패': { bg: 'bg-red-100', text: 'text-red-700' },
  '접수': { bg: 'bg-blue-100', text: 'text-blue-700' },
  '접수완료': { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  '조리중': { bg: 'bg-orange-100', text: 'text-orange-700' },
  '조리완료': { bg: 'bg-amber-100', text: 'text-amber-800' },
  '배달중': { bg: 'bg-purple-100', text: 'text-purple-700' },
  '포장완료': { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  '완료': { bg: 'bg-green-100', text: 'text-green-700' },
  '취소': { bg: 'bg-gray-100', text: 'text-gray-700' },
};

export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  '앱결제': '앱 결제',
  '만나서카드': '만나서 카드 결제',
  '만나서현금': '만나서 현금 결제',
  '방문시결제': '방문 시 결제',
};

```

---

