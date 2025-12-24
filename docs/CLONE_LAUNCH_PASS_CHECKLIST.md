# S-Delivery v3.0 Clone & Launch PASS Checklist

이 문서는 S-Delivery v3.0 기반의 상점 앱을 복제(Clone)하고 런칭할 때 반드시 확인해야 할 **PASS / FAIL 기준**을 정의합니다.
이 과정에서 하나라도 FAIL이 발생하면 런칭할 수 없습니다.

## A. Repo Integrity (필수 파일 확인)
- [ ] `firebase.json` 존재 여부 (indexes 설정 포함 확인)
- [ ] `firestore.indexes.json` 존재 여부 (Upsell 복합 인덱스 포함 확인)
- [ ] `functions/src/scheduled/statsDailyV3.ts` 존재 여부 (v2 scheduler)
- [ ] `functions/package.json` 존재 여부

## B. .env / Firebase Config
- [ ] `.env` 파일이 생성되었는가? (템플릿 복사)
- [ ] `VITE_FIREBASE_API_KEY` 등 필수 키가 교체되었는가? **(Template 값 사용 금지)**
- [ ] `VITE_FCM_VAPID_KEY` 설정 확인

## C. Firestore Rules & Indexes
- [ ] **Firestore Rules 배포**
  ```bash
  firebase deploy --only firestore:rules
  ```
- [ ] **Firestore Indexes 배포 (Upsell 필수)**
  ```bash
  firebase deploy --only firestore:indexes
  ```
- [ ] **PASS 기준**: 배포 성공 메시지 확인. `Missing Index` 에러가 앱 구동 중 발생하지 않아야 함.

## D. Functions Deploy (Daily Reports)
- [ ] **Dependencies 설치**
  ```bash
  cd functions
  npm ci
  ```
- [ ] **Functions 배포**
  ```bash
  firebase deploy --only functions
  ```
- [ ] **PASS 기준**: `statsDailyV3` 함수가 에러 없이 배포되어야 함.
- [ ] **설정 확인**: Cloud Console에서 `statsDailyV3`가 `asia-northeast3`, `dailly 00:10 KST`로 설정되었는지 확인.

## E. Hosting Deploy
- [ ] **Build & Deploy**
  ```bash
  npm run build
  firebase deploy --only hosting
  ```
- [ ] **PASS 기준**: 배포된 URL 접속 시 404가 없고, 메인 페이지가 정상 로딩됨.

## F. Admin 초기 설정
- [ ] **최초 로그인**: 관리자 계정 생성 및 로그인
- [ ] **상점 설정**: `/store-setup` 또는 `/admin/store-settings` 진입
- [ ] **영업 시간 / 배달팁 설정**: 초기값 입력 확인
- [ ] **PASS 기준**: 상점이 생성되고 `stores/default` 문서가 Firestore에 존재함.

## G. 고객 플로우 QA
- [ ] **메뉴 조회**: 메뉴 리스트 정상 출력 (숨김 메뉴 제외 확인)
- [ ] **장바구니 담기**: 정상 동작
- [ ] **주문 접수**: 테스트 결제 및 주문 생성 확인
- [ ] **재주문 확인**: `내 주문` 목록 -> `같은 메뉴 담기` 클릭 -> 옵션 초기화된 상태로 장바구니 이동 확인
- [ ] **PASS 기준**: 전체 주문 사이클(접수~완료) 에러 없음.

## H. Upsell QA
- [ ] **장바구니 Upsell 노출**: 장바구니 페이지 하단 `함께 즐기면 좋은 메뉴` 섹션 노출
- [ ] **동작 확인**: 추천 메뉴 '담기' 클릭 시 장바구니 추가됨
- [ ] **PASS 기준**: 콘솔에 `index missing` 에러가 없어야 함.

## I. Daily Report QA
- [ ] **페이지 접속**: `/admin/daily-reports` 접속
- [ ] **데이터 확인**: "아직 집계된 데이터가 없습니다" (첫 런칭 직후 정상)
- [ ] **PASS 기준**: 페이지 로딩 시 타임존 에러나 권한 에러가 없어야 함.

## J. 운영 금지 규칙 (절대 위반 금지)
- [ ] **[FAIL]** 운영 DB 삭제 (Firestore 콘솔에서 전체 삭제 금지)
- [ ] **[FAIL]** `statsDailyV3` 함수 삭제 (리포트 중단됨)
- [ ] **[FAIL]** 고객 실결제 유도 (테스트 모드 PG 반드시 확인)

## K. 런칭 후 24h 모니터링 최소 체크
- [ ] 런칭 다음 날 오전 00:15 이후 `statsDailyV3` 실행 로그 확인 ("Completed" 메시지)
- [ ] Admin Daily Report 페이지에서 데이터 조회 되는지 확인

## L. RISK (Option A - Owner Accepted)
> **[RISK] statsDailyV3 Daily Full Scan**
> - **내용**: 일일 리포트 생성 시 `db.collection("stores").get()`으로 모든 상점을 스캔함.
> - **영향**: 상점 수가 1,000개 이상으로 늘어날 경우 Read 비용이 선형 증가.
> - **조치**: 현재 MVP 단계에서는 허용(Acceptable Risk). 향후 `updatedAt` 기반 스캔이나 Group Query로 고도화 필요.
> - **PASS 기준**: 위 비용 리스크를 인지하고 출시함.
