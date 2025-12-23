# Phase 13: 자동화 스크립트 프롬프트 (5개)

## Prompt 13-1: Firebase 프로젝트 생성 스크립트

```
scripts/create-firebase-project.js 파일을 생성해줘:

목적:
새 상점을 위한 Firebase 프로젝트를 자동으로 생성하고 설정

입력 파라미터:
- storeName: 상점명 (예: "대박마라탕")
- storeId: 영문 ID (예: "daebak")

기능:
1. Firebase Admin SDK 초기화
2. 새 Firebase 프로젝트 생성
   - Project ID: {storeId}-delivery-app
   - Display Name: {storeName} 배달앱
3. Firestore 데이터베이스 활성화
   - 위치: asia-northeast3 (서울)
   - 모드: Native
4. Firebase Authentication 활성화
   - 이메일/비밀번호 인증 활성화
5. Firebase Hosting 설정
   - 사이트 이름: {storeId}
6. Firebase Storage 활성화
7. 프로젝트 설정 정보를 JSON 파일로 저장
   - 저장 위치: stores/{storeId}/firebase-config.json

출력:
{
  success: true,
  projectId: "daebak-delivery-app",
  config: {
    apiKey: "...",
    authDomain: "...",
    projectId: "...",
    storageBucket: "...",
    messagingSenderId: "...",
    appId: "..."
  }
}

에러 처리:
- 프로젝트 ID 중복 시 에러 메시지
- 권한 부족 시 안내 메시지
- 네트워크 오류 처리

사용 예시:
node scripts/create-firebase-project.js --name "대박마라탕" --id "daebak"
```

---

## Prompt 13-2: 환경변수 주입 스크립트

```
scripts/inject-env-config.js 파일을 생성해줘:

목적:
템플릿 앱에 상점별 Firebase 설정을 자동으로 주입

입력 파라미터:
- storeId: 상점 ID
- configPath: Firebase 설정 JSON 파일 경로

기능:
1. Firebase 설정 JSON 파일 읽기
   - 경로: stores/{storeId}/firebase-config.json
2. 템플릿 디렉토리 복사
   - 원본: template/
   - 대상: stores/{storeId}/
3. .env 파일 생성
   내용:
   REACT_APP_FIREBASE_API_KEY={apiKey}
   REACT_APP_FIREBASE_AUTH_DOMAIN={authDomain}
   REACT_APP_FIREBASE_PROJECT_ID={projectId}
   REACT_APP_FIREBASE_STORAGE_BUCKET={storageBucket}
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID={messagingSenderId}
   REACT_APP_FIREBASE_APP_ID={appId}
   REACT_APP_STORE_ID={storeId}
   REACT_APP_STORE_NAME={storeName}
4. .firebaserc 파일 생성
   {
     "projects": {
       "default": "{projectId}"
     }
   }
5. package.json의 name 필드 업데이트
   - "name": "{storeId}-delivery-app"

출력:
{
  success: true,
  storeId: "daebak",
  envPath: "stores/daebak/.env",
  firebasercPath: "stores/daebak/.firebaserc"
}

검증:
- 모든 환경변수가 올바르게 설정되었는지 확인
- 필수 파일 존재 여부 확인

사용 예시:
node scripts/inject-env-config.js --id "daebak"
```

---

## Prompt 13-3: 도메인 연결 스크립트

```
scripts/setup-domain.js 파일을 생성해줘:

목적:
Firebase Hosting에 커스텀 도메인 자동 연결

입력 파라미터:
- storeId: 상점 ID
- domain: 도메인 (예: "daebak.myplatform.com")
- projectId: Firebase 프로젝트 ID

기능:
1. Firebase Admin SDK로 프로젝트 선택
2. Firebase Hosting에 커스텀 도메인 추가
   - firebase.hosting.sites.domains.create() 사용
3. SSL 인증서 자동 발급 요청
4. DNS 설정 정보 출력
   - A 레코드 또는 CNAME 레코드 정보
5. 도메인 검증 상태 확인
   - 최대 10분 대기
   - 1분마다 상태 체크
6. 연결 완료 시 상점 정보 업데이트
   - stores/{storeId}/domain-info.json 저장

출력:
{
  success: true,
  domain: "daebak.myplatform.com",
  status: "connected",
  sslStatus: "active",
  dnsRecords: [
    {
      type: "A",
      name: "daebak",
      value: "151.101.1.195"
    }
  ]
}

DNS 설정 안내 메시지:
"다음 DNS 레코드를 추가해주세요:
Type: A
Name: daebak
Value: 151.101.1.195

설정 후 최대 24시간이 소요될 수 있습니다."

에러 처리:
- 도메인 이미 사용 중
- DNS 설정 미완료
- SSL 발급 실패

사용 예시:
node scripts/setup-domain.js --id "daebak" --domain "daebak.myplatform.com"
```

---

## Prompt 13-4: 앱 배포 스크립트

```
scripts/deploy-store.js 파일을 생성해줘:

목적:
상점별 앱을 Firebase Hosting에 자동 배포

입력 파라미터:
- storeId: 상점 ID

기능:
1. 상점 디렉토리로 이동
   - cd stores/{storeId}
2. 의존성 설치 (최초 1회)
   - npm install (node_modules 없을 때만)
3. 환경변수 확인
   - .env 파일 존재 여부
   - 필수 변수 검증
4. 프로덕션 빌드
   - npm run build
   - 빌드 성공 여부 확인
5. Firebase Functions 배포
   - cd functions
   - npm install
   - npm run build
   - firebase deploy --only functions
6. Firebase Hosting 배포
   - firebase deploy --only hosting
7. Firestore 규칙 배포
   - firebase deploy --only firestore:rules
8. Firestore 인덱스 배포
   - firebase deploy --only firestore:indexes
9. 배포 정보 저장
   - stores/{storeId}/deployment-info.json
   {
     deployedAt: timestamp,
     version: "1.0.0",
     buildSize: "2.3 MB",
     hostingUrl: "https://daebak.myplatform.com"
   }

진행 상황 표시:
[1/7] 환경변수 확인 중... ✓
[2/7] 의존성 설치 중... ✓
[3/7] 빌드 중... ✓
[4/7] Functions 배포 중... ✓
[5/7] Hosting 배포 중... ✓
[6/7] Firestore 규칙 배포 중... ✓
[7/7] 완료! ✓

출력:
{
  success: true,
  storeId: "daebak",
  hostingUrl: "https://daebak.myplatform.com",
  functionsDeployed: 5,
  buildTime: "45s"
}

에러 처리:
- 빌드 실패 시 로그 출력
- 배포 실패 시 롤백 안내
- 권한 오류 처리

사용 예시:
node scripts/deploy-store.js --id "daebak"
```

---

## Prompt 13-5: 전체 상점 업데이트 스크립트

```
scripts/update-all-stores.js 파일을 생성해줘:

목적:
템플릿 앱 업데이트 시 모든 상점에 일괄 적용

입력 파라미터:
- updateType: 업데이트 타입 ("code" | "config" | "all")
- message: 업데이트 메시지

기능:
1. 모든 상점 목록 조회
   - stores/ 디렉토리 스캔
   - 각 상점의 firebase-config.json 확인
2. 템플릿 변경사항 확인
   - Git diff 또는 파일 비교
3. 각 상점별 업데이트 실행
   - updateType === "code":
     * template/src → stores/{storeId}/src 복사
     * 기존 환경변수 유지
   - updateType === "config":
     * firebase.json, firestore.rules 업데이트
   - updateType === "all":
     * 전체 파일 동기화 (환경변수 제외)
4. 각 상점 재배포
   - node scripts/deploy-store.js --id {storeId}
5. 업데이트 로그 저장
   - logs/update-{timestamp}.json

진행 상황:
상점 1/10: daebak
  [✓] 파일 동기화
  [✓] 빌드
  [✓] 배포
  완료!

상점 2/10: kimchi
  [✓] 파일 동기화
  [✓] 빌드
  [✓] 배포
  완료!

...

전체 완료: 10/10 성공

출력:
{
  success: true,
  totalStores: 10,
  updated: 10,
  failed: 0,
  duration: "15m 30s",
  failedStores: []
}

안전 장치:
- 업데이트 전 백업 생성
  * stores/{storeId}/backup-{timestamp}/
- 실패 시 자동 롤백
- 사용자 확인 프롬프트
  "10개 상점을 업데이트하시겠습니까? (y/n)"

에러 처리:
- 일부 상점 실패 시 계속 진행
- 실패한 상점 목록 출력
- 재시도 옵션 제공

사용 예시:
node scripts/update-all-stores.js --type "code" --message "메뉴 UI 개선"
```

---

## 스크립트 공통 요구사항

### 1. 로깅
모든 스크립트는 상세 로그를 남겨야 함:
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console()
  ]
});
```

### 2. 에러 처리
```javascript
try {
  // 작업 수행
} catch (error) {
  logger.error('작업 실패', { error: error.message, stack: error.stack });
  process.exit(1);
}
```

### 3. 진행 상황 표시
```javascript
const ora = require('ora');
const spinner = ora('Firebase 프로젝트 생성 중...').start();

// 작업 수행
spinner.succeed('프로젝트 생성 완료!');
```

### 4. 설정 파일
모든 스크립트는 config.json에서 설정 읽기:
```json
{
  "firebase": {
    "serviceAccountPath": "./service-account.json"
  },
  "domain": {
    "baseDomain": "myplatform.com"
  },
  "paths": {
    "template": "./template",
    "stores": "./stores"
  }
}
```

---

## 패키지 의존성

package.json에 추가:
```json
{
  "devDependencies": {
    "firebase-admin": "^12.0.0",
    "firebase-tools": "^13.0.0",
    "winston": "^3.11.0",
    "ora": "^8.0.0",
    "commander": "^11.1.0",
    "chalk": "^5.3.0"
  }
}
```

---

**Phase 13 완료 후**: 관리자 대시보드(Phase 14)에서 이 스크립트들을 UI로 호출
