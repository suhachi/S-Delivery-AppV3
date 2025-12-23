# Phase 14: 관리자 대시보드 프롬프트 (8개)

## Prompt 14-1: 대시보드 프로젝트 설정

```
admin-dashboard/ 디렉토리에 React + TypeScript 프로젝트를 생성해줘:

초기 설정:
1. Vite + React + TypeScript 템플릿 사용
   npx create-vite@latest admin-dashboard --template react-ts
2. 필수 의존성 설치:
   - firebase-admin (서버 측)
   - firebase (클라이언트 측)
   - react-router-dom
   - @tanstack/react-query
   - axios
   - recharts (통계 차트)
   - lucide-react (아이콘)
   - tailwindcss (스타일링)

프로젝트 구조:
admin-dashboard/
├─ src/
│  ├─ pages/
│  │  ├─ Dashboard.tsx        # 메인 대시보드
│  │  ├─ StoreList.tsx        # 상점 목록
│  │  ├─ CreateStore.tsx      # 새 상점 추가
│  │  ├─ StoreDetail.tsx      # 상점 상세
│  │  └─ Login.tsx            # 관리자 로그인
│  ├─ components/
│  │  ├─ StoreCard.tsx        # 상점 카드
│  │  ├─ DeploymentProgress.tsx  # 배포 진행 상황
│  │  └─ StatsChart.tsx       # 통계 차트
│  ├─ lib/
│  │  ├─ firebase-admin.ts    # Firebase Admin SDK
│  │  ├─ api.ts               # API 호출
│  │  └─ types.ts             # 타입 정의
│  ├─ hooks/
│  │  ├─ useStores.ts         # 상점 목록 훅
│  │  └─ useDeployment.ts     # 배포 상태 훅
│  ├─ App.tsx
│  └─ main.tsx
├─ server/
│  ├─ index.ts                # Express 서버
│  ├─ routes/
│  │  ├─ stores.ts            # 상점 관리 API
│  │  └─ deployment.ts        # 배포 API
│  └─ middleware/
│     └─ auth.ts              # 인증 미들웨어
├─ package.json
├─ tsconfig.json
└─ vite.config.ts

환경변수 (.env):
VITE_ADMIN_API_URL=http://localhost:3001
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=admin-dashboard

서버 환경변수 (server/.env):
PORT=3001
FIREBASE_SERVICE_ACCOUNT_PATH=./service-account.json
```

---

## Prompt 14-2: Firebase Admin SDK 설정

```
src/lib/firebase-admin.ts 파일을 생성해줘:

목적:
여러 Firebase 프로젝트를 동시에 관리

구현:
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

// 서비스 계정 키 로드
const serviceAccount = JSON.parse(
  fs.readFileSync(
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './service-account.json',
    'utf8'
  )
);

// 기본 Admin 앱 초기화
const defaultApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// 상점별 앱 관리
const storeApps: Map<string, admin.app.App> = new Map();

// 상점 앱 초기화 또는 가져오기
export function getStoreApp(storeId: string, projectId: string): admin.app.App {
  if (storeApps.has(storeId)) {
    return storeApps.get(storeId)!;
  }

  // 상점별 서비스 계정 로드
  const storeServiceAccount = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, `../../stores/${storeId}/service-account.json`),
      'utf8'
    )
  );

  const app = admin.initializeApp(
    {
      credential: admin.credential.cert(storeServiceAccount),
      projectId
    },
    storeId
  );

  storeApps.set(storeId, app);
  return app;
}

// 상점 Firestore 가져오기
export function getStoreFirestore(storeId: string, projectId: string) {
  const app = getStoreApp(storeId, projectId);
  return app.firestore();
}

// 상점 Auth 가져오기
export function getStoreAuth(storeId: string, projectId: string) {
  const app = getStoreApp(storeId, projectId);
  return app.auth();
}

// 모든 상점 앱 정리
export function cleanupStoreApps() {
  storeApps.forEach(app => app.delete());
  storeApps.clear();
}

export default defaultApp;
```

---

## Prompt 14-3: 상점 목록 페이지

```
src/pages/StoreList.tsx 파일을 생성해줘:

UI 구성:
1. 헤더
   - 제목: "상점 관리"
   - [+ 새 상점 추가] 버튼
   - 검색창
   - 필터 (전체/활성/비활성)

2. 상점 카드 그리드 (3열)
   각 카드:
   - 상점 로고 (없으면 기본 아이콘)
   - 상점명
   - 도메인 (daebak.myplatform.com)
   - 상태 배지 (활성/비활성)
   - 통계:
     * 오늘 주문: 15건
     * 이번 달 매출: ₩1,250,000
   - 액션 버튼:
     * [상세보기]
     * [배포]
     * [설정]

3. 페이지네이션

데이터 fetching:
import { useQuery } from '@tanstack/react-query';
import { getStores } from '../lib/api';

export function StoreList() {
  const { data: stores, isLoading } = useQuery({
    queryKey: ['stores'],
    queryFn: getStores
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">상점 관리</h1>
        <button
          onClick={() => navigate('/stores/create')}
          className="btn-primary"
        >
          + 새 상점 추가
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {stores?.map(store => (
          <StoreCard key={store.id} store={store} />
        ))}
      </div>
    </div>
  );
}

API 엔드포인트 (server/routes/stores.ts):
router.get('/stores', async (req, res) => {
  try {
    // stores/ 디렉토리 스캔
    const storesDir = path.join(__dirname, '../../../stores');
    const storeDirs = fs.readdirSync(storesDir);

    const stores = await Promise.all(
      storeDirs.map(async (storeId) => {
        const configPath = path.join(storesDir, storeId, 'firebase-config.json');
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

        // Firestore에서 통계 조회
        const db = getStoreFirestore(storeId, config.projectId);
        const ordersToday = await db.collection('orders')
          .where('createdAt', '>=', startOfDay(new Date()))
          .count()
          .get();

        return {
          id: storeId,
          name: config.storeName,
          domain: config.domain,
          status: config.active ? 'active' : 'inactive',
          stats: {
            ordersToday: ordersToday.data().count,
            // ... 기타 통계
          }
        };
      })
    );

    res.json(stores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## Prompt 14-4: 새 상점 추가 폼

```
src/pages/CreateStore.tsx 파일을 생성해줘:

UI: 단계별 폼 (Stepper)

Step 1: 기본 정보
- 상점명 (필수)
- 상점 ID (영문, 필수, 중복 체크)
- 사업자번호
- 대표자명
- 전화번호

Step 2: 도메인 설정
- 서브도메인 입력
  * 입력: "daebak"
  * 미리보기: "daebak.myplatform.com"
- 도메인 사용 가능 여부 확인

Step 3: 초기 관리자 계정
- 이메일 (필수)
- 임시 비밀번호 자동 생성
- 비밀번호 표시

Step 4: 확인 및 생성
- 입력한 정보 요약 표시
- [생성하기] 버튼

구현:
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { createStore } from '../lib/api';

export function CreateStore() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    storeName: '',
    storeId: '',
    businessNumber: '',
    ownerName: '',
    phone: '',
    subdomain: '',
    adminEmail: '',
    tempPassword: ''
  });

  const createMutation = useMutation({
    mutationFn: createStore,
    onSuccess: (data) => {
      // 생성 완료 페이지로 이동
      navigate(`/stores/${data.storeId}/created`);
    }
  });

  const handleSubmit = async () => {
    createMutation.mutate(formData);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">새 상점 추가</h1>

      {/* Stepper */}
      <div className="mb-8">
        <div className="flex items-center">
          <Step number={1} active={step === 1} completed={step > 1} />
          <Step number={2} active={step === 2} completed={step > 2} />
          <Step number={3} active={step === 3} completed={step > 3} />
          <Step number={4} active={step === 4} />
        </div>
      </div>

      {/* Form */}
      {step === 1 && <BasicInfoForm data={formData} onChange={setFormData} />}
      {step === 2 && <DomainForm data={formData} onChange={setFormData} />}
      {step === 3 && <AdminAccountForm data={formData} onChange={setFormData} />}
      {step === 4 && <ConfirmationStep data={formData} />}

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={() => setStep(step - 1)}
          disabled={step === 1}
          className="btn-secondary"
        >
          이전
        </button>
        {step < 4 ? (
          <button onClick={() => setStep(step + 1)} className="btn-primary">
            다음
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={createMutation.isPending}
            className="btn-primary"
          >
            {createMutation.isPending ? '생성 중...' : '생성하기'}
          </button>
        )}
      </div>
    </div>
  );
}

API 엔드포인트 (server/routes/stores.ts):
router.post('/stores', async (req, res) => {
  const { storeName, storeId, subdomain, adminEmail } = req.body;

  try {
    // 1. Firebase 프로젝트 생성
    const { exec } = require('child_process');
    const projectResult = await execPromise(
      `node scripts/create-firebase-project.js --name "${storeName}" --id "${storeId}"`
    );

    // 2. 환경변수 주입
    await execPromise(
      `node scripts/inject-env-config.js --id "${storeId}"`
    );

    // 3. 도메인 연결
    await execPromise(
      `node scripts/setup-domain.js --id "${storeId}" --domain "${subdomain}.myplatform.com"`
    );

    // 4. 앱 배포
    await execPromise(
      `node scripts/deploy-store.js --id "${storeId}"`
    );

    // 5. 관리자 계정 생성
    const auth = getStoreAuth(storeId, projectResult.projectId);
    const tempPassword = generatePassword();
    await auth.createUser({
      email: adminEmail,
      password: tempPassword,
      emailVerified: true
    });

    res.json({
      success: true,
      storeId,
      domain: `${subdomain}.myplatform.com`,
      adminEmail,
      tempPassword
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## Prompt 14-5: 배포 진행 상황 UI

```
src/components/DeploymentProgress.tsx 파일을 생성해줘:

목적:
상점 생성/배포 시 실시간 진행 상황 표시

UI:
┌─────────────────────────────────────┐
│  상점 생성 중...                     │
├─────────────────────────────────────┤
│  ✓ Firebase 프로젝트 생성 완료       │
│  ✓ Firestore 설정 완료              │
│  ⏳ 앱 빌드 중... (45%)              │
│  ⏸ 도메인 연결 대기                 │
│  ⏸ 배포 대기                        │
├─────────────────────────────────────┤
│  전체 진행률: 45%                    │
│  [■■■■■□□□□□]                    │
└─────────────────────────────────────┘

구현:
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

interface DeploymentStep {
  id: string;
  label: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  progress?: number;
  error?: string;
}

export function DeploymentProgress({ storeId }: { storeId: string }) {
  const { data: deployment } = useQuery({
    queryKey: ['deployment', storeId],
    queryFn: () => getDeploymentStatus(storeId),
    refetchInterval: 2000, // 2초마다 폴링
    enabled: !!storeId
  });

  const steps: DeploymentStep[] = [
    { id: 'project', label: 'Firebase 프로젝트 생성', status: deployment?.projectStatus },
    { id: 'firestore', label: 'Firestore 설정', status: deployment?.firestoreStatus },
    { id: 'build', label: '앱 빌드', status: deployment?.buildStatus, progress: deployment?.buildProgress },
    { id: 'domain', label: '도메인 연결', status: deployment?.domainStatus },
    { id: 'deploy', label: '배포', status: deployment?.deployStatus }
  ];

  const totalProgress = steps.filter(s => s.status === 'completed').length / steps.length * 100;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-4">배포 진행 상황</h3>

      <div className="space-y-3">
        {steps.map(step => (
          <div key={step.id} className="flex items-center">
            {step.status === 'completed' && <CheckIcon className="text-green-500" />}
            {step.status === 'in-progress' && <SpinnerIcon className="text-blue-500" />}
            {step.status === 'failed' && <XIcon className="text-red-500" />}
            {step.status === 'pending' && <ClockIcon className="text-gray-400" />}

            <span className="ml-2">{step.label}</span>

            {step.progress !== undefined && (
              <span className="ml-auto text-sm text-gray-500">
                {step.progress}%
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6">
        <div className="flex justify-between text-sm mb-1">
          <span>전체 진행률</span>
          <span>{Math.round(totalProgress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${totalProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

WebSocket 실시간 업데이트 (선택):
// server/index.ts
import { Server } from 'socket.io';

const io = new Server(server);

io.on('connection', (socket) => {
  socket.on('subscribe-deployment', (storeId) => {
    socket.join(`deployment-${storeId}`);
  });
});

// 배포 진행 상황 브로드캐스트
function emitDeploymentProgress(storeId: string, step: string, status: string) {
  io.to(`deployment-${storeId}`).emit('deployment-progress', {
    step,
    status,
    timestamp: Date.now()
  });
}
```

---

## Prompt 14-6: 상점 상세 페이지

```
src/pages/StoreDetail.tsx 파일을 생성해줘:

URL: /stores/:storeId

UI 구성:
1. 헤더
   - 상점명
   - 상태 배지
   - 액션 버튼: [재배포] [설정] [삭제]

2. 탭 메뉴
   - 개요
   - 통계
   - 배포 기록
   - 설정

3. 개요 탭
   - 기본 정보 카드
     * 도메인
     * Firebase 프로젝트 ID
     * 생성일
     * 마지막 배포일
   - 빠른 통계
     * 오늘 주문
     * 이번 주 주문
     * 이번 달 매출
   - 최근 주문 목록 (5개)

4. 통계 탭
   - 매출 추이 차트 (recharts)
   - 주문 추이 차트
   - 인기 메뉴 Top 5

5. 배포 기록 탭
   - 배포 히스토리 테이블
     * 배포 일시
     * 버전
     * 배포자
     * 상태
     * [롤백] 버튼

6. 설정 탭
   - Firebase 설정 정보
   - 도메인 설정
   - 관리자 계정 관리

구현:
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export function StoreDetail() {
  const { storeId } = useParams();
  const { data: store } = useQuery({
    queryKey: ['store', storeId],
    queryFn: () => getStore(storeId!)
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{store?.name}</h1>
          <p className="text-gray-500">{store?.domain}</p>
        </div>
        <div className="space-x-2">
          <button className="btn-secondary">재배포</button>
          <button className="btn-secondary">설정</button>
          <button className="btn-danger">삭제</button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="stats">통계</TabsTrigger>
          <TabsTrigger value="deployments">배포 기록</TabsTrigger>
          <TabsTrigger value="settings">설정</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab store={store} />
        </TabsContent>

        <TabsContent value="stats">
          <StatsTab storeId={storeId!} />
        </TabsContent>

        <TabsContent value="deployments">
          <DeploymentsTab storeId={storeId!} />
        </TabsContent>

        <TabsContent value="settings">
          <SettingsTab store={store} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

## Prompt 14-7: 일괄 업데이트 기능

```
src/pages/BulkUpdate.tsx 파일을 생성해줘:

목적:
모든 상점에 템플릿 업데이트 일괄 적용

UI:
1. 업데이트 타입 선택
   - [ ] 코드 업데이트 (src/ 폴더)
   - [ ] 설정 업데이트 (firebase.json, firestore.rules)
   - [ ] 전체 업데이트

2. 업데이트 메시지 입력
   - "메뉴 UI 개선"

3. 대상 상점 선택
   - [✓] 전체 선택
   - [✓] daebak (대박마라탕)
   - [✓] kimchi (김치찌개)
   - [ ] chicken (치킨하우스) - 비활성

4. 미리보기
   - 변경될 파일 목록
   - 영향받는 상점 수

5. [업데이트 시작] 버튼

진행 상황:
┌─────────────────────────────────────┐
│  일괄 업데이트 진행 중...            │
├─────────────────────────────────────┤
│  ✓ daebak: 업데이트 완료             │
│  ⏳ kimchi: 빌드 중... (60%)         │
│  ⏸ chicken: 대기 중                 │
├─────────────────────────────────────┤
│  전체: 1/3 완료                      │
└─────────────────────────────────────┘

구현:
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

export function BulkUpdate() {
  const [updateType, setUpdateType] = useState<'code' | 'config' | 'all'>('code');
  const [message, setMessage] = useState('');
  const [selectedStores, setSelectedStores] = useState<string[]>([]);

  const updateMutation = useMutation({
    mutationFn: (data: {
      type: string;
      message: string;
      stores: string[];
    }) => bulkUpdateStores(data),
    onSuccess: () => {
      toast.success('일괄 업데이트 완료!');
    }
  });

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">일괄 업데이트</h1>

      {/* Update Type */}
      <div className="mb-6">
        <label className="block mb-2">업데이트 타입</label>
        <select
          value={updateType}
          onChange={(e) => setUpdateType(e.target.value as any)}
          className="select"
        >
          <option value="code">코드 업데이트</option>
          <option value="config">설정 업데이트</option>
          <option value="all">전체 업데이트</option>
        </select>
      </div>

      {/* Message */}
      <div className="mb-6">
        <label className="block mb-2">업데이트 메시지</label>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="예: 메뉴 UI 개선"
          className="input"
        />
      </div>

      {/* Store Selection */}
      <div className="mb-6">
        <label className="block mb-2">대상 상점</label>
        <StoreSelector
          selected={selectedStores}
          onChange={setSelectedStores}
        />
      </div>

      {/* Preview */}
      <div className="mb-6 p-4 bg-gray-50 rounded">
        <h3 className="font-bold mb-2">미리보기</h3>
        <p>변경될 파일: {getChangedFiles(updateType).length}개</p>
        <p>영향받는 상점: {selectedStores.length}개</p>
      </div>

      {/* Action */}
      <button
        onClick={() => updateMutation.mutate({
          type: updateType,
          message,
          stores: selectedStores
        })}
        disabled={updateMutation.isPending}
        className="btn-primary"
      >
        {updateMutation.isPending ? '업데이트 중...' : '업데이트 시작'}
      </button>

      {/* Progress */}
      {updateMutation.isPending && (
        <BulkUpdateProgress stores={selectedStores} />
      )}
    </div>
  );
}
```

---

## Prompt 14-8: 모니터링 대시보드

```
src/pages/Monitoring.tsx 파일을 생성해줘:

목적:
모든 상점의 상태를 한눈에 모니터링

UI:
1. 전체 통계 카드
   - 총 상점 수: 10개
   - 활성 상점: 8개
   - 오늘 총 주문: 150건
   - 오늘 총 매출: ₩5,250,000

2. 상점별 상태 테이블
   | 상점명 | 상태 | 오늘 주문 | 오늘 매출 | 마지막 배포 | 액션 |
   |--------|------|----------|----------|------------|------|
   | 대박마라탕 | 🟢 정상 | 25건 | ₩850,000 | 2시간 전 | [상세] |
   | 김치찌개 | 🟡 경고 | 10건 | ₩320,000 | 1일 전 | [상세] |
   | 치킨하우스 | 🔴 오류 | 0건 | ₩0 | 3일 전 | [확인] |

3. 실시간 주문 피드
   - 최근 주문 10개 (모든 상점)
   - 자동 새로고침

4. 알림 센터
   - 배포 실패 알림
   - 높은 오류율 경고
   - 도메인 만료 예정

구현:
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export function Monitoring() {
  const { data: overview } = useQuery({
    queryKey: ['monitoring-overview'],
    queryFn: getMonitoringOverview,
    refetchInterval: 30000 // 30초마다
  });

  const { data: stores } = useQuery({
    queryKey: ['monitoring-stores'],
    queryFn: getStoresStatus,
    refetchInterval: 10000 // 10초마다
  });

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">모니터링</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard
          label="총 상점 수"
          value={overview?.totalStores}
          icon={<StoreIcon />}
        />
        <StatCard
          label="활성 상점"
          value={overview?.activeStores}
          icon={<CheckIcon />}
        />
        <StatCard
          label="오늘 총 주문"
          value={overview?.todayOrders}
          icon={<ShoppingBagIcon />}
        />
        <StatCard
          label="오늘 총 매출"
          value={formatCurrency(overview?.todaySales)}
          icon={<DollarIcon />}
        />
      </div>

      {/* Stores Status Table */}
      <div className="bg-white rounded-lg shadow mb-6">
        <table className="w-full">
          <thead>
            <tr>
              <th>상점명</th>
              <th>상태</th>
              <th>오늘 주문</th>
              <th>오늘 매출</th>
              <th>마지막 배포</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {stores?.map(store => (
              <tr key={store.id}>
                <td>{store.name}</td>
                <td>
                  <StatusBadge status={store.status} />
                </td>
                <td>{store.todayOrders}건</td>
                <td>{formatCurrency(store.todaySales)}</td>
                <td>{formatRelativeTime(store.lastDeployedAt)}</td>
                <td>
                  <button onClick={() => navigate(`/stores/${store.id}`)}>
                    상세
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recent Orders Feed */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-bold mb-4">실시간 주문</h3>
        <RecentOrdersFeed />
      </div>
    </div>
  );
}

API 엔드포인트:
router.get('/monitoring/overview', async (req, res) => {
  const stores = await getAllStores();

  const stats = await Promise.all(
    stores.map(async (store) => {
      const db = getStoreFirestore(store.id, store.projectId);
      const ordersToday = await db.collection('orders')
        .where('createdAt', '>=', startOfDay(new Date()))
        .get();

      const todaySales = ordersToday.docs.reduce(
        (sum, doc) => sum + (doc.data().total || 0),
        0
      );

      return {
        ordersToday: ordersToday.size,
        todaySales
      };
    })
  );

  res.json({
    totalStores: stores.length,
    activeStores: stores.filter(s => s.active).length,
    todayOrders: stats.reduce((sum, s) => sum + s.ordersToday, 0),
    todaySales: stats.reduce((sum, s) => sum + s.todaySales, 0)
  });
});
```

---

**Phase 14 완료 후**: 관리자 대시보드를 Firebase Hosting에 배포 (Phase 15)
