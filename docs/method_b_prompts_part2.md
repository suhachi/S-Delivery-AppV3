# 방식 B 프롬프트 (계속) - Prompt B-3 ~ B-5

## Prompt B-3: Firebase 서비스 활성화 가이드

```
docs/store-setup/03-firebase-services.md 파일을 생성해줘:

# Firebase 서비스 활성화 가이드

## 소요 시간: 약 10-15분

## 사전 준비
- ✅ Firebase 프로젝트 생성 완료 (02-firebase-project.md)

---

## 필요한 서비스 목록

배달앱 운영에 필요한 Firebase 서비스:

**필수 서비스** (반드시 활성화):
1. ✅ Firestore Database - 데이터 저장 (메뉴, 주문, 사용자)
2. ✅ Authentication - 사용자 로그인/회원가입
3. ✅ Hosting - 웹사이트 배포
4. ✅ Storage - 이미지 파일 저장

**선택 서비스** (나중에 활성화 가능):
5. ⭕ Cloud Functions - 푸시 알림 (나중에)
6. ⭕ Cloud Messaging - 푸시 알림 (나중에)

---

## Service 1: Firestore Database 설정

### 1-1. Firestore 시작
1. 좌측 메뉴에서 [빌드] 섹션 찾기
2. [Firestore Database] 클릭
3. [데이터베이스 만들기] 버튼 클릭

### 1-2. 보안 규칙 선택
```
┌─────────────────────────────────┐
│ 보안 규칙으로 시작               │
├─────────────────────────────────┤
│                                 │
│ ● 프로덕션 모드에서 시작         │
│   (권장)                         │
│   모든 읽기/쓰기 거부            │
│   나중에 규칙 배포 필요          │
│                                 │
│ ○ 테스트 모드에서 시작           │
│   30일 동안 모든 읽기/쓰기 허용  │
│   보안 취약                      │
│                                 │
│ [다음]                          │
└─────────────────────────────────┘
```

**선택**: ● 프로덕션 모드에서 시작 ✅

**이유**:
- 보안 규칙은 나중에 앱 배포 시 자동으로 설정됨
- 테스트 모드는 30일 후 자동 차단되어 위험

[다음] 버튼 클릭

### 1-3. Firestore 위치 선택
```
┌─────────────────────────────────┐
│ Cloud Firestore 위치             │
├─────────────────────────────────┤
│                                 │
│ 위치 선택:                       │
│ ┌─────────────────────────────┐ │
│ │ asia-northeast3 (서울)      │ │
│ └─────────────────────────────┘ │
│                                 │
│ ⚠ 나중에 변경할 수 없습니다      │
│                                 │
│ [사용 설정]                      │
└─────────────────────────────────┘
```

**선택**: asia-northeast3 (서울) ✅

**중요**:
- ⚠️ 위치는 생성 후 변경 불가!
- 서울 선택 시 가장 빠른 속도
- 한국 서비스에 최적

[사용 설정] 버튼 클릭

### 1-4. 생성 완료 대기
```
Cloud Firestore 프로비저닝 중...
⏳ 데이터베이스 생성 중
⏳ 인덱스 설정 중
(약 1-2분 소요)
```

완료되면 빈 데이터베이스 화면이 표시됩니다.

**완료**: Firestore Database 활성화 완료 ✅

---

## Service 2: Authentication 설정

### 2-1. Authentication 시작
1. 좌측 메뉴 [빌드] > [Authentication] 클릭
2. [시작하기] 버튼 클릭

### 2-2. 로그인 방법 추가
1. [Sign-in method] 탭 클릭 (기본 선택됨)
2. "기본 제공업체" 섹션에서 [이메일/비밀번호] 클릭

### 2-3. 이메일/비밀번호 활성화
```
┌─────────────────────────────────┐
│ 이메일/비밀번호                  │
├─────────────────────────────────┤
│                                 │
│ ☑ 사용 설정                      │
│   사용자가 이메일과 비밀번호로   │
│   가입 및 로그인 가능            │
│                                 │
│ □ 이메일 링크(비밀번호 불필요)   │
│   (선택 사항, 체크 안 함)        │
│                                 │
│ [저장]                          │
└─────────────────────────────────┘
```

**설정**:
1. "사용 설정" 체크 ✅
2. "이메일 링크" 체크 안 함 (선택 사항)
3. [저장] 버튼 클릭

### 2-4. 활성화 확인
```
Sign-in providers
┌─────────────────────────────────┐
│ 이메일/비밀번호    ✅ 사용 설정  │
│ Google            ⭕ 사용 안 함  │
│ Facebook          ⭕ 사용 안 함  │
└─────────────────────────────────┘
```

**완료**: Authentication 활성화 완료 ✅

---

## Service 3: Hosting 설정

### 3-1. Hosting 시작
1. 좌측 메뉴 [빌드] > [Hosting] 클릭
2. [시작하기] 버튼 클릭

### 3-2. 설정 단계 (건너뛰기)
```
┌─────────────────────────────────┐
│ 1단계: Firebase CLI 설치         │
├─────────────────────────────────┤
│ npm install -g firebase-tools   │
│                                 │
│ (나중에 로컬에서 실행)           │
│                                 │
│ [다음]                          │
└─────────────────────────────────┘
```

**지금은 모두 건너뛰기**:
1. [다음] 클릭
2. [다음] 클릭
3. [콘솔로 이동] 클릭

### 3-3. Hosting 활성화 확인
```
Hosting 페이지
┌─────────────────────────────────┐
│ 아직 배포된 사이트가 없습니다    │
│                                 │
│ Firebase CLI를 사용하여          │
│ 첫 배포를 시작하세요             │
└─────────────────────────────────┘
```

Hosting이 활성화되었습니다. 실제 배포는 나중에 진행합니다.

**완료**: Hosting 활성화 완료 ✅

---

## Service 4: Storage 설정

### 4-1. Storage 시작
1. 좌측 메뉴 [빌드] > [Storage] 클릭
2. [시작하기] 버튼 클릭

### 4-2. 보안 규칙 선택
```
┌─────────────────────────────────┐
│ 보안 규칙으로 시작               │
├─────────────────────────────────┤
│                                 │
│ ● 프로덕션 모드에서 시작         │
│   (권장)                         │
│                                 │
│ [다음]                          │
└─────────────────────────────────┘
```

**선택**: ● 프로덕션 모드에서 시작 ✅

[다음] 버튼 클릭

### 4-3. Storage 위치 선택
```
┌─────────────────────────────────┐
│ Cloud Storage 위치               │
├─────────────────────────────────┤
│                                 │
│ ┌─────────────────────────────┐ │
│ │ asia-northeast3 (서울)      │ │
│ └─────────────────────────────┘ │
│                                 │
│ ⚠ Firestore와 동일한 위치 권장  │
│                                 │
│ [완료]                          │
└─────────────────────────────────┘
```

**선택**: asia-northeast3 (서울) ✅

[완료] 버튼 클릭

### 4-4. 생성 완료
```
Cloud Storage 버킷 생성 중...
⏳ (약 30초 소요)
```

완료되면 빈 Storage 화면이 표시됩니다.

**완료**: Storage 활성화 완료 ✅

---

## 선택 서비스 (나중에 활성화)

### Cloud Functions (선택)
**용도**: 푸시 알림 기능
**활성화 시기**: 푸시 알림 기능 추가 시
**비용**: 함수 실행 횟수에 따라 과금

**지금은 건너뛰기** - 나중에 필요하면 활성화

### Cloud Messaging (선택)
**용도**: 푸시 알림 전송
**활성화 시기**: 푸시 알림 기능 추가 시
**비용**: 무료 (전송 횟수 무제한)

**지금은 건너뛰기** - 나중에 필요하면 활성화

---

## 최종 확인

### 서비스 활성화 체크리스트

필수 서비스:
✅ Firestore Database (asia-northeast3)  
✅ Authentication (이메일/비밀번호)  
✅ Hosting  
✅ Storage (asia-northeast3)  

선택 서비스:
⭕ Cloud Functions (나중에)  
⭕ Cloud Messaging (나중에)  

### 프로젝트 개요 확인
```
┌─────────────────────────────────┐
│ 대박마라탕 배달앱                │
├─────────────────────────────────┤
│                                 │
│ ✅ Firestore Database           │
│ ✅ Authentication               │
│ ✅ Hosting                      │
│ ✅ Storage                      │
│ ⭕ Functions                    │
│ ⭕ Cloud Messaging              │
│                                 │
└─────────────────────────────────┘
```

---

## 다음 단계

**04-app-setup.md** - 템플릿 앱 다운로드 및 설정 가이드로 이동하세요.

---

## 자주 묻는 질문 (FAQ)

### Q1: Firestore 위치를 잘못 선택했어요.
**A**: 위치는 변경 불가능합니다.
- 해결: 새 프로젝트 생성 필요
- 데이터 마이그레이션 매우 복잡
- 신중하게 선택 필요

### Q2: 테스트 모드로 시작했는데 괜찮나요?
**A**: 30일 후 자동 차단됩니다.
- 해결: 보안 규칙 직접 수정 필요
- 프로덕션 모드 권장
- 앱 배포 시 자동으로 규칙 설정됨

### Q3: Cloud Functions를 지금 활성화해야 하나요?
**A**: 아니요, 나중에 해도 됩니다.
- 푸시 알림 기능 사용 시 필요
- 지금은 불필요
- 언제든 추가 가능

### Q4: Storage 용량은 얼마나 되나요?
**A**: 무료 할당량:
- 5GB 저장 용량
- 1GB/일 다운로드
- 초과 시 과금 ($0.026/GB)

### Q5: 서비스 활성화를 취소할 수 있나요?
**A**: 일부 가능합니다:
- Firestore: 삭제 불가 (비활성화만 가능)
- Authentication: 비활성화 가능
- Hosting: 비활성화 가능
- Storage: 삭제 가능

---

## 문제 해결

### 문제: Firestore 생성이 5분 이상 걸립니다
**해결**:
1. 10분까지 기다려보기
2. 브라우저 새로고침
3. 다른 브라우저 시도
4. 프로젝트 삭제 후 재생성

### 문제: "권한이 없습니다" 오류
**해결**:
1. Blaze 플랜 확인 (일부 서비스는 Blaze 필요)
2. 결제 정보 확인
3. 프로젝트 소유자 권한 확인

### 문제: Storage 버킷 생성 실패
**해결**:
1. Firestore와 동일한 위치 선택
2. 프로젝트 ID 확인 (특수문자 없는지)
3. 몇 분 후 재시도

---

**작성일**: 2025-12-05  
**버전**: 1.0  
**이전 문서**: 02-firebase-project.md  
**다음 문서**: 04-app-setup.md
```

---

## Prompt B-4: 템플릿 앱 설정 가이드

```
docs/store-setup/04-app-setup.md 파일을 생성해줘:

# 템플릿 앱 다운로드 및 설정 가이드

## 소요 시간: 약 20-30분

## 사전 준비
- ✅ Firebase 서비스 활성화 완료 (03-firebase-services.md)
- ✅ Firebase SDK 설정 정보 저장됨
- ✅ 컴퓨터에 Node.js 설치 필요

---

## Step 1: Node.js 설치 확인

### 1-1. Node.js 설치 여부 확인
1. 명령 프롬프트(Windows) 또는 터미널(Mac) 열기
   - Windows: Win+R → "cmd" 입력 → Enter
   - Mac: Cmd+Space → "terminal" 입력 → Enter

2. 다음 명령어 입력:
   ```bash
   node --version
   ```

3. 결과 확인:
   ```
   ✅ v18.17.0 (또는 v16 이상) → 설치됨, Step 2로 이동
   ❌ 'node'은(는) 내부 또는 외부 명령... → 설치 필요
   ```

### 1-2. Node.js 설치 (설치 안 된 경우)
1. https://nodejs.org 접속
2. "LTS" 버전 다운로드 (권장)
   ```
   예: Node.js 18.17.0 LTS
   ```
3. 다운로드한 파일 실행
4. 설치 마법사:
   - [Next] 계속 클릭
   - 기본 설정 유지
   - [Install] 클릭
   - 관리자 권한 허용
5. 설치 완료 후 컴퓨터 재시작
6. 다시 `node --version` 명령어로 확인

**완료**: Node.js 설치 완료 ✅

---

## Step 2: 템플릿 앱 다운로드

### 방법 A: GitHub에서 다운로드 (권장)

1. 브라우저에서 템플릿 저장소 접속:
   ```
   https://github.com/[플랫폼운영자]/delivery-app-template
   ```

2. [Code] 버튼 클릭 → [Download ZIP] 클릭

3. 다운로드한 ZIP 파일 압축 해제:
   - Windows: 우클릭 → "압축 풀기"
   - Mac: 더블 클릭

4. 폴더 이름 변경:
   ```
   delivery-app-template-main
   →
   daebak-delivery-app
   ```

5. 원하는 위치로 이동:
   ```
   예: C:\Users\사용자명\Documents\daebak-delivery-app
   또는: ~/Documents/daebak-delivery-app
   ```

### 방법 B: Git Clone (개발자용)

```bash
git clone https://github.com/[플랫폼운영자]/delivery-app-template.git daebak-delivery-app
cd daebak-delivery-app
```

**완료**: 템플릿 다운로드 완료 ✅

---

## Step 3: 프로젝트 폴더 열기

### 3-1. 명령 프롬프트에서 폴더 이동

**Windows**:
```cmd
cd C:\Users\사용자명\Documents\daebak-delivery-app
```

**Mac/Linux**:
```bash
cd ~/Documents/daebak-delivery-app
```

### 3-2. 폴더 내용 확인
```bash
dir    # Windows
ls     # Mac/Linux
```

**예상 출력**:
```
public/
src/
functions/
.gitignore
package.json
README.md
firebase.json
...
```

**완료**: 프로젝트 폴더 진입 완료 ✅

---

## Step 4: 의존성 설치

### 4-1. npm install 실행
```bash
npm install
```

**진행 과정**:
```
npm WARN deprecated ...
added 1234 packages in 2m
```

**소요 시간**: 2-5분 (인터넷 속도에 따라)

### 4-2. Functions 의존성 설치
```bash
cd functions
npm install
cd ..
```

**완료**: 의존성 설치 완료 ✅

---

## Step 5: 환경변수 설정 (중요!)

### 5-1. .env 파일 생성

**Windows**:
```cmd
copy .env.example .env
notepad .env
```

**Mac/Linux**:
```bash
cp .env.example .env
nano .env
```

### 5-2. Firebase 설정 정보 입력

이전에 저장한 Firebase SDK 정보를 사용합니다.

**.env 파일 내용**:
```env
# Firebase 설정
REACT_APP_FIREBASE_API_KEY=AIzaSyC...
REACT_APP_FIREBASE_AUTH_DOMAIN=daebak-delivery.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=daebak-delivery
REACT_APP_FIREBASE_STORAGE_BUCKET=daebak-delivery.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef

# 상점 정보
REACT_APP_STORE_NAME=대박마라탕
REACT_APP_STORE_PHONE=02-1234-5678
```

### 5-3. 값 입력 방법

1. Firebase Console에서 저장한 정보 열기:
   - `firebase-config.txt` 파일 열기
   - 또는 Firebase Console > 프로젝트 설정 > 일반 > SDK 스니펫

2. 각 값을 복사하여 .env 파일에 붙여넣기:
   ```
   apiKey → REACT_APP_FIREBASE_API_KEY
   authDomain → REACT_APP_FIREBASE_AUTH_DOMAIN
   projectId → REACT_APP_FIREBASE_PROJECT_ID
   storageBucket → REACT_APP_FIREBASE_STORAGE_BUCKET
   messagingSenderId → REACT_APP_FIREBASE_MESSAGING_SENDER_ID
   appId → REACT_APP_FIREBASE_APP_ID
   ```

3. 상점 정보 입력:
   ```
   REACT_APP_STORE_NAME=대박마라탕
   REACT_APP_STORE_PHONE=02-1234-5678
   ```

4. 파일 저장:
   - Notepad: Ctrl+S
   - Nano: Ctrl+O → Enter → Ctrl+X

**완료**: 환경변수 설정 완료 ✅

---

## Step 6: Firebase 프로젝트 연결

### 6-1. Firebase CLI 설치
```bash
npm install -g firebase-tools
```

### 6-2. Firebase 로그인
```bash
firebase login
```

**진행 과정**:
1. 브라우저가 자동으로 열림
2. Google 계정 선택
3. Firebase CLI 권한 허용
4. "Success! Logged in as ..." 메시지 확인

### 6-3. Firebase 프로젝트 선택
```bash
firebase use daebak-delivery
```

**출력**:
```
Now using project daebak-delivery
```

**완료**: Firebase 프로젝트 연결 완료 ✅

---

## Step 7: 로컬 테스트 실행

### 7-1. 개발 서버 시작
```bash
npm start
```

**진행 과정**:
```
Compiled successfully!

You can now view daebak-delivery-app in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.0.100:3000
```

### 7-2. 브라우저에서 확인
1. 브라우저가 자동으로 열림
2. http://localhost:3000 접속
3. 배달앱 화면 확인

**예상 화면**:
```
┌─────────────────────────────────┐
│ 대박마라탕 배달앱                │
├─────────────────────────────────┤
│                                 │
│ [로그인] [회원가입]              │
│                                 │
│ 메뉴 목록                        │
│ (아직 메뉴 없음)                 │
│                                 │
└─────────────────────────────────┘
```

### 7-3. 테스트
1. [회원가입] 클릭
2. 이메일/비밀번호 입력
3. 회원가입 성공 확인
4. 로그인 테스트

**완료**: 로컬 테스트 성공 ✅

---

## 최종 확인

모든 단계를 완료했는지 확인하세요:

✅ Node.js 설치 완료  
✅ 템플릿 앱 다운로드 완료  
✅ 의존성 설치 완료  
✅ 환경변수 설정 완료  
✅ Firebase 프로젝트 연결 완료  
✅ 로컬 테스트 성공  

---

## 다음 단계

**05-deployment.md** - Firebase Hosting 배포 및 도메인 연결 가이드로 이동하세요.

---

## 자주 묻는 질문 (FAQ)

### Q1: npm install이 실패합니다.
**A**: 다음을 시도하세요:
1. Node.js 버전 확인 (v16 이상 필요)
2. 관리자 권한으로 실행
3. npm 캐시 삭제: `npm cache clean --force`
4. 재시도

### Q2: .env 파일이 안 보입니다.
**A**: 숨김 파일 표시 설정:
- Windows: 탐색기 > 보기 > 숨김 항목 체크
- Mac: Cmd+Shift+. (점)

### Q3: localhost:3000이 안 열립니다.
**A**: 
1. 포트 3000이 이미 사용 중일 수 있음
2. 다른 포트 사용: `PORT=3001 npm start`
3. 방화벽 확인

### Q4: Firebase 로그인이 안 됩니다.
**A**:
1. 브라우저가 자동으로 안 열리면 수동으로 URL 복사
2. 시크릿 모드에서 시도
3. `firebase logout` 후 재시도

---

## 문제 해결

### 문제: "Module not found" 오류
**해결**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### 문제: Firebase 연결 오류
**해결**:
1. .env 파일 값 재확인
2. Firebase Console에서 SDK 정보 다시 복사
3. 앱 재시작

### 문제: 빌드 오류
**해결**:
1. Node.js 버전 확인
2. 의존성 재설치
3. 에러 메시지 확인 후 검색

---

**작성일**: 2025-12-05  
**버전**: 1.0  
**이전 문서**: 03-firebase-services.md  
**다음 문서**: 05-deployment.md
```

계속해서 마지막 프롬프트 B-5를 작성하겠습니다...
