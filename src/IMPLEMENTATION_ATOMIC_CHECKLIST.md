# 🎯 커스컴배달앱 원자 단위 구현 체크리스트

> My-Pho-App 가이드 기반 정밀 분석 및 실행 계획

---

## ✅ Phase 0: 멀티 테넌트 (완료 상태 재확인)

### 0-1. 상점 정보 스키마
- [x] stores/{storeId} 컬렉션 생성
- [x] Store 타입 정의 (/types/store.ts)
- [x] ownerUid, name, phone, address 필드

### 0-2. 관리자-상점 매핑
- [x] stores/{storeId}/admins 서브컬렉션
- [x] adminStores 컬렉션 (역방향 매핑)
- [x] storeAccess.ts 유틸리티

### 0-3. 초기 설정 마법사
- [x] StoreSetupWizard 4단계 구현
- [x] 상점 생성 로직
- [x] 관리자 매핑 자동 설정

### 0-4. StoreContext
- [x] contexts/StoreContext.tsx
- [x] currentStore, adminStores 상태
- [x] switchStore 함수
- [x] localStorage 연동

### 0-5. 데이터 격리
- [x] stores/{storeId}/menus
- [x] stores/{storeId}/orders
- [x] stores/{storeId}/coupons
- [ ] ⚠️ stores/{storeId}/users (미확인)
- [ ] ⚠️ stores/{storeId}/reviews (미확인)
- [ ] ⚠️ stores/{storeId}/notices (미확인)
- [ ] ⚠️ stores/{storeId}/events (미확인)
- [ ] ⚠️ stores/{storeId}/pushTokens (미확인)

### 0-6. 보안 규칙
- [x] firestore.rules 멀티 테넌트 적용
- [x] storage.rules 적용

### 0-7. 상점 선택 UI
- [x] StoreSwitcher 컴포넌트
- [x] AdminSidebar에 통합

### 0-8. 상점 설정 페이지
- [x] AdminStoreSettings 페이지
- [x] 상점 정보 수정 폼
- [x] 브랜딩 설정

### 0-9. 회원가입 로직
- [x] SignupPage storeId 연동 (재확인 필요)

### 0-10. 랜딩 페이지
- [x] WelcomePage 구현
- [ ] ⚠️ 상점별 커스터마이징 (추가 필요)

---

## ✅ Phase 1-5: 기본 기능 (98% 완료)

### Phase 1: 프로젝트 설정
- [x] React + TypeScript + Vite
- [x] Firebase 연동 (auth, firestore, storage)
- [x] 폴더 구조
- [x] 라우팅 (React Router)

### Phase 2: 인증 시스템
- [x] LoginPage
- [x] SignupPage
- [x] AuthContext
- [x] 관리자 권한 (useIsAdmin)
- [x] 데모 계정 (user@demo.com, admin@demo.com)

### Phase 3: 메뉴 시스템
- [x] MenuPage
- [x] MenuCard
- [x] MenuDetailModal
- [x] 옵션1/옵션2 시스템
- [x] CategoryBar
- [x] 관리자 메뉴 관리 (AdminMenuManagement)

### Phase 4: 주문 시스템
- [x] CartContext
- [x] CartPage
- [x] CheckoutPage
- [x] OrdersPage
- [x] OrderDetailPage
- [x] 주문 생성/조회

### Phase 5: 관리자 기능
- [x] AdminDashboard
- [x] AdminOrderManagement
- [x] AdminCouponManagement
- [x] 회원 검색 기능
- [x] 쿠폰 1회 제한 시스템

---

## ❌ Phase 6: 푸시 알림 시스템 (미구현)

### 6-1. FCM 설정
- [ ] Firebase 콘솔에서 FCM 활성화
- [ ] VAPID 키 생성
- [ ] .env에 REACT_APP_FIREBASE_VAPID_KEY 추가
- [ ] firebase.ts에서 messaging export 확인

### 6-2. FCM 초기화 파일
- [ ] /lib/firebase-messaging.ts 생성
- [ ] requestNotificationPermission() 함수
  - [ ] Notification.requestPermission()
  - [ ] getToken(messaging, { vapidKey })
  - [ ] 토큰 반환
- [ ] setupForegroundMessaging() 함수
  - [ ] onMessage(messaging, callback)
  - [ ] toast.info로 알림 표시

### 6-3. Service Worker
- [ ] /public/firebase-messaging-sw.js 생성
- [ ] Firebase SDK CDN import
  - [ ] importScripts('https://www.gstatic.com/firebasejs/...')
- [ ] firebase.initializeApp(config)
- [ ] onBackgroundMessage(messaging, handler)
  - [ ] self.registration.showNotification()
  - [ ] title, body, icon, badge, data
- [ ] notificationclick 이벤트
  - [ ] data.link로 페이지 이동

### 6-4. FCM 토큰 관리
- [ ] /lib/fcmInit.ts 생성
- [ ] Firestore pushTokens 컬렉션 스키마
  ```typescript
  stores/{storeId}/pushTokens/{tokenId}
  {
    uid: string,
    token: string,
    createdAt: Timestamp,
    updatedAt: Timestamp
  }
  ```
- [ ] 토큰 발급 로직
  - [ ] getToken() 호출
  - [ ] where('uid', '==', currentUser.uid) 쿼리
  - [ ] 기존 토큰 확인
  - [ ] 없으면 addDoc, 있으면 updateDoc
- [ ] 에러 처리 (토큰 발급 실패 시)

### 6-5. 알림 핸들러 컴포넌트
- [ ] /components/NotificationHandler.tsx 생성
- [ ] useEffect로 fcmInit 호출
- [ ] 로그인 사용자만 실행
- [ ] onMessage로 포그라운드 메시지 수신
- [ ] toast로 알림 표시
- [ ] 알림 클릭 시 navigate 이동
- [ ] App.tsx에 NotificationHandler 추가

### 6-6. Firebase Functions 푸시 API
- [ ] /functions 폴더 생성
- [ ] Firebase Functions 초기화
  - [ ] firebase init functions
  - [ ] TypeScript 선택
- [ ] functions/src/index.ts 작성
- [ ] sendToUser (HTTP Function)
  - [ ] 입력: {uid, title, body, data, link}
  - [ ] pushTokens에서 uid 기반 토큰 조회
  - [ ] sendEachForMulticast()로 발송
  - [ ] 실패 토큰 정리 (invalid token)
  - [ ] 결과 반환 {sent, failed, invalid}
- [ ] sendToAllUsers (HTTP Function)
  - [ ] 입력: {title, body, data, link}
  - [ ] 모든 토큰 조회
  - [ ] 전체 브로드캐스트
- [ ] sendWebpush (Callable Function)
  - [ ] 관리자 권한 확인
  - [ ] send()로 발송
  - [ ] pushLogs에 로그 저장
- [ ] HTTP Function 보안
  - [ ] x-api-key 헤더 확인
  - [ ] CORS 설정
- [ ] Functions 배포
  - [ ] npm run deploy:functions

### 6-7. 관리자 푸시 UI
- [ ] /pages/admin/AdminPushNotification.tsx 생성
- [ ] UI 구성
  - [ ] 제목 입력 (Input)
  - [ ] 내용 입력 (Textarea)
  - [ ] 링크 입력 (Input, 선택)
  - [ ] 발송 대상 선택 (Radio)
    - [ ] 특정 사용자 (UID 입력)
    - [ ] 전체 사용자
  - [ ] 발송 버튼
- [ ] handleSubmit 로직
  - [ ] fetch()로 HTTP Function 호출
  - [ ] x-api-key 헤더 추가
  - [ ] 성공/실패 수 표시
- [ ] AdminSidebar에 "푸시 알림" 메뉴 추가
- [ ] App.tsx에 /admin/push 라우트 추가

---

## ❌ Phase 7: 리뷰 시스템 (미구현)

### 7-1. Firestore 리뷰 스키마
- [ ] stores/{storeId}/reviews 컬렉션 생성
- [ ] 문서 구조 정의
  ```typescript
  {
    orderId: string,
    userId: string,
    userDisplayName: string,
    rating: number,  // 1-5
    comment: string,
    createdAt: Timestamp,
    updatedAt: Timestamp
  }
  ```
- [ ] /types/review.ts 타입 정의
- [ ] firestore.rules에 보안 규칙 추가
  - [ ] 읽기: 모든 사용자
  - [ ] 생성: 로그인 사용자
  - [ ] 수정/삭제: 작성자만
- [ ] firestore.indexes.json에 인덱스 추가
  - [ ] orderId

### 7-2. 리뷰 작성/수정 폼
- [ ] /components/review/ReviewForm.tsx 생성 (또는 ReviewModal 수정)
- [ ] Props 정의
  - [ ] orderId: string
  - [ ] onClose: () => void
  - [ ] onSuccess: () => void
- [ ] UI 구성
  - [ ] 별점 선택 (1-5 클릭 가능한 ★)
  - [ ] 리뷰 내용 (textarea, 최대 200자)
  - [ ] 등록/수정 버튼
  - [ ] 삭제 버튼 (수정 모드)
  - [ ] 닫기 버튼
- [ ] 기존 리뷰 확인 로직
  - [ ] useEffect로 reviews 쿼리
  - [ ] where('orderId', '==', orderId)
  - [ ] where('userId', '==', user.uid)
  - [ ] 있으면 수정 모드, 없으면 등록 모드
- [ ] 리뷰 등록 로직
  - [ ] addDoc(collection(db, `stores/${storeId}/reviews`), data)
  - [ ] orders 문서 업데이트
    - [ ] reviewed: true
    - [ ] reviewText, reviewRating, reviewAt
- [ ] 리뷰 수정 로직
  - [ ] updateDoc(doc(db, `stores/${storeId}/reviews/${reviewId}`), data)
  - [ ] orders 문서 동기화
- [ ] 리뷰 삭제 로직
  - [ ] deleteDoc(doc(db, `stores/${storeId}/reviews/${reviewId}`))
  - [ ] orders 문서 리뷰 필드 초기화
- [ ] OrderDetailPage에 "리뷰 작성" 버튼 추가

### 7-3. 리뷰 목록
- [ ] /components/review/ReviewList.tsx 생성
- [ ] Firestore 쿼리
  - [ ] collection(db, `stores/${storeId}/reviews`)
  - [ ] orderBy('createdAt', 'desc')
  - [ ] onSnapshot으로 실시간 구독
- [ ] UI 구성
  - [ ] 카드 형태 리스트
  - [ ] 작성자명 (userDisplayName)
  - [ ] 별점 (★★★★☆)
  - [ ] 리뷰 내용
  - [ ] 작성일 (formatDate)
- [ ] 별점별 색상 구분
  - [ ] 5점: 금색
  - [ ] 4점: 파란색
  - [ ] 3점 이하: 회색
- [ ] WelcomePage 또는 별도 페이지에 ReviewList 추가

---

## ❌ Phase 8: 공지사항 시스템 (미구현)

### 8-1. Firestore 공지사항 스키마
- [ ] stores/{storeId}/notices 컬렉션 생성
- [ ] 문서 구조 정의
  ```typescript
  {
    title: string,
    content: string,
    category: '공지' | '이벤트' | '점검' | '할인',
    pinned: boolean,  // 상단 고정
    createdAt: Timestamp,
    updatedAt: Timestamp
  }
  ```
- [ ] /types/notice.ts 타입 정의 (이미 있음, 확인)
- [ ] firestore.rules 보안 규칙
  - [ ] 읽기: 모든 사용자
  - [ ] 쓰기: 관리자만
- [ ] firestore.indexes.json 인덱스
  - [ ] createdAt (desc)
  - [ ] category + createdAt

### 8-2. 공지사항 관리 UI
- [ ] AdminNoticeManagement.tsx 확인 (이미 있음)
- [ ] 기능 확인
  - [ ] 공지사항 목록 조회 (실시간)
  - [ ] 공지사항 추가
  - [ ] 공지사항 수정
  - [ ] 공지사항 삭제
- [ ] 입력 필드
  - [ ] 제목 (Input)
  - [ ] 내용 (Textarea)
  - [ ] 카테고리 (Select)
  - [ ] 상단 고정 (Checkbox)
- [ ] UI 개선
  - [ ] 고정 공지 배경색 강조
  - [ ] 카테고리별 배지 색상
- [ ] storeId 기반 쿼리로 변경
  - [ ] collection(db, `stores/${storeId}/notices`)

### 8-3. 공지사항 목록 (사용자용)
- [ ] /components/notice/NoticeList.tsx 확인 (이미 있음)
- [ ] 기능 확인
  - [ ] notices 컬렉션 조회
  - [ ] 고정 공지 우선 표시
  - [ ] 최신순 정렬
- [ ] UI 확인
  - [ ] 제목, 카테고리 배지
  - [ ] 내용 (일부만, 더보기)
  - [ ] 작성일
- [ ] storeId 기반 쿼리로 변경
- [ ] NoticePage에 NoticeList 통합 확인

### 8-4. 공지사항 팝업
- [ ] /components/notice/NoticePopup.tsx 생성
- [ ] 기능
  - [ ] 앱 시작 시 중요 공지 팝업
  - [ ] pinned === true인 공지만
  - [ ] "오늘 하루 보지 않기" 체크박스
  - [ ] localStorage로 표시 여부 저장
    - [ ] key: `notice_popup_${noticeId}_${today}`
- [ ] UI
  - [ ] 모달 형태
  - [ ] 제목, 내용
  - [ ] 닫기 버튼
  - [ ] "오늘 하루 보지 않기" 체크박스
- [ ] App.tsx 또는 WelcomePage에 NoticePopup 추가

---

## ❌ Phase 9: 이벤트 배너 시스템 (미구현)

### 9-1. Firestore 이벤트 스키마
- [ ] stores/{storeId}/events 컬렉션 생성
- [ ] 문서 구조 정의
  ```typescript
  {
    title: string,
    imageUrl: string,
    link: string,
    active: boolean,
    startDate: Timestamp,
    endDate: Timestamp,
    createdAt: Timestamp
  }
  ```
- [ ] /types/event.ts 타입 정의 (이미 있음, 확인)
- [ ] firestore.rules 보안 규칙
  - [ ] 읽기: 모든 사용자
  - [ ] 쓰기: 관리자만

### 9-2. 이벤트 배너 컴포넌트
- [ ] /components/event/EventBanner.tsx 확인 (이미 있음)
- [ ] 기능 확인
  - [ ] events 컬렉션 조회
  - [ ] active === true 필터
  - [ ] 현재 날짜가 startDate ~ endDate 범위 내
- [ ] UI 확인
  - [ ] 이미지 배너 표시
  - [ ] 클릭 시 link로 이동
  - [ ] 여러 이벤트 시 캐러셀 (선택)
- [ ] storeId 기반 쿼리로 변경
  - [ ] collection(db, `stores/${storeId}/events`)
- [ ] WelcomePage에 EventBanner 추가 확인

### 9-3. 이벤트 관리 UI
- [ ] AdminEventManagement.tsx 확인 (이미 있음)
- [ ] 기능 확인
  - [ ] 이벤트 목록 조회
  - [ ] 이벤트 추가
  - [ ] 이벤트 수정
  - [ ] 이벤트 삭제
  - [ ] 활성화/비활성화
- [ ] 입력 필드
  - [ ] 제목
  - [ ] 이미지 URL (또는 업로드)
  - [ ] 링크 URL
  - [ ] 시작일 (DatePicker)
  - [ ] 종료일 (DatePicker)
  - [ ] 활성화 (Switch)
- [ ] UI 개선
  - [ ] 활성 이벤트 강조 표시
  - [ ] 기간 만료 이벤트 회색 표시
- [ ] storeId 기반 쿼리로 변경

---

## ❌ Phase 10: 유틸리티 함수 (부분 완료)

### 10-1. 날짜 포맷 유틸
- [x] /utils/formatDate.ts 존재 확인
- [ ] formatDate(timestamp) 함수 확인
  - [ ] Firestore Timestamp → "YYYY-MM-DD HH:mm:ss"
- [ ] formatDateShort(timestamp) 함수 추가
  - [ ] "MM/DD HH:mm" 형식
- [ ] formatDateRelative(timestamp) 함수 추가
  - [ ] "방금", "5분 전", "1시간 전", "어제", "MM/DD"

### 10-2. 라벨 관리
- [x] /utils/labels.ts 존재 확인
- [ ] ORDER_STATUS_LABELS 확인
  ```typescript
  {
    '접수': '주문 접수',
    '조리중': '조리 중',
    '배달중': '배달 중',
    '완료': '배달 완료',
    '취소': '주문 취소'
  }
  ```
- [ ] PAYMENT_TYPE_LABELS 확인
  ```typescript
  {
    '앱결제': '앱 결제',
    '만나서카드': '만나서 카드 결제',
    '만나서현금': '만나서 현금 결제',
    '방문시결제': '방문 시 결제'
  }
  ```
- [ ] CATEGORY_LABELS 확인
  ```typescript
  ['인기메뉴', '추천메뉴', '기본메뉴', '사이드메뉴', '음료', '주류']
  ```

### 10-3. Firestore 안전 스냅샷
- [ ] /devtools/safeSnapshot.ts 생성
- [ ] onSnapshotSafe() 래퍼 함수
  - [ ] onSnapshot의 안전한 버전
  - [ ] try-catch 에러 처리
  - [ ] 권한 없을 때 조용히 실패
  - [ ] options.enabled === false면 구독 안 함
  - [ ] 에러 시 console.warn
  - [ ] 빈 unsubscribe 함수 반환
- [ ] export { onSnapshotSafe }
- [ ] 기존 onSnapshot 호출을 onSnapshotSafe로 리팩토링 (선택)

---

## ❌ Phase 11: 공통 컴포넌트 (부분 완료)

### 11-1. 웰컴 페이지
- [x] /pages/WelcomePage.tsx 존재 확인
- [ ] Props 확인
  - [ ] user: User | null
- [ ] 표시 내용 확인
  - [ ] 로고 이미지
  - [ ] 환영 메시지
  - [ ] 사용자 정보 (로그인 시)
  - [ ] 관리자 뱃지 (useIsAdmin)
  - [ ] 이벤트 배너 (EventBanner)
  - [ ] 메인 버튼
    - [ ] 로그인 전: "로그인하고 시작하기" → /login
    - [ ] 로그인 후: "메뉴 바로가기" → /menu
- [ ] 개선 사항
  - [ ] 상점별 커스터마이징 (currentStore.logoUrl, bannerUrl)

### 11-2. 상단 바 (TopBar)
- [x] /components/common/TopBar.tsx 존재 확인
- [ ] 표시 내용 확인
  - [ ] 앱 로고/제목 (클릭 시 홈)
  - [ ] 네비게이션 링크
    - [ ] 메뉴
    - [ ] 장바구니 (아이템 수 배지)
    - [ ] 내 주문
    - [ ] 관리자 (관리자만)
  - [ ] 로그아웃 버튼
- [ ] CartContext로 장바구니 수 표시 확인
- [ ] useIsAdmin으로 관리자 메뉴 표시 확인
- [ ] 모바일 반응형 확인

### 11-3. 관리자 메뉴 바
- [x] AdminSidebar.tsx 존재 확인
- [ ] 메뉴 항목 확인
  - [ ] 대시보드
  - [ ] 주문 관리
  - [ ] 메뉴 관리
  - [ ] 쿠폰 관리
  - [ ] 공지사항 관리
  - [ ] 이벤트 관리
  - [ ] 리뷰 관리
  - [ ] 상점 설정
  - [ ] 푸시 알림 (추가 필요)
- [ ] 현재 페이지 강조 표시 확인
- [ ] StoreSwitcher 통합 확인

### 11-4. 알림 가이드
- [ ] /components/common/NotificationGuide.tsx 생성
- [ ] 기능
  - [ ] 알림 권한 요청 안내
  - [ ] Notification.permission 확인
  - [ ] 'default' 상태면 배너 표시
  - [ ] "알림 받기" 버튼
  - [ ] 버튼 클릭 시 Notification.requestPermission()
- [ ] UI
  - [ ] 배너 형태 (상단 고정)
  - [ ] 닫기 버튼
  - [ ] localStorage로 "다시 보지 않기" 저장
- [ ] App.tsx 또는 WelcomePage에 NotificationGuide 추가

---

## ❌ Phase 12: 배포 및 최적화 (부분 완료)

### 12-1. Firebase Hosting 설정
- [x] firebase.json 존재 확인
- [ ] hosting 설정 확인
  - [ ] public: "dist" (Vite) 또는 "build" (CRA)
  - [ ] rewrites: SPA 라우팅 (모든 요청 → /index.html)
  - [ ] headers: 캐시 제어
    - [ ] index.html: no-cache
    - [ ] static files: max-age=31536000
- [ ] firestore 설정 확인
  - [ ] rules: "firestore.rules"
  - [ ] indexes: "firestore.indexes.json"
- [ ] storage 설정 확인
  - [ ] rules: "storage.rules"
- [ ] functions 설정 확인 (Phase 6 이후)
  - [ ] source: "functions"
  - [ ] runtime: "nodejs18"

### 12-2. Firestore 인덱스
- [x] firestore.indexes.json 존재 확인
- [ ] 필요한 인덱스 확인
  - [ ] orders: status + createdAt (desc)
  - [ ] orders: userId + createdAt (asc)
  - [ ] orders: adminDeleted + createdAt (desc)
  - [ ] orders: status + adminDeleted + createdAt (desc)
  - [ ] reviews: orderId
  - [ ] notices: type + startDate
  - [ ] notices: createdAt (desc)
  - [ ] menus: category + createdAt (desc)
  - [ ] events: createdAt (desc)
- [ ] firebase deploy --only firestore:indexes

### 12-3. 환경변수 템플릿
- [x] .env.example 존재 확인
- [ ] 필요한 변수 확인
  - [ ] VITE_FIREBASE_API_KEY
  - [ ] VITE_FIREBASE_AUTH_DOMAIN
  - [ ] VITE_FIREBASE_PROJECT_ID
  - [ ] VITE_FIREBASE_STORAGE_BUCKET
  - [ ] VITE_FIREBASE_MESSAGING_SENDER_ID
  - [ ] VITE_FIREBASE_APP_ID
  - [ ] VITE_FIREBASE_VAPID_KEY (Phase 6)
- [ ] 주석 추가
  - [ ] Firebase 프로젝트 설정 안내
  - [ ] VAPID 키 생성 방법

### 12-4. 빌드 및 배포 스크립트
- [ ] package.json scripts 확인
  - [ ] "build": "vite build" 또는 "react-scripts build"
  - [ ] "deploy": "npm run build && firebase deploy"
  - [ ] "deploy:hosting": "npm run build && firebase deploy --only hosting"
  - [ ] "deploy:functions": "cd functions && npm run build && cd .. && firebase deploy --only functions"
  - [ ] "deploy:rules": "firebase deploy --only firestore:rules,storage:rules"
- [ ] Firebase Functions 빌드 (Phase 6)
  - [ ] functions/package.json에 "build": "tsc"
- [ ] 빌드 테스트
  - [ ] npm run build
  - [ ] dist 또는 build 폴더 확인

### 12-5. README 최종 작성
- [x] README.md 존재 확인
- [ ] 프로젝트 소개 추가
- [ ] 기능 목록 추가
  - [ ] 사용자 인증
  - [ ] 메뉴 관리
  - [ ] 주문 시스템
  - [ ] 장바구니
  - [ ] 관리자 대시보드
  - [ ] 쿠폰 시스템
  - [ ] 리뷰 시스템 (Phase 7)
  - [ ] 공지사항 (Phase 8)
  - [ ] 이벤트 배너 (Phase 9)
  - [ ] 푸시 알림 (Phase 6)
  - [ ] 멀티 테넌트
- [ ] 기술 스택 추가
  - [ ] React + TypeScript
  - [ ] Firebase (Auth, Firestore, Storage, Functions, Hosting)
  - [ ] Tailwind CSS
  - [ ] shadcn/ui
- [ ] 설치 방법 추가
  - [ ] npm install
  - [ ] .env 설정
  - [ ] Firebase 프로젝트 설정
- [ ] 실행 방법 추가
  - [ ] npm run dev (개발)
  - [ ] npm run build (빌드)
  - [ ] npm run deploy (배포)
- [ ] 관리자 설정 추가
  - [ ] adminStores 컬렉션에 매핑 추가
- [ ] 데모 계정 안내
  - [ ] user@demo.com / demo123
  - [ ] admin@demo.com / admin123

---

## 🎯 최종 검증 체크리스트

### 기능 테스트
- [ ] 회원가입 및 로그인
- [ ] 메뉴 조회 (카테고리별)
- [ ] 메뉴 상세 (옵션 선택)
- [ ] 장바구니 추가/수정/삭제
- [ ] 주문 생성 (모든 결제 방식)
- [ ] 주문 내역 조회
- [ ] 주문 상세 조회
- [ ] 리뷰 작성/수정/삭제 (Phase 7)
- [ ] 공지사항 조회 (Phase 8)
- [ ] 이벤트 배너 표시 (Phase 9)
- [ ] 푸시 알림 수신 (Phase 6)

### 관리자 기능
- [ ] 대시보드 지표 확인
- [ ] 주문 목록 조회
- [ ] 주문 상태 변경
- [ ] 주문 삭제
- [ ] 메뉴 CRUD
- [ ] 메뉴 이미지 업로드
- [ ] 쿠폰 CRUD
- [ ] 회원 검색 (전화번호/이름)
- [ ] 특정 회원에게 쿠폰 발급
- [ ] 공지사항 CRUD (Phase 8)
- [ ] 이벤트 CRUD (Phase 9)
- [ ] 리뷰 관리 (Phase 7)
- [ ] 푸시 알림 발송 (Phase 6)
- [ ] 상점 설정 수정

### 멀티 테넌트
- [ ] 초기 설정 마법사 (StoreSetupWizard)
- [ ] 상점 선택 (StoreSwitcher)
- [ ] 상점별 데이터 격리 확인
- [ ] 관리자-상점 매핑 확인

### 보안
- [ ] Firestore 보안 규칙 테스트
- [ ] Storage 보안 규칙 테스트
- [ ] 관리자 권한 확인
- [ ] 상점별 데이터 격리 확인

### 성능 및 UI/UX
- [ ] 로딩 상태 표시
- [ ] 에러 처리
- [ ] Toast 알림
- [ ] 모바일 반응형
- [ ] 애니메이션 및 트랜지션
- [ ] 이미지 최적화

### 배포
- [ ] Firebase Hosting 배포
- [ ] Firebase Functions 배포 (Phase 6)
- [ ] Firestore 규칙 배포
- [ ] Storage 규칙 배포
- [ ] Firestore 인덱스 배포
- [ ] 프로덕션 환경 테스트

---

## 📊 진행 상황 요약

| Phase | 항목 | 상태 | 진행률 |
|-------|------|------|--------|
| Phase 0 | 멀티 테넌트 | ✅ 완료 (일부 확인 필요) | 90% |
| Phase 1-5 | 기본 기능 | ✅ 완료 | 98% |
| Phase 6 | 푸시 알림 | ❌ 미구현 | 5% |
| Phase 7 | 리뷰 시스템 | ❌ 미구현 | 10% |
| Phase 8 | 공지사항 | ⚠️ 부분 구현 | 40% |
| Phase 9 | 이벤트 배너 | ⚠️ 부분 구현 | 40% |
| Phase 10 | 유틸리티 | ⚠️ 부분 구현 | 60% |
| Phase 11 | 공통 컴포넌트 | ⚠️ 부분 구현 | 70% |
| Phase 12 | 배포 준비 | ⚠️ 부분 구현 | 60% |

### 전체 진행률: **66%**

---

## 🚀 다음 단계

1. **우선순위 1 (필수):**
   - Phase 7: 리뷰 시스템
   - Phase 8: 공지사항 완성
   - Phase 9: 이벤트 배너 완성

2. **우선순위 2 (선택):**
   - Phase 6: 푸시 알림

3. **우선순위 3 (최적화):**
   - Phase 10-12: 유틸리티, 공통 컴포넌트, 배포 준비

---

> **작성일:** 2024-12-05
> **기준:** My-Pho-App 개발 가이드 문서
> **프로젝트:** 커스컴배달앱 (React + TypeScript + Firebase)
