import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging, isSupported } from 'firebase/messaging';

// Firebase 설정
// .env 파일에서 환경 변수를 불러옵니다
// .env.example 파일을 참고하여 .env.local 파일을 생성하세요
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// 필수 환경 변수 검증
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const;

const missingVars = requiredEnvVars.filter(
  (varName) => !import.meta.env[varName]
);

if (missingVars.length > 0) {
  console.error(
    '❌ Firebase 환경 변수가 설정되지 않았습니다:',
    missingVars.join(', ')
  );
  console.error(
    '💡 .env.example 파일을 참고하여 .env.local 파일을 생성하고 Firebase 설정을 추가하세요.'
  );
  throw new Error(
    `Firebase 환경 변수가 누락되었습니다: ${missingVars.join(', ')}`
  );
}

// Firebase 초기화
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error('❌ Firebase 초기화 실패:', error);
  throw new Error('Firebase 초기화에 실패했습니다. 환경 변수를 확인하세요.');
}

// Firebase 서비스 초기화
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  ignoreUndefinedProperties: true
});
export const storage = getStorage(app);

// Firebase Analytics (브라우저 환경에서만)
let analytics: any = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}
export { analytics };

// Firebase Cloud Messaging (FCM) - 선택적
let messaging: any = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      messaging = getMessaging(app);
    }
  });
}
export { messaging };

export default app;