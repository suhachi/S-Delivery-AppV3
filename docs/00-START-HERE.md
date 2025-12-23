# 📂 KS Simple Delivery App: 마스터 가이드 (v1.0.0)

**환영합니다.** 이 문서는 `simple-delivery-app` 템플릿의 **Single Source of Truth (유일한 진실 공급원)**입니다.
복제, 구축, 배포, 운영에 필요한 모든 정보가 여기에서 시작됩니다.

---

## 🗺️ 문서 내비게이션 (Documentation Map)

업무 목적에 따라 아래 가이드를 참고하세요.

### 1️⃣ 입문 & 개념 (Basics)
- **[복제 모델의 이해](TEMPLATE_CLONE_MODEL.md)**: "템플릿 vs 상점" 구조와 불변의 법칙 (⭐ 필독)
- **[R&R 분담표](LAUNCH_PREPARATION_GUIDE.md)**: 클라이언트 vs 개발자 vs AI의 역할 정의

### 2️⃣ 실전 구축 (Execution)
- **[표준 런칭 절차서 (SOP)](STANDARD_LAUNCH_SOP.md)**: 복제부터 런칭까지 따라하는 Step-by-Step 매뉴얼 (⭐ 핵심)
- **[1호점 구축 로드맵](FIRST_CLIENT_ROADMAP.md)**: 첫 번째 클라이언트 런칭을 위한 구체적 실행 계획
- **[Firebase 프로젝트 생성 가이드](FIREBASE_PROJECT_CREATION_GUIDE.md)**: 콘솔 작업 상세 가이드 (스크린샷 대체 텍스트 포함)

### 3️⃣ 기술 설정 (Technical Config)
- **[환경변수 설정](ENVIRONMENT_SETUP.md)**: `.env` 및 `functions:config` 세팅법
- **[결제 연동 가이드](NICEPAY_SETUP.md)**: NICEPAY Sandbox/Real 키 설정법

### 4️⃣ 안전 & 배포 (Safety & Deploy)
- **[배포 전 필수 점검](DEPLOYMENT_PREFLIGHT_CHECK.md)**: 배포 전 반드시 확인해야 할 3가지 (계정/프로젝트/빌드)
- **[인덱스 배포 가이드](DEPLOYMENT_FIRESTORE_INDEXES.md)**: Firestore 복합 색인 설정

### 5️⃣ 전달 & 완료 (Handover)
- **[클라이언트 온보딩 체크리스트](CLIENT_ONBOARDING_CHECKLIST.md)**: 전체 진행상황 점검표
- **[전달 패키지 템플릿](CLIENT_HANDOVER_TEMPLATE.md)**: 점주에게 보낼 이메일/문서 양식

---

## 👥 역할별 핵심 책임 (Role Details)

성공적인 런칭을 위해 각 역할이 **반드시** 수행해야 할 핵심 의무입니다.

### 1. 🧑‍💼 클라이언트 (점주)
> **"비즈니스 자산 제공자"**
> *기술적인 내용은 몰라도 되지만, 아래 내용은 반드시 제공해야 함.*

1.  **브랜드 정의**: 상호명, 로고 이미지, 브랜드 컬러(선택).
2.  **데이터 준비**:
    - 판매할 메뉴 리스트 (사진, 가격, 설명).
    - 가게 기본 정보 (영업시간, 주소, 전화번호).
3.  **행정 절차**:
    - 사업자 등록.
    - NICEPAY 가맹 계약 (결제 연동 시 필수).

### 2. 👨‍💻 개발자 (KS Operator)
> **"인프라 구축 및 배포 실행자"**
> *AI가 작성한 코드와 스크립트를 사용하여 실제 서비스를 띄우는 주체.*

1.  **환경 구성**:
    - Firebase Console에서 프로젝트 생성 및 Blaze 요금제 설정.
    - 도메인 연결 및 DNS 설정.
2.  **파이프라인 실행**:
    - 템플릿 코드 Clone (`git checkout tags/v1.0.0`).
    - 설정 파일(`env`, `firebaserc`) 주입.
    - 배포 스크립트(`check-deploy.mjs`) 실행.
3.  **최종 검수**:
    - 관리자 페이지 접속 테스트 (상점 마법사 진입 여부).
    - 점주에게 계정 및 매뉴얼 전달.

### 3. 🤖 AI (System)
> **"기술 표준 제공자 및 안전 관리자"**
> *사람이 실수하기 쉬운 기술적 디테일을 보증.*

1.  **불변성 보장**: 템플릿 코드의 무결성을 유지하고, 커스텀 요구사항을 안전하게 반영.
2.  **안전장치 가동**: 잘못된 계정이나 프로젝트로 배포되는 것을 스크립트로 차단.
3.  **문서 현행화**: 프로세스가 변경되면 SOP 등 관련 문서를 즉시 업데이트.

---

## ⚠️ 불변의 대원칙 (Axioms)

1.  **One Code, Multi Config**: 모든 상점은 동일한 `v1.0.0` 코드를 사용한다. 오직 설정(`Config`)만 다르다.
2.  **Payment OFF Default**: 초기 배포 시 결제 기능은 무조건 **꺼져 있어야(OFF)** 한다.
3.  **Empty Start**: 데이터베이스는 비어 있어야 하며, 앱은 "상점 설정 마법사" 상태로 전달되어야 한다.

---

> *이 문서는 프로젝트의 대문입니다. 길을 잃었다면 항상 이곳으로 돌아오세요.*
