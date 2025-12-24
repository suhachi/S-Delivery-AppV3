# Project Code Volume 09

Generated: 2025-12-24 14:30:56
Root: D:\projectsing\S-Delivery-AppV3\

- Files in volume: 20
- Approx size: 0.08 MB

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

## File: firebase.json

```json
{
    "firestore": {
        "rules": "firestore.rules",
        "indexes": "firestore.indexes.json"
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

## File: functions\lib\scheduled\statsDailyV3.js

```javascript
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statsDailyV3 = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");
const dateKST_1 = require("../utils/dateKST");
exports.statsDailyV3 = (0, scheduler_1.onSchedule)({
    schedule: "10 0 * * *",
    // Better: "every day 00:10" and set region or use explicit timezone if supported by v2.
    // V2 supports timeZone.
    timeZone: "Asia/Seoul",
    region: "asia-northeast3", // Seoul region
}, async (event) => {
    const db = admin.firestore();
    const { startKST, endKST, dateKey } = (0, dateKST_1.getYesterdayKSTRange)();
    console.log(`[statsDailyV3] Starting aggregation for ${dateKey} (KST)`);
    try {
        const storesSnap = await db.collection("stores").get();
        const batchHandler = new BatchHandler(db);
        for (const storeDoc of storesSnap.docs) {
            const storeId = storeDoc.id;
            // Query Orders
            const ordersRef = db.collection("stores").doc(storeId).collection("orders");
            const ordersSnap = await ordersRef
                .where("createdAt", ">=", startKST)
                .where("createdAt", "<=", endKST)
                .get();
            if (ordersSnap.empty) {
                console.log(`[${storeId}] No orders for ${dateKey}`);
                continue;
            }
            // Aggregation Logic
            let ordersTotal = 0;
            let ordersPaid = 0;
            let ordersCanceled = 0;
            let grossSales = 0;
            const menuStatsMap = new Map();
            for (const doc of ordersSnap.docs) {
                const order = doc.data();
                if (order.status === '결제대기')
                    continue; // exclude pending
                ordersTotal++;
                if (order.status === '취소') {
                    ordersCanceled++;
                }
                else {
                    // Paid/Valid (접수, 배달중, 완료 etc)
                    ordersPaid++;
                    grossSales += (order.totalPrice || 0);
                    // Menu Stats
                    if (order.items) {
                        order.items.forEach(item => {
                            const itemTotalFn = (item.price + (item.options?.reduce((s, o) => s + (o.price * (o.quantity || 1)), 0) || 0)) * item.quantity;
                            const current = menuStatsMap.get(item.menuId) || { name: item.name, qty: 0, sales: 0 };
                            current.qty += item.quantity;
                            current.sales += itemTotalFn;
                            menuStatsMap.set(item.menuId, current);
                        });
                    }
                }
            }
            const avgOrderValue = ordersPaid > 0 ? Math.round(grossSales / ordersPaid) : 0;
            const cancelRate = (ordersPaid + ordersCanceled) > 0
                ? parseFloat((ordersCanceled / (ordersPaid + ordersCanceled)).toFixed(4))
                : 0;
            // Top Menus
            const topMenus = Array.from(menuStatsMap.entries())
                .map(([menuId, stats]) => ({ menuId, ...stats }))
                .sort((a, b) => b.qty - a.qty) // Sort by Quantity
                .slice(0, 5);
            const statsDoc = {
                dateKey,
                ordersTotal,
                ordersPaid,
                ordersCanceled,
                grossSales,
                avgOrderValue,
                cancelRate,
                topMenus,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            };
            // Save to subcollection
            const statsRef = db.collection("stores").doc(storeId).collection("stats_daily").doc(dateKey);
            await batchHandler.set(statsRef, statsDoc);
            console.log(`[${storeId}] Stats computed: Paid=${ordersPaid}, Sales=${grossSales}`);
        }
        await batchHandler.commit(); // Final commit
        console.log(`[statsDailyV3] Completed for ${dateKey}`);
    }
    catch (error) {
        console.error("[statsDailyV3] Error:", error);
    }
});
// Simple Helper for Batches (Firestore limit 500)
class BatchHandler {
    constructor(db) {
        this.count = 0;
        this.db = db;
        this.batch = db.batch();
    }
    async set(ref, data) {
        this.batch.set(ref, data, { merge: true });
        this.count++;
        if (this.count >= 490) {
            await this.commit();
        }
    }
    async commit() {
        if (this.count > 0) {
            await this.batch.commit();
            this.batch = this.db.batch();
            this.count = 0;
        }
    }
}
//# sourceMappingURL=statsDailyV3.js.map
```

---

## File: package.json

```json
{
    "name": "simple-delivery-app",
    "version": "0.1.0",
    "private": true,
    "dependencies": {
        "@radix-ui/react-accordion": "^1.2.3",
        "@radix-ui/react-alert-dialog": "^1.1.6",
        "@radix-ui/react-aspect-ratio": "^1.1.2",
        "@radix-ui/react-avatar": "^1.1.3",
        "@radix-ui/react-checkbox": "^1.1.4",
        "@radix-ui/react-collapsible": "^1.1.3",
        "@radix-ui/react-context-menu": "^2.2.6",
        "@radix-ui/react-dialog": "^1.1.6",
        "@radix-ui/react-dropdown-menu": "^2.1.6",
        "@radix-ui/react-hover-card": "^1.1.6",
        "@radix-ui/react-label": "^2.1.2",
        "@radix-ui/react-menubar": "^1.1.6",
        "@radix-ui/react-navigation-menu": "^1.2.5",
        "@radix-ui/react-popover": "^1.1.6",
        "@radix-ui/react-progress": "^1.1.2",
        "@radix-ui/react-radio-group": "^1.2.3",
        "@radix-ui/react-scroll-area": "^1.2.3",
        "@radix-ui/react-select": "^2.1.6",
        "@radix-ui/react-separator": "^1.1.2",
        "@radix-ui/react-slider": "^1.2.3",
        "@radix-ui/react-slot": "^1.1.2",
        "@radix-ui/react-switch": "^1.1.3",
        "@radix-ui/react-tabs": "^1.1.3",
        "@radix-ui/react-toggle": "^1.1.2",
        "@radix-ui/react-toggle-group": "^1.1.2",
        "@radix-ui/react-tooltip": "^1.1.8",
        "class-variance-authority": "^0.7.1",
        "clsx": "*",
        "cmdk": "^1.1.1",
        "dotenv": "^17.2.3",
        "embla-carousel-react": "^8.6.0",
        "firebase": "^12.6.0",
        "input-otp": "^1.4.2",
        "lucide-react": "^0.487.0",
        "next-themes": "^0.4.6",
        "react": "^18.3.1",
        "react-daum-postcode": "^3.2.0",
        "react-day-picker": "^8.10.1",
        "react-dom": "^18.3.1",
        "react-hook-form": "^7.55.0",
        "react-resizable-panels": "^2.1.7",
        "react-router-dom": "*",
        "recharts": "^2.15.4",
        "sonner": "^2.0.3",
        "tailwind-merge": "*",
        "tailwindcss": "*",
        "vaul": "^1.1.2"
    },
    "devDependencies": {
        "@testing-library/jest-dom": "^6.9.1",
        "@testing-library/react": "^16.3.0",
        "@testing-library/user-event": "^14.6.1",
        "@types/node": "^20.10.0",
        "@types/react": "^19.2.7",
        "@types/react-dom": "^19.2.3",
        "@typescript-eslint/eslint-plugin": "^8.49.0",
        "@typescript-eslint/parser": "^8.49.0",
        "@vitejs/plugin-react-swc": "^3.10.2",
        "eslint": "^8.57.0",
        "eslint-plugin-react-hooks": "^7.0.1",
        "eslint-plugin-react-refresh": "^0.4.24",
        "jsdom": "^27.3.0",
        "vite": "6.3.5",
        "vitest": "^4.0.15"
    },
    "scripts": {
        "dev": "vite",
        "build": "vite build",
        "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
        "preview": "vite preview",
        "firebase:init": "firebase init",
        "firebase:login": "firebase login",
        "test": "vitest",
        "test:ui": "vitest --ui",
        "predeploy": "node scripts/check-deploy.mjs",
        "firebase:deploy": "npm run predeploy && firebase deploy",
        "firebase:deploy:hosting": "npm run predeploy && firebase deploy --only hosting",
        "firebase:deploy:firestore": "npm run predeploy && firebase deploy --only firestore:rules,firestore:indexes",
        "firebase:deploy:storage": "npm run predeploy && firebase deploy --only storage",
        "generate:code-md": "powershell -ExecutionPolicy Bypass -File ./scripts/generate-project-code-md.ps1",
        "generate:code-10": "powershell -ExecutionPolicy Bypass -File ./scripts/generate-project-code-volumes.ps1 -VolumeCount 10",
        "generate:multi-projects": "powershell -ExecutionPolicy Bypass -File ./scripts/generate-multi-project-code.ps1"
    }
}

```

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

## File: src\components\common\AddressSearchInput.tsx

```typescript
import { useState } from 'react';
import { Search } from 'lucide-react';
import Input from './Input';
import Button from './Button';
import AddressSearchModal from './AddressSearchModal';

interface AddressSearchInputProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
    className?: string; // Wrapper className
    inputClassName?: string;
}

export default function AddressSearchInput({
    label,
    value,
    onChange,
    placeholder = '주소를 검색해주세요',
    required,
    className,
    inputClassName
}: AddressSearchInputProps) {
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    return (
        <div className={`relative ${className || ''}`}>
            <div className="flex gap-2 items-end">
                <div className="flex-1">
                    <Input
                        label={label}
                        value={value}
                        readOnly
                        onClick={() => setIsSearchOpen(true)}
                        placeholder={placeholder}
                        required={required}
                        className={`cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors ${inputClassName || ''}`}
                    />
                </div>
                <div className={label ? 'mb-[2px]' : ''}> {/* Align with input box if label exists */}
                    <Button
                        type="button"
                        onClick={() => setIsSearchOpen(true)}
                        variant="outline"
                        className="whitespace-nowrap h-[42px]"
                    >
                        <Search className="w-4 h-4 mr-1" />
                        검색
                    </Button>
                </div>
            </div>

            {isSearchOpen && (
                <AddressSearchModal
                    onClose={() => setIsSearchOpen(false)}
                    onComplete={(address) => {
                        onChange(address);
                    }}
                />
            )}
        </div>
    );
}

```

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

## File: src\components\event\EventList.tsx

```typescript
import { useState } from 'react';
import { Calendar, ChevronRight } from 'lucide-react';
import { Event } from '../../types/event';
import { formatDate } from '../../utils/formatDate';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { useStore } from '../../contexts/StoreContext';
import { useFirestoreCollection } from '../../hooks/useFirestoreCollection';
import { getActiveEventsQuery } from '../../services/eventService';

export default function EventList() {
    const { store } = useStore();
    const storeId = store?.id;
    const { data: events, loading } = useFirestoreCollection<Event>(
        storeId ? getActiveEventsQuery(storeId) : null
    );

    if (!storeId) return null;

    if (loading) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-600">이벤트를 불러오는 중...</p>
            </div>
        );
    }

    if (!events || events.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="text-5xl mb-4">🎉</div>
                <p className="text-gray-600">현재 진행 중인 이벤트가 없습니다</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {events.map((event) => (
                <Card key={event.id} className="overflow-hidden p-0">
                    {event.imageUrl && (
                        <div className="relative h-48 w-full">
                            <img
                                src={event.imageUrl}
                                alt={event.title}
                                className="w-full h-full object-cover"
                            />
                            {event.active && (
                                <div className="absolute top-2 right-2">
                                    <Badge variant="success" size="sm">진행중</Badge>
                                </div>
                            )}
                        </div>
                    )}
                    <div className="p-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{event.title}</h3>

                        <div className="flex items-center text-sm text-gray-500 mb-4">
                            <Calendar className="w-4 h-4 mr-1.5" />
                            <span>
                                {formatDate(event.startDate)} ~ {formatDate(event.endDate)}
                            </span>
                        </div>

                        {event.link && (
                            <a
                                href={event.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm"
                            >
                                자세히 보기 <ChevronRight className="w-4 h-4 ml-0.5" />
                            </a>
                        )}
                    </div>
                </Card>
            ))}
        </div>
    );
}

```

---

## File: src\components\menu\MenuDetailModal.tsx

```typescript
import { useState } from 'react';
import { X, Plus, Minus, ShoppingCart } from 'lucide-react';
import { Menu, MenuOption } from '../../types/menu';
import { useCart } from '../../contexts/CartContext';
import { toast } from 'sonner';
import Button from '../common/Button';
import Badge from '../common/Badge';

interface MenuDetailModalProps {
  menu: Menu;
  onClose: () => void;
}

export default function MenuDetailModal({ menu, onClose }: MenuDetailModalProps) {
  // ATOM-122: 숨김 메뉴 접근 차단
  if (menu.isHidden) {
    onClose();
    return null;
  }

  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<MenuOption[]>([]);

  const toggleOption = (option: MenuOption) => {
    setSelectedOptions(prev => {
      const exists = prev.find(opt => opt.id === option.id);
      if (exists) {
        return prev.filter(opt => opt.id !== option.id);
      } else {
        return [...prev, { ...option, quantity: 1 }];
      }
    });
  };

  const updateOptionQuantity = (optionId: string, delta: number) => {
    setSelectedOptions(prev => {
      return prev.map(opt => {
        if (opt.id === optionId) {
          const newQuantity = (opt.quantity || 1) + delta;
          if (newQuantity < 1) return opt; // Minimum 1
          return { ...opt, quantity: newQuantity };
        }
        return opt;
      });
    });
  };

  const getTotalPrice = () => {
    const optionsPrice = selectedOptions.reduce((sum, opt) => sum + (opt.price * (opt.quantity || 1)), 0);
    return (menu.price + optionsPrice) * quantity;
  };

  const handleAddToCart = () => {
    if (menu.soldout) {
      toast.error('품절된 메뉴입니다');
      return;
    }

    addItem({
      menuId: menu.id,
      name: menu.name,
      price: menu.price,
      quantity,
      options: selectedOptions,
      imageUrl: menu.imageUrl,
    });

    toast.success(`${menu.name}을(를) 장바구니에 담았습니다`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <div className="overflow-y-auto max-h-[90vh]">
          {/* Image */}
          <div className="relative aspect-[16/9] bg-gray-100">
            {menu.imageUrl ? (
              <img
                src={menu.imageUrl}
                alt={menu.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <span className="text-8xl">🍜</span>
              </div>
            )}

            {menu.soldout && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Badge variant="danger" size="lg">
                  품절
                </Badge>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Header */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-2 mb-2">
                {menu.category.map((cat) => (
                  <Badge key={cat} variant="primary">
                    {cat}
                  </Badge>
                ))}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{menu.name}</h2>
              <p className="text-gray-600">{menu.description}</p>
            </div>

            {/* Price */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <span className="text-3xl font-bold text-blue-600">
                {menu.price.toLocaleString()}
              </span>
              <span className="text-lg text-gray-600 ml-2">원</span>
            </div>

            {/* Options */}
            {menu.options && menu.options.length > 0 && (
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">옵션 선택</h3>
                <div className="space-y-2">
                  {menu.options.map((option) => {
                    const selected = selectedOptions.find(opt => opt.id === option.id);
                    return (
                      <div
                        key={option.id}
                        className={`
                          w-full rounded-lg border-2 transition-all overflow-hidden
                          ${selected
                            ? 'border-blue-500 bg-white'
                            : 'border-gray-200 hover:border-gray-300'
                          }
                        `}
                      >
                        <button
                          onClick={() => toggleOption(option)}
                          className="w-full flex items-center justify-between p-4 text-left"
                        >
                          <span className="font-medium text-gray-900">{option.name}</span>
                          <span className={`${selected ? 'text-blue-600' : 'text-gray-900'} font-semibold`}>
                            +{option.price.toLocaleString()}원
                          </span>
                        </button>

                        {selected && option.quantity !== undefined && (
                          <div className="flex items-center justify-between bg-blue-50 p-3 border-t border-blue-100 animate-slide-down">
                            <span className="text-sm text-blue-800 font-medium ml-1">수량</span>
                            <div className="flex items-center bg-white rounded-lg border border-blue-200 shadow-sm">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateOptionQuantity(option.id, -1);
                                }}
                                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:bg-gray-50 rounded-l-lg transition-colors"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-8 text-center text-sm font-bold text-gray-900">
                                {selected.quantity || 1}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateOptionQuantity(option.id, 1);
                                }}
                                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:bg-gray-50 rounded-r-lg transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">수량</h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="text-2xl font-bold text-gray-900 min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Total & Add to Cart */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">총 금액</p>
                <p className="text-2xl font-bold text-blue-600">
                  {getTotalPrice().toLocaleString()}원
                </p>
              </div>
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={menu.soldout}
                className="flex-1"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                장바구니 담기
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## File: src\components\notice\NoticePopup.tsx

```typescript
import { useState, useEffect } from 'react';
import { X, Pin } from 'lucide-react';
import { Notice } from '../../types/notice';
import { useStore } from '../../contexts/StoreContext';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { getNoticesPath } from '../../lib/firestorePaths';
import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';

export default function NoticePopup() {
  const { store } = useStore();
  const storeId = store?.id;
  const [notice, setNotice] = useState<Notice | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!storeId) return;

    const loadPinnedNotice = async () => {
      try {
        // 고정된 공지 중 가장 최근 것 하나만 가져오기
        const q = query(
          collection(db, getNoticesPath(storeId)),
          where('pinned', '==', true),
          orderBy('createdAt', 'desc'),
          limit(1)
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          return;
        }

        const noticeDoc = snapshot.docs[0];
        const noticeData = {
          id: noticeDoc.id,
          ...noticeDoc.data(),
        } as Notice;

        // localStorage 체크: 오늘 본 공지인지 확인
        const today = new Date().toISOString().split('T')[0];
        const storageKey = `notice_popup_${noticeData.id}_${today}`;
        const hasSeenToday = localStorage.getItem(storageKey);

        if (!hasSeenToday) {
          setNotice(noticeData);
          setShow(true);
        }
      } catch (error) {
        console.error('공지사항 팝업 로드 실패:', error);
      }
    };

    loadPinnedNotice();
  }, [storeId]);

  const handleClose = (dontShowToday: boolean = false) => {
    if (dontShowToday && notice) {
      const today = new Date().toISOString().split('T')[0];
      const storageKey = `notice_popup_${notice.id}_${today}`;
      localStorage.setItem(storageKey, 'true');
    }
    setShow(false);
  };

  if (!show || !notice) {
    return null;
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '공지': return 'primary';
      case '이벤트': return 'secondary';
      case '점검': return 'danger';
      case '할인': return 'success';
      default: return 'gray';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
      <div className="relative w-full max-w-lg">
        <Card className="relative">
          {/* Close Button */}
          <button
            onClick={() => handleClose(false)}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          {/* Header */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Pin className="w-5 h-5 text-blue-600" />
              <Badge variant={getCategoryColor(notice.category)}>
                {notice.category}
              </Badge>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 pr-8">
              {notice.title}
            </h2>
          </div>

          {/* Content */}
          <div className="mb-6">
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {notice.content}
            </p>
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              fullWidth
              onClick={() => handleClose(true)}
            >
              오늘 하루 보지 않기
            </Button>
            <Button
              fullWidth
              onClick={() => handleClose(false)}
            >
              확인
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
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

## File: src\components\ui\radio-group.tsx

```typescript
"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group@1.2.3";
import { CircleIcon } from "lucide-react@0.487.0";

import { cn } from "./utils";

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid gap-3", className)}
      {...props}
    />
  );
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="relative flex items-center justify-center"
      >
        <CircleIcon className="fill-primary absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

export { RadioGroup, RadioGroupItem };

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

