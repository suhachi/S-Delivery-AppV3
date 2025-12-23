# 빠른 시작 가이드

Firebase 연동을 빠르게 시작하는 가이드입니다.

## 🚀 5분 안에 시작하기

### 1단계: 환경 변수 설정 (1분)

```bash
# .env 파일 생성
copy .env.example .env
```

`.env` 파일을 열고 Firebase Console에서 복사한 설정 값을 입력하세요.

### 2단계: Firebase 프로젝트 생성 (2분)

1. [Firebase Console](https://console.firebase.google.com) 접속
2. 프로젝트 추가
3. 웹 앱 추가 후 설정 정보 복사
4. `.env` 파일에 붙여넣기

### 3단계: Firebase 서비스 활성화 (1분)

Firebase Console에서:
- ✅ Authentication > 이메일/비밀번호 활성화
- ✅ Firestore Database > 프로덕션 모드로 생성
- ✅ Storage > 시작하기

### 4단계: 보안 규칙 설정 (1분)

Firebase Console에서:
- Firestore > 규칙 탭 > `src/firestore.rules` 내용 복사/붙여넣기 > 게시
- Storage > 규칙 탭 > `src/storage.rules` 내용 복사/붙여넣기 > 게시

### 5단계: 실행 및 테스트

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:5173` 접속하여 테스트하세요!

---

## 📚 상세 가이드

더 자세한 내용은 다음 문서를 참조하세요:

- [FIREBASE_SETUP_GUIDE.md](./FIREBASE_SETUP_GUIDE.md) - 상세한 Firebase 연동 가이드
- [FIREBASE_CHECKLIST.md](./FIREBASE_CHECKLIST.md) - 단계별 체크리스트
- [src/README_FIREBASE.md](./src/README_FIREBASE.md) - 기존 Firebase 문서

---

## ⚡ 주요 명령어

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# Firebase CLI 로그인
npm run firebase:login

# Firebase 프로젝트 초기화
npm run firebase:init

# Firebase 배포
npm run firebase:deploy

# Firestore 규칙만 배포
npm run firebase:deploy:firestore

# Storage 규칙만 배포
npm run firebase:deploy:storage

# Hosting만 배포
npm run firebase:deploy:hosting
```

---

## 🔧 문제 해결

### 환경 변수가 로드되지 않음
- `.env` 파일이 프로젝트 루트에 있는지 확인
- 개발 서버 재시작

### Firebase 연결 오류
- `.env` 파일의 값이 올바른지 확인
- Firebase Console에서 프로젝트 활성화 확인

### 권한 오류
- Firestore/Storage 보안 규칙이 배포되었는지 확인
- 관리자 권한이 올바르게 설정되었는지 확인

---

**더 자세한 내용은 [FIREBASE_SETUP_GUIDE.md](./FIREBASE_SETUP_GUIDE.md)를 참조하세요!**

