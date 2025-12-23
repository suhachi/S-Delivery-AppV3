# Utils, Data, Devtools 파일

## src/utils/formatDate.ts

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

## src/utils/labels.ts

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

## src/devtools/safeSnapshot.ts

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

## src/data/mockMenus.ts

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
  // ... 더 많은 메뉴 데이터
];
```

## src/data/mockOrders.ts

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
  // ... 더 많은 주문 데이터
];
```

## src/data/mockCoupons.ts

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
  // ... 더 많은 쿠폰 데이터
];
```

## src/data/mockUsers.ts

```typescript
export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  createdAt: Date;
}

export const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'user@demo.com',
    name: '김민수',
    phone: '010-1234-5678',
    createdAt: new Date('2024-01-15'),
  },
  // ... 더 많은 사용자 데이터
];
```

## Components UI 폴더

`src/components/ui/` 폴더에는 많은 UI 컴포넌트가 있습니다:
- accordion.tsx
- alert.tsx
- alert-dialog.tsx
- aspect-ratio.tsx
- avatar.tsx
- badge.tsx
- breadcrumb.tsx
- button.tsx
- calendar.tsx
- card.tsx
- carousel.tsx
- chart.tsx
- checkbox.tsx
- collapsible.tsx
- command.tsx
- context-menu.tsx
- dialog.tsx
- drawer.tsx
- dropdown-menu.tsx
- form.tsx
- hover-card.tsx
- input.tsx
- input-otp.tsx
- label.tsx
- menubar.tsx
- navigation-menu.tsx
- pagination.tsx
- popover.tsx
- progress.tsx
- radio-group.tsx
- resizable.tsx
- scroll-area.tsx
- select.tsx
- separator.tsx
- sheet.tsx
- sidebar.tsx
- skeleton.tsx
- slider.tsx
- sonner.tsx
- switch.tsx
- table.tsx
- tabs.tsx
- textarea.tsx
- toggle.tsx
- toggle-group.tsx
- tooltip.tsx
- use-mobile.ts
- utils.ts

이들은 주로 Radix UI 기반의 재사용 가능한 UI 컴포넌트입니다. 전체 코드는 프로젝트의 `src/components/ui/` 폴더를 참조하세요.

