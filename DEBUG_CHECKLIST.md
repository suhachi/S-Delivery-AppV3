# 빈 화면 디버깅 체크리스트

## 🔍 즉시 확인할 사항

### 1. 브라우저 콘솔 확인

브라우저 개발자 도구 (F12) > Console 탭에서 다음 메시지 확인:

✅ **정상적인 경우:**
```
🚀 App starting...
✅ Root element found
✅ App rendered
Firebase Config: { projectId: "...", authDomain: "...", hasApiKey: true }
StoreContext: Subscribing to store/default
StoreContext: Snapshot received { exists: false }
```

❌ **문제가 있는 경우:**
- `❌ Root element not found!` → HTML 문제
- Firebase 오류 메시지 → Firebase 연결 문제
- `Store subscription error` → Firestore 권한 문제

### 2. Elements 탭 확인

1. Elements 탭 클릭
2. `<div id="root">` 찾기
3. 내부에 내용이 있는지 확인

**정상:**
```html
<div id="root">
  <div class="min-h-screen ...">
    <!-- 앱 내용 -->
  </div>
</div>
```

**문제:**
```html
<div id="root"></div>
<!-- 비어있음 -->
```

### 3. Network 탭 확인

**확인 사항:**
- ✅ 모든 `.tsx`, `.ts` 파일이 200 상태
- ✅ `firebase_firestore.js` 파일이 로드됨
- ❌ 404 오류가 있는 파일
- ❌ Firestore 요청이 실패하는지

### 4. 로딩 화면 확인

화면에 "로딩 중..." 메시지가 보이는지 확인:

- **보임**: Context가 로딩 중 (정상, 잠시 기다림)
- **안 보임**: 다른 문제 (콘솔 확인 필요)

## 🛠️ 단계별 해결

### Step 1: 콘솔 메시지 확인

브라우저 콘솔에서 다음을 확인:

```javascript
// 1. React가 마운트되었는지
document.getElementById('root').innerHTML

// 2. Firebase가 초기화되었는지
window.firebase || 'Firebase not in window'

// 3. 현재 URL
window.location.href
```

### Step 2: .env 파일 확인

터미널에서:
```bash
# Windows PowerShell
Get-Content .env

# 또는
cat .env
```

확인 사항:
- 파일이 존재하는지
- 모든 값이 올바르게 입력되었는지
- `VITE_` 접두사가 있는지

### Step 3: Firebase 연결 테스트

브라우저 콘솔에서:
```javascript
// Firebase가 초기화되었는지 확인
import { db } from './lib/firebase';
console.log('Firestore:', db);
```

### Step 4: 강제 새로고침

1. **Ctrl + Shift + R** (하드 리프레시)
2. 또는 개발자 도구 > Network 탭 > "Disable cache" 체크 후 새로고침

### Step 5: 개발 서버 재시작

터미널에서:
```bash
# 서버 종료 (Ctrl + C)
# 서버 재시작
npm run dev
```

## 📋 체크리스트

다음 항목을 순서대로 확인하세요:

- [ ] 브라우저 콘솔에 "🚀 App starting..." 메시지가 보임
- [ ] 브라우저 콘솔에 "✅ App rendered" 메시지가 보임
- [ ] 브라우저 콘솔에 Firebase Config 로그가 보임
- [ ] 브라우저 콘솔에 StoreContext 로그가 보임
- [ ] Elements 탭에서 `#root` 내부에 내용이 있음
- [ ] Network 탭에서 모든 파일이 200 상태
- [ ] `.env` 파일이 올바르게 설정됨
- [ ] 로딩 화면이 보이거나 WelcomePage가 보임

## 🆘 여전히 해결되지 않으면

다음 정보를 제공해주세요:

1. **브라우저 콘솔의 전체 메시지** (스크린샷 또는 텍스트)
2. **Network 탭의 오류** (빨간색으로 표시된 항목)
3. **Elements 탭의 `#root` 내용** (스크린샷)
4. **개발 서버 터미널의 메시지** (오류가 있다면)

---

**디버깅 로그가 추가되었습니다. 브라우저 콘솔을 확인하세요!**

