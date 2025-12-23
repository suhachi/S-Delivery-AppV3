# S-Delivery-App - Volume 05

Generated: 2025-12-23 19:23:22
Project Path: D:\projectsing\S-Delivery-App\

- Files in volume: 19
- Approx size: 0.07 MB

---

## File: scripts\check-deploy.mjs

```javascript
#!/usr/bin/env node

/**
 * 배포 전 필수 체크 스크립트 (Pre-flight Check)
 * 
 * 이 스크립트는 배포 명령어(npm run deploy 등) 실행 시 자동으로 호출되어
 * 다음 사항을 검증합니다:
 * 1. Firebase 로그인 계정 (REQUIRED_ACCOUNT)
 * 2. 활성 Firebase 프로젝트 (Active Project vs .firebaserc)
 * 3. 빌드 결과물 존재 여부 (build 폴더)
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// --- 환경 설정 ---
const REQUIRED_ACCOUNT = 'jsbae59@gmail.com'; // 배포 권한이 있는 유일한 계정
const BUILD_DIR_NAME = 'build'; // Vite 기본 출력 디렉터리

let hasError = false;
let requiredProject = null;

console.log('\n🔍 [Safety Check] 배포 전 필수 점검 시작...\n');

// 0. 타겟 프로젝트 식별 (.firebaserc 파싱)
try {
    const firebasercPath = join(__dirname, '..', '.firebaserc');
    if (fs.existsSync(firebasercPath)) {
        const firebaserc = JSON.parse(fs.readFileSync(firebasercPath, 'utf-8'));
        requiredProject = firebaserc.projects?.default;
        // console.log(`ℹ️  Target Project defined in .firebaserc: ${requiredProject}`);
    } else {
        console.warn('⚠️  .firebaserc 파일이 없습니다. 프로젝트 일치 여부를 확인할 수 없습니다.');
    }
} catch (e) {
    console.warn('⚠️  .firebaserc 파싱 실패:', e.message);
}

// 1. Firebase 계정 확인
process.stdout.write('1️⃣  Firebase 계정 확인... ');
try {
    // firebase login:list를 사용하여 현재 로그인된 계정을 확인합니다.
    const loginOutput = execSync('firebase login:list', { encoding: 'utf-8', stdio: 'pipe' });
    const loggedInAccount = loginOutput.match(/Logged in as (.+)/)?.[1]?.trim();

    if (!loggedInAccount) {
        console.log('❌\n   Firebase에 로그인되어 있지 않습니다.');
        hasError = true;
    } else if (loggedInAccount !== REQUIRED_ACCOUNT) {
        console.log('❌');
        console.error(`   ⛔ 잘못된 계정입니다: ${loggedInAccount}`);
        console.error(`   ✅ 필수 계정: ${REQUIRED_ACCOUNT}`);
        console.error('   -> 해결: firebase logout 후 firebase login 으로 전환하세요.');
        hasError = true;
    } else {
        console.log(`✅ (${loggedInAccount})`);
    }
} catch (error) {
    // 명령어가 실패한다는 건 로그인이 안되어있거나 CLI 문제
    console.log('❌ 오류 발생');
    console.error('   Firebase CLI 실행 중 오류:', error.message);
    hasError = true;
}

// 2. Firebase 프로젝트 확인
process.stdout.write('2️⃣  Firebase 프로젝트 확인... ');
try {
    let activeProject = null;

    // firebase use 로 현재 활성 alias 확인
    try {
        const useOutput = execSync('firebase use', { encoding: 'utf-8', stdio: 'pipe' });
        const activeMatch = useOutput.match(/Active Project:\s*(.+)/i);
        // "Active Project: complex-name (alias)" 형식일 수 있음
        if (activeMatch) {
            activeProject = activeMatch[1]?.trim();
        } else {
            // "Active Project" 텍스트 없이 그냥 alias 목록만 나오는 경우, * 표시된 줄 찾기
            const asteriskMatch = useOutput.match(/\*\s*(\S+)/);
            if (asteriskMatch) {
                // alias 이름일 수 있음. alias면 실제 ID를 찾아야 함.
                // .firebaserc에서 매핑 확인 필요하지만 복잡하므로 activeProject가 ID라고 가정하거나
                // use output에 괄호로 ID가 같이 나오는지 확인 "(project-id)"
                const idInParens = useOutput.match(/\*\s*.+\s*\((.+)\)/);
                activeProject = idInParens ? idInParens[1] : asteriskMatch[1];
            }
        }
    } catch (e) { /* ignore */ }

    // 만약 activeProject를 못 찾았고, .firebaserc에 default가 있다면 default를 사용한다고 가정
    if (!activeProject && requiredProject) {
        // CLI가 active project가 없으면 default를 씀
        activeProject = requiredProject;
    }

    if (!activeProject) {
        console.log('❌');
        console.error('   활성 프로젝트를 확인할 수 없습니다.');
        hasError = true;
    } else if (requiredProject && activeProject !== requiredProject) {
        console.log('❌');
        console.error(`   ⛔ 프로젝트 불일치!`);
        console.error(`   Current Active : ${activeProject}`);
        console.error(`   Target (.rc)   : ${requiredProject}`);
        console.error(`   -> 해결: 'firebase use default' 또는 'firebase use ${requiredProject}' 실행`);
        hasError = true;
    } else {
        console.log(`✅ (${activeProject})`);
    }
} catch (error) {
    console.log('❌ 오류');
    console.error('   프로젝트 확인 중 예외:', error.message);
    hasError = true;
}

// 3. 빌드 확인
process.stdout.write('3️⃣  빌드 결과물 확인... ');
try {
    const buildDir = join(__dirname, '..', BUILD_DIR_NAME);
    if (!fs.existsSync(buildDir)) {
        console.log('❌');
        console.error(`   ⛔ '${BUILD_DIR_NAME}' 폴더가 없습니다.`);
        console.error('   -> 해결: 먼저 빌드를 실행하세요 (npm run build)');
        // 빌드 없는 배포는 치명적이지 않을 수 있지만(Functions만 배포할 때 등), 
        // 통상적으로 Hosting 배포 시 필수이므로 Error로 처리합니다.
        hasError = true;
    } else {
        console.log('✅');
    }
} catch (error) {
    console.warn('⚠️  빌드 확인 중 오류 (무시 가능)', error.message);
}

console.log('');

// 결과 처리
if (hasError) {
    console.error('🚫 [BLOCK] 배포가 중단되었습니다. 위 에러를 수정한 후 다시 시도하세요.');
    process.exit(1);
} else {
    console.log('✨ 모든 체크 포인트를 통과했습니다. 배포를 시작합니다! 🚀\n');
    process.exit(0);
}

```

---

## File: src\components\common\AddressSearchModal.tsx

```typescript
import DaumPostcodeEmbed from 'react-daum-postcode';
import { X } from 'lucide-react';

interface AddressSearchModalProps {
    onComplete: (address: string) => void;
    onClose: () => void;
}

export default function AddressSearchModal({ onComplete, onClose }: AddressSearchModalProps) {
    const handleComplete = (data: any) => {
        let fullAddress = data.address;
        let extraAddress = '';

        if (data.addressType === 'R') {
            if (data.bname !== '') {
                extraAddress += data.bname;
            }
            if (data.buildingName !== '') {
                extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
            }
            fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
        }

        onComplete(fullAddress);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden animate-slide-up"
                onClick={(e) => e.stopPropagation()}
                style={{ height: '550px', display: 'flex', flexDirection: 'column' }}
            >
                <div className="flex justify-between items-center p-4 border-b bg-gray-50 flex-shrink-0">
                    <h3 className="text-lg font-bold text-gray-900">주소 검색</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
                <div className="flex-1 w-full relative">
                    <DaumPostcodeEmbed
                        onComplete={handleComplete}
                        style={{ width: '100%', height: '100%' }}
                        autoClose={false}
                    />
                </div>
            </div>
        </div>
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

## File: src\components\ui\avatar.tsx

```typescript
"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar@1.1.3";

import { cn } from "./utils";

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-10 shrink-0 overflow-hidden rounded-full",
        className,
      )}
      {...props}
    />
  );
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className,
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };

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

## File: src\components\ui\progress.tsx

```typescript
"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress@1.1.2";

import { cn } from "./utils";

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="bg-primary h-full w-full flex-1 transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };

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

## File: src\pages\admin\AdminMenuManagement.tsx

```typescript
import { useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { Menu, MenuOption, CATEGORIES } from '../../types/menu';
import { toast } from 'sonner';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import ImageUpload from '../../components/common/ImageUpload';
import { useStore } from '../../contexts/StoreContext';
import { useFirestoreCollection } from '../../hooks/useFirestoreCollection';
import { createMenu, updateMenu, deleteMenu, toggleMenuSoldout, getAllMenusQuery } from '../../services/menuService';

export default function AdminMenuManagement() {
  const { store, loading: storeLoading } = useStore();

  // storeId가 있을 때만 쿼리 생성
  const { data: menus, loading, error } = useFirestoreCollection<Menu>(
    store?.id ? getAllMenusQuery(store.id) : null
  );

  if (storeLoading) return null;
  if (!store || !store.id) return <StoreNotFound />;

  if (error) {
    toast.error(`데이터 로드 실패: ${error.message}`);
    console.error(error);
  }

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);

  if (storeLoading) return null;


  function StoreNotFound() {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-16">
              <p className="text-lg text-gray-600">상점을 찾을 수 없습니다</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const handleAddMenu = () => {
    setEditingMenu(null);
    setIsModalOpen(true);
  };

  const handleEditMenu = (menu: Menu) => {
    setEditingMenu(menu);
    setIsModalOpen(true);
  };

  const handleDeleteMenu = async (menuId: string) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await deleteMenu(store.id, menuId);
        toast.success('메뉴가 삭제되었습니다');
      } catch (error) {
        toast.error('메뉴 삭제에 실패했습니다');
      }
    }
  };

  const handleToggleSoldout = async (menuId: string, currentSoldout: boolean) => {
    try {
      await toggleMenuSoldout(store.id, menuId, !currentSoldout);
      toast.success('품절 상태가 변경되었습니다');
    } catch (error) {
      toast.error('품절 상태 변경에 실패했습니다');
    }
  };

  const handleSaveMenu = async (menuData: Omit<Menu, 'id' | 'createdAt'>) => {
    try {
      if (editingMenu) {
        await updateMenu(store.id, editingMenu.id, menuData);
        toast.success('메뉴가 수정되었습니다');
      } else {
        await createMenu(store.id, menuData);
        toast.success('메뉴가 추가되었습니다');
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error('메뉴 저장에 실패했습니다');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl mb-2">
                <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                  메뉴 관리
                </span>
              </h1>
              <p className="text-gray-600">총 {menus?.length || 0}개의 메뉴</p>
            </div>
            <Button onClick={handleAddMenu}>
              <Plus className="w-5 h-5 mr-2" />
              메뉴 추가
            </Button>
          </div>

          {/* Menu List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menus?.map((menu) => (
              <Card key={menu.id} padding="none" className="overflow-hidden">
                {/* Image */}
                <div className="relative aspect-[4/3] bg-gray-100">
                  {menu.imageUrl ? (
                    <img
                      src={menu.imageUrl}
                      alt={menu.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="text-5xl">🍜</span>
                    </div>
                  )}
                  {menu.soldout && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Badge variant="danger" size="lg">품절</Badge>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {menu.category.slice(0, 2).map((cat) => (
                      <Badge key={cat} variant="primary" size="sm">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{menu.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{menu.description}</p>
                  <p className="text-xl font-bold text-blue-600 mb-4">
                    {menu.price.toLocaleString()}원
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth
                      onClick={() => handleEditMenu(menu)}
                    >
                      <Edit2 className="w-4 h-4 mr-1.5" />
                      수정
                    </Button>
                    <Button
                      variant={menu.soldout ? 'secondary' : 'ghost'}
                      size="sm"
                      fullWidth
                      onClick={() => handleToggleSoldout(menu.id, menu.soldout)}
                    >
                      {menu.soldout ? '판매 재개' : '품절'}
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteMenu(menu.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>

      {/* Menu Form Modal */}
      {isModalOpen && (
        <MenuFormModal
          menu={editingMenu}
          onSave={handleSaveMenu}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

interface MenuFormModalProps {
  menu: Menu | null;
  onSave: (menu: Omit<Menu, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

function MenuFormModal({ menu, onSave, onClose }: MenuFormModalProps) {
  const [formData, setFormData] = useState<Partial<Menu>>(
    menu || {
      name: '',
      price: 0,
      category: [],
      description: '',
      imageUrl: '',
      options: [],
      soldout: false,
    }
  );

  // 옵션 타입 선택 (옵션1: 수량 있음, 옵션2: 수량 없음)
  const [optionType, setOptionType] = useState<'type1' | 'type2'>('type1');
  const [newOption, setNewOption] = useState<Partial<MenuOption>>({
    name: '',
    price: 0,
    quantity: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || formData.category?.length === 0) {
      toast.error('필수 항목을 모두 입력해주세요');
      return;
    }

    onSave(formData as Omit<Menu, 'id' | 'createdAt'>);
  };

  const toggleCategory = (cat: string) => {
    const categories = formData.category || [];
    if (categories.includes(cat)) {
      setFormData({ ...formData, category: categories.filter(c => c !== cat) });
    } else {
      setFormData({ ...formData, category: [...categories, cat] });
    }
  };

  const addOption = () => {
    if (!newOption.name || !newOption.price) {
      toast.error('옵션명과 가격을 입력해주세요');
      return;
    }

    if (optionType === 'type1' && (!newOption.quantity || newOption.quantity <= 0)) {
      toast.error('옵션 수량을 입력해주세요');
      return;
    }

    const option: MenuOption = {
      id: `option-${Date.now()}`,
      name: newOption.name,
      price: newOption.price,
      ...(optionType === 'type1' ? { quantity: newOption.quantity } : {}),
    };

    setFormData({
      ...formData,
      options: [...(formData.options || []), option],
    });

    setNewOption({ name: '', price: 0, quantity: 0 });
    toast.success('옵션이 추가되었습니다');
  };

  const removeOption = (optionId: string) => {
    setFormData({
      ...formData,
      options: (formData.options || []).filter(opt => opt.id !== optionId),
    });
    toast.success('옵션이 삭제되었습니다');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {menu ? '메뉴 수정' : '메뉴 추가'}
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
            label="메뉴명"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="가격"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              카테고리 (최소 1개 선택)
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`
                    px-4 py-2 rounded-lg border-2 transition-all
                    ${formData.category?.includes(cat)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }
                  `}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              설명
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              rows={3}
              required
            />
          </div>

          <div className="mb-4">
            <ImageUpload
              menuId={menu ? menu.id : 'new'}
              currentImageUrl={formData.imageUrl}
              onImageUploaded={(url) => setFormData({ ...formData, imageUrl: url })}
            />
          </div>

          <div className="border-t border-gray-200 pt-5 mt-5">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              옵션 관리 (선택)
            </label>

            {/* 옵션 타입 선택 */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">옵션 타입</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOptionType('type1')}
                  className={`
                    flex-1 px-4 py-2 rounded-lg border-2 transition-all text-sm
                    ${optionType === 'type1'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }
                  `}
                >
                  옵션1 (수량 포함)
                </button>
                <button
                  type="button"
                  onClick={() => setOptionType('type2')}
                  className={`
                    flex-1 px-4 py-2 rounded-lg border-2 transition-all text-sm
                    ${optionType === 'type2'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }
                  `}
                >
                  옵션2 (수량 없음)
                </button>
              </div>
            </div>

            {/* 옵션 추가 폼 */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="grid gap-3">
                <Input
                  label="옵션명"
                  value={newOption.name || ''}
                  onChange={(e) => setNewOption({ ...newOption, name: e.target.value })}
                  placeholder="예: 곱빼기, 사리 추가, 매운맛 등"
                />

                <div className={`grid gap-3 ${optionType === 'type1' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  <Input
                    label="가격"
                    type="number"
                    value={newOption.price || 0}
                    onChange={(e) => setNewOption({ ...newOption, price: Number(e.target.value) })}
                    placeholder="0"
                  />

                  {optionType === 'type1' && (
                    <Input
                      label="수량"
                      type="number"
                      value={newOption.quantity || 0}
                      onChange={(e) => setNewOption({ ...newOption, quantity: Number(e.target.value) })}
                      placeholder="0"
                    />
                  )}
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={addOption}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  옵션 추가
                </Button>
              </div>
            </div>

            {/* 옵션 목록 */}
            {formData.options && formData.options.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">등록된 옵션 ({formData.options.length}개)</p>
                <div className="space-y-2">
                  {formData.options.map((opt) => (
                    <div
                      key={opt.id}
                      className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{opt.name}</p>
                        <p className="text-sm text-gray-600">
                          +{opt.price.toLocaleString()}원
                          {opt.quantity !== undefined && ` · 수량: ${opt.quantity}개`}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeOption(opt.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" fullWidth onClick={onClose}>
              취소
            </Button>
            <Button type="submit" fullWidth>
              {menu ? '수정' : '추가'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
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

## File: src\pages\OrderDetailPage.test.tsx

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import OrderDetailPage from './OrderDetailPage';
import { useStore } from '../contexts/StoreContext';
import { useFirestoreDocument } from '../hooks/useFirestoreDocument';
import { useParams, useNavigate } from 'react-router-dom';

// Mock dependencies
vi.mock('react-router-dom', () => ({
    useParams: vi.fn(),
    useNavigate: vi.fn(),
}));

vi.mock('../contexts/StoreContext', () => ({
    useStore: vi.fn(),
}));

vi.mock('../hooks/useFirestoreDocument', () => ({
    useFirestoreDocument: vi.fn(),
}));

vi.mock('../components/common/Card', () => ({
    default: ({ children }: any) => <div data-testid="card">{children}</div>,
}));

// Mock lucide icons
vi.mock('lucide-react', () => ({
    ArrowLeft: () => <span>ArrowLeft</span>,
    MapPin: () => <span>MapPin</span>,
    Phone: () => <span>Phone</span>,
    CreditCard: () => <span>CreditCard</span>,
    Clock: () => <span>Clock</span>,
    Package: () => <span>Package</span>,
    CheckCircle2: () => <span>CheckCircle2</span>,
    MessageSquare: () => <span>MessageSquare</span>,
    AlertCircle: () => <span>AlertCircle</span>,
}));

describe('OrderDetailPage', () => {
    const mockNavigate = vi.fn();
    const mockStore = { id: 'store_1' };

    beforeEach(() => {
        vi.clearAllMocks();
        (useNavigate as any).mockReturnValue(mockNavigate);
        (useStore as any).mockReturnValue({ store: mockStore });
        (useParams as any).mockReturnValue({ orderId: 'order_123' });
    });

    it('should render loading state', () => {
        (useFirestoreDocument as any).mockReturnValue({
            data: null,
            loading: true,
            error: null
        });

        render(<OrderDetailPage />);
        expect(screen.getByText('주문 정보를 불러오는 중...')).toBeInTheDocument();
    });

    it('should render error/not found state', () => {
        (useFirestoreDocument as any).mockReturnValue({
            data: null,
            loading: false,
            error: new Error('Failed')
        });

        render(<OrderDetailPage />);
        // Component renders one of these
        expect(screen.getByText('주문 정보를 불러오는데 실패했습니다')).toBeInTheDocument();
    });

    it('should render order details when loaded', () => {
        const mockOrder = {
            id: 'order_123',
            status: '접수',
            totalPrice: 15000,
            items: [
                { name: 'Pizza', price: 15000, quantity: 1, options: [] }
            ],
            createdAt: { toDate: () => new Date('2024-01-01T12:00:00') },
            address: 'Seoul Grid',
            phone: '010-1234-5678',
            paymentType: 'card',
            orderType: '배달'
        };

        (useFirestoreDocument as any).mockReturnValue({
            data: mockOrder,
            loading: false,
            error: null
        });

        render(<OrderDetailPage />);

        expect(screen.getByText('주문 상세')).toBeInTheDocument();
        expect(screen.getByText('주문번호: order_12')).toBeInTheDocument();
        expect(screen.getByText('Pizza')).toBeInTheDocument();
        // Price appears multiple times, check at least one
        expect(screen.getAllByText('15,000원').length).toBeGreaterThan(0);
    });

    it('should navigate back when button clicked', () => {
        (useFirestoreDocument as any).mockReturnValue({
            data: { id: '1', status: '접수', items: [], totalPrice: 0, createdAt: new Date() },
            loading: false,
            error: null
        });

        render(<OrderDetailPage />);

        const backButton = screen.getByText('주문 목록으로');
        fireEvent.click(backButton);

        expect(mockNavigate).toHaveBeenCalledWith('/orders');
    });
});

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

export default function OrdersPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { store } = useStore();
  const [filter, setFilter] = useState<OrderStatus | '전체'>('전체');

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
              <OrderCard key={order.id} order={order} onClick={() => navigate(`/orders/${order.id}`)} getDisplayStatus={getDisplayStatus} />
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

function OrderCard({ order, onClick, getDisplayStatus }: { order: Order; onClick: () => void; getDisplayStatus: (s: OrderStatus) => string }) {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const statusColor = ORDER_STATUS_COLORS[order.status as OrderStatus];

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

        {/* 리뷰 작성 버튼 (완료된 주문만) */}
        {canReview && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            {order.reviewed ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>리뷰 작성 완료 ({order.reviewRating || 0}점)</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowReviewModal(true);
                  }}
                >
                  리뷰 수정
                </Button>
              </div>
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
                리뷰 작성하기
              </Button>
            )}
          </div>
        )}
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

## File: src\pages\SignupPage.tsx

```typescript
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, ArrowRight, CheckCircle2, Phone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    phone: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다';
    }

    if (!formData.displayName) {
      newErrors.displayName = '이름을 입력해주세요';
    } else if (formData.displayName.length < 2) {
      newErrors.displayName = '이름은 최소 2자 이상이어야 합니다';
    }

    if (!formData.phone) {
      newErrors.phone = '전화번호를 입력해주세요';
    } else if (!/^[0-9-]+$/.test(formData.phone)) {
      newErrors.phone = '숫자와 하이픈(-)만 입력 가능합니다';
    } else if (formData.phone.length < 10) {
      newErrors.phone = '올바른 전화번호 형식이 아닙니다';
    }

    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요';
    } else if (formData.password.length < 6) {
      newErrors.password = '비밀번호는 최소 6자 이상이어야 합니다';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호를 다시 입력해주세요';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);

    try {
      await signup(formData.email, formData.password, formData.displayName, formData.phone);
      toast.success('회원가입이 완료되었습니다!');
      navigate('/menu');
    } catch (error: any) {
      toast.error(error.message || '회원가입에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
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
              회원가입
            </span>
          </h1>
          <p className="text-gray-600">새로운 계정을 만들어보세요</p>
        </div>

        {/* Signup Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 animate-scale-in">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="이름"
              type="text"
              placeholder="홍길동"
              value={formData.displayName}
              onChange={(e) => updateField('displayName', e.target.value)}
              error={errors.displayName}
              icon={<UserIcon className="w-5 h-5" />}
              autoComplete="name"
            />

            <Input
              label="전화번호"
              type="tel"
              placeholder="010-1234-5678"
              value={formData.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              error={errors.phone}
              icon={<Phone className="w-5 h-5" />}
              autoComplete="tel"
            />

            <Input
              label="이메일"
              type="email"
              placeholder="example@email.com"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              error={errors.email}
              icon={<Mail className="w-5 h-5" />}
              autoComplete="email"
            />

            <Input
              label="비밀번호"
              type="password"
              placeholder="최소 6자 이상"
              value={formData.password}
              onChange={(e) => updateField('password', e.target.value)}
              error={errors.password}
              icon={<Lock className="w-5 h-5" />}
              autoComplete="new-password"
            />

            <Input
              label="비밀번호 확인"
              type="password"
              placeholder="비밀번호를 다시 입력하세요"
              value={formData.confirmPassword}
              onChange={(e) => updateField('confirmPassword', e.target.value)}
              error={errors.confirmPassword}
              icon={<Lock className="w-5 h-5" />}
              autoComplete="new-password"
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
                  가입하기
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          {/* Benefits */}
          <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-orange-50 rounded-xl">
            <p className="text-sm font-medium text-gray-900 mb-3">회원 혜택</p>
            <ul className="space-y-2">
              <BenefitItem text="신규 가입 쿠폰 즉시 지급" />
              <BenefitItem text="주문 내역 관리 및 재주문" />
              <BenefitItem text="맞춤 추천 메뉴 제공" />
            </ul>
          </div>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              이미 계정이 있으신가요?{' '}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
              >
                로그인
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

function BenefitItem({ text }: { text: string }) {
  return (
    <li className="flex items-center text-sm text-gray-700">
      <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
      {text}
    </li>
  );
}

```

---

## File: src\types\menu.ts

```typescript
export interface MenuOption {
  id: string;
  name: string;
  price: number;
  quantity?: number; // 옵션1용: 수량이 있는 옵션
}

export interface Menu {
  id: string;
  name: string;
  price: number;
  category: string[];
  description: string;
  imageUrl?: string;
  options?: MenuOption[];
  soldout: boolean;
  createdAt: Date;
}

export const CATEGORIES = [
  '인기메뉴',
  '추천메뉴',
  '기본메뉴',
  '사이드메뉴',
  '음료',
  '주류',
] as const;

export type Category = typeof CATEGORIES[number];
```

---

## File: src\types\review.ts

```typescript
/**
 * 리뷰 타입 정의
 */

export interface Review {
  id: string;
  orderId: string;
  userId: string;
  userDisplayName: string;
  rating: number; // 1-5
  comment: string;
  images?: string[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface CreateReviewData extends Omit<Review, 'id' | 'createdAt' | 'updatedAt'> { }

export interface UpdateReviewData extends Partial<Omit<Review, 'id' | 'orderId' | 'userId' | 'createdAt'>> { }

```

---

