# My-Pho-App 개발 프롬프트 가이드 - 마스터 인덱스

## 📚 문서 구성

이 가이드는 my-pho-app을 처음부터 완성까지 개발하기 위한 **원자 단위 프롬프트**를 제공합니다.

### 문서 목록
1. **prompts_part1.md** - Phase 1~5 (기본 기능)
2. **prompts_part2.md** - Phase 6~12 (고급 기능 및 배포)
3. **이 문서** - 마스터 인덱스 및 실행 가이드

---

## 🎯 전체 개발 로드맵

### 총 프롬프트 수: 60개
### 예상 개발 기간: 1-2주 (1인 개발자 기준)

```
Phase 1: 프로젝트 초기 설정 (5 prompts) ⏱ 2-3시간
  └─ React 프로젝트 생성, Firebase 설정, 폴더 구조

Phase 2: 사용자 인증 (5 prompts) ⏱ 4-6시간
  └─ 로그인, 회원가입, 관리자 권한

Phase 3: 메뉴 관리 (5 prompts) ⏱ 6-8시간
  └─ 메뉴 CRUD, 카테고리, 옵션

Phase 4: 주문 시스템 (5 prompts) ⏱ 8-10시간
  └─ 장바구니, 주문 생성, 주문 목록

Phase 5: 관리자 기능 (5 prompts) ⏱ 6-8시간
  └─ 대시보드, 주문 관리, 실시간 알림

Phase 6: 푸시 알림 (7 prompts) ⏱ 8-12시간
  └─ FCM 설정, Service Worker, Cloud Functions

Phase 7: 리뷰 시스템 (3 prompts) ⏱ 3-4시간
  └─ 리뷰 작성, 수정, 목록

Phase 8: 공지사항 (4 prompts) ⏱ 3-4시간
  └─ 공지 CRUD, 팝업

Phase 9: 이벤트 배너 (3 prompts) ⏱ 2-3시간
  └─ 이벤트 관리, 배너 표시

Phase 10: 유틸리티 (3 prompts) ⏱ 1-2시간
  └─ 날짜 포맷, 라벨, 안전 스냅샷

Phase 11: 공통 컴포넌트 (4 prompts) ⏱ 3-4시간
  └─ 웰컴 페이지, TopBar, 알림 가이드

Phase 12: 배포 (5 prompts) ⏱ 2-3시간
  └─ Firebase 설정, 빌드, 배포
```

---

## 🚀 빠른 시작 가이드

### 1단계: 환경 준비
```bash
# Node.js 설치 확인 (v14 이상)
node --version

# Firebase CLI 설치
npm install -g firebase-tools

# Firebase 로그인
firebase login
```

### 2단계: 프롬프트 실행 순서

#### ⚠️ 중요: 반드시 순서대로 진행하세요!

1. **Phase 1 완료** → Firebase 프로젝트 생성 필수
2. **Phase 2 완료** → 테스트 계정 생성
3. **Phase 3 완료** → 샘플 메뉴 데이터 추가
4. **Phase 4 완료** → 주문 테스트
5. **Phase 5 완료** → 관리자 계정 설정 (Firestore에서 수동)
6. **Phase 6 완료** → FCM 설정 및 HTTPS 환경 필요
7. **Phase 7-11** → 순서 무관 (병렬 가능)
8. **Phase 12** → 최종 배포

---

## 📋 프롬프트 실행 체크리스트

### Phase 1: 프로젝트 초기 설정 ✅
- [ ] 1-1: React 프로젝트 생성
- [ ] 1-2: 필수 의존성 설치
- [ ] 1-3: Firebase 프로젝트 설정
- [ ] 1-4: 폴더 구조 생성
- [ ] 1-5: 기본 라우팅 설정

### Phase 2: 사용자 인증 ✅
- [ ] 2-1: Firebase Authentication 설정
- [ ] 2-2: 로그인 컴포넌트
- [ ] 2-3: 회원가입 컴포넌트
- [ ] 2-4: 사용자 문서 자동 생성 훅
- [ ] 2-5: 관리자 권한 시스템

### Phase 3: 메뉴 관리 ✅
- [ ] 3-1: Firestore 메뉴 스키마
- [ ] 3-2: 카테고리 바
- [ ] 3-3: 메뉴 카드
- [ ] 3-4: 메뉴 목록
- [ ] 3-5: 메뉴 등록/수정 폼

### Phase 4: 주문 시스템 ✅
- [ ] 4-1: 장바구니 Context
- [ ] 4-2: 장바구니 페이지
- [ ] 4-3: 주문/결제 페이지
- [ ] 4-4: Firestore 주문 스키마
- [ ] 4-5: 내 주문 목록

### Phase 5: 관리자 기능 ✅
- [ ] 5-1: 관리자 대시보드
- [ ] 5-2: 주문 관리 페이지
- [ ] 5-3: 실시간 주문 알림
- [ ] 5-4: 메뉴 관리 페이지
- [ ] 5-5: 쿠폰 관리

### Phase 6: 푸시 알림 ✅
- [ ] 6-1: FCM 설정
- [ ] 6-2: FCM 초기화 파일
- [ ] 6-3: Service Worker
- [ ] 6-4: FCM 토큰 관리
- [ ] 6-5: 알림 핸들러
- [ ] 6-6: Firebase Functions API
- [ ] 6-7: 관리자 푸시 발송 UI

### Phase 7: 리뷰 시스템 ✅
- [ ] 7-1: Firestore 리뷰 스키마
- [ ] 7-2: 리뷰 작성 폼
- [ ] 7-3: 리뷰 목록

### Phase 8: 공지사항 ✅
- [ ] 8-1: Firestore 공지사항 스키마
- [ ] 8-2: 공지사항 관리
- [ ] 8-3: 공지사항 목록
- [ ] 8-4: 공지사항 팝업

### Phase 9: 이벤트 배너 ✅
- [ ] 9-1: Firestore 이벤트 스키마
- [ ] 9-2: 이벤트 배너 컴포넌트
- [ ] 9-3: 이벤트 관리

### Phase 10: 유틸리티 ✅
- [ ] 10-1: 날짜 포맷 유틸
- [ ] 10-2: 라벨 관리
- [ ] 10-3: Firestore 안전 스냅샷

### Phase 11: 공통 컴포넌트 ✅
- [ ] 11-1: 웰컴 페이지
- [ ] 11-2: TopBar
- [ ] 11-3: 관리자 메뉴 바
- [ ] 11-4: 알림 가이드

### Phase 12: 배포 ✅
- [ ] 12-1: Firebase Hosting 설정
- [ ] 12-2: Firestore 인덱스
- [ ] 12-3: 환경변수 템플릿
- [ ] 12-4: 빌드 및 배포 스크립트
- [ ] 12-5: README 작성

---

## 🔗 의존성 관계

### 필수 선행 작업

| 프롬프트 | 선행 필요 |
|---------|----------|
| 2-x (인증) | 1-3 (Firebase 설정) |
| 3-x (메뉴) | 1-3, 2-5 (관리자 권한) |
| 4-x (주문) | 2-x, 3-x, 4-1 (Cart Context) |
| 5-x (관리자) | 2-5, 4-4 (주문 스키마) |
| 6-x (푸시) | 1-3, 2-x |
| 7-x (리뷰) | 4-4 (주문 스키마) |
| 11-1 (웰컴) | 2-x, 9-2 (이벤트 배너) |
| 12-x (배포) | 모든 Phase 완료 |

---

## 💡 프롬프트 사용 팁

### 1. 프롬프트 복사 방법
```
각 프롬프트를 AI 어시스턴트에게 그대로 복사하여 전달하세요.
프롬프트는 독립적으로 실행 가능하도록 설계되었습니다.
```

### 2. 프롬프트 커스터마이징
```
필요에 따라 프롬프트를 수정할 수 있습니다:
- 카테고리 변경 (3-2)
- 주문 상태 추가 (4-4)
- 결제 방법 변경 (4-3)
- 알림 메시지 커스터마이징 (6-x)
```

### 3. 에러 발생 시
```
1. Firebase 설정 확인 (.env 파일)
2. 의존성 설치 확인 (npm install)
3. Firestore 보안 규칙 확인
4. 관리자 권한 확인 (admins 컬렉션)
```

---

## 🎨 디자인 제외 이유

이 가이드는 **기능 구현에만 집중**합니다:
- 각 컴포넌트는 기본 스타일만 포함
- 인라인 스타일 또는 최소한의 CSS
- 디자인은 나중에 일괄 적용 권장

### 디자인 적용 시점
```
1. 모든 기능 구현 완료 후
2. CSS 변수 또는 테마 시스템 도입
3. 컴포넌트 라이브러리 적용 (선택)
4. 디자인 시스템 구축
```

---

## 📊 Firestore 데이터 구조 요약

### 컬렉션 목록
```
users/          - 사용자 정보
admins/         - 관리자 권한
menus/          - 메뉴
orders/         - 주문
reviews/        - 리뷰
notices/        - 공지사항
events/         - 이벤트
coupons/        - 쿠폰
pushTokens/     - FCM 토큰
pushLogs/       - 푸시 로그
```

### 주요 관계
```
orders.userId → users.uid
reviews.orderId → orders.id
reviews.userId → users.uid
pushTokens.uid → users.uid
```

---

## 🔐 보안 체크리스트

### Firebase 설정
- [ ] .env 파일을 .gitignore에 추가
- [ ] API 키 노출 방지
- [ ] Firestore 보안 규칙 배포
- [ ] Firebase Functions 환경변수 설정

### 관리자 권한
- [ ] admins 컬렉션에 UID 수동 추가
- [ ] 보안 규칙에서 쓰기 금지
- [ ] 관리자 페이지 접근 제어

### 데이터 보호
- [ ] 사용자는 본인 데이터만 접근
- [ ] 주문은 관리자만 조회
- [ ] 리뷰는 작성자만 수정/삭제

---

## 🧪 테스트 가이드

### 기능별 테스트 시나리오

#### 1. 인증 테스트
```
1. 회원가입 → 이메일 중복 확인
2. 로그인 → 잘못된 비밀번호
3. 로그아웃 → 상태 초기화
```

#### 2. 메뉴 테스트
```
1. 카테고리 필터링
2. 옵션 선택
3. 품절 처리 (관리자)
```

#### 3. 주문 테스트
```
1. 장바구니 추가/삭제
2. 주문 생성 (배달/포장)
3. 주문 상태 변경 (관리자)
```

#### 4. 푸시 알림 테스트
```
1. 알림 권한 요청
2. 포그라운드 알림
3. 백그라운드 알림
4. 알림 클릭 → 페이지 이동
```

---

## 🚀 배포 가이드

### 개발 환경
```bash
npm start
# http://localhost:3000
```

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

# Functions만
npm run deploy:functions

# 보안 규칙만
npm run deploy:rules
```

### 배포 후 확인 사항
- [ ] 모든 페이지 접근 가능
- [ ] Firebase 서비스 연동 확인
- [ ] 푸시 알림 작동 (HTTPS 필요)
- [ ] 관리자 기능 정상 작동

---

## 📞 문제 해결

### 자주 발생하는 오류

#### 1. Firebase 초기화 오류
```
원인: .env 파일 설정 오류
해결: Firebase 프로젝트 설정에서 API 키 재확인
```

#### 2. Firestore 권한 오류
```
원인: 보안 규칙 미배포 또는 잘못된 규칙
해결: firestore.rules 확인 후 재배포
```

#### 3. FCM 토큰 발급 실패
```
원인: VAPID 키 미설정 또는 HTTP 환경
해결: .env에 VAPID 키 추가, HTTPS 사용
```

#### 4. 관리자 페이지 접근 불가
```
원인: admins 컬렉션에 UID 미등록
해결: Firestore 콘솔에서 수동 추가
```

---

## 🎓 학습 리소스

### Firebase 공식 문서
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Cloud Firestore](https://firebase.google.com/docs/firestore)
- [Cloud Functions](https://firebase.google.com/docs/functions)
- [Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)

### React 공식 문서
- [React Hooks](https://react.dev/reference/react)
- [React Router](https://reactrouter.com/)
- [Context API](https://react.dev/reference/react/useContext)

---

## 📝 개발 노트

### 코드 컨벤션
```javascript
// 컴포넌트명: PascalCase
function MenuCard() {}

// 파일명: PascalCase.js
MenuCard.js

// 변수/함수: camelCase
const handleClick = () => {}

// 상수: UPPER_SNAKE_CASE
const ORDER_STATUS_LABELS = {}
```

### 폴더 구조 규칙
```
components/     - 재사용 가능한 UI 컴포넌트
pages/          - 페이지 컴포넌트
hooks/          - 커스텀 훅
contexts/       - Context API
utils/          - 유틸리티 함수
lib/            - 외부 라이브러리 래퍼
```

---

## ✨ 다음 단계

### 기능 확장 아이디어
1. **쿠폰 적용 로직** 구현
2. **포인트 시스템** 추가
3. **배달 추적** 기능
4. **실시간 채팅** (고객-관리자)
5. **통계 대시보드** 강화
6. **이미지 업로드** (Firebase Storage)
7. **결제 게이트웨이** 연동

### 성능 최적화
1. **코드 스플리팅** (React.lazy)
2. **메모이제이션** (React.memo, useMemo)
3. **이미지 최적화** (WebP, CDN)
4. **Firestore 쿼리 최적화**

### 코드 품질 개선
1. **TypeScript** 도입
2. **ESLint** 설정
3. **Prettier** 설정
4. **테스트 코드** 작성 (Jest, React Testing Library)

---

## 🎉 완료 후

모든 프롬프트를 완료했다면:

1. ✅ **기능 테스트** 완료
2. ✅ **배포** 완료
3. ✅ **문서화** 완료
4. 🎨 **디자인 적용** 시작!

---

**Happy Coding!** 🚀

---

## 📄 라이센스 및 크레딧

이 가이드는 my-pho-app 프로젝트 분석을 기반으로 작성되었습니다.

**작성일**: 2025-12-04  
**버전**: 1.0  
**작성자**: AI Assistant
