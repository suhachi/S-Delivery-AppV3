# Firebase 연동 설정 가이드

이 프로젝트는 Firebase를 환경 변수로 관리하도록 설정되어 있습니다. 새로운 Firebase 프로젝트 정보를 설정하는 방법을 안내합니다.

## 📋 사전 준비

1. Firebase Console (https://console.firebase.google.com/)에서 새 프로젝트 생성
2. 웹 앱 추가 (프로젝트 설정 > 일반 > 내 앱 > 웹 앱 추가)

## 🔧 설정 방법

### 1. 환경 변수 파일 생성

프로젝트 루트 디렉토리에 `.env.local` 파일을 생성합니다.

```bash
# Windows PowerShell
Copy-Item .env.example .env.local

# 또는 직접 생성
New-Item -Path .env.local -ItemType File
```

### 2. Firebase 설정 정보 입력

`.env.local` 파일을 열고 Firebase Console에서 확인한 정보를 입력합니다:

```env
# Firebase 설정
VITE_FIREBASE_API_KEY=여기에_API_키_입력
VITE_FIREBASE_AUTH_DOMAIN=여기에_인증_도메인_입력
VITE_FIREBASE_PROJECT_ID=여기에_프로젝트_ID_입력
VITE_FIREBASE_STORAGE_BUCKET=여기에_스토리지_버킷_입력
VITE_FIREBASE_MESSAGING_SENDER_ID=여기에_메시징_발신자_ID_입력
VITE_FIREBASE_APP_ID=여기에_앱_ID_입력
VITE_FIREBASE_MEASUREMENT_ID=여기에_측정_ID_입력 (선택사항)
```

### 3. Firebase Console에서 정보 확인 방법

1. Firebase Console 접속
2. 프로젝트 선택
3. 프로젝트 설정 (⚙️ 아이콘) 클릭
4. "일반" 탭 선택
5. "내 앱" 섹션에서 웹 앱 선택
6. "SDK 설정 및 구성" 섹션에서 `firebaseConfig` 객체 확인

예시:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef",
  measurementId: "G-XXXXXXXXXX"
};
```

### 4. Firebase 서비스 활성화

프로젝트에서 사용할 Firebase 서비스를 활성화합니다:

#### Authentication (인증)
1. Firebase Console > Authentication
2. "시작하기" 클릭
3. 사용할 로그인 방법 활성화 (이메일/비밀번호 등)

#### Firestore Database (데이터베이스)
1. Firebase Console > Firestore Database
2. "데이터베이스 만들기" 클릭
3. 프로덕션 모드 또는 테스트 모드 선택
4. 위치 선택 (권장: asia-northeast3 - 서울)

#### Storage (파일 저장소)
1. Firebase Console > Storage
2. "시작하기" 클릭
3. 보안 규칙 설정 (초기에는 테스트 모드 가능)

### 5. 개발 서버 재시작

환경 변수 변경 후에는 개발 서버를 재시작해야 합니다:

```bash
# 개발 서버 중지 (Ctrl+C)
# 개발 서버 재시작
npm run dev
```

## ✅ 설정 확인

브라우저 콘솔을 열고 다음을 확인합니다:

1. 환경 변수 오류가 없는지 확인
2. Firebase 초기화가 성공했는지 확인
3. Authentication, Firestore, Storage 서비스가 정상 작동하는지 확인

## 🔒 보안 주의사항

- `.env.local` 파일은 **절대** Git에 커밋하지 마세요 (이미 `.gitignore`에 포함됨)
- Firebase API 키는 클라이언트에 노출되어도 안전하지만, 다른 민감한 정보는 포함하지 마세요
- 프로덕션 환경에서는 Firebase Console에서 도메인 제한을 설정하는 것을 권장합니다

## 📝 추가 설정 (선택사항)

### Nicepay 설정
결제 기능을 사용하는 경우:

```env
VITE_NICEPAY_CLIENT_ID=your-nicepay-client-id
VITE_NICEPAY_RETURN_URL=http://localhost:3000/nicepay/return
```

## 🆘 문제 해결

### 환경 변수가 읽히지 않는 경우
1. `.env.local` 파일이 프로젝트 루트에 있는지 확인
2. 변수명이 `VITE_`로 시작하는지 확인
3. 개발 서버를 재시작했는지 확인

### Firebase 초기화 오류
1. 모든 필수 환경 변수가 설정되었는지 확인
2. Firebase Console에서 프로젝트가 활성화되어 있는지 확인
3. 브라우저 콘솔의 오류 메시지 확인

## 📚 참고 자료

- [Firebase 공식 문서](https://firebase.google.com/docs)
- [Vite 환경 변수 가이드](https://vitejs.dev/guide/env-and-mode.html)

