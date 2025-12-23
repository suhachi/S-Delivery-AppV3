# 관리자 계정 설정 가이드

앱을 사용하려면 관리자 계정이 필요합니다. 이 가이드에 따라 관리자 권한을 설정하세요.

## 방법 1: Firebase Console에서 직접 설정 (권장)

### 1단계: 사용자 계정 생성

1. 앱 실행 (`npm run dev`)
2. 브라우저에서 `http://localhost:5173` 접속
3. 회원가입 페이지(`/signup`)로 이동
4. 이메일과 비밀번호로 계정 생성
5. 로그인 완료

### 2단계: 사용자 UID 확인

1. [Firebase Console](https://console.firebase.google.com) 접속
2. 프로젝트 선택: `simple-delivery-app-9d347`
3. **Authentication** > **사용자** 탭 클릭
4. 방금 생성한 사용자 클릭
5. **UID** 복사 (예: `abc123def456ghi789...`)

### 3단계: 관리자 문서 생성

1. Firebase Console > **Firestore Database** > **데이터** 탭 클릭
2. **컬렉션 시작** 버튼 클릭
3. 컬렉션 ID 입력: `admins`
4. **다음** 클릭
5. 문서 ID 입력: 복사한 UID 붙여넣기
6. **필드 추가** 클릭:
   - 필드: `isAdmin`
   - 유형: `boolean` 선택
   - 값: `true` 입력
7. **필드 추가** 클릭:
   - 필드: `createdAt`
   - 유형: `timestamp` 선택
   - 값: 현재 시간 (또는 빈 값으로 두면 자동 설정)
8. **저장** 클릭

### 4단계: 확인

1. Firestore Database > 데이터 탭에서 `admins` 컬렉션 확인
2. 문서 ID가 사용자 UID와 일치하는지 확인
3. `isAdmin` 필드가 `true`인지 확인

### 5단계: 앱에서 테스트

1. 앱에서 로그아웃
2. 다시 로그인
3. `/admin` 페이지로 이동
4. 관리자 대시보드가 표시되는지 확인

## 방법 2: Firebase CLI 사용 (고급)

Firebase CLI가 설치되어 있다면:

```bash
# Firebase CLI 로그인
firebase login

# 프로젝트 선택
firebase use simple-delivery-app-9d347

# 관리자 문서 생성 (UID를 실제 값으로 변경)
firebase firestore:set admins/{USER_UID} '{"isAdmin": true, "createdAt": "2024-12-06T00:00:00Z"}'
```

## 여러 관리자 추가

여러 관리자를 추가하려면:

1. 각 사용자 계정 생성
2. 각 사용자의 UID 확인
3. `admins` 컬렉션에 각 UID로 문서 추가
4. 모든 문서에 `isAdmin: true` 설정

## 관리자 권한 확인

관리자 권한이 올바르게 설정되었는지 확인:

1. Firestore Database > 데이터 탭
2. `admins` 컬렉션 확인
3. 문서 목록에서 사용자 UID 확인
4. 각 문서의 `isAdmin` 필드가 `true`인지 확인

## 문제 해결

### 관리자 페이지 접근 불가

**원인 1: UID가 정확하지 않음**
- Firebase Console > Authentication에서 UID를 다시 확인
- Firestore의 문서 ID와 정확히 일치하는지 확인

**원인 2: isAdmin 필드가 true가 아님**
- Firestore에서 문서를 열어 `isAdmin` 필드 확인
- `true`로 수정

**원인 3: 로그인 상태 문제**
- 앱에서 로그아웃 후 다시 로그인
- 브라우저 캐시 삭제 후 재시도

**원인 4: 보안 규칙 문제**
- Firestore 보안 규칙이 올바르게 배포되었는지 확인
- `src/firestore.rules` 파일의 `admins` 컬렉션 규칙 확인

### "Permission denied" 오류

- Firestore 보안 규칙 확인
- 관리자 문서가 올바르게 생성되었는지 확인
- 사용자가 로그인되어 있는지 확인

## 보안 주의사항

⚠️ **중요**: 관리자 권한은 신중하게 부여하세요!

- 관리자는 모든 데이터에 접근할 수 있습니다
- 관리자 계정은 최소한으로 유지하세요
- 정기적으로 관리자 목록을 확인하세요
- 불필요한 관리자 권한은 즉시 제거하세요

## 다음 단계

관리자 계정 설정이 완료되면:

1. [FIREBASE_SETUP_COMPLETE.md](./FIREBASE_SETUP_COMPLETE.md) 참조
2. 초기 상점 데이터 생성
3. 메뉴 데이터 추가
4. 앱 기능 테스트

---

**관리자 계정 설정이 완료되면 앱을 사용할 수 있습니다!** 🎉

