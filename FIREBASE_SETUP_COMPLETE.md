# Firebase 연동 완료! 🎉

Firebase 연동의 필수 단계가 모두 완료되었습니다!

## ✅ 완료된 작업

- [x] Firebase 프로젝트 생성 및 설정
- [x] `.env` 파일 생성 및 설정 값 입력
- [x] Firestore 보안 규칙 배포
- [x] Storage 보안 규칙 배포
- [x] Authentication 이메일/비밀번호 활성화

## 🚀 다음 단계: 앱 실행 및 테스트

### 1. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

### 2. 첫 사용자 계정 생성

1. 앱에서 회원가입 페이지(`/signup`)로 이동
2. 이메일과 비밀번호로 계정 생성
3. Firebase Console > Authentication > 사용자 탭에서 생성된 사용자 확인

### 3. 관리자 권한 설정 (중요!)

앱을 사용하려면 관리자 계정이 필요합니다.

#### 방법: Firebase Console에서 설정

1. **사용자 UID 확인**
   - Firebase Console > Authentication > 사용자 탭
   - 방금 생성한 사용자 클릭
   - **UID 복사** (예: `abc123def456...`)

2. **관리자 문서 생성**
   - Firebase Console > Firestore Database > 데이터 탭
   - **컬렉션 시작** 클릭
   - 컬렉션 ID: `admins` 입력
   - **다음** 클릭
   - 문서 ID: 복사한 UID 입력
   - **필드 추가** 클릭:
     - 필드: `isAdmin`
     - 유형: `boolean`
     - 값: `true`
   - **필드 추가** 클릭:
     - 필드: `createdAt`
     - 유형: `timestamp`
     - 값: 현재 시간 (또는 빈 값으로 두면 자동 설정)
   - **저장** 클릭

#### 확인

- Firestore Database > 데이터 탭에서 `admins` 컬렉션이 생성되었는지 확인
- 문서 ID가 사용자 UID와 일치하는지 확인
- `isAdmin` 필드가 `true`인지 확인

### 4. 관리자 페이지 접근 테스트

1. 앱에서 로그아웃 후 다시 로그인
2. `/admin` 페이지로 이동
3. 관리자 대시보드가 표시되는지 확인

### 5. 초기 상점 데이터 생성

앱을 사용하려면 상점 정보가 필요합니다.

#### 방법 A: 앱에서 생성 (권장)

1. 관리자로 로그인
2. `/store-setup` 페이지로 이동
3. 상점 정보 입력:
   - 상점 이름
   - 설명
   - 연락처 정보
   - 배달 설정
   - 결제 방법
4. **저장** 클릭

#### 방법 B: Firebase Console에서 직접 생성

1. Firebase Console > Firestore Database > 데이터 탭
2. **컬렉션 시작** 클릭
3. 컬렉션 ID: `store` 입력
4. 문서 ID: `default` 입력
5. 필드 추가:
   ```
   name (string): "상점 이름"
   description (string): "상점 설명"
   phone (string): "010-1234-5678"
   email (string): "contact@example.com"
   address (string): "서울시 강남구..."
   deliveryFee (number): 3000
   minOrderAmount (number): 15000
   settings (map):
     autoAcceptOrders (boolean): false
     estimatedDeliveryTime (number): 30
     paymentMethods (array): ["앱결제", "만나서카드", "만나서현금"]
     enableReviews (boolean): true
     enableCoupons (boolean): true
     enableNotices (boolean): true
     enableEvents (boolean): true
   createdAt (timestamp): 현재 시간
   updatedAt (timestamp): 현재 시간
   ```
6. **저장** 클릭

### 6. 기능 테스트

#### 메뉴 관리 테스트
1. 관리자 페이지 > 메뉴 관리
2. 메뉴 추가
3. 이미지 업로드
4. Firebase Console > Firestore에서 `menus` 컬렉션 확인
5. Firebase Console > Storage에서 업로드된 이미지 확인

#### 주문 테스트
1. 일반 사용자로 로그인 (또는 새 계정 생성)
2. 메뉴 페이지에서 메뉴 선택
3. 장바구니에 추가
4. 주문하기
5. Firebase Console > Firestore에서 `orders` 컬렉션 확인

## 📋 체크리스트

### 필수 작업
- [x] Firebase 프로젝트 설정
- [x] `.env` 파일 생성
- [x] Firestore 보안 규칙 배포
- [x] Storage 보안 규칙 배포
- [x] Authentication 활성화
- [ ] 관리자 계정 생성
- [ ] 초기 상점 데이터 생성
- [ ] 개발 서버 실행 및 테스트

### 선택 작업
- [ ] 초기 메뉴 데이터 추가
- [ ] 쿠폰 데이터 추가
- [ ] 공지사항 추가
- [ ] 이벤트 배너 추가
- [ ] Firestore 인덱스 배포

## 🔍 문제 해결

### 관리자 페이지 접근 불가
- Firestore > `admins` 컬렉션에 사용자 UID가 정확히 등록되었는지 확인
- `isAdmin` 필드가 `true`인지 확인
- 로그아웃 후 다시 로그인

### "Permission denied" 오류
- Firestore/Storage 보안 규칙이 올바르게 배포되었는지 확인
- Firebase Console에서 규칙 탭 확인

### 이미지 업로드 실패
- Storage 보안 규칙 확인
- 파일 크기가 5MB 이하인지 확인
- 이미지 파일 형식인지 확인

### 데이터가 표시되지 않음
- Firestore에 데이터가 실제로 생성되었는지 확인
- 브라우저 콘솔에서 오류 메시지 확인
- 네트워크 탭에서 Firebase 요청 확인

## 📚 참고 문서

- [FIREBASE_SETUP_GUIDE.md](./FIREBASE_SETUP_GUIDE.md) - 전체 Firebase 연동 가이드
- [FIREBASE_CHECKLIST.md](./FIREBASE_CHECKLIST.md) - 단계별 체크리스트
- [NEXT_STEPS.md](./NEXT_STEPS.md) - 다음 단계 가이드

## 🎯 빠른 시작 명령어

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# Firebase CLI 로그인 (필요한 경우)
firebase login

# Firestore 인덱스 배포 (필요한 경우)
firebase deploy --only firestore:indexes
```

---

**축하합니다! Firebase 연동이 완료되었습니다! 이제 앱을 실행하고 테스트해보세요! 🚀**

