# 로컬 개발 환경 설정 가이드

이 가이드는 Simple Delivery App을 로컬에서 실행하고 초기 설정을 완료하는 방법을 안내합니다.

## 📋 목차

1. [로컬 서버 실행](#1-로컬-서버-실행)
2. [관리자 계정 생성](#2-관리자-계정-생성)
3. [기본 상점 문서 생성](#3-기본-상점-문서-생성)
4. [확인 및 테스트](#4-확인-및-테스트)

---

## 1. 로컬 서버 실행

### 1-1. 프로젝트 디렉토리로 이동

```bash
cd simple-delivery-app
```

### 1-2. 의존성 설치 (처음 한 번만)

```bash
npm install
```

이 명령어는 `package.json`에 정의된 모든 의존성을 설치합니다. 처음 실행 시 몇 분이 걸릴 수 있습니다.

### 1-3. 개발 서버 실행

```bash
npm run dev
```

서버가 시작되면 다음과 같은 메시지가 표시됩니다:

```
  VITE v6.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 1-4. 브라우저에서 접속

브라우저에서 다음 주소로 접속하세요:

- **로컬**: http://localhost:5173
- 또는 터미널에 표시된 주소 사용

> **참고**: Vite는 기본적으로 포트 5173을 사용합니다. 포트 3000이 아닙니다.

---

## 2. 관리자 계정 생성

앱을 사용하려면 관리자 계정이 필요합니다. 다음 단계를 따라 관리자 계정을 생성하세요.

### 2-1. 브라우저에서 회원가입

1. 브라우저에서 `http://localhost:5173` 접속
2. 회원가입 페이지(`/signup`)로 이동
3. 이메일과 비밀번호로 계정 생성
   - 예: `admin@example.com` / `password123`
4. 회원가입 완료 후 자동으로 로그인됩니다

### 2-2. Firebase Console에서 UID 확인

1. [Firebase Console](https://console.firebase.google.com) 접속
2. 프로젝트 선택: `simple-delivery-app-9d347`
3. **Authentication** > **사용자** 탭 클릭
4. 방금 생성한 계정을 클릭
5. **UID** 복사 (예: `abc123def456ghi789...`)
   - UID는 사용자마다 고유한 긴 문자열입니다

### 2-3. Firestore에 관리자 문서 생성

1. Firebase Console > **Firestore Database** > **데이터** 탭 클릭
2. **컬렉션 시작** 버튼 클릭
3. 컬렉션 ID 입력: `admins`
4. **다음** 클릭
5. 문서 ID 입력: 복사한 UID 붙여넣기
6. **필드 추가** 클릭:
   - 필드: `isAdmin`
   - 유형: `boolean` 선택
   - 값: `true` 입력
7. (선택사항) 추가 필드:
   - 필드: `email`
   - 유형: `string`
   - 값: 회원가입 시 사용한 이메일
   - 필드: `name`
   - 유형: `string`
   - 값: 관리자 이름
   - 필드: `createdAt`
   - 유형: `timestamp`
   - 값: 현재 시간 (또는 빈 값으로 두면 자동 설정)
8. **저장** 클릭

### 2-4. 확인

- Firestore Database > 데이터 탭에서 `admins` 컬렉션이 생성되었는지 확인
- 문서 ID가 사용자 UID와 정확히 일치하는지 확인
- `isAdmin` 필드가 `true`인지 확인

---

## 3. 기본 상점 문서 생성

앱이 정상적으로 작동하려면 상점 정보가 필요합니다. 다음 단계를 따라 기본 상점 문서를 생성하세요.

### 방법 A: Firebase Console에서 직접 생성 (권장)

1. Firebase Console > **Firestore Database** > **데이터** 탭 클릭
2. **컬렉션 시작** 버튼 클릭
3. 컬렉션 ID 입력: `store`
4. **다음** 클릭
5. 문서 ID 입력: `default`
6. 필드 추가:

#### 필수 필드

```
name (string) = "심플 배달앱 가게"
phone (string) = "010-0000-0000"
email (string) = "contact@example.com"
address (string) = "서울시 강남구 테헤란로 123"
minOrderPrice (number) = 15000
deliveryFee (number) = 3000
```

#### 선택 필드 (추가 가능)

```
description (string) = "맛있는 음식을 빠르게 배달해드립니다"
businessHours (map):
  monday (map):
    open (string) = "09:00"
    close (string) = "22:00"
    isOpen (boolean) = true
  tuesday (map):
    open (string) = "09:00"
    close (string) = "22:00"
    isOpen (boolean) = true
  ... (다른 요일도 동일하게 설정)
settings (map):
  autoAcceptOrders (boolean) = false
  estimatedDeliveryTime (number) = 30
  paymentMethods (array) = ["앱결제", "만나서카드", "만나서현금"]
  enableReviews (boolean) = true
  enableCoupons (boolean) = true
  enableNotices (boolean) = true
  enableEvents (boolean) = true
createdAt (timestamp) = 현재 시간
updatedAt (timestamp) = 현재 시간
```

7. **저장** 클릭

### 방법 B: 앱에서 생성 (관리자 로그인 후)

1. 관리자로 로그인
2. `/store-setup` 페이지로 이동
3. 상점 정보 입력
4. 저장

---

## 4. 확인 및 테스트

### 4-1. 브라우저 새로고침

모든 설정이 완료되면 브라우저를 새로고침하세요 (F5 또는 Ctrl+R).

### 4-2. 관리자 로그인 확인

1. 로그아웃 후 다시 로그인
2. `/admin` 페이지로 이동
3. 관리자 대시보드가 표시되는지 확인
   - 통계 정보
   - 최근 주문 목록
   - 관리 메뉴

### 4-3. 기본 상점 정보 확인

다음 위치에서 상점 정보가 표시되는지 확인:

1. **상단 네비게이션 바**
   - 상점 이름이 표시되는지 확인

2. **마이페이지** (`/mypage`)
   - 상점 정보 섹션 확인

3. **주문 페이지**
   - 최소 주문 금액, 배달비가 올바르게 표시되는지 확인

### 4-4. 기능 테스트

#### 메뉴 관리 테스트
1. 관리자 페이지 > 메뉴 관리
2. 메뉴 추가 버튼 클릭
3. 메뉴 정보 입력 및 저장
4. 메뉴 목록에 추가된 메뉴가 표시되는지 확인

#### 주문 테스트
1. 일반 사용자로 로그인 (또는 새 계정 생성)
2. 메뉴 페이지에서 메뉴 선택
3. 장바구니에 추가
4. 주문하기
5. Firebase Console > Firestore에서 `orders` 컬렉션 확인

---

## 🔧 문제 해결

### 개발 서버가 시작되지 않음

**오류**: `npm run dev` 실행 시 오류 발생

**해결 방법**:
1. Node.js 버전 확인 (18 이상 필요)
   ```bash
   node --version
   ```
2. `node_modules` 삭제 후 재설치
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### 포트가 이미 사용 중

**오류**: `Port 5173 is already in use`

**해결 방법**:
1. 다른 포트 사용:
   ```bash
   npm run dev -- --port 3000
   ```
2. 또는 기존 프로세스 종료

### 관리자 페이지 접근 불가

**원인**: 관리자 권한이 올바르게 설정되지 않음

**해결 방법**:
1. Firestore > `admins` 컬렉션 확인
2. 문서 ID가 사용자 UID와 정확히 일치하는지 확인
3. `isAdmin` 필드가 `true`인지 확인
4. 로그아웃 후 다시 로그인

### 상점 정보가 표시되지 않음

**원인**: `store/default` 문서가 생성되지 않음

**해결 방법**:
1. Firestore > `store` 컬렉션 확인
2. 문서 ID가 정확히 `default`인지 확인 (대소문자 구분)
3. 필수 필드가 모두 입력되었는지 확인

### "Permission denied" 오류

**원인**: Firestore 보안 규칙 문제

**해결 방법**:
1. Firebase Console > Firestore > 규칙 탭 확인
2. 보안 규칙이 올바르게 배포되었는지 확인
3. 사용자가 로그인되어 있는지 확인

---

## 📚 관련 문서

- [ADMIN_SETUP.md](./ADMIN_SETUP.md) - 관리자 계정 설정 상세 가이드
- [FIREBASE_SETUP_GUIDE.md](./FIREBASE_SETUP_GUIDE.md) - Firebase 연동 가이드
- [FIREBASE_SETUP_COMPLETE.md](./FIREBASE_SETUP_COMPLETE.md) - Firebase 연동 완료 가이드

---

## ✅ 체크리스트

로컬 개발 환경 설정이 완료되었는지 확인하세요:

- [ ] 의존성 설치 완료 (`npm install`)
- [ ] 개발 서버 실행 성공 (`npm run dev`)
- [ ] 브라우저에서 앱 접속 성공
- [ ] 회원가입 완료
- [ ] Firebase Console에서 UID 확인
- [ ] Firestore에 관리자 문서 생성 (`admins` 컬렉션)
- [ ] Firestore에 상점 문서 생성 (`store/default`)
- [ ] 관리자 페이지 접근 성공
- [ ] 상점 정보가 화면에 표시됨
- [ ] 메뉴 추가 테스트 성공

---

**모든 설정이 완료되면 앱을 사용할 수 있습니다! 🎉**

