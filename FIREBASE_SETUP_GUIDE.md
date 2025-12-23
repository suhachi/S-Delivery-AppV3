# Firebase 연동 가이드

이 문서는 Simple Delivery App 프로젝트에 Firebase를 연동하는 방법을 안내합니다.

## 목차

1. [Firebase 프로젝트 생성](#1-firebase-프로젝트-생성)
2. [환경 변수 설정](#2-환경-변수-설정)
3. [Firebase 서비스 활성화](#3-firebase-서비스-활성화)
4. [보안 규칙 설정](#4-보안-규칙-설정)
5. [초기 데이터 구조](#5-초기-데이터-구조)
6. [테스트 및 확인](#6-테스트-및-확인)

---

## 1. Firebase 프로젝트 생성

### 1.1 Firebase Console 접속

1. [Firebase Console](https://console.firebase.google.com)에 접속
2. Google 계정으로 로그인

### 1.2 프로젝트 생성

1. **프로젝트 추가** 클릭
2. 프로젝트 이름 입력 (예: `simple-delivery-app`)
3. Google Analytics 설정 (선택사항)
4. 프로젝트 생성 완료

### 1.3 웹 앱 등록

1. 프로젝트 대시보드에서 **웹 앱 추가** (</> 아이콘) 클릭
2. 앱 닉네임 입력 (예: `Simple Delivery Web`)
3. **Firebase Hosting 설정** 체크 (선택사항)
4. **앱 등록** 클릭

### 1.4 Firebase 설정 정보 복사

웹 앱 등록 후 표시되는 Firebase 설정 정보를 복사합니다:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

---

## 2. 환경 변수 설정

### 2.1 .env 파일 생성

프로젝트 루트 디렉토리에 `.env` 파일을 생성합니다:

```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

### 2.2 환경 변수 입력

`.env` 파일을 열고 Firebase 설정 정보를 입력합니다:

```env
VITE_FIREBASE_API_KEY=AIzaSyC...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 2.3 .gitignore 확인

`.env` 파일이 Git에 커밋되지 않도록 `.gitignore`에 포함되어 있는지 확인합니다:

```
.env
.env.local
.env.production
```

---

## 3. Firebase 서비스 활성화

### 3.1 Authentication (인증)

1. Firebase Console > **Authentication** 메뉴로 이동
2. **시작하기** 클릭
3. **이메일/비밀번호** 제공업체 활성화
   - **이메일/비밀번호** 클릭
   - **사용 설정** 토글 활성화
   - **저장** 클릭

### 3.2 Firestore Database (데이터베이스)

1. Firebase Console > **Firestore Database** 메뉴로 이동
2. **데이터베이스 만들기** 클릭
3. **프로덕션 모드** 선택 (나중에 보안 규칙 설정)
4. 위치 선택 (예: `asia-northeast3` - 서울)
5. **사용 설정** 클릭

### 3.3 Storage (파일 저장소)

1. Firebase Console > **Storage** 메뉴로 이동
2. **시작하기** 클릭
3. 보안 규칙 확인 후 **다음** 클릭
4. 위치 선택 (Firestore와 동일한 위치 권장)
5. **완료** 클릭

### 3.4 Cloud Messaging (선택사항)

푸시 알림을 사용하려면:

1. Firebase Console > **Cloud Messaging** 메뉴로 이동
2. **클라우드 메시징 API (V1)** 활성화
3. 웹 푸시 인증서 생성 (선택사항)

---

## 4. 보안 규칙 설정

### 4.1 Firestore 보안 규칙

Firebase Console > **Firestore Database** > **규칙** 탭에서 다음 규칙을 설정합니다:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // 헬퍼 함수들
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // 전역 관리자 확인
    function isSystemAdmin() {
      return isAuthenticated() && 
             exists(/databases/$(database)/documents/admins/$(request.auth.uid)) &&
             get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.isAdmin == true;
    }
    
    // 상점 문서
    match /store/{storeId} {
      allow read: if isAuthenticated();
      allow write: if isSystemAdmin();
    }
    
    // 메뉴
    match /menus/{menuId} {
      allow read: if isAuthenticated();
      allow write: if isSystemAdmin();
    }
    
    // 주문
    match /orders/{orderId} {
      allow read: if isAuthenticated() && 
                    (resource.data.userId == request.auth.uid || isSystemAdmin());
      allow create: if isAuthenticated() && 
                      request.resource.data.userId == request.auth.uid;
      allow update, delete: if isSystemAdmin();
    }
    
    // 쿠폰
    match /coupons/{couponId} {
      allow read: if isAuthenticated();
      allow write: if isSystemAdmin();
    }
    
    // 리뷰
    match /reviews/{reviewId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && 
                      request.resource.data.userId == request.auth.uid;
      allow update, delete: if isAuthenticated() && 
                              (resource.data.userId == request.auth.uid || isSystemAdmin());
    }
    
    // 공지사항
    match /notices/{noticeId} {
      allow read: if isAuthenticated();
      allow write: if isSystemAdmin();
    }
    
    // 이벤트
    match /events/{eventId} {
      allow read: if isAuthenticated();
      allow write: if isSystemAdmin();
    }
    
    // 사용자 문서
    match /users/{userId} {
      allow read: if isOwner(userId) || isSystemAdmin();
      allow create, update: if isOwner(userId);
      allow delete: if isSystemAdmin();
    }
    
    // 관리자 문서
    match /admins/{userId} {
      allow read: if isOwner(userId);
      allow write: if false; // 서버에서만 설정
    }
    
    // 기본적으로 모든 다른 문서는 거부
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**중요**: 개발 단계에서는 테스트를 위해 임시로 모든 접근을 허용할 수 있습니다:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2025, 12, 31);
    }
  }
}
```

⚠️ **경고**: 프로덕션 환경에서는 절대 위의 규칙을 사용하지 마세요!

### 4.2 Storage 보안 규칙

Firebase Console > **Storage** > **규칙** 탭에서 다음 규칙을 설정합니다:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
             firestore.get(/databases/(default)/documents/admins/$(request.auth.uid)).data.isAdmin == true;
    }
    
    function isImageFile() {
      return request.resource.contentType.matches('image/.*');
    }
    
    function isSizeValid() {
      return request.resource.size < 5 * 1024 * 1024; // 5MB
    }
    
    // 메뉴 이미지
    match /menus/{menuId}/{fileName} {
      allow read: if isAuthenticated();
      allow write: if isAdmin() && isImageFile() && isSizeValid();
      allow delete: if isAdmin();
    }
    
    // 프로필 이미지
    match /profiles/{userId}/{fileName} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && 
                     request.auth.uid == userId &&
                     isImageFile() && 
                     isSizeValid();
      allow delete: if isAuthenticated() && 
                      (request.auth.uid == userId || isAdmin());
    }
    
    // 리뷰 이미지
    match /reviews/{reviewId}/{fileName} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && isImageFile() && isSizeValid();
      allow delete: if isAdmin();
    }
    
    // 이벤트 배너 이미지
    match /events/{eventId}/{fileName} {
      allow read: if isAuthenticated();
      allow write: if isAdmin() && isImageFile() && isSizeValid();
      allow delete: if isAdmin();
    }
    
    // 공지사항 이미지
    match /notices/{noticeId}/{fileName} {
      allow read: if isAuthenticated();
      allow write: if isAdmin() && isImageFile() && isSizeValid();
      allow delete: if isAdmin();
    }
    
    // 기본적으로 모든 다른 파일은 거부
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 5. 초기 데이터 구조

### 5.1 Firestore 컬렉션 구조

프로젝트는 다음 컬렉션 구조를 사용합니다:

```
Firestore Database
├── store (컬렉션)
│   └── default (문서) - 단일 상점 정보
├── menus (컬렉션)
│   └── {menuId} (문서) - 메뉴 정보
├── orders (컬렉션)
│   └── {orderId} (문서) - 주문 정보
├── coupons (컬렉션)
│   └── {couponId} (문서) - 쿠폰 정보
├── reviews (컬렉션)
│   └── {reviewId} (문서) - 리뷰 정보
├── notices (컬렉션)
│   └── {noticeId} (문서) - 공지사항 정보
├── events (컬렉션)
│   └── {eventId} (문서) - 이벤트 정보
├── users (컬렉션)
│   └── {userId} (문서) - 사용자 정보
└── admins (컬렉션)
    └── {userId} (문서) - 관리자 정보
```

### 5.2 초기 관리자 계정 생성

Firebase Console > **Firestore Database** > **데이터** 탭에서:

1. **컬렉션 시작** 클릭
2. 컬렉션 ID: `admins` 입력
3. 문서 ID: 관리자로 설정할 사용자의 UID 입력
4. 필드 추가:
   - `isAdmin` (boolean): `true`
   - `createdAt` (timestamp): 현재 시간

또는 Firebase CLI를 사용:

```bash
firebase firestore:set admins/{userId} '{"isAdmin": true, "createdAt": "2024-01-01T00:00:00Z"}'
```

### 5.3 초기 상점 데이터 생성

앱을 실행하고 관리자로 로그인한 후:
1. `/store-setup` 페이지로 이동
2. 상점 정보 입력
3. 상점 생성

또는 Firestore에서 직접 생성:

```javascript
// Firestore Console에서
컬렉션: store
문서 ID: default
필드:
  - name: "상점 이름"
  - description: "상점 설명"
  - phone: "010-1234-5678"
  - email: "contact@example.com"
  - address: "서울시 강남구..."
  - deliveryFee: 3000
  - minOrderAmount: 15000
  - settings: {
      autoAcceptOrders: false,
      estimatedDeliveryTime: 30,
      paymentMethods: ["앱결제", "만나서카드", "만나서현금"],
      enableReviews: true,
      enableCoupons: true,
      enableNotices: true,
      enableEvents: true
    }
  - createdAt: (현재 시간)
  - updatedAt: (현재 시간)
```

---

## 6. 테스트 및 확인

### 6.1 개발 서버 실행

```bash
npm install
npm run dev
```

### 6.2 Firebase 연결 확인

1. 브라우저에서 `http://localhost:3000` 접속
2. 개발자 도구 콘솔 확인
3. Firebase 연결 오류가 없는지 확인

### 6.3 인증 테스트

1. `/signup` 페이지에서 계정 생성
2. `/login` 페이지에서 로그인
3. Firebase Console > Authentication에서 사용자 확인

### 6.4 Firestore 테스트

1. 관리자로 로그인
2. 관리자 페이지에서 메뉴 추가
3. Firebase Console > Firestore Database에서 데이터 확인

### 6.5 Storage 테스트

1. 관리자 페이지에서 메뉴 이미지 업로드
2. Firebase Console > Storage에서 파일 확인

---

## 7. 문제 해결

### 7.1 환경 변수가 로드되지 않음

- `.env` 파일이 프로젝트 루트에 있는지 확인
- 파일 이름이 정확히 `.env`인지 확인 (`.env.txt` 아님)
- 개발 서버를 재시작

### 7.2 Firebase 연결 오류

- `.env` 파일의 값이 올바른지 확인
- Firebase Console에서 프로젝트가 활성화되어 있는지 확인
- 브라우저 콘솔의 오류 메시지 확인

### 7.3 권한 오류

- Firestore 보안 규칙 확인
- Storage 보안 규칙 확인
- 사용자가 로그인되어 있는지 확인
- 관리자 권한이 올바르게 설정되어 있는지 확인

### 7.4 인덱스 오류

Firestore에서 복합 쿼리를 사용할 때 인덱스가 필요할 수 있습니다:

1. Firebase Console > Firestore Database > **인덱스** 탭
2. 오류 메시지의 링크를 클릭하여 인덱스 자동 생성
3. 또는 `src/firestore.indexes.json` 파일을 사용하여 배포

```bash
firebase deploy --only firestore:indexes
```

---

## 8. 다음 단계

Firebase 연동이 완료되면:

1. ✅ 실제 데이터로 테스트
2. ✅ 관리자 계정 생성 및 권한 설정
3. ✅ 초기 메뉴 데이터 추가
4. ✅ 프로덕션 환경 설정
5. ✅ Firebase Hosting 배포 (선택사항)

---

## 참고 자료

- [Firebase 공식 문서](https://firebase.google.com/docs)
- [Firebase Console](https://console.firebase.google.com)
- [Firebase 보안 규칙 가이드](https://firebase.google.com/docs/firestore/security/get-started)
- [Vite 환경 변수 가이드](https://vitejs.dev/guide/env-and-mode.html)

---

## 지원

문제가 발생하면:
1. 브라우저 콘솔의 오류 메시지 확인
2. Firebase Console의 로그 확인
3. 프로젝트 문서 (`docs/` 폴더) 참조

