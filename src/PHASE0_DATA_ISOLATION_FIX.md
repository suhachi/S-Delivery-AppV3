# 🚨 Phase 0 데이터 격리 미완성 발견 및 수정 계획

## 문제점

모든 서비스 파일이 **하드코딩된 컬렉션 이름**을 사용하고 있어 멀티 테넌트 구조가 실제로 작동하지 않습니다.

### 현재 상태 (❌ 잘못됨)

```typescript
// menuService.ts
const COLLECTION_NAME = 'menus'; // ❌ 모든 상점이 같은 컬렉션 사용

// orderService.ts  
const COLLECTION_NAME = 'orders'; // ❌ 모든 상점이 같은 컬렉션 사용

// couponService.ts
const COLLECTION_NAME = 'coupons'; // ❌ 모든 상점이 같은 컬렉션 사용
```

### 올바른 구조 (✅ 수정 필요)

```typescript
// menuService.ts
import { getMenusPath } from '../lib/firestorePaths';

export async function createMenu(storeId: string, menuData: ...) {
  const path = getMenusPath(storeId); // 'stores/${storeId}/menus'
  await addDoc(collection(db, path), ...);
}
```

## 수정 대상 파일

1. ✅ `/lib/firestorePaths.ts` - 이미 올바르게 정의됨
2. ❌ `/services/menuService.ts` - storeId 파라미터 추가 필요
3. ❌ `/services/orderService.ts` - storeId 파라미터 추가 필요
4. ❌ `/services/couponService.ts` - storeId 파라미터 추가 필요
5. ❌ 모든 페이지/컴포넌트 - 서비스 호출 시 storeId 전달 필요

## 수정 계획

### Step 1: 서비스 파일 수정
- [ ] menuService.ts
- [ ] orderService.ts
- [ ] couponService.ts

### Step 2: 컴포넌트 수정 (storeId 전달)
- [ ] AdminMenuManagement.tsx
- [ ] AdminOrderManagement.tsx
- [ ] AdminCouponManagement.tsx
- [ ] MenuPage.tsx
- [ ] CartPage.tsx
- [ ] CheckoutPage.tsx
- [ ] OrdersPage.tsx

### Step 3: 훅 수정
- [ ] useFirestoreCollection.ts - storeId 지원

## 영향도 분석

이 수정은 **전체 프로젝트에 영향**을 미치는 중대한 리팩토링입니다.

### Breaking Changes
- 모든 서비스 함수 시그니처 변경
- 모든 컴포넌트에서 useStore() 또는 useStoreId() 사용 필요

### 호환성 문제
- 기존 데이터가 루트 컬렉션에 있으면 마이그레이션 필요
- admin@demo.com 계정에 상점이 없어서 현재 동작하지 않음

## 결론

**Phase 0이 실제로는 50% 미완성 상태**입니다.

- ✅ 스키마 설계 완료
- ✅ StoreContext 완료
- ✅ 경로 유틸리티 완료
- ❌ 서비스 레이어 미적용
- ❌ 실제 데이터 격리 미작동

## 권장 조치

1. **즉시 수정**: 서비스 레이어 멀티 테넌트화
2. **데이터 마이그레이션**: 기존 데이터를 stores/{storeId}/ 아래로 이동
3. **테스트**: 상점 생성 → 메뉴 추가 → 주문 생성 전체 플로우 검증
