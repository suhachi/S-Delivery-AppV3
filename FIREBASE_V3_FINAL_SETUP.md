# Firebase V3 최종 설정 가이드

## 📋 개요

이 문서는 S-Delivery-AppV3 프로젝트의 Firebase 설정을 완전히 마무리하기 위한 최종 가이드입니다.

---

## ✅ 완료된 작업

### 1. 환경 변수 설정 완료
- `.env.local` 파일 생성 완료
- 모든 필수 Firebase 설정 값 포함

### 2. Firebase 프로젝트 정보

```
프로젝트 이름: S-Delivery-AppV3
프로젝트 ID: fir-delivery-appv3-b3c31
프로젝트 번호: 306197195626
앱 ID: 1:306197195626:web:62904a18cd5e3e113ad313
앱 닉네임: S-Delivery-AppV3
Measurement ID: G-MWY3PRMT5W
```

### 3. 설정된 파일
- ✅ `.env.local` - 환경 변수 설정
- ✅ `.firebaserc` - Firebase 프로젝트 ID 설정
- ✅ `src/lib/firebase.ts` - Firebase 초기화 코드 (Analytics 포함)
- ✅ `src/vite-env.d.ts` - 환경 변수 타입 정의

---

## 🔧 Firebase Console에서 서비스 활성화

### 1. Authentication (인증) 활성화

1. Firebase Console 접속: https://console.firebase.google.com
2. 프로젝트 선택: `fir-delivery-appv3-b3c31`
3. 왼쪽 메뉴에서 **Authentication** 클릭
4. **"시작하기"** 클릭 (처음 사용 시)
5. **Sign-in method** 탭에서 사용할 로그인 방법 활성화:
   - ✅ **이메일/비밀번호** (필수) - Enable
   - ⚪ **Google** (선택사항)
   - ⚪ **전화번호** (선택사항)

### 2. Firestore Database (데이터베이스) 생성

1. Firebase Console > **Firestore Database** 클릭
2. **"데이터베이스 만들기"** 클릭
3. 보안 규칙 선택:
   - ⚠️ **프로덕션 모드** 선택 (보안 규칙 사용)
   - 테스트 모드는 30일 후 자동 차단됨
4. 위치 선택:
   - ✅ **asia-northeast3 (서울)** 권장
   - 또는 **asia-northeast1 (도쿄)**
5. 데이터베이스 생성 완료

### 3. Storage (파일 저장소) 활성화

1. Firebase Console > **Storage** 클릭
2. **"시작하기"** 클릭
3. 보안 규칙 선택:
   - ⚠️ **프로덕션 모드** 선택 (보안 규칙 사용)
4. 위치 선택:
   - ✅ Firestore와 동일한 위치 선택 권장
5. Storage 활성화 완료

### 4. Cloud Messaging (푸시 알림) - 선택사항

1. Firebase Console > **Cloud Messaging** 클릭
2. 웹 푸시 인증서 섹션 확인
3. **VAPID 키 쌍** 확인 (이미 `.env.local`에 설정됨)
4. 서비스 워커 등록 (향후 구현 시 필요)

---

## 🚀 보안 규칙 배포

### Firestore 보안 규칙 배포

```bash
cd D:\projectsing\S-Delivery-AppV3
firebase deploy --only firestore:rules
```

### Storage 보안 규칙 배포

```bash
firebase deploy --only storage
```

---

## 📊 Firestore 인덱스 배포

필요한 복합 인덱스가 자동으로 생성되도록 설정되어 있습니다.

```bash
firebase deploy --only firestore:indexes
```

### 필요한 인덱스 목록

1. **Orders 컬렉션**
   - `userId (ASC) + createdAt (DESC)`
   - `storeId (ASC) + status (ASC) + createdAt (DESC)`

2. **Coupons 컬렉션**
   - `isActive (ASC) + createdAt (DESC)`

3. **Notices 컬렉션**
   - `pinned (DESC) + createdAt (DESC)`

4. **Events 컬렉션**
   - `active (ASC) + startDate (ASC)`

인덱스 파일 위치: `src/firestore.indexes.json`

---

## ✅ 설정 완료 체크리스트

### Firebase Console 설정
- [ ] Authentication 활성화 (이메일/비밀번호)
- [ ] Firestore Database 생성 (프로덕션 모드, 서울 리전)
- [ ] Storage 활성화 (프로덕션 모드)
- [ ] Cloud Messaging 확인 (선택사항)

### 로컬 환경 설정
- [x] `.env.local` 파일 생성
- [x] `.firebaserc` 파일 설정
- [x] Firebase 초기화 코드 (`src/lib/firebase.ts`)
- [x] 환경 변수 타입 정의 (`src/vite-env.d.ts`)

### 배포 준비
- [ ] Firestore 보안 규칙 배포
- [ ] Storage 보안 규칙 배포
- [ ] Firestore 인덱스 배포
- [ ] 개발 서버 실행 테스트

---

## 🧪 연결 테스트

### 개발 서버 실행

```bash
cd D:\projectsing\S-Delivery-AppV3
pnpm dev
# 또는
npm run dev
```

### 브라우저 콘솔 확인

개발 서버 실행 후 브라우저 개발자 도구(F12)에서 다음을 확인:

1. **Firebase 초기화 성공 확인**
   - 콘솔에 Firebase 관련 오류가 없는지 확인
   - `✅ Firebase 초기화 성공` 메시지 확인 (있는 경우)

2. **환경 변수 로드 확인**
   - Network 탭에서 Firebase API 요청이 정상적으로 이루어지는지 확인

3. **인증 테스트**
   - 회원가입/로그인 기능이 정상 작동하는지 확인

---

## 🔒 보안 확인 사항

### 환경 변수 보안
- ✅ `.env.local` 파일은 `.gitignore`에 포함되어 Git에 커밋되지 않음
- ⚠️ **절대 `.env.local` 파일을 공개 저장소에 업로드하지 마세요**

### Firebase 보안 규칙
- ✅ Firestore 보안 규칙 파일: `firestore.rules`
- ✅ Storage 보안 규칙 파일: `storage.rules`
- ⚠️ 프로덕션 배포 전 반드시 보안 규칙을 검토하고 배포하세요

---

## 📞 문제 해결

### 환경 변수가 로드되지 않는 경우

1. **파일 이름 확인**: `.env.local` (정확한 이름 확인)
2. **서버 재시작**: 개발 서버를 중지하고 다시 시작
3. **파일 위치 확인**: 프로젝트 루트 디렉토리에 있는지 확인

### Firebase 초기화 오류

1. **환경 변수 확인**: `.env.local` 파일의 모든 값이 올바른지 확인
2. **Firebase Console 확인**: 프로젝트가 활성화되어 있는지 확인
3. **브라우저 콘솔 확인**: 정확한 오류 메시지 확인

### Firestore 권한 오류

1. **보안 규칙 확인**: `firestore.rules` 파일 검토
2. **규칙 배포 확인**: `firebase deploy --only firestore:rules` 실행
3. **인증 상태 확인**: 사용자가 올바르게 로그인되어 있는지 확인

---

## 🎯 다음 단계

Firebase 설정이 완료되면:

1. ✅ **V3 개발 계획서 확인**: `V3_DEVELOPMENT_PLAN.md`
2. ✅ **개발 로드맵 확인**: `V3_DEVELOPMENT_ROADMAP.md`
3. 🚀 **개발 시작**: 계획서와 로드맵에 따라 개발 진행

---

**작성일**: 2024년 12월  
**프로젝트**: S-Delivery-AppV3  
**Firebase 프로젝트 ID**: fir-delivery-appv3-b3c31

