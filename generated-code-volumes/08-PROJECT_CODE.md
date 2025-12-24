# Project Code Volume 08

Generated: 2025-12-24 14:30:56
Root: D:\projectsing\S-Delivery-AppV3\

- Files in volume: 21
- Approx size: 0.08 MB

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

## File: scripts\clear_orders_only.js

```javascript
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc } from 'firebase/firestore';
import 'dotenv/config';

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

async function clearOrders() {
    console.log('🧹 Clearing Order History & Stats...');

    try {
        // Target: stores/default/orders
        const ordersRef = collection(db, 'stores', 'default', 'orders');
        const snapshot = await getDocs(ordersRef);

        if (snapshot.empty) {
            console.log('✅ No orders to delete.');
            process.exit(0);
        }

        console.log(`Found ${snapshot.size} orders. Deleting...`);

        // Delete fake orders one by one (Client SDK limit)
        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);

        console.log('✅ All orders deleted successfully.');
        console.log('📊 Revenue stats should now be reset to 0.');
        console.log('🏪 Store settings and menus are PRESERVED.');

    } catch (e) {
        console.error('Error clearing orders:', e);
    }
    process.exit(0);
}

clearOrders();

```

---

## File: src\components\admin\Receipt.tsx

```typescript
import { Order } from '../../types/order';
import { Store } from '../../types/store';

interface ReceiptProps {
    order: Order | null;
    store: Store | null;
}

export default function Receipt({ order, store }: ReceiptProps) {
    if (!order) return null;

    // 1. 날짜 포맷팅 (YYYY. MM. DD. 오후 h:mm)
    const formatDate = (date: any) => {
        const d = date?.toDate ? date.toDate() : new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0'); // User example uses 12 (no spacing, just number)
        // Actually user example: 25. 12. 10. 오후 01:08
        // Let's match typical Korean format: YYYY. MM. DD. 
        const day = String(d.getDate()).padStart(2, '0');
        const hour = d.getHours();
        const minute = String(d.getMinutes()).padStart(2, '0');
        const ampm = hour >= 12 ? '오후' : '오전';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;

        // User example uses 2-digit year "25". Let's stick to full year or 2-digit as per preference. 
        // User text example: "2025.12.10."
        return `${year}.${month}.${day}. ${ampm} ${displayHour}:${minute}`;
    };

    // 2. 결제방식 매핑
    const getPaymentText = (type: string, isPickup: boolean) => {
        // 배달: 앱결제, 만나서카드, 만나서현금
        // 포장: 앱결제, 방문시결제
        if (type === '만나서카드') return '만나서 카드';
        if (type === '만나서현금') return '만나서 현금';
        if (type === '방문시결제') return '방문 시 결제';
        return '앱 결제'; // Default for '앱결제'
    };

    // 계산 로직
    const itemsPrice = order.items.reduce((total, item) => {
        const optionsPrice = item.options?.reduce((optSum, opt) => optSum + (opt.price * (opt.quantity || 1)), 0) || 0;
        return total + ((item.price + optionsPrice) * item.quantity);
    }, 0);

    const discountAmount = order.discountAmount || 0;
    const deliveryFee = order.totalPrice - itemsPrice + discountAmount;

    return (
        <div id="receipt-container">
            <div className="w-[280px] mx-auto bg-white text-black font-mono text-[12px] leading-snug p-2 pb-8">

                {/* 상점 정보 */}
                <div className="text-center mb-4">
                    <h1 className="text-xl font-bold mb-1">{store?.name || '상점'}</h1>
                    <p className="mb-0.5">{store?.address || ''}</p>
                    <p>Tel: {store?.phone || ''}</p>
                </div>

                {/* 주문 타입 배지 */}
                <div className="text-center mb-2">
                    <span className="inline-block border border-black px-2 py-0.5 font-bold text-sm">
                        [{order.orderType}]
                    </span>
                </div>

                {/* 주문 번호 */}
                <div className="text-center mb-2">
                    <p className="font-bold text-sm">주문번호: {order.id.slice(0, 4).toUpperCase()}</p>
                </div>

                {/* 주문 기본 정보 */}
                <div className="mb-2 space-y-0.5">
                    <div className="flex justify-between">
                        <span>일시</span>
                        <span>{formatDate(order.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>결제</span>
                        <span>{getPaymentText(order.paymentType, order.orderType === '포장주문')}</span>
                    </div>
                </div>

                {/* 고객 정보 */}
                <div className="mb-2 mt-4">
                    <p className="font-bold mb-1">고객 정보</p>
                    {order.orderType === '배달주문' && (
                        <p className="mb-1 break-words">{order.address}</p>
                    )}
                    <p className="mb-1">{order.phone}</p>
                    {/* 포장주문시 이름, 전화번호만 노출인데 이름이 없으므로 전화번호만 노출됨 (배달시엔 주소 포함) */}
                </div>

                {/* 요청 사항 */}
                {order.memo && (
                    <div className="mb-2">
                        <p className="font-bold mb-1">요청사항:</p>
                        <p className="break-words">{order.memo}</p>
                    </div>
                )}

                <div className="border-b border-black my-2"></div>

                {/* 메뉴 헤더 */}
                <div className="flex mb-1 font-bold">
                    <span className="flex-1">메뉴명</span>
                    <span className="w-8 text-center">수량</span>
                    <span className="w-16 text-right">금액</span>
                </div>

                <div className="border-b border-black mb-2"></div>

                {/* 메뉴 리스트 */}
                <div className="mb-2">
                    {order.items.map((item, index) => {
                        const optionsPrice = item.options?.reduce((sum, opt) => sum + (opt.price * (opt.quantity || 1)), 0) || 0;
                        const itemTotal = (item.price + optionsPrice) * item.quantity;
                        // Format: 
                        // Item Name    Qty    Price
                        // - Option            Price
                        //                     Total (aligned right)

                        return (
                            <div key={index} className="mb-2">
                                {/* 메인 메뉴 */}
                                <div className="flex items-start mb-0.5">
                                    <span className="flex-1 break-words pr-1">{item.name}</span>
                                    <span className="w-8 text-center">{item.quantity}</span>
                                    <span className="w-16 text-right">{item.price.toLocaleString()}</span>
                                </div>

                                {/* 옵션 리스트 */}
                                {item.options && item.options.map((opt, optIdx) => (
                                    <div key={optIdx} className="flex text-gray-800 mb-0.5">
                                        <span className="flex-1 break-words pl-2 text-[11px]">- {opt.name}</span>
                                        <span className="w-8 text-center text-[11px]"></span> {/* 옵션 수량 표시는 보통 생략하거나 이름 옆에 */}
                                        <span className="w-16 text-right text-[11px]">+{(opt.price * (opt.quantity || 1)).toLocaleString()}</span>
                                    </div>
                                ))}

                                {/* 항목 소계 (옵션 포함 총액) */}
                                <div className="text-right font-bold mt-1">
                                    {itemTotal.toLocaleString()}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="border-b border-black my-2"></div>

                {/* 금액 집계 */}
                <div className="space-y-1 mb-2">
                    <div className="flex justify-between">
                        <span>주문금액</span>
                        <span>{itemsPrice.toLocaleString()}</span>
                    </div>
                    {deliveryFee > 0 && (
                        <div className="flex justify-between">
                            <span>배달팁</span>
                            <span>+{deliveryFee.toLocaleString()}</span>
                        </div>
                    )}
                    {discountAmount > 0 && (
                        <div className="flex justify-between">
                            <span>할인금액</span>
                            <span>-{discountAmount.toLocaleString()}</span>
                        </div>
                    )}
                </div>

                <div className="border-b border-black my-2"></div>

                {/* 최종 합계 */}
                <div className="flex justify-between text-lg font-bold mb-4">
                    <span>합계</span>
                    <span>{order.totalPrice.toLocaleString()}원</span>
                </div>

                <div className="border-b border-black my-4"></div>

                {/* 푸터 */}
                <div className="text-center">
                    <p className="mb-1 font-bold">* 이용해 주셔서 감사합니다 *</p>
                    <p className="text-[10px]">Powered by CusCom</p>
                </div>

            </div>
        </div>
    );
}

```

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

## File: src\components\ui\textarea.tsx

```typescript
import * as React from "react";

import { cn } from "./utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "resize-none border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-input-background px-3 py-2 text-base transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };

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

## File: src\firestore.indexes.json

```json
{
  "indexes": [
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "adminDeleted",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "adminDeleted",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "reviews",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "notices",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "pinned",
          "order": "DESCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "menus",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "category",
          "arrayConfig": "CONTAINS"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "events",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "active",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "startDate",
          "order": "ASCENDING"
        }
      ]
    },
    {
      "collectionGroup": "events",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "active",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "endDate",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "coupons",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "isActive",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
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

## File: src\pages\admin\AdminDailyReportPage.tsx

```typescript
import { useState, useEffect } from 'react';
import { doc, getDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useStore } from '../../contexts/StoreContext';
import Card from '../../components/common/Card';
import { BarChart, DollarSign, ShoppingBag, XCircle, TrendingUp } from 'lucide-react';

interface DailyStats {
    dateKey: string;
    ordersTotal: number;
    ordersPaid: number;
    ordersCanceled: number;
    grossSales: number;
    avgOrderValue: number;
    cancelRate: number;
    topMenus: Array<{
        menuId: string;
        name: string;
        qty: number;
        sales: number;
    }>;
    updatedAt: any;
}

export default function AdminDailyReportPage() {
    const { store } = useStore();
    const [stats, setStats] = useState<DailyStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!store?.id) return;

        const fetchStats = async () => {
            setLoading(true);
            try {
                // 어제 날짜 구하기 (KST 고정: 클라이언트/브라우저 타임존 무시)
                const now = new Date();
                const kstNow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
                const kstYesterday = new Date(kstNow.getTime() - 24 * 60 * 60 * 1000);

                const yyyy = kstYesterday.getFullYear();
                const mm = String(kstYesterday.getMonth() + 1).padStart(2, '0');
                const dd = String(kstYesterday.getDate()).padStart(2, '0');
                const dateKey = `${yyyy}-${mm}-${dd}`;

                const docRef = doc(db, 'stores', store.id, 'stats_daily', dateKey);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setStats(docSnap.data() as DailyStats);
                } else {
                    // 데이터가 없으면 null (집계 전)
                    setStats(null);
                }
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [store?.id]);

    if (loading) return <div className="p-8 text-center text-gray-500">리포트 로딩 중...</div>;

    if (!stats) {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold mb-4">일일 리포트</h1>
                <Card className="text-center py-12">
                    <div className="flex justify-center mb-4">
                        <BarChart className="w-12 h-12 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">아직 집계된 데이터가 없습니다</h3>
                    <p className="text-gray-500">내일 다시 확인해주세요. (매일 00:10 자동 집계)</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">일일 리포트 ({stats.dateKey})</h1>
                <p className="text-gray-500">어제 하루 매장의 주요 지표입니다.</p>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard
                    title="총 매출"
                    value={`${stats.grossSales.toLocaleString()}원`}
                    icon={<DollarSign className="w-6 h-6 text-blue-600" />}
                    subText={`객단가 ${stats.avgOrderValue.toLocaleString()}원`}
                />
                <StatsCard
                    title="유효 주문"
                    value={`${stats.ordersPaid}건`}
                    icon={<ShoppingBag className="w-6 h-6 text-green-600" />}
                    subText={`총 접수 ${stats.ordersTotal}건`}
                />
                <StatsCard
                    title="취소율"
                    value={`${(stats.cancelRate * 100).toFixed(1)}%`}
                    icon={<XCircle className="w-6 h-6 text-red-600" />}
                    subText={`취소 ${stats.ordersCanceled}건`}
                />
                <StatsCard
                    title="성장률"
                    value="-"
                    icon={<TrendingUp className="w-6 h-6 text-purple-600" />}
                    subText="전일 대비 데이터 부족"
                />
            </div>

            {/* Top Menus */}
            <div className="grid lg:grid-cols-2 gap-6">
                <Card title="인기 메뉴 TOP 5 (판매량 순)">
                    <div className="space-y-4">
                        {stats.topMenus.map((menu, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <span className="w-6 h-6 flex items-center justify-center bg-white rounded-full text-sm font-bold text-gray-500 shadow-sm">
                                        {idx + 1}
                                    </span>
                                    <span className="font-medium text-gray-900">{menu.name}</span>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-900">{menu.qty}개</p>
                                    <p className="text-xs text-gray-500">{menu.sales.toLocaleString()}원</p>
                                </div>
                            </div>
                        ))}
                        {stats.topMenus.length === 0 && (
                            <p className="text-center text-gray-500 py-4">판매 내역이 없습니다.</p>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}

function StatsCard({ title, value, icon, subText }: { title: string; value: string; icon: React.ReactNode; subText?: string }) {
    return (
        <Card>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
                    {subText && <p className="text-xs text-gray-400">{subText}</p>}
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                    {icon}
                </div>
            </div>
        </Card>
    );
}

```

---

## File: src\pages\OrdersPage.tsx

```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Clock, CheckCircle2, XCircle, ChevronRight, Star } from 'lucide-react';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, OrderStatus } from '../types/order';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import ReviewModal from '../components/review/ReviewModal';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../contexts/StoreContext';
import { useFirestoreCollection } from '../hooks/useFirestoreCollection';
import { getUserOrdersQuery } from '../services/orderService';
import { Order } from '../types/order';

// 헬퍼 함수: Firestore Timestamp 처리를 위한 toDate
const toDate = (date: any): Date => {
  if (date?.toDate) return date.toDate();
  if (date instanceof Date) return date;
  if (typeof date === 'string') return new Date(date);
  return new Date();
};

import { useReorder } from '../hooks/useReorder';

export default function OrdersPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { store } = useStore();
  const [filter, setFilter] = useState<OrderStatus | '전체'>('전체');

  // R2-FIX-03: useReorder 훅을 상위로 이동
  const { handleReorder, reordering } = useReorder();

  // Firestore에서 현재 사용자의 주문 조회
  const ordersQuery = (store?.id && user?.id)
    ? getUserOrdersQuery(store.id, user.id)
    : null;

  const { data: allOrders, loading } = useFirestoreCollection<Order>(ordersQuery);

  const filteredOrders = filter === '전체'
    ? (allOrders || []).filter(order => order.status !== '결제대기')
    : (allOrders || []).filter(order => order.status === filter);

  // 헬퍼 함수: 사용자용 상태 라벨 변환
  const getDisplayStatus = (status: OrderStatus) => {
    switch (status) {
      case '접수': return '접수중';
      case '접수완료': return '접수확인';
      default: return ORDER_STATUS_LABELS[status];
    }
  };

  const filters: (OrderStatus | '전체')[] = ['전체', '접수', '접수완료', '조리중', '배달중', '완료', '취소'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">주문 내역을 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl mb-2">
            <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              내 주문
            </span>
          </h1>
          <p className="text-gray-600">주문 내역을 확인하고 관리하세요</p>
        </div>

        {/* Status Filter */}
        <div className="mb-6 flex space-x-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {filters.map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`
                px-4 py-2 rounded-lg whitespace-nowrap transition-all flex-shrink-0
                ${filter === status
                  ? 'gradient-primary text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-500'
                }
              `}
            >
              {status === '전체' ? '전체' : getDisplayStatus(status)}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onClick={() => navigate(`/orders/${order.id}`)}
                getDisplayStatus={getDisplayStatus}
                onReorder={() => store?.id && handleReorder(store.id, order)}
                isReordering={reordering}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-32 h-32 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Package className="w-16 h-16 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              주문 내역이 없습니다
            </h2>
            <p className="text-gray-600 mb-8">
              맛있는 메뉴를 주문해보세요
            </p>
            <Button onClick={() => navigate('/menu')}>
              메뉴 둘러보기
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

interface OrderCardProps {
  order: Order;
  onClick: () => void;
  getDisplayStatus: (s: OrderStatus) => string;
  onReorder: () => void;
  isReordering: boolean;
}

function OrderCard({ order, onClick, getDisplayStatus, onReorder, isReordering }: OrderCardProps) {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const statusColor = ORDER_STATUS_COLORS[order.status as OrderStatus];
  const { store } = useStore(); // useReorder hook removed

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case '접수':
      case '접수완료':
      case '조리중':
        return <Clock className="w-5 h-5" />;
      case '배달중':
        return <Package className="w-5 h-5" />;
      case '완료':
        return <CheckCircle2 className="w-5 h-5" />;
      case '취소':
        return <XCircle className="w-5 h-5" />;
    }
  };

  // 리뷰 작성 가능 여부 (완료 상태만)
  const canReview = order.status === '완료';

  return (
    <>
      <Card>
        {/* 클릭 가능한 메인 영역 */}
        <div onClick={onClick} className="cursor-pointer hover:bg-gray-50 transition-colors p-1 -m-1 rounded-lg">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${statusColor.bg}`}>
                <div className={statusColor.text}>
                  {getStatusIcon(order.status)}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  {toDate(order.createdAt).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <p className="text-xs text-gray-500">주문번호: {order.id.slice(0, 8)}</p>
              </div>
            </div>
            <Badge variant={
              order.status === '완료' ? 'success' :
                order.status === '취소' ? 'danger' :
                  order.status === '배달중' ? 'secondary' :
                    'primary'
            }>
              {getDisplayStatus(order.status)}
            </Badge>
          </div>

          <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {item.imageUrl && (
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">수량: {item.quantity}개</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {((item.price + (item.options?.reduce((sum: number, opt) => sum + (opt.price * (opt.quantity || 1)), 0) || 0)) * item.quantity).toLocaleString()}원
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">총 결제 금액</p>
              <p className="text-2xl font-bold text-blue-600">
                {order.totalPrice.toLocaleString()}원
              </p>
            </div>
            <ChevronRight className="w-6 h-6 text-gray-400" />
          </div>
        </div>

        {/* 하단 버튼 영역 */}
        <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-3">
          {/* 재주문 버튼 */}
          <Button
            variant="secondary"
            fullWidth
            onClick={(e) => {
              e.stopPropagation();
              onReorder();
            }}
            disabled={isReordering}
          >
            <Package className="w-4 h-4 mr-2" />
            {isReordering ? '담는 중...' : '같은 메뉴 담기'}
          </Button>

          {/* 리뷰 버튼 (완료 시) */}
          {canReview && (
            order.reviewed ? (
              <Button
                variant="outline"
                fullWidth
                onClick={(e) => {
                  e.stopPropagation();
                  setShowReviewModal(true);
                }}
              >
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-2" />
                리뷰 수정
              </Button>
            ) : (
              <Button
                variant="outline"
                fullWidth
                onClick={(e) => {
                  e.stopPropagation();
                  setShowReviewModal(true);
                }}
              >
                <Star className="w-4 h-4 mr-2" />
                리뷰 작성
              </Button>
            )
          )}
        </div>
      </Card>

      {/* 리뷰 모달 */}
      {showReviewModal && (
        <ReviewModal
          orderId={order.id}
          onClose={() => setShowReviewModal(false)}
          onSuccess={() => {
            // 주문 목록 새로고침
            window.location.reload();
          }}
        />
      )}
    </>
  );
}
```

---

## File: src\pages\StoreSetupWizard.tsx

```typescript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../contexts/StoreContext';
import { StoreFormData } from '../types/store';
import { toast } from 'sonner';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import AddressSearchInput from '../components/common/AddressSearchInput';
import Card from '../components/common/Card';
import { Store as StoreIcon, ChevronRight, ChevronLeft, Check } from 'lucide-react';

// 현재 버전에서는 '단일 상점' 아키텍처를 따르므로 고정된 ID를 사용합니다.
// 향후 멀티 스토어 플랫폼으로 확장 시, 이 값을 동적으로 생성하거나 사용자 입력을 받도록 수정해야 합니다.
const DEFAULT_STORE_ID = 'default';

const STEPS = [
  { id: 1, name: '기본 정보', description: '상점 이름과 설명' },
  { id: 2, name: '연락처', description: '전화번호, 이메일, 주소' },
  { id: 3, name: '배달 설정', description: '배달비, 최소 주문 금액' },
  { id: 4, name: '완료', description: '설정 확인 및 생성' },
];

export default function StoreSetupWizard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { store, loading: storeLoading } = useStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // 이미 상점이 설정되어 있다면 관리자 페이지로 이동
  useEffect(() => {
    if (!storeLoading && store) {
      toast.info('이미 상점이 설정되어 있습니다.');
      navigate('/admin');
    }
  }, [store, storeLoading, navigate]);

  const [formData, setFormData] = useState<StoreFormData>({
    name: '',
    description: '',
    phone: '',
    email: user?.email || '',
    address: '',
    deliveryFee: 3000,
    minOrderAmount: 15000,
  });

  if (storeLoading) return null;

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.name) {
          toast.error('상점 이름을 입력해주세요');
          return false;
        }
        if (formData.name.length < 2) {
          toast.error('상점 이름은 최소 2자 이상이어야 합니다');
          return false;
        }
        return true;
      case 2:
        if (!formData.phone || !formData.email || !formData.address) {
          toast.error('모든 연락처 정보를 입력해주세요');
          return false;
        }
        return true;
      case 3:
        if (formData.deliveryFee < 0 || formData.minOrderAmount < 0) {
          toast.error('금액은 0 이상이어야 합니다');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('로그인이 필요합니다');
      return;
    }

    setLoading(true);

    try {
      // 1. 상점 데이터 문서 생성 (store/default)
      const storeData = {
        ...formData,
        id: DEFAULT_STORE_ID,
        logoUrl: '',
        bannerUrl: '',
        primaryColor: '#3b82f6',
        businessHours: {},
        settings: {
          autoAcceptOrders: false,
          estimatedDeliveryTime: 30,
          paymentMethods: ['앱결제', '만나서카드', '만나서현금'],
          enableReviews: true,
          enableCoupons: true,
          enableNotices: true,
          enableEvents: true,
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // 1. 상점 문서 생성 (단일 상점 모드: 'default' ID 사용)
      await setDoc(doc(db, 'stores', DEFAULT_STORE_ID), storeData);

      // 2. 관리자-상점 매핑 생성 (권한 부여용)
      // 이 매핑이 있어야 firestore.rules의 isStoreOwner()가 true를 반환하여 수정 권한을 가짐
      if (user?.id) {
        const adminStoreId = `${user.id}_${DEFAULT_STORE_ID}`;
        await setDoc(doc(db, 'adminStores', adminStoreId), {
          adminUid: user.id,
          storeId: DEFAULT_STORE_ID,
          role: 'owner',
          createdAt: serverTimestamp(),
        });

        // 3. 사용자 문서에 role 업데이트 (선택 사항, 클라이언트 편의용)
        // await updateDoc(doc(db, 'users', user.id), { role: 'admin' }); 
      }



      // 성공 메시지 및 이동
      toast.success('상점이 성공적으로 생성되었습니다!');

      // 스토어 컨텍스트 갱신을 위해 잠시 대기
      setTimeout(() => {
        refreshStore();
        navigate('/admin');
        window.location.reload(); // StoreContext 새로고침
      }, 1000);
    } catch (error) {
      console.error('Failed to create store:', error);
      toast.error('상점 생성에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 gradient-primary rounded-3xl mb-4">
            <StoreIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl mb-2">
            <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              상점 만들기
            </span>
          </h1>
          <p className="text-gray-600">나만의 배달 앱을 만들어보세요</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${currentStep > step.id
                      ? 'bg-green-500 text-white'
                      : currentStep === step.id
                        ? 'gradient-primary text-white'
                        : 'bg-gray-200 text-gray-500'
                      }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span>{step.id}</span>
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-sm font-medium text-gray-900">{step.name}</p>
                    <p className="text-xs text-gray-500 hidden sm:block">{step.description}</p>
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <Card className="p-8">
          {/* Step 1: 기본 정보 */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">기본 정보</h2>

              <Input
                label="상점 이름"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="예: 맛있는 포집"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  상점 설명
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  rows={4}
                  placeholder="상점을 소개하는 짧은 설명을 작성해주세요"
                />
              </div>
            </div>
          )}

          {/* Step 2: 연락처 */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">연락처 정보</h2>

              <Input
                label="전화번호"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="010-1234-5678"
                required
              />

              <Input
                label="이메일"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contact@example.com"
                required
              />

              <AddressSearchInput
                label="주소"
                value={formData.address}
                onChange={(address) => setFormData({ ...formData, address })}
                required
              />
            </div>
          )}

          {/* Step 3: 배달 설정 */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">배달 설정</h2>

              <Input
                label="배달비 (원)"
                type="number"
                value={formData.deliveryFee}
                onChange={(e) => setFormData({ ...formData, deliveryFee: parseInt(e.target.value) || 0 })}
                placeholder="3000"
                required
              />

              <Input
                label="최소 주문 금액 (원)"
                type="number"
                value={formData.minOrderAmount}
                onChange={(e) => setFormData({ ...formData, minOrderAmount: parseInt(e.target.value) || 0 })}
                placeholder="15000"
                required
              />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  💡 <strong>팁:</strong> 배달비와 최소 주문 금액은 나중에 상점 설정에서 변경할 수 있습니다.
                </p>
              </div>
            </div>
          )}

          {/* Step 4: 완료 */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">설정 확인</h2>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">상점 정보</h3>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">상점 이름:</dt>
                      <dd className="font-medium text-gray-900">{formData.name}</dd>
                    </div>
                  </dl>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">연락처</h3>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">전화:</dt>
                      <dd className="font-medium text-gray-900">{formData.phone}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">이메일:</dt>
                      <dd className="font-medium text-gray-900">{formData.email}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">주소:</dt>
                      <dd className="font-medium text-gray-900">{formData.address}</dd>
                    </div>
                  </dl>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">배달 설정</h3>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">배달비:</dt>
                      <dd className="font-medium text-gray-900">{formData.deliveryFee.toLocaleString()}원</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">최소 주문:</dt>
                      <dd className="font-medium text-gray-900">{formData.minOrderAmount.toLocaleString()}원</dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  ✅ 모든 설정이 완료되었습니다! 상점을 생성하시겠습니까?
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={loading}
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                이전
              </Button>
            )}

            {currentStep < 4 ? (
              <Button
                onClick={handleNext}
                fullWidth={currentStep === 1}
              >
                다음
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                fullWidth
              >
                {loading ? '생성 중...' : '상점 만들기 🎉'}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
```

---

## File: src\services\storageService.ts

```typescript
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  uploadBytesResumable,
  UploadTask
} from 'firebase/storage';
import { storage } from '../lib/firebase';

// 이미지 업로드
export async function uploadImage(
  file: File,
  path: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  try {
    const storageRef = ref(storage, path);

    if (onProgress) {
      // 진행상황을 추적하려면 uploadBytesResumable 사용
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(progress);
          },
          (error) => {
            console.error('이미지 업로드 실패:', error);
            reject(error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          }
        );
      });
    } else {
      // 간단한 업로드
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    }
  } catch (error) {
    console.error('이미지 업로드 실패:', error);
    throw error;
  }
}

// 메뉴 이미지 업로드
export async function uploadMenuImage(
  file: File,
  menuId: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  const path = `menus/${menuId}/${Date.now()}_${file.name}`;
  return uploadImage(file, path, onProgress);
}

// 프로필 이미지 업로드
export async function uploadProfileImage(
  file: File,
  userId: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  const path = `profiles/${userId}/${Date.now()}_${file.name}`;
  return uploadImage(file, path, onProgress);
}

// 이미지 삭제
export async function deleteImage(imageUrl: string): Promise<void> {
  try {
    // URL에서 파일 경로 추출
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error) {
    console.error('이미지 삭제 실패:', error);
    throw error;
  }
}

// 파일 유효성 검사
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: '지원되는 이미지 형식: JPG, PNG, WebP',
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: '이미지 크기는 5MB 이하여야 합니다',
    };
  }

  return { valid: true };
}

// 이미지 리사이즈 (선택적)
export async function resizeImage(
  file: File,
  maxWidth: number = 800,
  maxHeight: number = 800
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // 비율 유지하면서 리사이즈
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('이미지 리사이즈 실패'));
            }
          },
          file.type,
          0.9
        );
      };

      img.onerror = () => reject(new Error('이미지 로드 실패'));
    };

    reader.onerror = () => reject(new Error('파일 읽기 실패'));
  });
}

// 이벤트 이미지 업로드
export async function uploadEventImage(file: File): Promise<string> {
  const path = `events/${Date.now()}_${file.name}`;
  return uploadImage(file, path);
}

// 상점 이미지 업로드 (로고/배너)
export async function uploadStoreImage(file: File, type: 'logo' | 'banner'): Promise<string> {
  // 경로: store/{type}_{timestamp}_{filename}
  const timestamp = Date.now();
  const path = `store/${type}_${timestamp}_${file.name}`;
  return uploadImage(file, path);
}

// 리뷰 이미지 업로드
export async function uploadReviewImage(file: File): Promise<string> {
  const path = `reviews/${Date.now()}_${file.name}`;
  return uploadImage(file, path);
}

```

---

## File: src\services\userService.ts

```typescript
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User } from '../types/user';

// User 타입 정의 (기존 types/user.ts가 없다면 여기에 정의하거나 types 폴더에 추가해야 함)
// 일단 간단한 인터페이스 사용
export interface UserProfile {
    id: string;
    name: string;
    phone: string;
    email: string;
    createdAt: any;
}

const COLLECTION_NAME = 'users';

export async function searchUsers(keyword: string): Promise<UserProfile[]> {
    try {
        const usersRef = collection(db, COLLECTION_NAME);
        let q;

        // 전화번호로 검색 (정확히 일치하거나 시작하는 경우)
        if (/^[0-9-]+$/.test(keyword)) {
            q = query(
                usersRef,
                where('phone', '>=', keyword),
                where('phone', '<=', keyword + '\uf8ff'),
                limit(5)
            );
        } else {
            // 이름으로 검색
            q = query(
                usersRef,
                where('displayName', '>=', keyword),
                where('displayName', '<=', keyword + '\uf8ff'),
                limit(5)
            );
        }

        const snapshot = await getDocs(q);
        const users: UserProfile[] = [];

        snapshot.forEach((doc) => {
            const data = doc.data();
            users.push({
                id: doc.id,
                name: data.displayName || data.name || '이름 없음',
                phone: data.phone || '',
                email: data.email || '',
                createdAt: data.createdAt,
            });
        });

        return users;
    } catch (error) {
        console.error('사용자 검색 실패:', error);
        return [];
    }
}

// 전체 사용자 목록 가져오기 (최근 가입순 20명)
export async function getRecentUsers(): Promise<UserProfile[]> {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            orderBy('createdAt', 'desc'),
            limit(20)
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name || '이름 없음',
            phone: doc.data().phone || '',
            email: doc.data().email || '',
            createdAt: doc.data().createdAt,
        })) as UserProfile[];
    } catch (error) {
        console.error('사용자 목록 로드 실패:', error);
        return [];
    }
}

```

---

## File: src\test\setup.ts

```typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// 각 테스트 후 정리
afterEach(() => {
    cleanup();
});

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

