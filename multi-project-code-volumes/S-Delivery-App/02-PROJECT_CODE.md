# S-Delivery-App - Volume 02

Generated: 2025-12-23 19:23:22
Project Path: D:\projectsing\S-Delivery-App\

- Files in volume: 18
- Approx size: 0.07 MB

---

## File: src\components\common\Badge.tsx

```typescript
import { HTMLAttributes, ReactNode } from 'react';

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'gray';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md' | 'lg';
  children?: ReactNode;
}

export default function Badge({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: BadgeProps) {
  const variantClasses = {
    primary: 'bg-blue-100 text-blue-700',
    secondary: 'bg-orange-100 text-orange-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
    gray: 'bg-gray-100 text-gray-700',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      {...props}
    >
      {children}
    </span>
  );
}

```

---

## File: src\components\event\EventBanner.tsx

```typescript
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Event } from '../../types/event';
import { useStore } from '../../contexts/StoreContext';
import { useFirestoreCollection } from '../../hooks/useFirestoreCollection';
import { getActiveEventsQuery } from '../../services/eventService';

export default function EventBanner() {
  const { store } = useStore();
  const storeId = store?.id;
  const [currentIndex, setCurrentIndex] = useState(0);

  // Firestore에서 활성화된 이벤트만 조회
  const { data: events, loading } = useFirestoreCollection<Event>(
    storeId ? getActiveEventsQuery(storeId) : null
  );

  // 자동 슬라이드
  useEffect(() => {
    if (!events || events.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % events.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [events?.length]);

  if (!storeId || loading) {
    return null;
  }

  if (!events || events.length === 0) {
    return null;
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + events.length) % events.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % events.length);
  };

  const handleClick = (event: Event) => {
    if (event.link) {
      window.open(event.link, '_blank');
    }
  };

  const currentEvent = events[currentIndex];

  return (
    <div className="relative w-full">
      {/* 배너 이미지 */}
      <div
        onClick={() => handleClick(currentEvent)}
        className="relative aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden cursor-pointer group"
      >
        <img
          src={currentEvent.imageUrl}
          alt={currentEvent.title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
        />

        {/* 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent">
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h3 className="text-white font-bold text-xl sm:text-2xl drop-shadow-lg">
              {currentEvent.title}
            </h3>
          </div>
        </div>
      </div>

      {/* 이전/다음 버튼 (여러 이벤트가 있을 때만) */}
      {events.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronRight className="w-6 h-6 text-gray-800" />
          </button>

          {/* 인디케이터 */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {events.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex
                  ? 'bg-white w-8'
                  : 'bg-white/50 hover:bg-white/75'
                  }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
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

## File: src\components\ui\pagination.tsx

```typescript
import * as React from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "lucide-react@0.487.0";

import { cn } from "./utils";
import { Button, buttonVariants } from "./button";

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  );
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  React.ComponentProps<"a">;

function PaginationLink({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
          size,
        }),
        className,
      )}
      {...props}
    />
  );
}

function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn("gap-1 px-2.5 sm:pl-2.5", className)}
      {...props}
    >
      <ChevronLeftIcon />
      <span className="hidden sm:block">Previous</span>
    </PaginationLink>
  );
}

function PaginationNext({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn("gap-1 px-2.5 sm:pr-2.5", className)}
      {...props}
    >
      <span className="hidden sm:block">Next</span>
      <ChevronRightIcon />
    </PaginationLink>
  );
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontalIcon className="size-4" />
      <span className="sr-only">More pages</span>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};

```

---

## File: src\components\ui\select.tsx

```typescript
"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select@2.1.6";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "lucide-react@0.487.0";

import { cn } from "./utils";

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default";
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-full items-center justify-between gap-2 rounded-md border bg-input-background px-3 py-2 text-sm whitespace-nowrap transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className,
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1",
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("text-muted-foreground px-2 py-1.5 text-xs", className)}
      {...props}
    />
  );
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className,
      )}
      {...props}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("bg-border pointer-events-none -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className,
      )}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className,
      )}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};

```

---

## File: src\components\ui\sheet.tsx

```typescript
"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog@1.1.6";
import { XIcon } from "lucide-react@0.487.0";

import { cn } from "./utils";

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className,
      )}
      {...props}
    />
  );
}

function SheetContent({
  className,
  children,
  side = "right",
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left";
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
          side === "right" &&
            "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
          side === "left" &&
            "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
          side === "top" &&
            "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto border-b",
          side === "bottom" &&
            "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto border-t",
          className,
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none">
          <XIcon className="size-4" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-foreground font-semibold", className)}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};

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

## File: src\pages\admin\AdminCouponManagement.test.tsx

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminCouponManagement from './AdminCouponManagement';
import { useStore } from '../../contexts/StoreContext';
import { useFirestoreCollection } from '../../hooks/useFirestoreCollection';
import { createCoupon } from '../../services/couponService';
import { searchUsers } from '../../services/userService';

// Mocks
vi.mock('../../contexts/StoreContext', () => ({
    useStore: vi.fn(),
}));

vi.mock('../../hooks/useFirestoreCollection', () => ({
    useFirestoreCollection: vi.fn(),
}));

vi.mock('../../services/couponService', () => ({
    createCoupon: vi.fn(),
    updateCoupon: vi.fn(),
    deleteCoupon: vi.fn(),
    toggleCouponActive: vi.fn(),
    getAllCouponsQuery: vi.fn(),
}));

vi.mock('../../services/userService', () => ({
    searchUsers: vi.fn(),
}));

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

vi.mock('../../components/admin/AdminSidebar', () => ({
    default: () => <div data-testid="sidebar">Sidebar</div>,
}));

// Mock Lucide
vi.mock('lucide-react', () => ({
    Plus: () => <span>Plus</span>,
    Edit2: () => <span>Edit</span>,
    Trash2: () => <span>Trash</span>,
    X: () => <span>X</span>,
    Ticket: () => <span>Ticket</span>,
    TrendingUp: () => <span>Trending</span>,
    Search: () => <span>Search</span>,
    User: () => <span>User</span>,
}));

describe('AdminCouponManagement Integration', () => {
    const mockStore = { id: 'store_1' };

    beforeEach(() => {
        vi.clearAllMocks();
        (useStore as any).mockReturnValue({ store: mockStore });
        (useFirestoreCollection as any).mockReturnValue({ data: [], loading: false });
    });

    it('should render coupon list and open add modal', async () => {
        render(<AdminCouponManagement />);
        expect(screen.getByRole('heading', { name: /쿠폰 관리/ })).toBeInTheDocument();

        // Button contains icon "Plus", so text might be "Plus 쿠폰 추가"
        const addBtn = screen.getByRole('button', { name: /쿠폰 추가/ });
        fireEvent.click(addBtn);

        expect(screen.getByRole('heading', { name: '쿠폰 추가' })).toBeInTheDocument(); // Modal title
    });

    it('should integrate user search in modal', async () => {
        const user = userEvent.setup();
        render(<AdminCouponManagement />);

        // Open Modal
        await user.click(screen.getByRole('button', { name: /쿠폰 추가/ }));

        // Mock Search Result
        const mockUsers = [{ id: 'u1', name: 'Hong', phone: '01012345678' }];
        (searchUsers as any).mockResolvedValue(mockUsers);

        // Enter search query
        const searchInput = screen.getByPlaceholderText('이름 또는 전화번호로 회원 검색');
        await user.type(searchInput, 'Hong');

        // Wait for search debounce (500ms in component)
        await waitFor(() => {
            expect(searchUsers).toHaveBeenCalledWith('Hong');
        }, { timeout: 1000 });

        // Verify result display
        expect(await screen.findByText('Hong')).toBeInTheDocument();
        expect(screen.getByText('01012345678')).toBeInTheDocument();
    });

    it('should create a coupon', async () => {
        const user = userEvent.setup();
        render(<AdminCouponManagement />);

        await user.click(screen.getByRole('button', { name: /쿠폰 추가/ }));

        // Fill Form (Name, Amount, MinOrder, Dates)
        // Select Predefined Name "이벤트쿠폰"
        await user.click(screen.getByText('이벤트쿠폰'));

        // Discount Amount & Min Order Amount
        // Input component doesn't link label and input with id/for, so getByLabelText fails.
        // We use getAllByRole('spinbutton') (type="number") and access by order.
        // Order: 1. Discount Value, 2. Max Discount (if %, optional), 3. Min Order Amount

        const inputs = screen.getAllByRole('spinbutton');
        const amountInput = inputs[0]; // First number input
        const minOrderInput = inputs[inputs.length - 1]; // Last number input

        await user.type(amountInput, '5000');
        await user.type(minOrderInput, '20000');

        // Dates (default is today, just ensuring inputs exist)
        // We can just submit as defaults are set in state usually, but let's check

        // Submit
        const submitBtn = screen.getByRole('button', { name: '추가' });
        await user.click(submitBtn);

        await waitFor(() => {
            expect(createCoupon).toHaveBeenCalled();
        });

        // Verify call arguments (partial check)
        const callArgs = (createCoupon as any).mock.calls[0];
        expect(callArgs[0]).toBe('store_1');
        expect(callArgs[1].name).toBe('이벤트쿠폰');
        expect(callArgs[1].discountValue).toBe(5000);
    });
});

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
}

export interface UpdateStoreFormData extends StoreFormData {
  primaryColor?: string;
}

```

---

## File: src\vite-env.d.ts

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
  readonly VITE_FIREBASE_PROJECT_ID?: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  readonly VITE_FIREBASE_APP_ID?: string;
  readonly VITE_FIREBASE_MEASUREMENT_ID?: string;
  readonly VITE_FIREBASE_VAPID_KEY?: string;
  readonly VITE_NICEPAY_CLIENT_ID?: string;
  readonly VITE_NICEPAY_RETURN_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

```

---

