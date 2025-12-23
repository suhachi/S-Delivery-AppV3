# Phase 15: 배포 및 운영 프롬프트 (3개)

## Prompt 15-1: 관리자 대시보드 배포

```
관리자 대시보드를 Firebase Hosting에 배포해줘:

목표:
admin.myplatform.com 도메인으로 관리자 대시보드 접근 가능

사전 준비:
1. Firebase 프로젝트 생성 (admin-dashboard)
2. Firebase Hosting 활성화
3. 커스텀 도메인 설정

배포 단계:

Step 1: Firebase 프로젝트 설정
cd admin-dashboard
firebase init

선택 옵션:
- Hosting: Configure files for Firebase Hosting
- Firestore: Deploy Firestore security rules
- Functions: Configure Cloud Functions

Hosting 설정:
- Public directory: dist
- Single-page app: Yes
- GitHub 자동 배포: No

Step 2: firebase.json 설정
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  },
  "firestore": {
    "rules": "firestore.rules"
  },
  "functions": {
    "source": "server",
    "runtime": "nodejs18"
  }
}

Step 3: Firestore 보안 규칙
firestore.rules 파일 생성:
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    // 관리자만 접근 가능
    function isAdmin() {
      return request.auth != null && 
             exists(/databases/$(db)/documents/admins/$(request.auth.uid));
    }

    // 관리자 컬렉션
    match /admins/{adminId} {
      allow read: if isAdmin();
      allow write: if false; // 수동으로만 추가
    }

    // 상점 메타데이터
    match /stores/{storeId} {
      allow read, write: if isAdmin();
    }

    // 배포 로그
    match /deployments/{deploymentId} {
      allow read, write: if isAdmin();
    }
  }
}

Step 4: 환경변수 설정
.env.production 파일:
VITE_ADMIN_API_URL=https://admin-api.myplatform.com
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=admin-dashboard.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=admin-dashboard

Step 5: 빌드 및 배포
npm run build
firebase deploy

배포 확인:
- Hosting URL: https://admin-dashboard.web.app
- 커스텀 도메인: admin.myplatform.com

Step 6: 관리자 계정 생성
Firebase Console에서:
1. Authentication > Users > Add user
   - Email: admin@myplatform.com
   - Password: (강력한 비밀번호)
2. Firestore > admins 컬렉션 > 문서 추가
   - 문서 ID: (위에서 생성한 UID)
   - 필드:
     * email: admin@myplatform.com
     * role: super-admin
     * createdAt: (현재 시간)

Step 7: 접근 제어
src/App.tsx에 인증 가드 추가:
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';

function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // 관리자 권한 확인
        const adminDoc = await getDoc(doc(db, 'admins', firebaseUser.uid));
        setIsAdmin(adminDoc.exists());
        setUser(firebaseUser);
      } else {
        setIsAdmin(false);
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user || !isAdmin) {
    return <LoginPage />;
  }

  return <Dashboard />;
}

Step 8: HTTPS 및 보안 설정
- Firebase Hosting은 자동으로 HTTPS 제공
- CORS 설정 (server/index.ts):
  app.use(cors({
    origin: ['https://admin.myplatform.com'],
    credentials: true
  }));

배포 완료 확인:
✓ https://admin.myplatform.com 접속 가능
✓ 관리자 로그인 작동
✓ 상점 목록 조회 가능
✓ 새 상점 추가 기능 작동
```

---

## Prompt 15-2: DNS 설정 가이드

```
DNS 설정 가이드 문서를 작성해줘:

파일명: docs/dns-setup-guide.md

내용:

# DNS 설정 가이드

## 개요
각 상점에 서브도메인을 할당하기 위한 DNS 설정 방법

## 필요한 정보
- 기본 도메인: myplatform.com
- DNS 제공업체: (예: Cloudflare, Route 53, GoDaddy)

## 설정 방법

### 방법 1: A 레코드 (권장)

각 상점마다 A 레코드 추가:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | daebak | 151.101.1.195 | 3600 |
| A | kimchi | 151.101.1.195 | 3600 |
| A | chicken | 151.101.1.195 | 3600 |

Firebase Hosting IP 주소:
- 151.101.1.195
- 151.101.65.195

### 방법 2: CNAME 레코드

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | daebak | daebak-delivery-app.web.app | 3600 |
| CNAME | kimchi | kimchi-delivery-app.web.app | 3600 |

### 방법 3: 와일드카드 (모든 서브도메인)

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | * | 151.101.1.195 | 3600 |

주의: 와일드카드 사용 시 모든 서브도메인이 Firebase로 연결됨

## Cloudflare 설정 예시

1. Cloudflare 대시보드 로그인
2. 도메인 선택 (myplatform.com)
3. DNS 탭 클릭
4. [Add record] 버튼 클릭
5. 레코드 정보 입력:
   - Type: A
   - Name: daebak
   - IPv4 address: 151.101.1.195
   - Proxy status: Proxied (🟠)
   - TTL: Auto
6. [Save] 클릭

## Firebase Hosting 커스텀 도메인 연결

각 상점 프로젝트에서:

1. Firebase Console 접속
2. Hosting 메뉴
3. [Add custom domain] 클릭
4. 도메인 입력: daebak.myplatform.com
5. DNS 레코드 확인
6. [Verify] 클릭
7. SSL 인증서 자동 발급 (최대 24시간)

## 자동화 스크립트

scripts/setup-domain.js 사용:
```bash
node scripts/setup-domain.js --id "daebak" --domain "daebak.myplatform.com"
```

스크립트 실행 시:
1. Firebase Hosting에 도메인 추가
2. DNS 레코드 정보 출력
3. 검증 대기
4. SSL 인증서 발급 확인

## 문제 해결

### 도메인 연결 안 됨
- DNS 전파 대기 (최대 24-48시간)
- DNS 레코드 확인: `nslookup daebak.myplatform.com`
- Cloudflare Proxy 비활성화 후 재시도

### SSL 인증서 발급 실패
- DNS 레코드가 올바른지 확인
- Firebase Hosting에서 도메인 재검증
- 24시간 대기 후 재시도

### 여러 IP 주소 표시
- Firebase는 여러 IP 사용 (정상)
- 모든 IP를 A 레코드로 추가 권장

## 검증 방법

```bash
# DNS 레코드 확인
nslookup daebak.myplatform.com

# HTTPS 접속 확인
curl -I https://daebak.myplatform.com

# SSL 인증서 확인
openssl s_client -connect daebak.myplatform.com:443 -servername daebak.myplatform.com
```

## 비용

- DNS 레코드 추가: 무료
- SSL 인증서: 무료 (Firebase 자동 발급)
- 도메인 갱신: 연 $12 (기본 도메인만)
```

---

## Prompt 15-3: 운영 매뉴얼 작성

```
운영 매뉴얼 문서를 작성해줘:

파일명: docs/operations-manual.md

내용:

# 운영 매뉴얼

## 일일 운영

### 아침 체크리스트 (09:00)
- [ ] 관리자 대시보드 접속
- [ ] 모든 상점 상태 확인 (모니터링 페이지)
- [ ] 오류 알림 확인
- [ ] 배포 실패 건 확인

### 저녁 정산 (22:00)
- [ ] 일일 매출 확인
- [ ] 주문 통계 확인
- [ ] 백업 상태 확인

## 새 상점 추가 프로세스

### 1. 사전 준비
- 상점 정보 수집:
  * 상점명
  * 사업자번호
  * 대표자명
  * 전화번호
  * 이메일 (관리자 계정용)
- 서브도메인 결정 (예: daebak)

### 2. 상점 생성
1. 관리자 대시보드 접속
2. [새 상점 추가] 클릭
3. 정보 입력 (4단계 폼)
4. [생성하기] 클릭
5. 진행 상황 모니터링 (5-10분 소요)

### 3. DNS 설정
1. DNS 제공업체 접속
2. A 레코드 추가:
   - Name: {storeId}
   - Value: 151.101.1.195
3. 저장 및 전파 대기 (최대 24시간)

### 4. 검증
- [ ] 도메인 접속 확인
- [ ] HTTPS 작동 확인
- [ ] 관리자 로그인 테스트
- [ ] 메뉴 등록 테스트
- [ ] 주문 테스트

### 5. 사장님 온보딩
1. 접속 정보 전달:
   ```
   안녕하세요!
   
   배달앱이 준비되었습니다.
   
   접속 주소: https://daebak.myplatform.com
   관리자 이메일: admin@daebak.com
   임시 비밀번호: ********
   
   첫 로그인 후 비밀번호를 변경해주세요.
   ```
2. 초기 설정 가이드 제공
3. 메뉴 등록 지원
4. 테스트 주문 진행

## 템플릿 앱 업데이트

### 업데이트 유형

#### 1. 긴급 버그 수정
```bash
# 1. 템플릿 수정
cd template
# 버그 수정 코드 작성

# 2. 테스트
npm run build
npm run test

# 3. 전체 상점 업데이트
cd ..
node scripts/update-all-stores.js --type "code" --message "긴급 버그 수정"
```

#### 2. 기능 추가
```bash
# 1. 템플릿에 기능 추가
cd template
# 새 기능 개발

# 2. 테스트 상점에서 검증
node scripts/deploy-store.js --id "test-store"

# 3. 검증 완료 후 전체 배포
node scripts/update-all-stores.js --type "all" --message "신규 기능 추가"
```

#### 3. 설정 변경
```bash
# Firebase 설정만 업데이트
node scripts/update-all-stores.js --type "config" --message "Firestore 규칙 업데이트"
```

### 업데이트 전 체크리스트
- [ ] 템플릿 앱 로컬 테스트 완료
- [ ] 테스트 상점 배포 및 검증
- [ ] 변경사항 문서화
- [ ] 롤백 계획 수립
- [ ] 사장님들에게 사전 공지 (중요 변경 시)

### 롤백 절차
```bash
# 1. 백업에서 복원
cp -r stores/daebak/backup-{timestamp}/* stores/daebak/

# 2. 재배포
node scripts/deploy-store.js --id "daebak"
```

## 모니터링 및 알림

### 모니터링 항목
1. 서버 상태
   - Firebase Hosting 상태
   - Firebase Functions 상태
   - Firestore 쿼리 성능

2. 상점별 지표
   - 주문 수
   - 매출
   - 오류율
   - 응답 시간

3. 알림 설정
   - 배포 실패 → 이메일
   - 높은 오류율 (>5%) → Slack
   - 도메인 만료 30일 전 → 이메일

### 알림 설정 방법
```javascript
// server/monitoring/alerts.ts
import nodemailer from 'nodemailer';

export async function sendAlert(type: string, message: string) {
  if (type === 'deployment-failed') {
    await sendEmail({
      to: 'admin@myplatform.com',
      subject: '배포 실패 알림',
      body: message
    });
  }
}
```

## 백업 및 복구

### 자동 백업
매일 03:00 자동 백업 (cron):
```bash
# crontab -e
0 3 * * * /path/to/scripts/backup-all-stores.sh
```

backup-all-stores.sh:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d)
BACKUP_DIR="backups/$DATE"

mkdir -p $BACKUP_DIR

# 각 상점 Firestore 백업
for store in stores/*; do
  STORE_ID=$(basename $store)
  firebase firestore:export gs://backup-bucket/$STORE_ID/$DATE \
    --project $STORE_ID-delivery-app
done
```

### 수동 복구
```bash
# 특정 상점 복구
firebase firestore:import gs://backup-bucket/daebak/20250105 \
  --project daebak-delivery-app
```

## 비용 관리

### 월별 비용 확인
1. Firebase Console > 각 프로젝트 > Usage
2. 예상 비용 확인
3. 예산 초과 시 알림 설정

### 비용 최적화
- Firestore 인덱스 최적화
- 불필요한 Functions 호출 제거
- Storage 파일 정리
- 오래된 주문 데이터 아카이빙

## 문제 해결

### 배포 실패
1. 로그 확인: `firebase deploy --debug`
2. 권한 확인: Service Account 키 유효성
3. 빌드 오류: `npm run build` 로그 확인

### 도메인 접속 불가
1. DNS 전파 확인: `nslookup {domain}`
2. Firebase Hosting 상태 확인
3. SSL 인증서 확인

### 주문 처리 오류
1. Firestore 규칙 확인
2. Functions 로그 확인
3. 네트워크 연결 확인

## 보안

### 정기 보안 점검 (월 1회)
- [ ] Service Account 키 로테이션
- [ ] 관리자 계정 권한 검토
- [ ] Firestore 보안 규칙 검토
- [ ] API 키 노출 여부 확인

### 사고 대응
1. 즉시 영향받는 상점 비활성화
2. 로그 수집 및 분석
3. 보안 패치 적용
4. 사장님들에게 공지

## 연락처

- 기술 지원: tech@myplatform.com
- 긴급 연락: 010-XXXX-XXXX
- Slack: #platform-ops
```

---

## 추가 문서

### 1. FAQ 문서
docs/faq.md:
- 자주 묻는 질문
- 일반적인 문제 해결 방법

### 2. API 문서
docs/api-reference.md:
- 관리자 API 엔드포인트
- 인증 방법
- 요청/응답 예시

### 3. 개발자 가이드
docs/developer-guide.md:
- 템플릿 앱 구조
- 커스터마이징 방법
- 새 기능 추가 가이드

---

**Phase 15 완료**: 이제 완전한 독립 배포형 플랫폼 운영 가능!
