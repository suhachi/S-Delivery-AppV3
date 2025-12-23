# My-Pho-App 개발 프롬프트 가이드 (Part 1/3)

## 📌 개요

이 문서는 my-pho-app을 처음부터 현재 상태까지 개발하기 위한 **원자 단위의 상세한 프롬프트**를 단계별로 제공합니다.

**전제 조건:**
- 디자인은 제외 (기능 구현에만 집중)
- React + Firebase 기반
- 각 프롬프트는 독립적으로 실행 가능
- 순서대로 진행 권장

---

## 🚀 Phase 1: 프로젝트 초기 설정

### Prompt 1-1: React 프로젝트 생성
```
Create React App을 사용하여 새로운 React 프로젝트를 생성해줘.

요구사항:
- 프로젝트명: my-pho-app
- 현재 디렉토리에 생성
- 생성 후 package.json 확인

실행 명령:
npx create-react-app my-pho-app
cd my-pho-app
```

### Prompt 1-2: 필수 의존성 설치
```
다음 라이브러리들을 설치해줘:

1. Firebase SDK (인증, Firestore, Cloud Messaging)
2. React Router (라우팅)
3. React Toastify (알림 메시지)
4. React Icons (아이콘)
5. Google Maps API (지도)
6. File Saver (파일 다운로드)
7. XLSX (엑셀 처리)

실행 명령:
npm install firebase react-router-dom react-toastify react-icons @react-google-maps/api file-saver xlsx
```

### Prompt 1-3: Firebase 프로젝트 설정
```
Firebase 콘솔에서 새 프로젝트를 생성하고, 다음 서비스를 활성화한 후 설정 파일을 생성해줘:

활성화할 서비스:
1. Authentication (이메일/비밀번호 로그인)
2. Firestore Database
3. Cloud Functions
4. Cloud Messaging
5. Hosting

생성할 파일:
- src/firebase.js: Firebase 초기화 설정
- .env: 환경변수 (API 키 등)

firebase.js 내용:
- Firebase SDK import
- 환경변수에서 설정 읽기
- Firebase 앱 초기화
- auth, db export
```

### Prompt 1-4: 기본 폴더 구조 생성
```
다음 폴더 구조를 생성해줘:

src/
├── components/
│   ├── admin/
│   ├── common/
│   ├── menu/
│   ├── order/
│   ├── payment/
│   ├── review/
│   ├── notice/
│   ├── event/
│   └── user/
├── pages/
│   ├── admin/
│   └── debug/
├── hooks/
├── contexts/
├── utils/
├── lib/
├── styles/
├── api/
├── routes/
└── devtools/

각 폴더에 .gitkeep 파일 생성
```

### Prompt 1-5: 기본 라우팅 설정
```
React Router를 사용하여 기본 라우팅 구조를 App.js에 구현해줘:

필요한 라우트:
- / : 홈/웰컴 페이지
- /login : 로그인
- /signup : 회원가입
- /menu : 메뉴 목록
- /cart : 장바구니
- /orders : 내 주문 목록
- /admin/* : 관리자 페이지 (권한 필요)

구현 사항:
- BrowserRouter 사용
- Routes와 Route 컴포넌트 설정
- 미래 호환성 플래그 설정 (v7_startTransition, v7_relativeSplatPath)
```

---

## 🔐 Phase 2: 사용자 인증 시스템

### Prompt 2-1: Firebase Authentication 설정
```
Firebase Authentication을 사용한 이메일/비밀번호 로그인 시스템을 구현해줘:

구현할 기능:
1. 로그인 (signInWithEmailAndPassword)
2. 회원가입 (createUserWithEmailAndPassword)
3. 로그아웃 (signOut)
4. 인증 상태 감지 (onAuthStateChanged)

App.js에 추가:
- useState로 user 상태 관리
- useEffect로 인증 상태 구독
- 로그인 전까지 로딩 표시
```

### Prompt 2-2: 로그인 컴포넌트 생성
```
src/components/user/Auth.js 파일을 생성하고 로그인 폼을 구현해줘:

UI 요소:
- 이메일 입력 필드
- 비밀번호 입력 필드
- 로그인 버튼
- 회원가입 링크

기능:
- 폼 제출 시 Firebase signInWithEmailAndPassword 호출
- 성공 시 메인 페이지로 이동
- 실패 시 에러 메시지 표시 (react-toastify)
- onAuthSuccess prop으로 부모에게 알림
```

### Prompt 2-3: 회원가입 컴포넌트 생성
```
src/components/user/Signup.js 파일을 생성하고 회원가입 폼을 구현해줘:

UI 요소:
- 이메일 입력 필드
- 비밀번호 입력 필드
- 비밀번호 확인 필드
- 회원가입 버튼

유효성 검사:
- 이메일 형식 확인
- 비밀번호 최소 6자
- 비밀번호 일치 확인

기능:
- Firebase createUserWithEmailAndPassword 호출
- 성공 시 로그인 페이지로 이동
- 에러 처리
```

### Prompt 2-4: 사용자 문서 자동 생성 훅
```
src/hooks/useEnsureUserDoc.js 파일을 생성해줘:

기능:
- 로그인 시 Firestore users/{uid} 문서 확인
- 문서가 없으면 자동 생성
- 생성할 필드: email, displayName, createdAt

구현:
- useEffect 사용
- auth.currentUser 확인
- getDoc으로 문서 존재 확인
- setDoc으로 문서 생성 (merge: true)
```

### Prompt 2-5: 관리자 권한 시스템
```
관리자 권한 확인 시스템을 구현해줘:

1. src/hooks/useIsAdminState.js 생성:
   - Firestore admins/{uid} 문서 확인
   - isAdmin, adminLoading 상태 반환
   - onSnapshot으로 실시간 감지

2. src/routes/RequireAuth.js 생성:
   - 로그인 필수 라우트 보호
   - requireAdmin prop으로 관리자 전용 설정
   - 권한 없으면 리다이렉트

3. App.js에 적용:
   - 관리자 라우트에 RequireAuth 래핑
```

---

## 🍜 Phase 3: 메뉴 관리 시스템

### Prompt 3-1: Firestore 메뉴 스키마 설계
```
Firestore에 menus 컬렉션을 설계하고 보안 규칙을 설정해줘:

문서 구조 (menus/{menuId}):
{
  name: string,           // 메뉴명
  price: number,          // 가격
  category: string[],     // 카테고리 (배열)
  description: string,    // 설명
  imageUrl: string,       // 이미지 URL
  options: array,         // 옵션 [{name, price}]
  soldout: boolean,       // 품절 여부
  createdAt: timestamp    // 생성일
}

보안 규칙 (firestore.rules):
- 모든 사용자: 읽기 허용
- 쓰기: 금지 (관리자는 SDK로 직접 작성)
```

### Prompt 3-2: 카테고리 바 컴포넌트
```
src/components/menu/CategoryBar.js 파일을 생성해줘:

카테고리 목록:
['인기메뉴', '추천메뉴', '기본메뉴', '사이드메뉴', '음료', '주류']

UI:
- 가로 스크롤 가능한 버튼 리스트
- 선택된 카테고리 강조 표시
- 클릭 시 onSelect 콜백 호출

Props:
- selected: 현재 선택된 카테고리
- onSelect: 카테고리 선택 핸들러
```

### Prompt 3-3: 메뉴 카드 컴포넌트
```
src/components/menu/MenuCard.js 파일을 생성해줘:

표시 정보:
- 메뉴 이미지
- 메뉴명
- 가격
- 옵션 선택 (있는 경우)
- 수량 선택
- 장바구니 담기 버튼
- 품절 표시

관리자 전용 버튼 (isAdmin prop):
- 수정 버튼
- 삭제 버튼
- 품절 처리 버튼

Props:
- menu: 메뉴 객체
- isAdmin: 관리자 여부
- quantity: 수량
- selectedOption: 선택된 옵션 인덱스
- onQuantityChange: 수량 변경 핸들러
- onAddToCart: 장바구니 추가 핸들러
- onSoldout: 품절 처리 핸들러
- onDelete: 삭제 핸들러
- onEdit: 수정 핸들러
- onOptionChange: 옵션 변경 핸들러
```

### Prompt 3-4: 메뉴 목록 컴포넌트
```
src/components/menu/MenuList.js 파일을 생성해줘:

기능:
1. Firestore menus 컬렉션 실시간 구독 (onSnapshot)
2. 카테고리별 필터링
3. 메뉴 카드 렌더링
4. 수량 및 옵션 상태 관리
5. 장바구니 추가 기능
6. 관리자 기능 (품절, 삭제)

상태:
- menus: 전체 메뉴 목록
- selectedCat: 선택된 카테고리
- quantities: 각 메뉴의 수량 {menuId: qty}
- selectedOptions: 각 메뉴의 선택 옵션 {menuId: idx}
- editingMenu: 수정 중인 메뉴

구현:
- CategoryBar로 카테고리 선택
- filteredMenus로 카테고리별 필터링
- MenuCard 컴포넌트 매핑
```

### Prompt 3-5: 메뉴 등록/수정 폼
```
src/components/menu/MenuForm.js 파일을 생성해줘:

모드:
- create: 새 메뉴 등록
- edit: 기존 메뉴 수정

입력 필드:
- 메뉴명 (필수)
- 가격 (필수, 숫자)
- 카테고리 (다중 선택, 체크박스)
- 설명
- 이미지 URL
- 옵션 (동적 추가/삭제)

기능:
- addDoc (create) 또는 updateDoc (edit)
- 유효성 검사
- 성공/실패 토스트
- onSuccess, onCancel 콜백

Props:
- mode: 'create' | 'edit'
- menu: 수정할 메뉴 (edit 모드)
- onSuccess: 성공 콜백
- onCancel: 취소 콜백
```

---

## 🛒 Phase 4: 장바구니 및 주문 시스템

### Prompt 4-1: 장바구니 Context 생성
```
src/contexts/CartContext.js 파일을 생성하고 장바구니 상태 관리를 구현해줘:

Context 제공 기능:
- cartItems: 장바구니 아이템 배열
- addToCart(item, qty): 아이템 추가
- removeFromCart(itemId): 아이템 제거
- updateQuantity(itemId, qty): 수량 변경
- clearCart(): 장바구니 비우기
- totalItems: 총 아이템 수
- totalPrice: 총 가격

아이템 구조:
{
  id: menuId,
  name: string,
  price: number,
  qty: number,
  selectedOption: {name, price} | null
}

구현:
- useState로 cartItems 관리
- localStorage에 저장 (새로고침 시 유지)
- useEffect로 localStorage 동기화
```

### Prompt 4-2: 장바구니 페이지
```
src/components/order/CartPage.js 파일을 생성해줘:

표시 내용:
- 장바구니 아이템 목록
- 각 아이템: 이름, 옵션, 가격, 수량, 소계
- 수량 변경 버튼 (+/-)
- 삭제 버튼
- 총 금액
- 주문하기 버튼

기능:
- CartContext 사용
- 수량 변경 시 updateQuantity 호출
- 삭제 시 removeFromCart 호출
- 주문하기 클릭 시 /checkout으로 이동
- 빈 장바구니 시 메시지 표시
```

### Prompt 4-3: 주문/결제 페이지
```
src/components/order/OrderPayment.js 파일을 생성해줘:

입력 필드:
- 주문자 이름 (필수)
- 전화번호 (필수)
- 배달/포장 선택 (라디오 버튼)
- 결제 방법 선택:
  * 배달: 앱결제, 만나서카드, 만나서현금
  * 포장: 앱결제, 방문시결제
- 배송 주소 (배달 선택 시):
  * 주소 검색 버튼 (Daum Postcode API)
  * 상세 주소
- 요청사항 (선택)

기능:
1. 폼 유효성 검사
2. Firestore orders 컬렉션에 주문 생성:
   - items: 장바구니 아이템
   - deliveryType: 'delivery' | 'pickup'
   - paymentType: 한글 결제 방법
   - paymentMethod: 표준 코드 (toPaymentMethodCode 함수)
   - customerAddress, customerName, customerPhone
   - request, total, status: '접수'
   - userId, createdAt
   - adminDeleted: false, userDeleted: false, reviewed: false
3. 주문 성공 시:
   - 장바구니 비우기
   - /orders로 이동
   - 성공 토스트
```

### Prompt 4-4: Firestore 주문 스키마
```
Firestore orders 컬렉션 스키마를 설계하고 보안 규칙을 설정해줘:

문서 구조 (orders/{orderId}):
{
  items: [{id, name, price, qty}],
  deliveryType: 'delivery' | 'pickup',
  paymentType: string,
  paymentMethod: string,
  customerAddress: string,
  customerName: string,
  customerPhone: string,
  request: string,
  total: number,
  status: string,  // '접수', '조리중', '배달중', '완료', '취소'
  userId: string,
  userDisplayName: string,
  createdAt: timestamp,
  adminDeleted: boolean,
  userDeleted: boolean,
  reviewed: boolean,
  updateType: string  // 알림용
}

보안 규칙:
- 읽기: 관리자만
- 생성: 로그인 사용자
- 수정/삭제: 관리자만

인덱스 생성:
- status + createdAt
- userId + createdAt
- adminDeleted + createdAt
```

### Prompt 4-5: 내 주문 목록
```
src/components/order/OrderList.js 파일을 생성해줘:

기능:
- 현재 사용자의 주문만 조회 (where userId == currentUser.uid)
- 최신순 정렬 (orderBy createdAt desc)
- 실시간 업데이트 (onSnapshot)

표시 내용:
- 주문 번호 (orderId)
- 주문 일시
- 주문 상태 (배지 색상 구분)
- 주문 아이템 목록
- 총 금액
- 배달/포장 구분
- 리뷰 작성 버튼 (완료 상태 + 미작성)

상태별 색상:
- 접수: 파란색
- 조리중: 주황색
- 배달중: 보라색
- 완료: 녹색
- 취소: 회색
```

---

## 👨‍💼 Phase 5: 관리자 기능

### Prompt 5-1: 관리자 대시보드
```
src/components/admin/Dashboard.js 파일을 생성해줘:

표시 지표:
1. 이번 달 총 매출 (adminDeleted !== true, status !== '취소')
2. 오늘 매출
3. 이번 달 총 주문 수
4. 리뷰 평균 평점

데이터 수집:
- orders 컬렉션 실시간 구독
- reviews 컬렉션 실시간 구독
- menus 컬렉션 실시간 구독

구현:
- onSnapshot으로 실시간 데이터
- 관리자 권한 확인 (useIsAdminState)
- 권한 없으면 접근 차단
- 카드 형태로 지표 표시
```

### Prompt 5-2: 주문 관리 페이지
```
src/components/admin/OrderManagement.js 파일을 생성해줘:

기능:
1. 전체 주문 목록 조회 (adminDeleted !== true)
2. 주문 상태 변경 (드롭다운)
3. 주문 삭제 (adminDeleted = true)
4. 엑셀 다운로드

필터:
- 상태별 필터 (전체, 접수, 조리중, 배달중, 완료, 취소)
- 날짜 범위 필터

표시 정보:
- 주문 번호, 일시, 고객명, 전화번호
- 주문 내역, 금액
- 배달/포장, 주소
- 요청사항
- 상태 변경 드롭다운
- 삭제 버튼

엑셀 다운로드:
- xlsx 라이브러리 사용
- 필터링된 주문만 다운로드
- 파일명: orders_YYYYMMDD.xlsx
```

### Prompt 5-3: 실시간 주문 알림
```
src/components/admin/AdminOrderAlert.js 파일을 생성해줘:

기능:
- orders 컬렉션 실시간 감지
- 새 주문 생성 시 알림 표시
- 주문 상태 변경 시 알림

구현:
1. onSnapshot으로 orders 구독
2. 이전 스냅샷과 비교하여 변경 감지
3. docChanges()로 추가/수정 구분
4. 새 주문: "새 주문이 접수되었습니다!" 토스트
5. 상태 변경: "주문 상태가 변경되었습니다" 토스트

조건:
- 관리자만 구독
- App.js에서 전역으로 렌더링
- key prop으로 재마운트 방지
```

### Prompt 5-4: 메뉴 관리 페이지
```
src/components/admin/MenuManagement.js 파일을 생성해줘:

기능:
1. 메뉴 목록 표시
2. 메뉴 추가 (MenuForm 모달)
3. 메뉴 수정
4. 메뉴 삭제
5. 품절 처리

UI:
- 상단: 메뉴 추가 버튼
- 메뉴 목록 테이블:
  * 이미지, 이름, 가격, 카테고리
  * 품절 여부
  * 수정/삭제 버튼

모달:
- MenuForm 컴포넌트 재사용
- 배경 클릭 시 닫기
```

### Prompt 5-5: 쿠폰 관리
```
src/components/admin/CouponManagement.js 파일을 생성해줘:

Firestore 스키마 (coupons/{couponId}):
{
  code: string,
  discount: number,  // 할인율 (%)
  expiry: timestamp,
  createdAt: timestamp
}

기능:
1. 쿠폰 목록 표시
2. 쿠폰 추가
3. 쿠폰 수정
4. 쿠폰 삭제

입력 필드:
- 쿠폰 코드
- 할인율 (1-100)
- 만료일 (날짜 선택)

유효성 검사:
- 코드 필수
- 할인율 1-100
- 만료일은 오늘 이후
```
