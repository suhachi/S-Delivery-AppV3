# 🚀 커스컴배달앱 설정 가이드

## 📦 설치

### 1. 의존성 설치
```bash
npm install
```

필요한 패키지:
- `react`, `react-dom` - React 프레임워크
- `react-router-dom` - 라우팅
- `firebase` - Firebase SDK
- `sonner` - 토스트 알림
- `lucide-react` - 아이콘
- `tailwindcss` - 스타일링

---

## 🔥 Firebase 설정

### 1단계: Firebase 프로젝트 생성
1. https://console.firebase.google.com 접속
2. 새 프로젝트 생성
3. 웹 앱 추가

### 2단계: 환경 변수 설정
```bash
# .env.example을 .env로 복사
cp .env.example .env
```

`.env` 파일에 Firebase 설정 입력:
```env
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

### 3단계: Firebase 서비스 활성화

#### Authentication
```
Firebase Console > Authentication > 시작하기
로그인 방법 > 이메일/비밀번호 활성화
```

#### Firestore Database
```
Firebase Console > Firestore Database > 데이터베이스 만들기
프로덕션 모드로 시작
위치: asia-northeast3 (서울)
```

#### Storage
```
Firebase Console > Storage > 시작하기
프로덕션 모드
위치: Firestore와 동일
```

### 4단계: 보안 규칙 배포
```bash
# Firebase CLI 설치
npm install -g firebase-tools

# Firebase 로그인
firebase login

# 프로젝트 초기화
firebase init

# 보안 규칙 배포
firebase deploy --only firestore:rules,storage
```

---

## 👨‍💼 관리자 설정

### Firestore에서 관리자 권한 부여

1. Firebase Console > Firestore Database
2. 컬렉션 시작 클릭
3. 컬렉션 ID: `admins`
4. 문서 추가:
   - 문서 ID: [관리자의 UID] (Authentication에서 확인)
   - 필드: `isAdmin` (boolean) = `true`
   - 필드: `updatedAt` (timestamp) = 현재 시간

### UID 확인 방법
```
Firebase Console > Authentication > 사용자 탭
원하는 사용자 클릭 > UID 복사
```

---

## 🏃 실행

### 개발 서버
```bash
npm run dev
```
→ http://localhost:3000

### 프로덕션 빌드
```bash
npm run build
```

### Firebase 배포
```bash
# 전체 배포
npm run deploy

# Hosting만
npm run deploy:hosting
```

---

## 📁 프로젝트 구조

```
custom-delivery-app/
├── public/                 # 정적 파일
├── src/
│   ├── components/         # React 컴포넌트
│   │   ├── admin/         # 관리자 컴포넌트
│   │   ├── common/        # 공통 컴포넌트
│   │   └── menu/          # 메뉴 컴포넌트
│   ├── contexts/          # React Context
│   ├── data/              # 목 데이터
│   ├── hooks/             # Custom Hooks
│   ├── lib/               # Firebase 설정
│   ├── pages/             # 페이지 컴포넌트
│   ├── services/          # API 서비스
│   ├── styles/            # 스타일
│   ├── types/             # TypeScript 타입
│   └── App.tsx            # 메인 앱
├── firestore.rules        # Firestore 보안 규칙
├── firestore.indexes.json # Firestore 인덱스
├── storage.rules          # Storage 보안 규칙
├── firebase.json          # Firebase 설정
└── .env                   # 환경 변수 (생성 필요)
```

---

## 🎯 주요 기능

### 사용자
- ✅ 회원가입 / 로그인
- ✅ 메뉴 탐색 및 검색
- ✅ 장바구니 관리
- ✅ 주문 생성
- ✅ 주문 내역 조회

### 관리자
- ✅ 통계 대시보드
- ✅ 메뉴 관리 (추가, 수정, 삭제, 품절 처리)
- ✅ 주문 관리 (상태 변경)
- ✅ 쿠폰 관리

---

## 🔧 문제 해결

### "Permission denied" 오류
→ Firestore/Storage 보안 규칙 확인 및 배포

### 관리자 페이지 접근 불가
→ Firestore > admins 컬렉션에 UID 정확히 등록되었는지 확인

### Firebase 연결 실패
→ `.env` 파일 생성 및 올바른 값 입력 확인

### 빌드 오류
→ `node_modules` 삭제 후 재설치
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 추가 자료

- [README_FIREBASE.md](./README_FIREBASE.md) - 상세한 Firebase 연동 가이드
- [Firebase 공식 문서](https://firebase.google.com/docs)
- [React 공식 문서](https://react.dev)
- [Tailwind CSS 문서](https://tailwindcss.com)

---

## 🤝 지원

문제가 발생하면 다음을 확인하세요:
1. `.env` 파일이 올바르게 설정되었는지
2. Firebase 서비스가 모두 활성화되었는지
3. 보안 규칙이 배포되었는지
4. 관리자 권한이 올바르게 설정되었는지

---

**Happy Coding! 🎉**
