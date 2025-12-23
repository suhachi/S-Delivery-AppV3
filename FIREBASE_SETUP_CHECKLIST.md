# Firebase 설정 확인 체크리스트

이 문서는 Firebase 프로젝트 설정과 환경 변수 입력을 위해 **직접 확인해서 알려줘야 할 정보들**을 정리한 것입니다.

---

## 📋 확인해야 할 정보 목록

### ✅ 필수 정보 (반드시 확인 필요)

#### 1. Firebase 프로젝트 기본 정보

**확인 위치**: Firebase Console > 프로젝트 설정 > 일반

| 항목 | 환경 변수 이름 | 확인 방법 | 예시 |
|------|---------------|----------|------|
| **API Key** | `VITE_FIREBASE_API_KEY` | 프로젝트 설정 > 일반 > 내 앱 > SDK 설정 및 구성 > 웹 앱 > apiKey | `AIzaSyCKS_ilGLymEaBjdF6oVKPKKkPc2dNCxQU` |
| **Auth Domain** | `VITE_FIREBASE_AUTH_DOMAIN` | 프로젝트 설정 > 일반 > 내 앱 > SDK 설정 및 구성 > 웹 앱 > authDomain | `simple-delivery-app-9d347.firebaseapp.com` |
| **Project ID** | `VITE_FIREBASE_PROJECT_ID` | 프로젝트 설정 > 일반 > 프로젝트 ID | `simple-delivery-app-9d347` |
| **Storage Bucket** | `VITE_FIREBASE_STORAGE_BUCKET` | 프로젝트 설정 > 일반 > 내 앱 > SDK 설정 및 구성 > 웹 앱 > storageBucket | `simple-delivery-app-9d347.firebasestorage.app` |
| **Messaging Sender ID** | `VITE_FIREBASE_MESSAGING_SENDER_ID` | 프로젝트 설정 > 일반 > 내 앱 > SDK 설정 및 구성 > 웹 앱 > messagingSenderId | `665529206596` |
| **App ID** | `VITE_FIREBASE_APP_ID` | 프로젝트 설정 > 일반 > 내 앱 > SDK 설정 및 구성 > 웹 앱 > appId | `1:665529206596:web:6e5542c21b7fe765a0b911` |

#### 2. Google Analytics (선택사항)

| 항목 | 환경 변수 이름 | 확인 방법 | 예시 |
|------|---------------|----------|------|
| **Measurement ID** | `VITE_FIREBASE_MEASUREMENT_ID` | 프로젝트 설정 > 일반 > 내 앱 > SDK 설정 및 구성 > 웹 앱 > measurementId | `G-FZ74JXV42S` |

**참고**: Google Analytics를 사용하지 않으면 이 값은 생략 가능합니다.

#### 3. Cloud Messaging VAPID Key (선택사항)

| 항목 | 환경 변수 이름 | 확인 방법 | 예시 |
|------|---------------|----------|------|
| **VAPID Key** | `VITE_FIREBASE_VAPID_KEY` | 프로젝트 설정 > 클라우드 메시징 > 웹 푸시 인증서 > 키 쌍 | `BHo92LzMekAkTjyIm7PiChVBw4pQ5dgBsqLtnl013LYGK6Pa14qmo3fHrmWiVFswiYaEdVT_qhjPWCIB2IYU_60` |

**참고**: 푸시 알림을 사용하지 않으면 이 값은 생략 가능합니다.

---

## 🔍 Firebase Console에서 정보 확인하는 방법

### 방법 1: 프로젝트 설정에서 확인 (권장)

1. [Firebase Console](https://console.firebase.google.com) 접속
2. 프로젝트 선택
3. 왼쪽 메뉴에서 **⚙️ 프로젝트 설정** 클릭
4. **일반** 탭 선택
5. **내 앱** 섹션에서 웹 앱 선택 (또는 웹 앱 추가)
6. **SDK 설정 및 구성** 섹션에서 다음 정보 확인:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`
   - `measurementId` (있는 경우)

### 방법 2: 웹 앱 등록 시 표시되는 정보

웹 앱을 새로 등록하면 다음 형식의 코드가 표시됩니다:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

이 값들을 복사하여 사용하세요.

---

## 📝 환경 변수 입력 형식

확인한 정보를 다음 형식으로 `.env` 파일에 입력하세요:

```env
# Firebase 설정 (필수)
VITE_FIREBASE_API_KEY=여기에_API_Key_입력
VITE_FIREBASE_AUTH_DOMAIN=여기에_Auth_Domain_입력
VITE_FIREBASE_PROJECT_ID=여기에_Project_ID_입력
VITE_FIREBASE_STORAGE_BUCKET=여기에_Storage_Bucket_입력
VITE_FIREBASE_MESSAGING_SENDER_ID=여기에_Messaging_Sender_ID_입력
VITE_FIREBASE_APP_ID=여기에_App_ID_입력

# Google Analytics (선택사항)
VITE_FIREBASE_MEASUREMENT_ID=여기에_Measurement_ID_입력

# VAPID Key (선택사항 - 푸시 알림용)
VITE_FIREBASE_VAPID_KEY=여기에_VAPID_Key_입력
```

---

## ✅ 확인 체크리스트

### Firebase Console 확인 사항

- [ ] Firebase Console에 로그인 가능한가?
- [ ] 프로젝트가 생성되어 있는가?
- [ ] 웹 앱이 등록되어 있는가?
- [ ] 프로젝트 설정 > 일반 메뉴 접근 가능한가?

### 필수 정보 확인

- [ ] `VITE_FIREBASE_API_KEY` 확인 완료
- [ ] `VITE_FIREBASE_AUTH_DOMAIN` 확인 완료
- [ ] `VITE_FIREBASE_PROJECT_ID` 확인 완료
- [ ] `VITE_FIREBASE_STORAGE_BUCKET` 확인 완료
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID` 확인 완료
- [ ] `VITE_FIREBASE_APP_ID` 확인 완료

### 선택 정보 확인

- [ ] `VITE_FIREBASE_MEASUREMENT_ID` 확인 (Google Analytics 사용 시)
- [ ] `VITE_FIREBASE_VAPID_KEY` 확인 (푸시 알림 사용 시)

---

## 📋 정보 제공 형식

다음 형식으로 정보를 제공해주시면 `.env` 파일을 생성해드릴 수 있습니다:

```
VITE_FIREBASE_API_KEY=실제_API_Key_값
VITE_FIREBASE_AUTH_DOMAIN=실제_Auth_Domain_값
VITE_FIREBASE_PROJECT_ID=실제_Project_ID_값
VITE_FIREBASE_STORAGE_BUCKET=실제_Storage_Bucket_값
VITE_FIREBASE_MESSAGING_SENDER_ID=실제_Messaging_Sender_ID_값
VITE_FIREBASE_APP_ID=실제_App_ID_값
VITE_FIREBASE_MEASUREMENT_ID=실제_Measurement_ID_값 (있는 경우)
VITE_FIREBASE_VAPID_KEY=실제_VAPID_Key_값 (있는 경우)
```

또는 Firebase Console에서 표시되는 `firebaseConfig` 객체를 그대로 복사해서 제공해주셔도 됩니다.

---

## 🔐 보안 주의사항

⚠️ **중요**: 
- `.env` 파일은 Git에 커밋되지 않도록 `.gitignore`에 포함되어 있습니다.
- API Key는 공개 저장소에 노출되지 않도록 주의하세요.
- 이 정보들은 프로젝트 내부에서만 사용하세요.

---

## 🆘 문제 해결

### 정보를 찾을 수 없는 경우

1. **웹 앱이 등록되지 않은 경우**:
   - Firebase Console > 프로젝트 개요 > 웹 앱 추가 (</> 아이콘)
   - 앱 닉네임 입력 후 등록

2. **프로젝트 설정에 접근할 수 없는 경우**:
   - Firebase Console 왼쪽 메뉴에서 ⚙️ 아이콘 클릭
   - 또는 프로젝트 개요 페이지에서 "프로젝트 설정" 링크 클릭

3. **Storage Bucket이 다른 형식인 경우**:
   - `your-project.appspot.com` 형식도 가능
   - `your-project.firebasestorage.app` 형식도 가능
   - Firebase Console에 표시된 값을 그대로 사용

---

## 📚 참고 문서

- [Firebase Console](https://console.firebase.google.com)
- `FIREBASE_SETUP_GUIDE.md` - 상세 설정 가이드
- `FIREBASE_CONFIG.md` - 설정 정보 (기존 프로젝트 정보 포함)

---

**다음 단계**: 정보를 확인하신 후 제공해주시면 `.env` 파일을 생성하고 설정을 완료해드리겠습니다!

