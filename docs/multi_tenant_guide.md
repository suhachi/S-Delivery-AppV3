# My-Pho-App 멀티 테넌트 변환 가이드

## 📌 개요

기존 my-pho-app을 **멀티 테넌트 SaaS**로 변환하여 여러 상점이 독립적으로 사용할 수 있게 만드는 가이드입니다.

### 핵심 개념
- **1개의 앱** = 여러 상점이 공유
- **각 상점**은 독립적인 데이터와 설정 보유
- **초기 설정 마법사**로 쉬운 온보딩
- **Firebase 프로젝트 공유** (비용 절감)

---

## 🏗 아키텍처 변경

### Before (단일 상점)
```
users/
menus/
orders/
notices/
```

### After (멀티 테넌트)
```
stores/                    # 상점 정보
  {storeId}/
    - info                 # 가게 정보
    - settings             # 설정
    
stores/{storeId}/menus/    # 상점별 메뉴
stores/{storeId}/orders/   # 상점별 주문
stores/{storeId}/notices/  # 상점별 공지
stores/{storeId}/reviews/  # 상점별 리뷰
stores/{storeId}/coupons/  # 상점별 쿠폰

users/                     # 전역 사용자
storeAdmins/              # 상점 관리자 매핑
  {userId}/
    - storeId
    - role
```

---

## 🎯 Phase 0: 멀티 테넌트 초기 설정

### Prompt 0-1: 상점 정보 스키마 설계
```
Firestore에 stores 컬렉션을 설계해줘:

문서 구조 (stores/{storeId}):
{
  // 기본 정보
  storeName: string,           // 가게명
  businessNumber: string,      // 사업자번호
  ownerName: string,           // 대표자명
  phone: string,               // 대표 전화번호
  
  // 주소 정보
  address: string,             // 기본 주소
  detailAddress: string,       // 상세 주소
  zipCode: string,             // 우편번호
  location: {                  // 지도 좌표
    lat: number,
    lng: number
  },
  
  // 운영 정보
  businessHours: {
    monday: {open: string, close: string, closed: boolean},
    tuesday: {...},
    // ... 요일별
  },
  deliveryFee: number,         // 배달비
  minOrderAmount: number,      // 최소 주문 금액
  deliveryRadius: number,      // 배달 반경 (km)
  
  // 디자인/브랜딩
  logo: string,                // 로고 URL
  primaryColor: string,        // 메인 색상
  description: string,         // 가게 소개
  
  // API 키 (암호화 권장)
  googleMapsApiKey: string,    // Google Maps API
  
  // 상태
  active: boolean,             // 활성화 여부
  setupCompleted: boolean,     // 초기 설정 완료
  
  // 메타
  createdAt: timestamp,
  updatedAt: timestamp,
  ownerId: string              // 생성자 UID
}

보안 규칙:
- 읽기: 해당 상점 관리자만
- 쓰기: 해당 상점 관리자만
```

### Prompt 0-2: 상점 관리자 매핑 스키마
```
storeAdmins 컬렉션을 설계해줘:

문서 구조 (storeAdmins/{userId}):
{
  storeId: string,             // 관리하는 상점 ID
  role: string,                // 'owner' | 'manager' | 'staff'
  permissions: string[],       // 권한 목록
  createdAt: timestamp
}

보안 규칙:
- 읽기: 본인만
- 쓰기: 시스템만 (Cloud Functions)
```

### Prompt 0-3: 초기 설정 마법사 UI
```
src/components/setup/SetupWizard.js 파일을 생성해줘:

단계별 폼:

1단계: 기본 정보
- 가게명 (필수)
- 사업자번호 (필수)
- 대표자명 (필수)
- 대표 전화번호 (필수)

2단계: 주소 정보
- 주소 검색 (Daum Postcode API)
- 상세 주소
- 지도에서 위치 확인 (Google Maps)

3단계: 운영 정보
- 영업시간 (요일별)
- 배달비
- 최소 주문 금액
- 배달 반경

4단계: 디자인 설정
- 로고 업로드 (선택)
- 메인 색상 선택
- 가게 소개

5단계: API 설정
- Google Maps API 키 입력
- (선택) 결제 PG API 키

UI 구성:
- 진행 표시 바 (1/5, 2/5, ...)
- 이전/다음 버튼
- 각 단계별 유효성 검사
- 완료 시 stores 컬렉션에 저장

완료 후:
- setupCompleted: true
- 메인 페이지로 리다이렉트
```

### Prompt 0-4: 상점 컨텍스트 생성
```
src/contexts/StoreContext.js 파일을 생성해줘:

Context 제공 기능:
- currentStore: 현재 상점 정보
- storeId: 현재 상점 ID
- isStoreAdmin: 상점 관리자 여부
- updateStore(data): 상점 정보 업데이트
- loading: 로딩 상태

구현:
1. 로그인 시 storeAdmins/{uid}에서 storeId 조회
2. stores/{storeId} 실시간 구독
3. 전역으로 상점 정보 제공

App.js에 적용:
- StoreProvider로 앱 전체 래핑
- 로그인 후 상점 정보 로드
- setupCompleted === false면 SetupWizard로 리다이렉트
```

### Prompt 0-5: 상점별 데이터 격리
```
모든 Firestore 쿼리를 상점별로 격리하도록 수정해줘:

변경 전:
collection(db, 'menus')

변경 후:
collection(db, `stores/${storeId}/menus`)

적용 대상:
- menus
- orders
- reviews
- notices
- coupons
- events

구현 방법:
1. useStore 훅 생성:
   const { storeId } = useStore();
   
2. 헬퍼 함수 생성:
   const getStoreCollection = (collectionName) => {
     return collection(db, `stores/${storeId}/${collectionName}`);
   }

3. 모든 컴포넌트에서 사용:
   const menusRef = getStoreCollection('menus');
```

---

## 🔐 보안 규칙 업데이트

### Prompt 0-6: Firestore 보안 규칙 수정
```
firestore.rules를 멀티 테넌트에 맞게 수정해줘:

rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    
    // 헬퍼 함수
    function isSignedIn() { 
      return request.auth != null; 
    }
    
    function isStoreAdmin(storeId) {
      return exists(/databases/$(db)/documents/storeAdmins/$(request.auth.uid))
        && get(/databases/$(db)/documents/storeAdmins/$(request.auth.uid)).data.storeId == storeId;
    }
    
    // 상점 정보
    match /stores/{storeId} {
      allow read: if isSignedIn() && isStoreAdmin(storeId);
      allow write: if isSignedIn() && isStoreAdmin(storeId);
    }
    
    // 상점별 메뉴
    match /stores/{storeId}/menus/{menuId} {
      allow read: if true;  // 공개
      allow write: if isStoreAdmin(storeId);
    }
    
    // 상점별 주문
    match /stores/{storeId}/orders/{orderId} {
      allow read: if isStoreAdmin(storeId) 
        || (isSignedIn() && resource.data.userId == request.auth.uid);
      allow create: if isSignedIn();
      allow update, delete: if isStoreAdmin(storeId);
    }
    
    // 상점별 리뷰
    match /stores/{storeId}/reviews/{reviewId} {
      allow read: if true;
      allow create: if isSignedIn();
      allow update, delete: if isSignedIn() 
        && resource.data.userId == request.auth.uid;
    }
    
    // 상점 관리자 매핑
    match /storeAdmins/{userId} {
      allow read: if isSignedIn() && request.auth.uid == userId;
      allow write: if false;  // Cloud Functions만
    }
    
    // 전역 사용자
    match /users/{userId} {
      allow read, write: if isSignedIn() && request.auth.uid == userId;
    }
  }
}
```

---

## 🎨 UI/UX 변경

### Prompt 0-7: 상점 선택/전환 기능
```
src/components/common/StoreSelector.js 파일을 생성해줘:

기능:
- 사용자가 관리하는 상점 목록 표시
- 상점 전환 (여러 상점 관리 시)
- 새 상점 추가 버튼

UI:
- 드롭다운 형태
- 현재 상점명 표시
- 상점 로고 아이콘

구현:
1. storeAdmins에서 userId로 조회
2. 여러 상점 관리 시 목록 표시
3. 선택 시 StoreContext 업데이트
4. localStorage에 마지막 선택 저장
```

### Prompt 0-8: 상점 설정 페이지
```
src/components/admin/StoreSettings.js 파일을 생성해줘:

기능:
- 상점 정보 조회 및 수정
- SetupWizard와 동일한 폼
- 실시간 미리보기

탭 구성:
1. 기본 정보
2. 운영 정보
3. 디자인 설정
4. API 설정
5. 고급 설정

저장:
- updateDoc으로 stores/{storeId} 업데이트
- 성공 토스트
```

---

## 🚀 배포 및 온보딩

### Prompt 0-9: 회원가입 시 상점 생성
```
회원가입 프로세스를 수정해줘:

기존:
1. 회원가입
2. 로그인
3. 앱 사용

변경:
1. 회원가입
2. 로그인
3. 초기 설정 마법사 (SetupWizard)
4. 상점 생성 및 storeAdmins 매핑
5. 앱 사용

구현:
- Signup.js에서 회원가입 성공 시
- /setup으로 리다이렉트
- SetupWizard 완료 시:
  * stores 컬렉션에 문서 생성
  * storeAdmins/{uid}에 매핑 생성
  * setupCompleted: true
```

### Prompt 0-10: 랜딩 페이지 추가
```
src/components/landing/LandingPage.js 파일을 생성해줘:

내용:
- 서비스 소개
- 주요 기능 설명
- 가격 정보 (선택)
- 시작하기 버튼 → 회원가입

구성:
- 히어로 섹션
- 기능 소개 (카드 형태)
- 고객 후기 (선택)
- FAQ
- CTA (Call to Action)

라우팅:
- / : LandingPage (로그아웃 상태)
- /app : WelcomePage (로그인 상태)
```

---

## 🔧 추가 기능

### Prompt 0-11: 상점별 도메인/서브도메인
```
(선택) 각 상점에 고유 URL을 제공하려면:

방법 1: 서브도메인
- store1.myapp.com
- store2.myapp.com

방법 2: 경로 기반
- myapp.com/store1
- myapp.com/store2

구현:
1. stores 컬렉션에 subdomain 필드 추가
2. Firebase Hosting rewrites 설정
3. 도메인에서 storeId 추출
4. StoreContext에 자동 설정

예시 (경로 기반):
- URL: myapp.com/store1
- storeId 추출: 'store1'
- 해당 상점 데이터 로드
```

### Prompt 0-12: 상점 통계 대시보드
```
src/components/admin/StoreDashboard.js 수정:

추가 지표:
- 전체 상점 수 (슈퍼 관리자만)
- 이번 달 신규 상점
- 활성 상점 비율

상점별 지표:
- 매출 (기존)
- 주문 수 (기존)
- 고객 수
- 리뷰 평점
- 인기 메뉴 Top 5
```

### Prompt 0-13: 구독/결제 시스템 (선택)
```
(선택) SaaS 수익화를 위한 구독 시스템:

Firestore 스키마 (subscriptions/{storeId}):
{
  plan: 'free' | 'basic' | 'pro',
  status: 'active' | 'canceled' | 'expired',
  startDate: timestamp,
  endDate: timestamp,
  features: {
    maxMenus: number,
    maxOrders: number,
    pushNotifications: boolean,
    customDomain: boolean
  }
}

기능:
- 플랜별 제한 확인
- 업그레이드 UI
- 결제 연동 (Stripe, Toss Payments)
```

---

## 📝 마이그레이션 가이드

### 기존 단일 상점 → 멀티 테넌트

```
1. 백업:
   - Firestore 데이터 export
   
2. 데이터 마이그레이션:
   - 기존 menus → stores/{defaultStoreId}/menus
   - 기존 orders → stores/{defaultStoreId}/orders
   - 기존 reviews → stores/{defaultStoreId}/reviews
   
3. 상점 정보 생성:
   - stores/{defaultStoreId} 문서 생성
   - 기존 관리자 → storeAdmins 매핑
   
4. 코드 업데이트:
   - 모든 쿼리를 상점별로 수정
   - StoreContext 적용
   
5. 테스트:
   - 기존 데이터 접근 확인
   - 새 상점 생성 테스트
```

---

## ✅ 체크리스트

### 멀티 테넌트 변환 완료 확인

- [ ] stores 컬렉션 생성
- [ ] storeAdmins 컬렉션 생성
- [ ] SetupWizard 구현
- [ ] StoreContext 적용
- [ ] 모든 쿼리 상점별 격리
- [ ] 보안 규칙 업데이트
- [ ] 상점 설정 페이지
- [ ] 랜딩 페이지 (선택)
- [ ] 데이터 마이그레이션 (기존 앱)
- [ ] 테스트 완료

---

## 🎯 사용 시나리오

### 상점 관리자 A
```
1. 회원가입
2. 초기 설정 마법사
   - 가게명: "라이옥"
   - 사업자번호: 123-45-67890
   - 주소, 영업시간 등 입력
3. 메뉴 등록
4. 주문 관리
```

### 상점 관리자 B
```
1. 회원가입
2. 초기 설정 마법사
   - 가게명: "김밥천국"
   - 사업자번호: 098-76-54321
   - 주소, 영업시간 등 입력
3. 메뉴 등록
4. 주문 관리
```

### 데이터 격리
```
stores/
  store_a/
    menus/     ← 라이옥 메뉴만
    orders/    ← 라이옥 주문만
    
  store_b/
    menus/     ← 김밥천국 메뉴만
    orders/    ← 김밥천국 주문만
```

---

## 💰 비용 절감 효과

### 단일 테넌트 (상점마다 별도 Firebase)
- Firebase 프로젝트 × N개
- Hosting × N개
- Functions × N개
- **비용: N배**

### 멀티 테넌트 (1개 Firebase 공유)
- Firebase 프로젝트 × 1개
- Hosting × 1개
- Functions × 1개
- **비용: 1배 (대폭 절감)**

---

## 🚀 다음 단계

1. **Phase 0 프롬프트 실행** (이 문서)
2. **기존 Phase 1-12 실행** (prompts_part1.md, part2.md)
3. **테스트 및 배포**
4. **상점 온보딩**

---

**작성일**: 2025-12-04  
**버전**: 1.0
