# 🔥 Firebase 연동 가이드

커스컴배달앱을 Firebase와 연동하는 방법을 단계별로 안내합니다.

## 📋 목차

1. [Firebase 프로젝트 생성](#1-firebase-프로젝트-생성)
2. [환경 변수 설정](#2-환경-변수-설정)
3. [Firebase 서비스 활성화](#3-firebase-서비스-활성화)
4. [보안 규칙 설정](#4-보안-규칙-설정)
5. [관리자 권한 설정](#5-관리자-권한-설정)
6. [배포](#6-배포)

---

## 1. Firebase 프로젝트 생성

### 1-1. Firebase Console 접속
https://console.firebase.google.com 에 접속합니다.

### 1-2. 새 프로젝트 생성
1. "프로젝트 추가" 클릭
2. 프로젝트 이름 입력: `custom-delivery-app`
3. Google Analytics 활성화 (선택)
4. 프로젝트 생성 완료

### 1-3. 웹 앱 추가
1. 프로젝트 개요 > 앱 추가 > 웹(</>) 선택
2. 앱 닉네임 입력: `커스컴배달앱`
3. Firebase Hosting 설정 체크
4. 앱 등록

---

## 2. 환경 변수 설정

### 2-1. Firebase 설정 확인
Firebase Console > 프로젝트 설정 > 일반 > SDK 설정 및 구성

### 2-2. .env 파일 생성
프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 입력합니다:

```bash
# .env.example 파일을 복사하여 .env로 저장
cp .env.example .env
```

### 2-3. 환경 변수 입력
`.env` 파일에 Firebase Console에서 확인한 값을 입력합니다:

```env
REACT_APP_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXX
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789012
REACT_APP_FIREBASE_APP_ID=1:123456789012:web:abcdefghijk
```

---

## 3. Firebase 서비스 활성화

### 3-1. Authentication 설정
1. Firebase Console > Authentication > 시작하기
2. 로그인 방법 > 이메일/비밀번호 > 사용 설정
3. 저장

### 3-2. Firestore Database 설정
1. Firebase Console > Firestore Database > 데이터베이스 만들기
2. **프로덕션 모드로 시작** 선택
3. 위치 선택: `asia-northeast3 (서울)` 또는 `asia-northeast1 (도쿄)`
4. 사용 설정

### 3-3. Storage 설정
1. Firebase Console > Storage > 시작하기
2. 보안 규칙: 프로덕션 모드
3. 위치: Firestore와 동일한 위치 선택
4. 완료

### 3-4. Hosting 설정 (선택)
1. Firebase Console > Hosting > 시작하기
2. Firebase CLI 설치 확인
3. 프로젝트 초기화는 아래 배포 섹션 참조

---

## 4. 보안 규칙 설정

### 4-1. Firestore 보안 규칙
Firebase Console > Firestore Database > 규칙 탭에서 `firestore.rules` 파일 내용을 복사하여 붙여넣습니다.

또는 로컬에서:
```bash
firebase deploy --only firestore:rules
```

### 4-2. Storage 보안 규칙
Firebase Console > Storage > 규칙 탭에서 `storage.rules` 파일 내용을 복사하여 붙여넣습니다.

또는 로컬에서:
```bash
firebase deploy --only storage
```

---

## 5. 관리자 권한 설정

### 방법 1: Firebase Console에서 직접 설정
1. Firestore Database > 데이터 탭
2. 컬렉션 시작 > 컬렉션 ID: `admins`
3. 첫 번째 문서 추가:
   - 문서 ID: `[사용자 UID]` (Authentication에서 확인)
   - 필드 추가:
     - `isAdmin` (boolean): `true`
     - `updatedAt` (timestamp): 현재 시간

### 방법 2: Firebase CLI로 설정
```bash
# Firebase Console의 Firestore 탭에서 직접 입력하거나
# Cloud Functions를 사용하여 설정 가능
```

### 관리자 계정 확인
1. Firebase Console > Authentication > 사용자 탭
2. 관리자로 설정할 사용자의 UID 복사
3. Firestore > admins 컬렉션에 해당 UID로 문서 생성

---

## 6. 배포

### 6-1. Firebase CLI 설치
```bash
npm install -g firebase-tools
```

### 6-2. Firebase 로그인
```bash
firebase login
```

### 6-3. Firebase 프로젝트 초기화
```bash
firebase init
```

선택 사항:
- Firestore: Yes
- Storage: Yes
- Hosting: Yes
- 프로젝트 선택: 생성한 프로젝트 선택
- Firestore rules: `firestore.rules`
- Firestore indexes: `firestore.indexes.json`
- Storage rules: `storage.rules`
- Public directory: `build`
- Single-page app: Yes
- GitHub 배포: No (선택)

### 6-4. 빌드 및 배포
```bash
# 전체 배포
npm run deploy

# Hosting만 배포
npm run deploy:hosting

# Firestore 규칙만 배포
npm run deploy:firestore
```

### 6-5. 배포 URL 확인
```
Hosting URL: https://your-project.web.app
```

---

## 📝 체크리스트

완료 후 다음 사항을 확인하세요:

- [ ] Firebase 프로젝트 생성 완료
- [ ] `.env` 파일 생성 및 환경변수 입력
- [ ] Authentication (이메일/비밀번호) 활성화
- [ ] Firestore Database 생성
- [ ] Storage 활성화
- [ ] Firestore 보안 규칙 설정
- [ ] Storage 보안 규칙 설정
- [ ] 관리자 계정 설정
- [ ] 로컬에서 앱 실행 테스트
- [ ] Firebase Hosting 배포

---

## 🚨 주의사항

1. **환경 변수 보안**
   - `.env` 파일은 절대 Git에 커밋하지 마세요
   - `.gitignore`에 `.env`가 포함되어 있는지 확인하세요

2. **보안 규칙**
   - 프로덕션 모드로 시작했다면 반드시 `firestore.rules`와 `storage.rules`를 배포하세요
   - 테스트 모드는 30일 후 자동으로 비활성화됩니다

3. **관리자 권한**
   - 관리자 UID는 정확해야 합니다
   - Authentication에서 UID를 확인하세요

4. **비용 관리**
   - Firebase는 무료 할당량이 있지만, 초과 시 요금이 부과될 수 있습니다
   - Firebase Console에서 사용량을 주기적으로 확인하세요

---

## 🔍 문제 해결

### "Permission denied" 오류
→ Firestore 또는 Storage 보안 규칙을 확인하세요

### 관리자 페이지 접근 불가
→ Firestore > admins 컬렉션에 사용자 UID가 정확히 등록되었는지 확인하세요

### 이미지 업로드 실패
→ Storage 보안 규칙과 Storage 활성화 여부를 확인하세요

### 배포 오류
→ `firebase.json` 파일이 올바른지 확인하고, `npm run build`가 성공했는지 확인하세요

---

## 📚 참고 자료

- [Firebase 공식 문서](https://firebase.google.com/docs)
- [Firestore 시작하기](https://firebase.google.com/docs/firestore/quickstart)
- [Firebase Authentication](https://firebase.google.com/docs/auth/web/start)
- [Firebase Storage](https://firebase.google.com/docs/storage/web/start)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)

---

## 💡 다음 단계

Firebase 연동이 완료되면:
- 푸시 알림 (FCM) 설정
- 리뷰 시스템 구현
- 공지사항 기능 추가
- 이벤트 배너 관리
- Google Maps API 연동
