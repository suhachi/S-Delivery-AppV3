# My-Pho-App 개발 프롬프트 가이드 (Part 2/3)

## 🔔 Phase 6: 푸시 알림 시스템

### Prompt 6-1: Firebase Cloud Messaging 설정
```
Firebase Cloud Messaging (FCM)을 설정해줘:

1. Firebase 콘솔에서 FCM 활성화
2. 웹 푸시 인증서 생성 (VAPID 키)
3. .env에 VAPID 키 추가

환경변수:
REACT_APP_FIREBASE_VAPID_KEY=your-vapid-key
```

### Prompt 6-2: FCM 초기화 파일
```
src/firebase-messaging.js 파일을 생성해줘:

구현 내용:
1. Firebase Messaging import
2. getMessaging() 초기화
3. getToken() 함수:
   - VAPID 키로 토큰 요청
   - 알림 권한 요청
   - 토큰 반환
4. onMessage() 핸들러:
   - 포그라운드 메시지 수신
   - 토스트로 알림 표시

export:
- messaging 객체
- getToken 함수
```

### Prompt 6-3: Service Worker 생성
```
public/firebase-messaging-sw.js 파일을 생성해줘:

기능:
1. Firebase SDK import (CDN)
2. Firebase 앱 초기화 (환경변수 사용)
3. Messaging 초기화
4. onBackgroundMessage 핸들러:
   - 백그라운드 메시지 수신
   - 알림 표시 (self.registration.showNotification)

알림 옵션:
- title, body
- icon, badge
- data (클릭 시 이동할 URL)

알림 클릭 이벤트:
- notificationclick 리스너
- data.link로 페이지 이동
```

### Prompt 6-4: FCM 토큰 관리
```
src/lib/fcmInit.js 파일을 생성해줘:

기능:
1. FCM 토큰 발급
2. Firestore pushTokens 컬렉션에 저장
3. 기존 토큰 확인 및 업데이트

Firestore 스키마 (pushTokens/{tokenId}):
{
  uid: string,
  token: string,
  createdAt: timestamp,
  updatedAt: timestamp
}

구현:
- getToken()으로 토큰 발급
- where('uid', '==', currentUser.uid) 쿼리
- 기존 토큰 있으면 업데이트, 없으면 추가
- 에러 처리
```

### Prompt 6-5: 알림 핸들러 컴포넌트
```
src/components/NotificationHandler.js 파일을 생성해줘:

기능:
1. 컴포넌트 마운트 시 FCM 초기화
2. 토큰 발급 및 저장
3. 포그라운드 메시지 수신 처리

구현:
- useEffect로 fcmInit 호출
- onMessage로 메시지 수신
- toast로 알림 표시
- 알림 클릭 시 해당 페이지로 이동

App.js에 추가:
- NotificationHandler 컴포넌트 렌더링
```

### Prompt 6-6: Firebase Functions - 푸시 발송 API
```
functions/index.ts 파일을 생성하고 푸시 알림 발송 API를 구현해줘:

1. sendToUser (HTTP Function):
   입력: {uid, title, body, data, link}
   기능:
   - pushTokens에서 해당 uid의 토큰 조회
   - sendEachForMulticast로 발송
   - 실패한 토큰 정리 (invalid token)
   - 결과 반환 {sent, failed, invalid}

2. sendToAllUsers (HTTP Function):
   입력: {title, body, data, link}
   기능:
   - 모든 토큰 조회
   - 전체 브로드캐스트
   - 실패 토큰 정리

3. sendWebpush (Callable Function):
   입력: {token, topic, title, body, link}
   기능:
   - 관리자 권한 확인
   - send()로 발송
   - pushLogs에 로그 저장

보안:
- HTTP Function: x-api-key 헤더 확인
- Callable Function: admins 컬렉션 확인
```

### Prompt 6-7: 관리자 푸시 발송 UI
```
src/components/admin/PushNotificationTest.js 파일을 생성해줘:

UI:
- 제목 입력
- 내용 입력
- 링크 입력 (선택)
- 발송 대상 선택:
  * 특정 사용자 (UID 입력)
  * 전체 사용자
- 발송 버튼

기능:
1. 폼 제출 시 Firebase Functions 호출
2. sendToUser 또는 sendToAllUsers
3. 결과 표시 (성공/실패 수)
4. 에러 처리

API 호출:
- fetch()로 HTTP Function 호출
- x-api-key 헤더 추가
```

---

## ⭐ Phase 7: 리뷰 시스템

### Prompt 7-1: Firestore 리뷰 스키마
```
Firestore reviews 컬렉션 스키마를 설계해줘:

문서 구조 (reviews/{reviewId}):
{
  orderId: string,
  userId: string,
  userDisplayName: string,
  rating: number,  // 1-5
  comment: string,
  createdAt: timestamp,
  updatedAt: timestamp
}

보안 규칙:
- 읽기: 모든 사용자
- 생성: 로그인 사용자
- 수정/삭제: 작성자만

인덱스:
- orderId
```

### Prompt 7-2: 리뷰 작성 폼
```
src/components/review/ReviewForm.js 파일을 생성해줘:

Props:
- orderId: 주문 ID
- user: 현재 사용자
- onClose: 닫기 콜백
- onReviewSuccess: 성공 콜백

UI:
- 별점 선택 (1-5, 클릭 가능한 별 아이콘)
- 리뷰 내용 입력 (textarea, 최대 200자)
- 등록/수정 버튼
- 삭제 버튼 (수정 모드)
- 닫기 버튼

기능:
1. 기존 리뷰 확인:
   - where('orderId', '==', orderId)
   - where('userId', '==', user.uid)
   - 있으면 수정 모드, 없으면 등록 모드
2. 리뷰 등록/수정:
   - addDoc 또는 updateDoc
   - orders 문서에 리뷰 정보 미러링:
     * reviewed: true
     * reviewText, reviewRating, reviewAt
3. 리뷰 삭제:
   - deleteDoc
   - orders 문서 리뷰 필드 초기화
```

### Prompt 7-3: 리뷰 목록
```
src/components/review/ReviewList.js 파일을 생성해줘:

기능:
- reviews 컬렉션 전체 조회
- 최신순 정렬
- 실시간 업데이트

표시 내용:
- 작성자명
- 별점 (★ 아이콘)
- 리뷰 내용
- 작성일

UI:
- 카드 형태
- 별점별 색상 구분
```

---

## 📢 Phase 8: 공지사항 시스템

### Prompt 8-1: Firestore 공지사항 스키마
```
Firestore notices 컬렉션 스키마를 설계해줘:

문서 구조 (notices/{noticeId}):
{
  title: string,
  content: string,
  category: string,  // '공지', '이벤트', '점검', '할인'
  pinned: boolean,   // 상단 고정
  createdAt: timestamp,
  updatedAt: timestamp
}

보안 규칙:
- 읽기: 모든 사용자
- 쓰기: 금지 (관리자는 SDK로)

인덱스:
- createdAt (desc)
- category + createdAt
```

### Prompt 8-2: 공지사항 관리
```
src/components/notice/NoticeManagement.js 파일을 생성해줘:

기능:
1. 공지사항 목록 표시
2. 공지사항 추가
3. 공지사항 수정
4. 공지사항 삭제

입력 필드:
- 제목
- 내용 (textarea)
- 카테고리 (select)
- 상단 고정 (checkbox)

UI:
- 상단: 입력 폼
- 하단: 목록
- 고정 공지는 배경색 강조

구현:
- onSnapshot으로 실시간 구독
- addDoc, updateDoc, deleteDoc
```

### Prompt 8-3: 공지사항 목록
```
src/components/notice/NoticeList.js 파일을 생성해줘:

기능:
- notices 컬렉션 조회
- 고정 공지 우선 표시
- 최신순 정렬

표시 내용:
- 제목
- 카테고리 배지
- 내용 (일부만, 더보기 버튼)
- 작성일

UI:
- 고정 공지: 상단 + 강조 표시
- 일반 공지: 리스트 형태
```

### Prompt 8-4: 공지사항 팝업
```
src/components/notice/NoticePopup.js 파일을 생성해줘:

기능:
- 앱 시작 시 중요 공지 팝업 표시
- "오늘 하루 보지 않기" 옵션
- localStorage로 표시 여부 저장

조건:
- pinned === true인 공지만
- 오늘 본 공지는 제외

UI:
- 모달 형태
- 제목, 내용
- 닫기 버튼
- "오늘 하루 보지 않기" 체크박스
```

---

## 🎉 Phase 9: 이벤트 배너

### Prompt 9-1: Firestore 이벤트 스키마
```
Firestore events 컬렉션 스키마를 설계해줘:

문서 구조 (events/{eventId}):
{
  title: string,
  imageUrl: string,
  link: string,
  active: boolean,
  startDate: timestamp,
  endDate: timestamp,
  createdAt: timestamp
}

보안 규칙:
- 읽기: 모든 사용자
- 쓰기: 금지
```

### Prompt 9-2: 이벤트 배너 컴포넌트
```
src/components/event/EventBanner.js 파일을 생성해줘:

기능:
- events 컬렉션에서 활성 이벤트 조회
- 현재 날짜가 startDate ~ endDate 범위 내
- active === true

UI:
- 이미지 배너 (클릭 가능)
- 여러 이벤트 시 캐러셀 (선택)
- 클릭 시 link로 이동

표시 위치:
- WelcomePage에 삽입
```

### Prompt 9-3: 이벤트 관리
```
src/components/notice/EventManagement.js 파일을 생성해줘:

기능:
1. 이벤트 목록 표시
2. 이벤트 추가
3. 이벤트 수정
4. 이벤트 삭제
5. 활성화/비활성화

입력 필드:
- 제목
- 이미지 URL
- 링크 URL
- 시작일
- 종료일
- 활성화 (checkbox)

UI:
- 이벤트 목록 테이블
- 활성 이벤트 강조 표시
```

---

## 🛠 Phase 10: 유틸리티 및 헬퍼

### Prompt 10-1: 날짜 포맷 유틸
```
src/utils/formatDate.js 파일을 생성해줘:

함수:
1. formatDate(timestamp):
   - Firestore Timestamp를 "YYYY-MM-DD HH:mm:ss" 형식으로 변환
2. formatDateShort(timestamp):
   - "MM/DD HH:mm" 형식
3. formatDateRelative(timestamp):
   - "방금", "5분 전", "1시간 전", "어제", "MM/DD" 등

export default { formatDate, formatDateShort, formatDateRelative }
```

### Prompt 10-2: 라벨 관리
```
src/utils/labels.js 파일을 생성해줘:

상수 정의:
1. ORDER_STATUS_LABELS:
   {
     '접수': '주문 접수',
     '조리중': '조리 중',
     '배달중': '배달 중',
     '완료': '배달 완료',
     '취소': '주문 취소'
   }

2. PAYMENT_TYPE_LABELS:
   {
     '앱결제': '앱 결제',
     '만나서카드': '만나서 카드 결제',
     '만나서현금': '만나서 현금 결제',
     '방문시결제': '방문 시 결제'
   }

3. CATEGORY_LABELS:
   ['인기메뉴', '추천메뉴', '기본메뉴', '사이드메뉴', '음료', '주류']

export default { ORDER_STATUS_LABELS, PAYMENT_TYPE_LABELS, CATEGORY_LABELS }
```

### Prompt 10-3: Firestore 안전 스냅샷
```
src/devtools/safeSnapshot.js 파일을 생성해줘:

기능:
- onSnapshot 래퍼 함수
- 에러 처리 추가
- 권한 없을 때 조용히 실패

함수:
onSnapshotSafe(query, onNext, onError, onCompletion, options)

구현:
- try-catch로 에러 처리
- options.enabled === false면 구독 안 함
- 에러 시 console.warn
- 빈 unsubscribe 함수 반환

export { onSnapshotSafe }
```

---

## 🎨 Phase 11: 공통 컴포넌트

### Prompt 11-1: 웰컴 페이지
```
src/components/common/WelcomePage.js 파일을 생성해줘:

Props:
- user: 현재 사용자

표시 내용:
- 로고 이미지
- 환영 메시지
- 사용자 정보 (로그인 시)
- 관리자 뱃지 (관리자인 경우)
- 이벤트 배너 (EventBanner 컴포넌트)
- 메인 버튼:
  * 로그인 전: "로그인하고 시작하기" → /login
  * 로그인 후: "메뉴 바로가기" → /menu

구현:
- useNavigate로 라우팅
- useIsAdminState로 관리자 확인
```

### Prompt 11-2: 상단 바 (TopBar)
```
src/components/common/TopBar.js 파일을 생성해줘:

표시 내용:
- 앱 로고/제목 (클릭 시 홈으로)
- 네비게이션 링크:
  * 메뉴
  * 장바구니 (아이템 수 배지)
  * 내 주문
  * 관리자 (관리자만)
- 로그아웃 버튼 (로그인 시)

Props:
- user: 현재 사용자

구현:
- useNavigate, Link 사용
- CartContext로 장바구니 아이템 수 표시
- signOut() 호출
```

### Prompt 11-3: 관리자 메뉴 바
```
src/components/common/AdminMenuBar.js 파일을 생성해줘:

메뉴 항목:
- 대시보드
- 주문 관리
- 메뉴 관리
- 쿠폰 관리
- 공지사항 관리
- 이벤트 관리
- 푸시 알림

UI:
- 세로 사이드바 또는 가로 탭
- 현재 페이지 강조 표시
- Link 컴포넌트 사용
```

### Prompt 11-4: 알림 가이드
```
src/components/common/NotificationGuide.js 파일을 생성해줘:

기능:
- 알림 권한 요청 안내
- 권한 상태 확인
- 권한 요청 버튼

UI:
- 알림 권한 없을 때만 표시
- 배너 형태
- "알림 받기" 버튼

구현:
- Notification.permission 확인
- 'default' 상태면 표시
- 버튼 클릭 시 Notification.requestPermission()
```

---

## 🚀 Phase 12: 배포 및 최종 설정

### Prompt 12-1: Firebase Hosting 설정
```
firebase.json 파일을 생성하고 Hosting 설정을 해줘:

설정 내용:
1. hosting:
   - public: "build"
   - rewrites: SPA 라우팅 (모든 요청 → /index.html)
   - headers: 캐시 제어
     * index.html: no-cache
     * static files: max-age=31536000

2. firestore:
   - rules: "firestore.rules"
   - indexes: "firestore.indexes.json"

3. functions:
   - source: "functions"
   - runtime: "nodejs18"
```

### Prompt 12-2: Firestore 인덱스 설정
```
firestore.indexes.json 파일을 생성해줘:

필요한 인덱스:
1. orders:
   - status + createdAt (desc)
   - userId + createdAt (asc)
   - adminDeleted + createdAt (desc)
   - status + adminDeleted + createdAt (desc)

2. reviews:
   - orderId

3. notices:
   - type + startDate
   - createdAt (desc)

4. menus:
   - category + createdAt (desc)

5. events:
   - createdAt (desc)
```

### Prompt 12-3: 환경변수 템플릿
```
.env.example 파일을 생성해줘:

내용:
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
REACT_APP_FIREBASE_VAPID_KEY=
REACT_APP_GOOGLE_MAPS_API_KEY=

주석:
# Firebase 프로젝트 설정에서 복사
# VAPID 키는 FCM 설정에서 생성
# Google Maps API 키는 Google Cloud Console에서 발급
```

### Prompt 12-4: 빌드 및 배포 스크립트
```
package.json에 배포 관련 스크립트를 추가해줘:

scripts:
- "build": "react-scripts build"
- "deploy": "npm run build && firebase deploy"
- "deploy:hosting": "npm run build && firebase deploy --only hosting"
- "deploy:functions": "cd functions && npm run build && cd .. && firebase deploy --only functions"
- "deploy:rules": "firebase deploy --only firestore:rules"

Firebase Functions 빌드:
- functions/package.json에 "build": "tsc" 추가
```

### Prompt 12-5: README 작성
```
README.md 파일을 작성해줘:

포함 내용:
1. 프로젝트 소개
2. 기능 목록
3. 기술 스택
4. 설치 방법:
   - npm install
   - .env 설정
   - Firebase 프로젝트 설정
5. 실행 방법:
   - npm start (개발)
   - npm run build (빌드)
   - npm run deploy (배포)
6. 관리자 설정:
   - Firestore admins 컬렉션에 UID 추가
7. 주요 페이지 URL
```

---

## ✅ 완료 체크리스트

모든 프롬프트를 완료했다면 다음을 확인하세요:

### 기능 테스트
- [ ] 회원가입 및 로그인
- [ ] 메뉴 조회 및 장바구니 추가
- [ ] 주문 생성
- [ ] 관리자 주문 관리
- [ ] 푸시 알림 수신
- [ ] 리뷰 작성
- [ ] 공지사항 조회

### 관리자 기능
- [ ] 대시보드 지표 확인
- [ ] 메뉴 CRUD
- [ ] 주문 상태 변경
- [ ] 쿠폰 관리
- [ ] 공지사항 관리
- [ ] 푸시 알림 발송

### 배포
- [ ] Firebase Hosting 배포
- [ ] Firebase Functions 배포
- [ ] Firestore 규칙 및 인덱스 배포
- [ ] 프로덕션 환경 테스트

---

**개발 완료!** 🎉
