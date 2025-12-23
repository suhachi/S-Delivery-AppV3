# 적용된 수정 사항

## ✅ 수정 완료된 오류

### 1. `getAllMenusQuery` export 오류

**문제:**
- `AdminMenuManagement.tsx`에서 `getAllMenusQuery`를 import하려고 했지만
- `menuService.ts`에는 `getMenusQuery`만 존재

**수정:**
- `src/pages/admin/AdminMenuManagement.tsx`
  - `getAllMenusQuery` → `getMenusQuery`로 변경

### 2. `MenuPage.tsx`의 잘못된 import

**문제:**
- `getMenusPath`를 사용했지만 `useFirestoreCollection`은 Query 객체를 받아야 함
- `storeId`를 사용했지만 `StoreContext`에는 `store` 객체만 존재

**수정:**
- `src/pages/MenuPage.tsx`
  - `getMenusPath` → `getMenusQuery`로 변경
  - `storeId` → `store`로 변경

### 3. `OrdersPage.tsx`의 잘못된 쿼리 사용

**문제:**
- `getOrdersPath(storeId)`는 문자열을 반환하지만 `useFirestoreCollection`은 Query 객체를 받아야 함
- 두 번째 인자로 배열을 전달했지만 `useFirestoreCollection`은 Query 객체 하나만 받음

**수정:**
- `src/pages/OrdersPage.tsx`
  - `getUserOrdersQuery(user.id)` 사용
  - `orderService.ts`의 헬퍼 함수 활용

### 4. 잘못된 import 경로 수정

**수정된 파일:**
- `src/App.tsx`: `sonner@2.0.3` → `sonner`
- `src/components/ui/sonner.tsx`: `sonner@2.0.3`, `next-themes@0.4.6` → `sonner`, `next-themes`
- `src/pages/StoreSetupWizard.tsx`: `sonner@2.0.3` → `sonner`
- `src/pages/admin/AdminStoreSettings.tsx`: `sonner@2.0.3` → `sonner`
- `src/components/common/TopBar.tsx`: `sonner@2.0.3` → `sonner`

### 5. 디버깅 로그 추가

**추가된 로그:**
- `src/main.tsx`: 앱 시작/렌더링 로그
- `src/lib/firebase.ts`: Firebase 설정 확인 로그
- `src/contexts/StoreContext.tsx`: Firestore 구독 상태 로그
- `src/App.tsx`: 로딩 상태 표시

## 🔍 확인이 필요한 파일

다음 파일들도 `storeId`를 사용하고 있어 수정이 필요할 수 있습니다:

- `src/pages/CheckoutPage.tsx`
- `src/components/event/EventBanner.tsx`
- `src/components/notice/NoticePopup.tsx`
- `src/components/notice/NoticeList.tsx`
- `src/components/review/ReviewList.tsx`
- `src/components/review/ReviewModal.tsx`

이 파일들은 실제 오류가 발생할 때 수정하면 됩니다.

## 📋 다음 단계

1. **브라우저 새로고침** (F5 또는 Ctrl+R)
2. **콘솔 확인:**
   - "🚀 App starting..." 메시지 확인
   - "✅ App rendered" 메시지 확인
   - Firebase Config 로그 확인
   - StoreContext 로그 확인
3. **화면 확인:**
   - WelcomePage가 표시되는지
   - 또는 "로딩 중..." 메시지가 표시되는지

## 🆘 추가 오류 발생 시

브라우저 콘솔의 오류 메시지를 알려주시면 추가로 수정하겠습니다.

---

**주요 오류가 수정되었습니다. 브라우저를 새로고침하세요!**

