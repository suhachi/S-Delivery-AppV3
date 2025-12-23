# Firebase 설정 정보

이 파일에는 실제 Firebase 프로젝트 설정 정보가 포함되어 있습니다.

## 프로젝트 정보

- **프로젝트 이름**: simple-delivery-app
- **프로젝트 ID**: simple-delivery-app-9d347
- **프로젝트 번호**: 665529206596
- **앱 ID**: 1:665529206596:web:6e5542c21b7fe765a0b911
- **호스팅 사이트**: simple-delivery-app-9d347

## .env 파일 생성

프로젝트 루트 디렉토리에 `.env` 파일을 생성하고 다음 내용을 입력하세요:

```env
# Firebase 설정
VITE_FIREBASE_API_KEY=AIzaSyCKS_ilGLymEaBjdF6oVKPKKkPc2dNCxQU
VITE_FIREBASE_AUTH_DOMAIN=simple-delivery-app-9d347.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=simple-delivery-app-9d347
VITE_FIREBASE_STORAGE_BUCKET=simple-delivery-app-9d347.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=665529206596
VITE_FIREBASE_APP_ID=1:665529206596:web:6e5542c21b7fe765a0b911
VITE_FIREBASE_MEASUREMENT_ID=G-FZ74JXV42S

# VAPID 키 (웹 푸시 알림용)
VITE_FIREBASE_VAPID_KEY=BHo92LzMekAkTjyIm7PiChVBw4pQ5dgBsqLtnl013LYGK6Pa14qmo3fHrmWiVFswiYaEdVT_qhjPWCIB2IYU_60
```

## Windows에서 .env 파일 생성 방법

1. 프로젝트 루트 디렉토리에서 PowerShell 실행
2. 다음 명령어 실행:

```powershell
@"
# Firebase 설정
VITE_FIREBASE_API_KEY=AIzaSyCKS_ilGLymEaBjdF6oVKPKKkPc2dNCxQU
VITE_FIREBASE_AUTH_DOMAIN=simple-delivery-app-9d347.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=simple-delivery-app-9d347
VITE_FIREBASE_STORAGE_BUCKET=simple-delivery-app-9d347.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=665529206596
VITE_FIREBASE_APP_ID=1:665529206596:web:6e5542c21b7fe765a0b911
VITE_FIREBASE_MEASUREMENT_ID=G-FZ74JXV42S

# VAPID 키 (웹 푸시 알림용)
VITE_FIREBASE_VAPID_KEY=BHo92LzMekAkTjyIm7PiChVBw4pQ5dgBsqLtnl013LYGK6Pa14qmo3fHrmWiVFswiYaEdVT_qhjPWCIB2IYU_60
"@ | Out-File -FilePath .env -Encoding utf8
```

또는 메모장으로:
1. 메모장 열기
2. 위의 내용 복사/붙여넣기
3. "다른 이름으로 저장" → 파일 이름: `.env` (따옴표 포함)
4. 인코딩: UTF-8 선택
5. 저장

## 다음 단계

1. ✅ `.env` 파일 생성 완료
2. ⚠️ **중요**: Firestore 보안 규칙 배포 필요
   - 현재 임시 규칙(2026년 1월 5일까지)이 설정되어 있습니다
   - `src/firestore.rules` 파일의 실제 보안 규칙을 배포해야 합니다
3. ⚠️ **중요**: Storage 보안 규칙 배포 필요
   - `src/storage.rules` 파일의 보안 규칙을 배포해야 합니다
4. 개발 서버 실행: `npm run dev`

## 보안 규칙 배포 방법

### 방법 1: Firebase Console에서 직접 배포

1. **Firestore 보안 규칙**:
   - Firebase Console > Firestore Database > 규칙 탭
   - `src/firestore.rules` 파일 내용 복사
   - 규칙 편집기에 붙여넣기
   - "게시" 클릭

2. **Storage 보안 규칙**:
   - Firebase Console > Storage > 규칙 탭
   - `src/storage.rules` 파일 내용 복사
   - 규칙 편집기에 붙여넣기
   - "게시" 클릭

### 방법 2: Firebase CLI 사용

```bash
# Firebase CLI 설치 (아직 안 했다면)
npm install -g firebase-tools

# Firebase 로그인
firebase login

# 프로젝트 연결
firebase use simple-delivery-app-9d347

# 보안 규칙 배포
firebase deploy --only firestore:rules,storage
```

## 확인 사항

- [ ] `.env` 파일 생성 완료
- [ ] Firestore 보안 규칙 배포 완료
- [ ] Storage 보안 규칙 배포 완료
- [ ] 개발 서버 실행 테스트 (`npm run dev`)
- [ ] 브라우저에서 앱 접속 테스트
- [ ] 회원가입/로그인 테스트
- [ ] Firebase Console에서 데이터 확인

---

**⚠️ 주의**: `.env` 파일은 Git에 커밋되지 않도록 `.gitignore`에 포함되어 있습니다.

