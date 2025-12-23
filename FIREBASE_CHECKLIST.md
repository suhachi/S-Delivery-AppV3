# Firebase 연동 체크리스트

이 체크리스트를 따라 Firebase 연동을 완료하세요.

## 📋 사전 준비

- [ ] Firebase 계정 생성 (Google 계정 필요)
- [ ] Node.js 및 npm 설치 확인
- [ ] 프로젝트 의존성 설치 (`npm install`)

---

## 1단계: Firebase 프로젝트 생성

- [ ] [Firebase Console](https://console.firebase.google.com) 접속
- [ ] 새 프로젝트 생성
  - 프로젝트 이름: `simple-delivery-app` (또는 원하는 이름)
  - Google Analytics 설정 (선택사항)
- [ ] 웹 앱 추가
  - 앱 닉네임 입력
  - Firebase Hosting 설정 (선택사항)

---

## 2단계: 환경 변수 설정

- [ ] `.env.example` 파일 확인
- [ ] `.env` 파일 생성 (`.env.example` 복사)
- [ ] Firebase Console에서 설정 정보 복사
  - 프로젝트 설정 > 일반 > 내 앱 > SDK 설정 및 구성
- [ ] `.env` 파일에 값 입력:
  - [ ] `VITE_FIREBASE_API_KEY`
  - [ ] `VITE_FIREBASE_AUTH_DOMAIN`
  - [ ] `VITE_FIREBASE_PROJECT_ID`
  - [ ] `VITE_FIREBASE_STORAGE_BUCKET`
  - [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - [ ] `VITE_FIREBASE_APP_ID`
  - [ ] `VITE_FIREBASE_MEASUREMENT_ID` (선택사항)

---

## 3단계: Firebase 서비스 활성화

### Authentication (인증)
- [ ] Firebase Console > Authentication 메뉴로 이동
- [ ] "시작하기" 클릭
- [ ] 이메일/비밀번호 제공업체 활성화
  - 이메일/비밀번호 클릭
  - 사용 설정 토글 활성화
  - 저장

### Firestore Database (데이터베이스)
- [ ] Firebase Console > Firestore Database 메뉴로 이동
- [ ] "데이터베이스 만들기" 클릭
- [ ] 프로덕션 모드 선택
- [ ] 위치 선택 (권장: `asia-northeast3` - 서울)
- [ ] 사용 설정 완료

### Storage (파일 저장소)
- [ ] Firebase Console > Storage 메뉴로 이동
- [ ] "시작하기" 클릭
- [ ] 보안 규칙 확인 후 다음 클릭
- [ ] 위치 선택 (Firestore와 동일한 위치 권장)
- [ ] 완료

### Cloud Messaging (선택사항)
- [ ] Firebase Console > Cloud Messaging 메뉴로 이동
- [ ] 클라우드 메시징 API (V1) 활성화 (필요한 경우)

---

## 4단계: 보안 규칙 설정

### Firestore 보안 규칙
- [ ] Firebase Console > Firestore Database > 규칙 탭으로 이동
- [ ] `src/firestore.rules` 파일 내용 확인
- [ ] 규칙 편집기에 내용 복사/붙여넣기
- [ ] "게시" 클릭

또는 Firebase CLI 사용:
- [ ] Firebase CLI 설치 (`npm install -g firebase-tools`)
- [ ] Firebase 로그인 (`firebase login`)
- [ ] 프로젝트 초기화 (`firebase init`)
- [ ] 규칙 배포 (`firebase deploy --only firestore:rules`)

### Storage 보안 규칙
- [ ] Firebase Console > Storage > 규칙 탭으로 이동
- [ ] `src/storage.rules` 파일 내용 확인
- [ ] 규칙 편집기에 내용 복사/붙여넣기
- [ ] "게시" 클릭

또는 Firebase CLI 사용:
- [ ] Storage 규칙 배포 (`firebase deploy --only storage`)

---

## 5단계: Firestore 인덱스 설정

- [ ] Firebase Console > Firestore Database > 인덱스 탭으로 이동
- [ ] `src/firestore.indexes.json` 파일 확인
- [ ] 필요한 인덱스가 자동으로 생성되는지 확인
- [ ] 또는 Firebase CLI로 배포:
  ```bash
  firebase deploy --only firestore:indexes
  ```

---

## 6단계: 초기 데이터 설정

### 관리자 계정 생성
- [ ] 앱에서 회원가입 또는 Firebase Console > Authentication에서 사용자 생성
- [ ] 생성된 사용자의 UID 복사
- [ ] Firebase Console > Firestore Database > 데이터 탭으로 이동
- [ ] 컬렉션 시작 클릭
- [ ] 컬렉션 ID: `admins` 입력
- [ ] 문서 ID: 사용자 UID 입력
- [ ] 필드 추가:
  - `isAdmin` (boolean): `true`
  - `createdAt` (timestamp): 현재 시간
- [ ] 저장

### 초기 상점 데이터 (선택사항)
- [ ] 앱 실행 후 관리자로 로그인
- [ ] `/store-setup` 페이지로 이동
- [ ] 상점 정보 입력 및 생성

또는 Firestore에서 직접 생성:
- [ ] 컬렉션: `store`
- [ ] 문서 ID: `default`
- [ ] 필드 입력 (필수 필드 확인)

---

## 7단계: 로컬 테스트

- [ ] 개발 서버 실행 (`npm run dev`)
- [ ] 브라우저에서 `http://localhost:5173` 접속
- [ ] 개발자 도구 콘솔 확인 (오류 없음)
- [ ] 회원가입 테스트
- [ ] 로그인 테스트
- [ ] Firebase Console에서 사용자 확인
- [ ] 관리자 페이지 접근 테스트
- [ ] 메뉴 추가 테스트 (관리자)
- [ ] 이미지 업로드 테스트 (관리자)
- [ ] 주문 생성 테스트 (사용자)

---

## 8단계: 문제 해결

### 환경 변수 관련
- [ ] `.env` 파일이 프로젝트 루트에 있는지 확인
- [ ] 파일 이름이 정확히 `.env`인지 확인 (`.env.txt` 아님)
- [ ] 개발 서버 재시작

### Firebase 연결 관련
- [ ] `.env` 파일의 값이 올바른지 확인
- [ ] Firebase Console에서 프로젝트가 활성화되어 있는지 확인
- [ ] 브라우저 콘솔의 오류 메시지 확인

### 권한 관련
- [ ] Firestore 보안 규칙이 배포되었는지 확인
- [ ] Storage 보안 규칙이 배포되었는지 확인
- [ ] 사용자가 로그인되어 있는지 확인
- [ ] 관리자 권한이 올바르게 설정되었는지 확인

### 인덱스 관련
- [ ] Firestore 인덱스가 생성되었는지 확인
- [ ] 복합 쿼리 사용 시 인덱스 오류 메시지 확인
- [ ] Firebase Console에서 인덱스 자동 생성 링크 클릭

---

## 9단계: 프로덕션 준비 (선택사항)

### Firebase Hosting 설정
- [ ] Firebase CLI 설치 및 로그인
- [ ] Firebase 프로젝트 초기화 (`firebase init`)
- [ ] Hosting 선택
- [ ] Public directory: `dist` 설정
- [ ] Single-page app: Yes
- [ ] 빌드 스크립트 확인 (`npm run build`)

### 환경 변수 설정
- [ ] 배포 플랫폼의 환경 변수 설정 확인
- [ ] 프로덕션 환경 변수 입력

### 배포 테스트
- [ ] 로컬 빌드 테스트 (`npm run build`)
- [ ] Firebase Hosting 배포 (`firebase deploy --only hosting`)
- [ ] 배포된 사이트에서 기능 테스트

---

## ✅ 완료 확인

모든 체크리스트를 완료했다면:

- [ ] 앱이 정상적으로 실행되는가?
- [ ] 사용자 인증이 작동하는가?
- [ ] 관리자 페이지에 접근할 수 있는가?
- [ ] 데이터가 Firestore에 저장되는가?
- [ ] 이미지가 Storage에 업로드되는가?
- [ ] 보안 규칙이 올바르게 작동하는가?

---

## 📚 참고 문서

- [FIREBASE_SETUP_GUIDE.md](./FIREBASE_SETUP_GUIDE.md) - 상세한 Firebase 연동 가이드
- [src/README_FIREBASE.md](./src/README_FIREBASE.md) - 기존 Firebase 문서
- [Firebase 공식 문서](https://firebase.google.com/docs)

---

## 🆘 도움이 필요하신가요?

문제가 발생하면:
1. 브라우저 콘솔의 오류 메시지 확인
2. Firebase Console의 로그 확인
3. `FIREBASE_SETUP_GUIDE.md`의 문제 해결 섹션 참조

---

**모든 체크리스트를 완료하면 Firebase 연동이 완료됩니다! 🎉**

