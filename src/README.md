# 🍜 커스컴배달앱

React + TypeScript + Firebase로 구축한 음식 배달 주문 관리 시스템

## 📋 프로젝트 소개

커스컴배달앱은 사용자가 온라인으로 음식을 주문하고, 관리자가 주문을 관리할 수 있는 풀스택 웹 애플리케이션입니다.

## ✨ 주요 기능

### 사용자 기능
- ✅ 회원가입 및 로그인 (Firebase Authentication)
- ✅ 메뉴 조회 및 검색
- ✅ 카테고리별 메뉴 필터링
- ✅ 옵션 선택 (수량 포함/미포함)
- ✅ 장바구니 관리
- ✅ 주문 생성 및 결제
- ✅ 주문 내역 조회
- ✅ 주문 상태 실시간 추적
- ✅ 리뷰 작성 및 수정
- ✅ 공지사항 확인
- ✅ 이벤트 배너 조회

### 관리자 기능
- ✅ 대시보드 (통계 및 지표)
- ✅ 주문 관리 (상태 변경, 삭제)
- ✅ 메뉴 관리 (CRUD, 옵션 설정)
- ✅ 쿠폰 관리 (할인율/할인금액, 회원 검색 및 특정 회원 발급)
- ✅ 리뷰 관리 (승인/거부, 답글)
- ✅ 공지사항 관리
- ✅ 이벤트 배너 관리
- ✅ 상점 설정 관리
- ✅ 멀티 테넌트 (여러 상점 운영 및 전환)

## 🛠 기술 스택

### Frontend
- **React 18** - UI 라이브러리
- **TypeScript** - 타입 안정성
- **React Router** - 라우팅
- **Tailwind CSS v4** - 스타일링
- **Lucide React** - 아이콘
- **Sonner** - 토스트 알림

### Backend & Services
- **Firebase Authentication** - 사용자 인증
- **Firestore** - NoSQL 데이터베이스
- **Firebase Hosting** - 웹 호스팅

## 📦 설치 방법

### 1. 저장소 클론
```bash
git clone https://github.com/your-repo/custom-delivery-app.git
cd custom-delivery-app
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
`.env.example` 파일을 복사하여 `.env` 파일을 생성하고, Firebase 프로젝트 설정 값을 입력합니다.

```bash
cp .env.example .env
```

`.env` 파일 내용:
```
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-storage-bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

### 4. Firebase 프로젝트 설정
1. [Firebase Console](https://console.firebase.google.com/)에서 새 프로젝트 생성
2. Authentication에서 이메일/비밀번호 로그인 활성화
3. Firestore Database 생성
4. 프로젝트 설정에서 웹 앱 추가 후 설정 값 복사

### 5. Firestore 보안 규칙 배포
```bash
firebase deploy --only firestore:rules
```

### 6. Firestore 인덱스 배포
```bash
firebase deploy --only firestore:indexes
```

## 🚀 실행 방법

### 개발 모드
```bash
npm start
```
http://localhost:3000에서 앱이 실행됩니다.

### 프로덕션 빌드
```bash
npm run build
```

### Firebase 배포
```bash
# 전체 배포
npm run deploy

# Hosting만 배포
npm run deploy:hosting

# Firestore 규칙만 배포
npm run deploy:rules
```

## 👥 관리자 설정

### 멀티 테넌트 (상점 관리)

이 시스템은 하나의 플랫폼에서 여러 상점을 운영할 수 있는 멀티 테넌트 구조입니다.

### 1. 상점 생성 (초기 설정 마법사)

관리자가 처음 로그인하면 4단계 초기 설정 마법사가 실행됩니다:
1. **기본 정보** - 상점명, 설명
2. **연락 정보** - 전화번호, 주소
3. **운영 시간** - 영업 시간 설정
4. **배달 정보** - 배달비, 최소 주문금액

### 2. 관리자 권한 부여

Firestore의 `adminStores` 컬렉션에 관리자-상점 매핑을 추가합니다:

```javascript
// Firestore Console에서 수동으로 추가
adminStores/{adminUserId}
{
  storeIds: ['store-1', 'store-2'],
  createdAt: timestamp
}
```

### 3. 상점 전환

관리자 패널의 StoreSwitcher를 통해 여러 상점을 관리할 수 있습니다.

### 데모 계정
- **관리자**: admin@demo.com / admin123
- **일반 사용자**: user@demo.com / demo123

## 📱 주요 페이지

| 경로 | 설명 | 권한 |
|------|------|------|
| `/` | 홈 (환영 페이지) | 공개 |
| `/login` | 로그인 | 공개 |
| `/signup` | 회원가입 | 공개 |
| `/menu` | 메뉴 목록 | 로그인 필요 |
| `/cart` | 장바구니 | 로그인 필요 |
| `/checkout` | 주문하기 | 로그인 필요 |
| `/orders` | 주문 내역 | 로그인 필요 |
| `/orders/:id` | 주문 상세 | 로그인 필요 |
| `/admin` | 관리자 대시보드 | 관리자 전용 |
| `/admin/menus` | 메뉴 관리 | 관리자 전용 |
| `/admin/orders` | 주문 관리 | 관리자 전용 |
| `/admin/coupons` | 쿠폰 관리 | 관리자 전용 |
| `/admin/reviews` | 리뷰 관리 | 관리자 전용 |
| `/admin/notices` | 공지사항 관리 | 관리자 전용 |
| `/admin/events` | 이벤트 관리 | 관리자 전용 |
| `/admin/store-settings` | 상점 설정 | 관리자 전용 |

## 🗄 Firestore 스키마

### 멀티 테넌트 구조

모든 데이터는 `stores/{storeId}/subcollection` 구조로 상점별로 격리됩니다.

### stores
```typescript
{
  id: string;
  name: string;
  description: string;
  phone: string;
  address: string;
  openingHours: {
    mon: { open: string; close: string };
    tue: { open: string; close: string };
    // ... 모든 요일
  };
  deliveryFee: number;
  minOrderAmount: number;
  logoUrl?: string;
  bannerUrl?: string;
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

### adminStores (관리자-상점 매핑)
```typescript
{
  adminUserId: string; // Document ID
  storeIds: string[];
  createdAt: timestamp;
}
```

### users
```typescript
{
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  createdAt: timestamp;
}
```

### stores/{storeId}/menus
```typescript
{
  id: string;
  name: string;
  price: number;
  category: string[];
  description: string;
  imageUrl?: string;
  option1?: MenuOption1[]; // 수량 포함 옵션
  option2?: MenuOption2[]; // 수량 미포함 옵션
  soldout: boolean;
  createdAt: timestamp;
}
```

### stores/{storeId}/orders
```typescript
{
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  items: CartItem[];
  totalPrice: number;
  discountAmount: number;
  finalPrice: number;
  status: '접수' | '조리중' | '배달중' | '완료' | '취소';
  paymentType: '앱결제' | '만나서카드' | '만나서현금' | '방문시결제';
  address: string;
  phone: string;
  memo?: string;
  couponCode?: string;
  adminDeleted: boolean;
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

### stores/{storeId}/reviews
```typescript
{
  id: string;
  orderId: string;
  userId: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  adminReply?: string;
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

### stores/{storeId}/coupons
```typescript
{
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount: number;
  maxDiscount?: number;
  expiryDate: timestamp;
  active: boolean;
  isPrivate: boolean; // true면 특정 회원만 사용 가능
  assignedUsers: string[]; // 발급된 회원 UID 목록 (isPrivate=true일 때)
  createdAt: timestamp;
}
```

### stores/{storeId}/userCoupons (회원별 쿠폰 사용 이력)
```typescript
{
  id: string; // Document ID: {userId}_{couponId}
  userId: string;
  couponId: string;
  used: boolean;
  usedAt?: timestamp;
  assignedAt: timestamp;
}
```

### stores/{storeId}/notices
```typescript
{
  id: string;
  title: string;
  content: string;
  category: '공지' | '이벤트' | '점검' | '할인';
  pinned: boolean;
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

### stores/{storeId}/events
```typescript
{
  id: string;
  title: string;
  imageUrl: string;
  link: string;
  active: boolean;
  startDate: timestamp;
  endDate: timestamp;
  createdAt: timestamp;
}
```

### userProfiles
```typescript
{
  uid: string; // Document ID
  displayName: string;
  phoneNumber: string;
  searchablePhoneNumber: string; // 하이픈 제거된 검색용 전화번호
  searchableDisplayName: string; // 소문자 변환된 검색용 이름
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

## 🔒 보안 규칙

Firestore 보안 규칙은 `/firestore.rules` 파일에 정의되어 있습니다.

주요 규칙:
- 사용자는 자신의 주문만 조회/생성 가능
- 관리자는 모든 데이터 읽기/쓰기 가능
- 리뷰는 주문 완료 후에만 작성 가능

## 📝 개발 가이드

### 옵션 시스템
메뉴에는 2가지 타입의 옵션을 추가할 수 있습니다:

**옵션1 (수량 포함)**
```typescript
{
  id: 'opt-1',
  name: '곱빼기',
  price: 2000,
  quantity: 1.5
}
```

**옵션2 (수량 없음)**
```typescript
{
  id: 'opt-2',
  name: '매운맛',
  price: 0
}
```

### 리뷰 시스템
- 사용자: 주문 완료 후 리뷰 작성
- 관리자: 리뷰 승인/거부, 답글 작성
- 상태: pending → approved/rejected

## 🎨 디자인 시스템

- **Primary Color**: Blue (#3b82f6)
- **Secondary Color**: Orange (#f97316)
- **Typography**: 시스템 폰트
- **Spacing**: Tailwind 기본 단위 (4px)
- **Radius**: 0.5rem ~ 1.5rem

## 🎯 구현 완료 기능

### Phase 0: 멀티 테넌트 시스템 ✅
- ✅ 상점 스키마 설계 및 구현
- ✅ 관리자-상점 매핑 (adminStores)
- ✅ StoreContext 및 데이터 격리
- ✅ 초기 설정 마법사 (4단계)
- ✅ StoreSwitcher (상점 전환 UI)
- ✅ 상점 설정 페이지

### Phase 1-5: 핵심 기능 ✅
- ✅ 사용자 인증 (Firebase Auth)
- ✅ 메뉴 관리 (옵션1/옵션2 시스템)
- ✅ 장바구니 및 주문 시스템
- ✅ 쿠폰 시스템 (회원 검색 및 특정 회원 발급)
- ✅ 관리자 대시보드

### Phase 7: 리뷰 시스템 ✅
- ✅ 리뷰 작성/수정/삭제
- ✅ 관리자 승인/거부
- ✅ 관리자 답글 기능

### Phase 8: 공지사항 시스템 ✅
- ✅ 공지사항 CRUD
- ✅ 공지사항 팝업 (오늘 하루 보지 않기)
- ✅ 카테고리별 필터링

### Phase 9: 이벤트 배너 시스템 ✅
- ✅ 이벤트 배너 CRUD
- ✅ 이벤트 캐러셀
- ✅ 날짜 범위 기반 활성화

### Phase 10-12: 유틸리티 및 배포 ✅
- ✅ 날짜 포맷 유틸리티
- ✅ 라벨 관리 시스템
- ✅ Firestore 보안 규칙
- ✅ Firebase Hosting 설정
- ✅ 환경변수 템플릿

## 🐛 알려진 이슈

- [ ] FCM 푸시 알림 미구현 (향후 추가 예정)
- [ ] 실제 결제 게이트웨이 미연동
- [ ] Google Maps API 미연동

## 📄 라이선스

MIT License

## 👨‍💻 개발자

커스컴배달앱 개발팀

## 🙏 감사

- Firebase 팀
- React 커뮤니티
- Tailwind CSS 팀
