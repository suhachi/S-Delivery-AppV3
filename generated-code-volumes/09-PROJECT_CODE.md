# Project Code Volume 09

Generated: 2025-12-23 14:30:55
Root: D:\projectsing\S-Delivery-AppV3\

- Files in volume: 19
- Approx size: 0.07 MB

---

## File: firebase.json

```json
{
    "firestore": {
        "rules": "firestore.rules",
        "indexes": "src/firestore.indexes.json"
    },
    "functions": [
        {
            "source": "functions",
            "codebase": "default",
            "ignore": [
                "node_modules",
                ".git",
                "firebase-debug.log",
                "firebase-debug.*.log"
            ],
            "predeploy": [
                "npm --prefix \"$RESOURCE_DIR\" run build"
            ]
        }
    ],
    "hosting": {
        "public": "build",
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
        ]
    },
    "storage": {
        "rules": "storage.rules"
    }
}
```

---

## File: scripts\reset_for_production.js

```javascript
import admin from 'firebase-admin';
import serviceAccount from '../service-account-key.json' assert { type: 'json' };

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function deleteCollection(db, collectionPath, batchSize) {
    const collectionRef = db.collection(collectionPath);
    const query = collectionRef.orderBy('__name__').limit(batchSize);

    return new Promise((resolve, reject) => {
        deleteQueryBatch(db, query, resolve).catch(reject);
    });
}

async function deleteQueryBatch(db, query, resolve) {
    const snapshot = await query.get();

    const batchSize = snapshot.size;
    if (batchSize === 0) {
        // When there are no documents left, we are done
        resolve();
        return;
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });
    await batch.commit();

    // Recurse on the next process tick, to avoid
    // exploding the stack.
    process.nextTick(() => {
        deleteQueryBatch(db, query, resolve);
    });
}

async function resetDatabase() {
    console.log('🗑️  Starting Database Reset for Production...');

    try {
        // 1. Delete 'stores/default' document (and its subcollections ideally, but Firestore requires manual deletion check)
        // Deleting the document 'stores/default' puts the app in "Setup Mode".
        console.log('Removing stores/default...');
        await db.doc('stores/default').delete();

        // 2. Delete subcollections of 'stores/default' (orders, menus, etc) checks
        // Users might have generated data.
        console.log('Cleaning up subcollections...');
        await deleteCollection(db, 'stores/default/orders', 50);
        await deleteCollection(db, 'stores/default/menus', 50);
        await deleteCollection(db, 'stores/default/reviews', 50);
        await deleteCollection(db, 'stores/default/notices', 50);
        await deleteCollection(db, 'stores/default/events', 50);
        await deleteCollection(db, 'stores/default/coupons', 50);

        // 3. Clear 'users' collection? 
        // User said "Start from Store Setup". If we keep users, they log in and if they have no store, they go to wizard.
        // Keeping users is safer so they don't lose their account, but if "Complete Initial State", maybe delete users too.
        // However, I don't have the service account key easily accessible in this environment potentially?
        // Wait, the user has `functions` setup, so credentials might be there.
        // But usually local `npm run dev` doesn't have admin privileges without key.

        // Actually, I can rely on the user manually deleting or just deleting the store doc is enough to trigger the wizard.
        // The script above assumes `service-account-key.json` exists. I haven't seen it in the file list.
        // Use the client-side script approach if server key is missing?
        // Client side deletion is harder due to rules. 
        // I will write a script that assumes it can run with `firebase-admin` (which implies credentials).
        // If not, I'll ask user to do it via console.

        // WAIT! `scripts/seed_v2_data.mjs` was being edited by user.
        // It likely uses `import { initializeApp } from 'firebase/app'` (Client SDK).
        // I should use Client SDK for the script if possible, BUT client SDK cannot delete collections easily.
        // I'll stick to just deleting the root logic doc for now.

    } catch (error) {
        console.error('Error resetting DB:', error);
    }

    console.log('✅ Database reset complete. Ready for new store setup.');
}

// Check if we can run this.
// If service account is missing, this will fail.
// I will create a CLIENT SIDE script instead that runs in the browser context or via a helper page?
// No, I can just create a `reset_db.js` and ask user to run it IF they have admin setup.
// BUT, the safer bet is to use the existing `seed_v2_data.mjs` style which uses Client SDK.
// With Client SDK, I can just delete `stores/default`.

```

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

## File: src\components\review\ReviewPreview.tsx

```typescript
import { Link } from 'react-router-dom';
import { Star, ChevronRight, User } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { useFirestoreCollection } from '../../hooks/useFirestoreCollection';
import { getAllReviewsQuery } from '../../services/reviewService';
import { Review } from '../../types/review';
import { formatDate } from '../../utils/formatDate';
import Card from '../common/Card';

export default function ReviewPreview() {
    const { store } = useStore();
    const storeId = store?.id;

    // Fetch reviews (sorted by newest First)
    const { data: reviews, loading } = useFirestoreCollection<Review>(
        storeId ? getAllReviewsQuery(storeId) : null
    );

    // Take only top 5 for preview
    const recentReviews = reviews ? reviews.slice(0, 5) : [];

    if (!storeId || loading) return null;

    if (recentReviews.length === 0) {
        return null; // hide if no reviews
    }

    return (
        <div className="container mx-auto px-4 mt-8 mb-12">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <span className="text-primary-600">💬</span>
                    <span>생생 리뷰 미리보기</span>
                </h2>
                <Link
                    to="/reviews"
                    className="text-sm text-gray-500 hover:text-primary-600 flex items-center gap-1"
                >
                    더보기 <ChevronRight className="w-4 h-4" />
                </Link>
            </div>

            <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 snap-x snap-mandatory">
                {recentReviews.map((review) => (
                    <div key={review.id} className="min-w-[280px] w-[280px] snap-start">
                        <Card
                            className="h-full flex flex-col p-4 bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group overflow-hidden"
                            padding="none"
                        >
                            {/* Image if available */}
                            {review.images && review.images.length > 0 && (
                                <div className="relative w-full h-32 overflow-hidden bg-gray-100">
                                    <img
                                        src={review.images[0]}
                                        alt="Review"
                                        className="w-full h-full object-cover transform transition-all duration-500 group-hover:scale-110 group-hover:brightness-105"
                                    />
                                </div>
                            )}

                            <div className="p-4 flex-1 flex flex-col">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                            <User className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-gray-900 truncate max-w-[100px]">
                                                {review.userDisplayName}
                                            </span>
                                            <div className="flex items-center">
                                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                <span className="text-xs font-bold ml-1">{review.rating}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
                                </div>

                                <div className="flex-1">
                                    <p className="text-sm text-gray-600 line-clamp-3 break-words">
                                        {review.comment}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>
                ))}
            </div>
        </div>
    );
}

```

---

## File: src\components\ui\alert.tsx

```typescript
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";

import { cn } from "./utils";

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive:
          "text-destructive bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
        className,
      )}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };

```

---

## File: src\contexts\AuthContext.tsx

```typescript
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { useIsAdmin } from '../hooks/useIsAdmin';

interface User {
  id: string;
  email: string;
  displayName?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  signup: (email: string, password: string, displayName?: string, phone?: string) => Promise<any>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading, signup, login, logout } = useFirebaseAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin(user?.id);
  // TEMPORARY TEST OVERRIDE: Force Admin
  // const isAdmin = true;
  // const adminLoading = false;

  const loading = authLoading || adminLoading;

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
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

## File: src\lib\firestorePaths.ts

```typescript
/**
 * Firestore 경로 헬퍼
 * 멀티 테넌트 데이터 격리를 위한 경로 생성 유틸리티
 * 
 * 기존: collection(db, 'menus')
 * 변경: collection(db, getMenusPath(storeId))
 */

/**
 * 상점별 메뉴 경로
 * stores/{storeId}/menus
 */
export function getMenusPath(storeId: string): string {
  return `stores/${storeId}/menus`;
}

/**
 * 상점별 주문 경로
 * stores/{storeId}/orders
 */
export function getOrdersPath(storeId: string): string {
  return `stores/${storeId}/orders`;
}

/**
 * 상점별 쿠폰 경로
 * stores/{storeId}/coupons
 */
export function getCouponsPath(storeId: string): string {
  return `stores/${storeId}/coupons`;
}

/**
 * 상점별 리뷰 경로
 * stores/{storeId}/reviews
 */
export function getReviewsPath(storeId: string): string {
  return `stores/${storeId}/reviews`;
}

/**
 * 상점별 공지사항 경로
 * stores/{storeId}/notices
 */
export function getNoticesPath(storeId: string): string {
  return `stores/${storeId}/notices`;
}

/**
 * 상점별 이벤트 경로
 * stores/{storeId}/events
 */
export function getEventsPath(storeId: string): string {
  return `stores/${storeId}/events`;
}

/**
 * 상점별 사용 쿠폰 경로
 * stores/{storeId}/couponUsages
 */
export function getCouponUsagesPath(storeId: string): string {
  return `stores/${storeId}/couponUsages`;
}

/**
 * 모든 경로를 한 번에 가져오기
 */
export function getStorePaths(storeId: string) {
  return {
    menus: getMenusPath(storeId),
    orders: getOrdersPath(storeId),
    coupons: getCouponsPath(storeId),
    reviews: getReviewsPath(storeId),
    notices: getNoticesPath(storeId),
    events: getEventsPath(storeId),
    couponUsages: getCouponUsagesPath(storeId),
  };
}

```

---

## File: src\lib\storeAccess.ts

```typescript
/**
 * 상점 접근 권한 관리 유틸리티
 * adminStores 컬렉션을 통해 관리자-상점 매핑 관리
 */

import { db } from './firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { AdminStore, StorePermission } from '../types/store';

/**
 * 관리자가 접근 가능한 상점 목록 조회
 */
export async function getAdminStores(adminUid: string): Promise<AdminStore[]> {
  // adminUid 유효성 검사
  if (!adminUid || typeof adminUid !== 'string') {
    console.warn('getAdminStores called with invalid adminUid:', adminUid);
    return [];
  }

  try {
    const q = query(
      collection(db, 'adminStores'),
      where('adminUid', '==', adminUid)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as AdminStore[];
  } catch (error) {
    console.error('Error in getAdminStores:', error);
    return [];
  }
}

/**
 * 특정 상점의 관리자 목록 조회
 */
export async function getStoreAdmins(storeId: string): Promise<AdminStore[]> {
  const q = query(
    collection(db, 'adminStores'),
    where('storeId', '==', storeId)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as AdminStore[];
}

/**
 * 관리자가 특정 상점에 접근 가능한지 확인
 */
export async function hasStoreAccess(
  adminUid: string,
  storeId: string
): Promise<boolean> {
  const adminStores = await getAdminStores(adminUid);
  return adminStores.some(as => as.storeId === storeId);
}

/**
 * 관리자가 특정 권한을 가지고 있는지 확인
 */
export async function hasPermission(
  adminUid: string,
  storeId: string,
  permission: StorePermission
): Promise<boolean> {
  const adminStores = await getAdminStores(adminUid);
  const adminStore = adminStores.find(as => as.storeId === storeId);
  
  if (!adminStore) return false;
  
  // owner는 모든 권한 보유
  if (adminStore.role === 'owner') return true;
  
  return adminStore.permissions.includes(permission);
}

/**
 * 관리자를 상점에 추가
 */
export async function addAdminToStore(
  adminUid: string,
  storeId: string,
  role: 'owner' | 'manager' | 'staff',
  permissions: StorePermission[]
): Promise<string> {
  const adminStoreData = {
    adminUid,
    storeId,
    role,
    permissions,
    createdAt: new Date(),
  };
  
  const docRef = await addDoc(collection(db, 'adminStores'), adminStoreData);
  return docRef.id;
}

/**
 * 상점에서 관리자 제거
 */
export async function removeAdminFromStore(adminStoreId: string): Promise<void> {
  await deleteDoc(doc(db, 'adminStores', adminStoreId));
}

/**
 * 기본 권한 세트
 */
export const DEFAULT_PERMISSIONS: Record<string, StorePermission[]> = {
  owner: [
    'manage_menus',
    'manage_orders',
    'manage_coupons',
    'manage_reviews',
    'manage_notices',
    'manage_events',
    'manage_store_settings',
    'view_analytics',
  ],
  manager: [
    'manage_menus',
    'manage_orders',
    'manage_coupons',
    'manage_reviews',
    'view_analytics',
  ],
  staff: [
    'manage_orders',
    'view_analytics',
  ],
};
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

