# Project Code Volume 04

Generated: 2025-12-23 14:30:55
Root: D:\projectsing\S-Delivery-AppV3\

- Files in volume: 18
- Approx size: 0.07 MB

---

## File: .eslintrc.cjs

```javascript
module.exports = {
    root: true,
    env: { browser: true, es2020: true },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react-hooks/recommended',
    ],
    ignorePatterns: ['dist', '.eslintrc.cjs'],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'react-refresh'],
    rules: {
        'react-refresh/only-export-components': [
            'warn',
            { allowConstantExport: true },
        ],
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-unused-vars': 'warn',
    },
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

## File: src\components\review\ReviewList.tsx

```typescript
import { Star, User } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { useFirestoreCollection } from '../../hooks/useFirestoreCollection';
import { getAllReviewsQuery } from '../../services/reviewService';
import { Review } from '../../types/review';
import Card from '../common/Card';
import { formatDate } from '../../utils/formatDate';

export default function ReviewList() {
  const { store } = useStore();
  const storeId = store?.id;

  // Firestore에서 리뷰 조회 (최신순)
  const { data: reviews, loading } = useFirestoreCollection<Review>(
    storeId ? getAllReviewsQuery(storeId) : null
  );

  if (!storeId) {
    return null;
  }

  if (loading) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-600">리뷰를 불러오는 중...</p>
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <Star className="w-10 h-10 text-gray-400" />
        </div>
        <p className="text-gray-600">아직 작성된 리뷰가 없습니다</p>
        <p className="text-sm text-gray-500 mt-2">첫 번째 리뷰를 작성해보세요!</p>
      </div>
    );
  }

  // 평균 별점 계산
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  // 별점별 개수
  const ratingCounts = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
  }));

  return (
    <div className="space-y-6">
      {/* 리뷰 통계 */}
      <Card>
        <div className="grid md:grid-cols-2 gap-6">
          {/* 평균 별점 */}
          <div className="text-center md:border-r border-gray-200">
            <p className="text-sm text-gray-600 mb-2">평균 별점</p>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="w-8 h-8 fill-yellow-400 text-yellow-400" />
              <span className="text-4xl font-bold text-gray-900">{averageRating}</span>
              <span className="text-xl text-gray-500">/ 5.0</span>
            </div>
            <p className="text-sm text-gray-600">총 {reviews.length}개의 리뷰</p>
          </div>

          {/* 별점 분포 */}
          <div className="space-y-2">
            {ratingCounts.map(({ rating, count }) => (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm font-medium text-gray-700">{rating}</span>
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-yellow-400 h-full rounded-full transition-all"
                    style={{
                      width: `${reviews.length > 0 ? (count / reviews.length) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">{count}개</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* 리뷰 목록 */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const ratingColor =
    review.rating === 5 ? 'text-yellow-500' :
      review.rating === 4 ? 'text-blue-500' :
        'text-gray-500';

  return (
    <Card>
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-6 h-6 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <p className="font-semibold text-gray-900">{review.userDisplayName}</p>
              <div className="flex items-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${star <= review.rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                      }`}
                  />
                ))}
                <span className="ml-2 font-semibold text-gray-900">
                  {review.rating}.0
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500 whitespace-nowrap">
              {formatDate(review.createdAt)}
            </p>
          </div>

          {/* Content */}
          <p className="text-gray-700 leading-relaxed break-words">
            {review.comment}
          </p>

          {/* Review Image */}
          {review.images && review.images.length > 0 && (
            <div className="mt-3">
              <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                <img
                  src={review.images[0]}
                  alt="Review Type"
                  className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => window.open(review.images![0], '_blank')}
                />
              </div>
            </div>
          )}

          {/* Updated indicator */}
          {review.updatedAt && review.updatedAt !== review.createdAt && (
            <p className="text-xs text-gray-500 mt-2">
              (수정됨: {formatDate(review.updatedAt)})
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

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

## File: src\components\ui\hover-card.tsx

```typescript
"use client";

import * as React from "react";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card@1.1.6";

import { cn } from "./utils";

function HoverCard({
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Root>) {
  return <HoverCardPrimitive.Root data-slot="hover-card" {...props} />;
}

function HoverCardTrigger({
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Trigger>) {
  return (
    <HoverCardPrimitive.Trigger data-slot="hover-card-trigger" {...props} />
  );
}

function HoverCardContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Content>) {
  return (
    <HoverCardPrimitive.Portal data-slot="hover-card-portal">
      <HoverCardPrimitive.Content
        data-slot="hover-card-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-64 origin-(--radix-hover-card-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden",
          className,
        )}
        {...props}
      />
    </HoverCardPrimitive.Portal>
  );
}

export { HoverCard, HoverCardTrigger, HoverCardContent };

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

## File: src\package.json

```json
{
  "name": "custom-delivery-app",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "deploy": "npm run build && firebase deploy",
    "deploy:hosting": "npm run build && firebase deploy --only hosting",
    "deploy:firestore": "firebase deploy --only firestore",
    "deploy:storage": "firebase deploy --only storage",
    "deploy:rules": "firebase deploy --only firestore:rules,storage:rules"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "firebase": "^10.7.0",
    "sonner": "^1.2.0",
    "lucide-react": "^0.292.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "react-scripts": "^5.0.1",
    "typescript": "^5.3.0",
    "tailwindcss": "^4.0.0"
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
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

## File: src\services\noticeService.ts

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
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Notice, NoticeCategory } from '../types/notice';

// 컬렉션 참조 헬퍼
const getNoticeCollection = (storeId: string) => collection(db, 'stores', storeId, 'notices');

/**
 * 공지사항 생성
 */
export async function createNotice(
  storeId: string,
  noticeData: Omit<Notice, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    const docRef = await addDoc(getNoticeCollection(storeId), {
      ...noticeData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('공지사항 생성 실패:', error);
    throw error;
  }
}

/**
 * 공지사항 수정
 */
export async function updateNotice(
  storeId: string,
  noticeId: string,
  noticeData: Partial<Omit<Notice, 'id' | 'createdAt'>>
): Promise<void> {
  try {
    const noticeRef = doc(db, 'stores', storeId, 'notices', noticeId);
    await updateDoc(noticeRef, {
      ...noticeData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('공지사항 수정 실패:', error);
    throw error;
  }
}

/**
 * 공지사항 삭제
 */
export async function deleteNotice(
  storeId: string,
  noticeId: string
): Promise<void> {
  try {
    const noticeRef = doc(db, 'stores', storeId, 'notices', noticeId);
    await deleteDoc(noticeRef);
  } catch (error) {
    console.error('공지사항 삭제 실패:', error);
    throw error;
  }
}

/**
 * 공지사항 고정 토글
 */
export async function toggleNoticePinned(
  storeId: string,
  noticeId: string,
  pinned: boolean
): Promise<void> {
  try {
    const noticeRef = doc(db, 'stores', storeId, 'notices', noticeId);
    await updateDoc(noticeRef, {
      pinned,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('공지사항 고정 상태 변경 실패:', error);
    throw error;
  }
}

/**
 * 모든 공지사항 쿼리 (고정 공지 우선, 최신순)
 */
export function getAllNoticesQuery(storeId: string) {
  return query(
    getNoticeCollection(storeId),
    orderBy('pinned', 'desc'),
    orderBy('createdAt', 'desc')
  );
}

/**
 * 카테고리별 공지사항 쿼리
 */
export function getNoticesByCategoryQuery(storeId: string, category: NoticeCategory) {
  return query(
    getNoticeCollection(storeId),
    where('category', '==', category),
    orderBy('pinned', 'desc'),
    orderBy('createdAt', 'desc')
  );
}

/**
 * 고정된 공지사항만 조회
 */
export function getPinnedNoticesQuery(storeId: string) {
  return query(
    getNoticeCollection(storeId),
    where('pinned', '==', true),
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

