# Firebase 연동 다음 단계

Firebase 프로젝트 설정이 완료되었습니다! 이제 다음 단계를 진행하세요.

## ✅ 완료된 작업

- [x] Firebase 프로젝트 생성
- [x] 웹 앱 등록
- [x] `.env` 파일 생성 및 설정 값 입력
- [x] VAPID 키 확인

## ⚠️ 필수 작업 (지금 해야 할 일)

### 1. Firestore 보안 규칙 배포 (중요!)

현재 Firestore에 임시 규칙(2026년 1월 5일까지)이 설정되어 있습니다. 실제 보안 규칙을 배포해야 합니다.

#### 방법 A: Firebase Console에서 직접 배포 (권장)

1. [Firebase Console](https://console.firebase.google.com) 접속
2. 프로젝트 선택: `simple-delivery-app-9d347`
3. **Firestore Database** > **규칙** 탭 클릭
4. `src/firestore.rules` 파일을 열어서 전체 내용 복사
5. Firebase Console의 규칙 편집기에 붙여넣기
6. **게시** 버튼 클릭

#### 방법 B: Firebase CLI 사용

```bash
# Firebase CLI 설치 (아직 안 했다면)
npm install -g firebase-tools

# Firebase 로그인
firebase login

# 프로젝트 연결
firebase use simple-delivery-app-9d347

# Firestore 규칙 배포
firebase deploy --only firestore:rules
```

### 2. Storage 보안 규칙 배포 (중요!)

1. Firebase Console > **Storage** > **규칙** 탭 클릭
2. `src/storage.rules` 파일을 열어서 전체 내용 복사
3. Firebase Console의 규칙 편집기에 붙여넣기
4. **게시** 버튼 클릭

또는 Firebase CLI:
```bash
firebase deploy --only storage
```

### 3. Firebase 서비스 활성화 확인

다음 서비스들이 활성화되어 있는지 확인하세요:

- [ ] **Authentication** - 이메일/비밀번호 제공업체 활성화
  - Firebase Console > Authentication > 로그인 방법
  - 이메일/비밀번호 > 사용 설정

- [ ] **Firestore Database** - 데이터베이스 생성 완료
  - Firebase Console > Firestore Database
  - 데이터베이스가 생성되어 있는지 확인

- [ ] **Storage** - Storage 활성화 완료
  - Firebase Console > Storage
  - Storage가 활성화되어 있는지 확인

## 🧪 테스트

### 1. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

### 2. 기본 기능 테스트

- [ ] 회원가입 테스트
  - `/signup` 페이지에서 계정 생성
  - Firebase Console > Authentication에서 사용자 확인

- [ ] 로그인 테스트
  - `/login` 페이지에서 로그인
  - 로그인 성공 확인

- [ ] 관리자 권한 설정
  - Firebase Console > Authentication에서 사용자 UID 복사
  - Firebase Console > Firestore Database > 데이터 탭
  - 컬렉션 시작 > 컬렉션 ID: `admins`
  - 문서 ID: 사용자 UID 입력
  - 필드 추가:
    - `isAdmin` (boolean): `true`
    - `createdAt` (timestamp): 현재 시간
  - 저장

- [ ] 관리자 페이지 접근 테스트
  - 관리자로 로그인 후 `/admin` 접속
  - 관리자 페이지가 정상적으로 표시되는지 확인

- [ ] 메뉴 추가 테스트 (관리자)
  - 관리자 페이지 > 메뉴 관리
  - 메뉴 추가 및 이미지 업로드
  - Firebase Console > Firestore에서 데이터 확인
  - Firebase Console > Storage에서 이미지 확인

## 📋 체크리스트

### 필수 작업
- [ ] Firestore 보안 규칙 배포
- [ ] Storage 보안 규칙 배포
- [ ] Authentication 이메일/비밀번호 활성화
- [ ] 관리자 계정 생성 (Firestore > admins 컬렉션)
- [ ] 개발 서버 실행 및 테스트

### 선택 작업
- [ ] Firestore 인덱스 배포 (`src/firestore.indexes.json`)
- [ ] 초기 상점 데이터 생성 (`/store-setup` 페이지 사용)
- [ ] 초기 메뉴 데이터 추가
- [ ] Firebase Hosting 배포 준비

## 🚨 주의사항

1. **보안 규칙은 반드시 배포해야 합니다!**
   - 현재 임시 규칙은 2026년 1월 5일까지만 유효합니다
   - 그 이후에는 모든 접근이 차단됩니다

2. **관리자 권한 설정**
   - 관리자로 사용할 계정의 UID를 정확히 입력해야 합니다
   - Authentication에서 UID를 확인하세요

3. **환경 변수**
   - `.env` 파일은 Git에 커밋되지 않습니다 (`.gitignore`에 포함)
   - 프로덕션 배포 시 배포 플랫폼의 환경 변수 설정을 사용하세요

## 📚 참고 문서

- [FIREBASE_SETUP_GUIDE.md](./FIREBASE_SETUP_GUIDE.md) - 상세한 Firebase 연동 가이드
- [FIREBASE_CHECKLIST.md](./FIREBASE_CHECKLIST.md) - 단계별 체크리스트
- [FIREBASE_CONFIG.md](./FIREBASE_CONFIG.md) - Firebase 설정 정보
- [QUICK_START.md](./QUICK_START.md) - 빠른 시작 가이드

## 🆘 문제 해결

### "Permission denied" 오류
→ Firestore 또는 Storage 보안 규칙이 배포되었는지 확인

### 관리자 페이지 접근 불가
→ Firestore > admins 컬렉션에 사용자 UID가 정확히 등록되었는지 확인

### 이미지 업로드 실패
→ Storage 보안 규칙과 Storage 활성화 여부 확인

### Firebase 연결 오류
→ `.env` 파일이 올바르게 생성되었는지 확인
→ 개발 서버 재시작

---

**다음 단계: Firestore 보안 규칙 배포부터 시작하세요!** 🔥

