# 방식 B 최종 프롬프트 - Prompt B-5

## Prompt B-5: 배포 및 도메인 연결 가이드

```
docs/store-setup/05-deployment.md 파일을 생성해줘:

# Firebase Hosting 배포 및 도메인 연결 가이드

## 소요 시간: 약 30-40분

## 사전 준비
- ✅ 템플릿 앱 설정 완료 (04-app-setup.md)
- ✅ 로컬 테스트 성공
- ✅ Firebase CLI 로그인 완료

---

## Step 1: 프로덕션 빌드

### 1-1. 빌드 명령어 실행
```bash
npm run build
```

**진행 과정**:
```
Creating an optimized production build...
Compiled successfully.

File sizes after gzip:

  50.12 KB  build/static/js/main.abc123.js
  1.78 KB   build/static/css/main.def456.css

The build folder is ready to be deployed.
```

**소요 시간**: 1-3분

### 1-2. 빌드 결과 확인
```bash
dir build    # Windows
ls build     # Mac/Linux
```

**예상 출력**:
```
build/
├─ static/
│  ├─ css/
│  ├─ js/
│  └─ media/
├─ index.html
└─ ...
```

**완료**: 프로덕션 빌드 완료 ✅

---

## Step 2: Firebase 초기화

### 2-1. Firebase 초기화 명령어
```bash
firebase init
```

### 2-2. 기능 선택
```
? Which Firebase features do you want to set up?
(Press Space to select, Enter to confirm)

◯ Realtime Database
◯ Firestore
◯ Functions
◉ Hosting
◯ Storage
◯ Emulators
```

**선택**:
- Space 키로 **Hosting** 선택 (◉)
- **Firestore**, **Functions**도 선택 (나중에 규칙 배포용)
- Enter 키로 확인

**최종 선택**:
```
◉ Firestore
◉ Functions
◉ Hosting
```

### 2-3. 프로젝트 선택
```
? Please select an option:
  ❯ Use an existing project
    Create a new project
    Add Firebase to an existing Google Cloud Platform project
```

**선택**: Use an existing project → Enter

```
? Select a default Firebase project:
  ❯ daebak-delivery (대박마라탕 배달앱)
    other-project
```

**선택**: daebak-delivery → Enter

### 2-4. Firestore 규칙 설정
```
? What file should be used for Firestore Rules?
  (firestore.rules)
```

**입력**: Enter (기본값 사용)

```
? What file should be used for Firestore indexes?
  (firestore.indexes.json)
```

**입력**: Enter (기본값 사용)

### 2-5. Functions 설정
```
? What language would you like to use to write Cloud Functions?
  ❯ JavaScript
    TypeScript
```

**선택**: JavaScript → Enter (또는 TypeScript)

```
? Do you want to use ESLint?
```

**입력**: N → Enter (선택 사항)

```
? Do you want to install dependencies with npm now?
```

**입력**: Y → Enter

### 2-6. Hosting 설정
```
? What do you want to use as your public directory?
  (public)
```

**중요**: `build` 입력 → Enter

```
? Configure as a single-page app (rewrite all urls to /index.html)?
```

**입력**: Y → Enter

```
? Set up automatic builds and deploys with GitHub?
```

**입력**: N → Enter

```
? File build/index.html already exists. Overwrite?
```

**입력**: N → Enter (덮어쓰지 않음)

**완료**: Firebase 초기화 완료 ✅

---

## Step 3: Firebase 배포

### 3-1. 전체 배포 명령어
```bash
firebase deploy
```

**진행 과정**:
```
=== Deploying to 'daebak-delivery'...

i  deploying firestore, functions, hosting
i  firestore: checking firestore.rules for compilation errors...
✔  firestore: rules file firestore.rules compiled successfully
i  functions: ensuring required API cloudfunctions.googleapis.com is enabled...
✔  functions: required API cloudfunctions.googleapis.com is enabled
i  functions: preparing functions directory for uploading...
i  hosting[daebak-delivery]: beginning deploy...
i  hosting[daebak-delivery]: found 20 files in build
✔  hosting[daebak-delivery]: file upload complete
i  hosting[daebak-delivery]: finalizing version...
✔  hosting[daebak-delivery]: version finalized
i  hosting[daebak-delivery]: releasing new version...
✔  hosting[daebak-delivery]: release complete

✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/daebak-delivery/overview
Hosting URL: https://daebak-delivery.web.app
```

**소요 시간**: 2-5분

### 3-2. 배포 URL 확인
배포 완료 후 표시되는 URL:
```
Hosting URL: https://daebak-delivery.web.app
```

브라우저에서 접속하여 확인!

**완료**: Firebase Hosting 배포 완료 ✅

---

## Step 4: 플랫폼 운영자에게 도메인 연결 요청

### 4-1. 도메인 연결 요청 정보 준비

다음 정보를 플랫폼 운영자에게 전달:

```
상점명: 대박마라탕
희망 서브도메인: daebak
Firebase Hosting URL: daebak-delivery.web.app
연락처: 010-1234-5678
이메일: daebak@example.com
```

### 4-2. 요청 방법

**방법 A: 이메일**
```
받는 사람: platform@myplatform.com
제목: 도메인 연결 요청 - 대박마라탕

안녕하세요,

배달앱 도메인 연결을 요청합니다.

- 상점명: 대박마라탕
- 희망 서브도메인: daebak
- Firebase Hosting URL: daebak-delivery.web.app
- 연락처: 010-1234-5678

감사합니다.
```

**방법 B: 웹 폼**
플랫폼 운영자가 제공하는 도메인 신청 폼 작성

### 4-3. 플랫폼 운영자 작업 대기

플랫폼 운영자가 DNS 설정을 완료하면 이메일로 알림:
```
제목: 도메인 연결 완료 - daebak.myplatform.com

도메인 연결이 완료되었습니다.

도메인: daebak.myplatform.com
상태: DNS 설정 완료

다음 단계를 진행해주세요:
1. Firebase Console에서 커스텀 도메인 추가
2. 소유권 확인
3. SSL 인증서 발급 대기

자세한 내용은 첨부된 가이드를 참조하세요.
```

---

## Step 5: Firebase에서 커스텀 도메인 추가

### 5-1. Firebase Console 접속
1. https://console.firebase.google.com
2. daebak-delivery 프로젝트 선택
3. 좌측 메뉴 [Hosting] 클릭

### 5-2. 커스텀 도메인 추가
1. [도메인 추가] 버튼 클릭
2. 도메인 입력:
   ```
   daebak.myplatform.com
   ```
3. [계속] 클릭

### 5-3. 소유권 확인
```
┌─────────────────────────────────┐
│ 도메인 소유권 확인               │
├─────────────────────────────────┤
│                                 │
│ DNS TXT 레코드 추가:            │
│                                 │
│ 이름: daebak.myplatform.com     │
│ 유형: TXT                       │
│ 값: firebase-hosting-abc123...  │
│                                 │
│ [확인]                          │
└─────────────────────────────────┘
```

**중요**: 이 정보를 플랫폼 운영자에게 전달
- 플랫폼 운영자가 TXT 레코드 추가
- 추가 완료 후 [확인] 버튼 클릭

### 5-4. 소유권 확인 완료 대기
```
도메인 소유권 확인 중...
⏳ DNS 전파 대기 중
(최대 24시간 소요)
```

일반적으로 5-10분 내 완료

### 5-5. SSL 인증서 발급
소유권 확인 완료 후 자동으로 SSL 인증서 발급 시작:
```
SSL 인증서 프로비저닝 중...
⏳ Let's Encrypt 인증서 발급 중
(최대 24시간 소요)
```

일반적으로 1-2시간 내 완료

**완료**: 커스텀 도메인 연결 완료 ✅

---

## Step 6: 최종 확인 및 테스트

### 6-1. 도메인 접속 테스트
1. 브라우저에서 https://daebak.myplatform.com 접속
2. 배달앱 화면 확인
3. HTTPS 자물쇠 아이콘 확인 (보안 연결)

### 6-2. 기능 테스트
- [ ] 회원가입 테스트
- [ ] 로그인 테스트
- [ ] 메뉴 등록 테스트 (관리자)
- [ ] 주문 테스트
- [ ] 이미지 업로드 테스트

### 6-3. 모바일 테스트
1. 휴대폰에서 도메인 접속
2. 반응형 디자인 확인
3. 모든 기능 작동 확인

**완료**: 배달앱 배포 및 운영 시작! 🎉

---

## 최종 확인

모든 단계를 완료했는지 확인하세요:

✅ 프로덕션 빌드 완료  
✅ Firebase 초기화 완료  
✅ Firebase Hosting 배포 완료  
✅ 플랫폼 운영자에게 도메인 요청  
✅ 커스텀 도메인 연결 완료  
✅ SSL 인증서 발급 완료  
✅ 최종 테스트 완료  

---

## 운영 시작!

축하합니다! 이제 배달앱 운영을 시작할 수 있습니다.

### 다음 할 일
1. **메뉴 등록**: 관리자 페이지에서 메뉴 추가
2. **공지사항 작성**: 오픈 이벤트 공지
3. **홍보**: 고객에게 도메인 공유
4. **주문 접수**: 첫 주문 받기!

### 관리자 계정 생성
1. 앱 접속
2. 회원가입
3. Firebase Console > Authentication
4. 사용자 찾기
5. Custom Claims 추가:
   ```json
   {"admin": true}
   ```

---

## 자주 묻는 질문 (FAQ)

### Q1: 배포 후 변경사항을 어떻게 반영하나요?
**A**: 
```bash
npm run build
firebase deploy
```

### Q2: 도메인 연결이 24시간이 지나도 안 됩니다.
**A**:
1. DNS 전파 확인: https://dnschecker.org
2. 플랫폼 운영자에게 문의
3. Firebase Console에서 상태 확인

### Q3: SSL 인증서 오류가 발생합니다.
**A**:
1. 24-48시간 대기
2. 브라우저 캐시 삭제
3. 시크릿 모드에서 접속
4. Firebase Support 문의

### Q4: 배포 비용이 얼마나 나오나요?
**A**:
- Hosting: 10GB/월 무료, 초과 시 $0.15/GB
- 일반적으로 월 $0-5 (이미지 많으면 더 높음)

### Q5: 앱을 업데이트하려면?
**A**:
1. 코드 수정
2. `npm run build`
3. `firebase deploy`
4. 자동으로 업데이트됨

---

## 문제 해결

### 문제: 빌드 실패
**해결**:
```bash
rm -rf node_modules build
npm install
npm run build
```

### 문제: 배포 권한 오류
**해결**:
1. `firebase login` 재실행
2. 프로젝트 소유자 권한 확인
3. `firebase use daebak-delivery` 재실행

### 문제: 도메인 연결 실패
**해결**:
1. 플랫폼 운영자에게 DNS 설정 확인 요청
2. TXT 레코드 값 재확인
3. 24시간 대기 후 재시도

---

## 업데이트 가이드

### 코드 업데이트 시
```bash
# 1. 코드 수정
# 2. 로컬 테스트
npm start

# 3. 빌드
npm run build

# 4. 배포
firebase deploy --only hosting

# 5. 확인
# 브라우저에서 도메인 접속하여 변경사항 확인
```

### Firestore 규칙 업데이트 시
```bash
firebase deploy --only firestore:rules
```

### Functions 업데이트 시
```bash
cd functions
npm run build
cd ..
firebase deploy --only functions
```

---

## 백업 및 복구

### Firestore 데이터 백업
```bash
firebase firestore:export gs://daebak-delivery.appspot.com/backups/$(date +%Y%m%d)
```

### 데이터 복구
```bash
firebase firestore:import gs://daebak-delivery.appspot.com/backups/20250105
```

---

## 모니터링

### Firebase Console에서 확인
1. **Hosting**: 트래픽, 대역폭 사용량
2. **Firestore**: 읽기/쓰기 횟수
3. **Authentication**: 사용자 수
4. **Storage**: 저장 용량

### 비용 모니터링
1. Firebase Console > 사용량 및 결제
2. 일일 사용량 확인
3. 예산 알림 설정 확인

---

**작성일**: 2025-12-05  
**버전**: 1.0  
**이전 문서**: 04-app-setup.md  
**완료**: 방식 B 전체 가이드 완료! 🎉
```

---

## 방식 B 프롬프트 완성!

총 5개의 상세 프롬프트:
1. ✅ B-1: Firebase 계정 생성
2. ✅ B-2: Firebase 프로젝트 생성
3. ✅ B-3: Firebase 서비스 활성화
4. ✅ B-4: 템플릿 앱 설정
5. ✅ B-5: 배포 및 도메인 연결

각 프롬프트는:
- 원자 단위로 분해됨
- 명확한 단계별 지침
- 스크린샷 위치 표시
- FAQ 및 문제 해결 포함
- 즉시 사용 가능

사장님이 이 가이드만 따라하면 독립적으로 배달앱을 설치하고 운영할 수 있습니다!
