# 빈 화면 문제 해결 가이드

## 🔍 문제 진단

### 1. 브라우저 개발자 도구 확인

**콘솔 탭 확인:**
1. F12 또는 우클릭 > 검사
2. Console 탭 클릭
3. 빨간색 오류 메시지 확인

**Elements 탭 확인:**
1. Elements 탭 클릭
2. `<div id="root">` 요소 찾기
3. 내부에 내용이 있는지 확인

**Network 탭 확인:**
- ✅ 파일들이 200 상태로 로드되는지 확인
- ❌ 404 또는 500 오류가 있는지 확인

### 2. 일반적인 원인

#### 원인 1: Firebase 연결 실패
- `.env` 파일이 없거나 잘못된 값
- Firebase 프로젝트가 활성화되지 않음

#### 원인 2: Context 로딩 중
- `StoreContext`가 `store/default` 문서를 기다리는 중
- 문서가 없어서 계속 로딩 상태

#### 원인 3: CSS가 로드되지 않음
- Tailwind CSS가 제대로 빌드되지 않음

#### 원인 4: JavaScript 오류
- import 경로 오류
- 타입 오류

## 🛠️ 해결 방법

### 방법 1: 브라우저 콘솔에서 직접 확인

브라우저 콘솔에 다음을 입력:

```javascript
// React가 마운트되었는지 확인
document.getElementById('root')

// Firebase가 초기화되었는지 확인
window.firebase || console.log('Firebase not found')

// 현재 URL 확인
window.location.href
```

### 방법 2: 로딩 상태 확인

`StoreContext`가 로딩 중일 수 있습니다. 다음을 확인:

1. 브라우저 콘솔에서:
```javascript
// StoreContext 로딩 상태 확인
localStorage.getItem('demoUser')
```

2. Network 탭에서 Firestore 요청 확인:
- `firestore.googleapis.com`로 요청이 가는지 확인
- 오류가 있는지 확인

### 방법 3: Firebase 연결 확인

`.env` 파일이 올바른지 확인:

```bash
# .env 파일 확인
cat .env
```

필수 값:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_AUTH_DOMAIN`

### 방법 4: 강제 새로고침

1. Ctrl + Shift + R (하드 리프레시)
2. 또는 개발자 도구 > Network 탭 > "Disable cache" 체크 후 새로고침

### 방법 5: 로그 추가로 디버깅

`src/main.tsx`에 로그 추가:

```typescript
console.log('App starting...');
createRoot(document.getElementById("root")!).render(<App />);
console.log('App rendered');
```

## 🔧 빠른 수정

### 임시 해결: 로딩 화면 추가

`App.tsx`에 로딩 화면을 추가하여 문제를 확인:

```typescript
function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const { loading: storeLoading } = useStore();
  
  if (authLoading || storeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }
  
  // ... 나머지 코드
}
```

## 📋 체크리스트

- [ ] 브라우저 콘솔에 오류가 있는지 확인
- [ ] `.env` 파일이 올바르게 설정되었는지 확인
- [ ] Network 탭에서 모든 파일이 200으로 로드되는지 확인
- [ ] Elements 탭에서 `#root` 요소에 내용이 있는지 확인
- [ ] Firebase Console에서 프로젝트가 활성화되어 있는지 확인
- [ ] Firestore `store/default` 문서가 생성되었는지 확인

## 🆘 여전히 해결되지 않으면

1. **터미널 확인:**
   - 개발 서버가 실행 중인지 확인
   - 오류 메시지가 있는지 확인

2. **브라우저 캐시 삭제:**
   - Ctrl + Shift + Delete
   - 캐시된 이미지 및 파일 삭제

3. **다른 브라우저 시도:**
   - Chrome, Firefox, Edge 등

4. **로그 확인:**
   - 개발 서버 터미널의 오류 메시지
   - 브라우저 콘솔의 오류 메시지

---

**문제가 계속되면 브라우저 콘솔의 정확한 오류 메시지를 알려주세요!**

