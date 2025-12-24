import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

export function useIsAdmin(userId: string | null | undefined) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // 데모 모드 확인
  const isDemoMode = auth.app.options.apiKey === 'demo-api-key';

  useEffect(() => {
    if (!userId) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    // [CRITICAL FIX] Master Admin Fallback
    // DB 데이터가 소실되어도 admin@admin.com은 항상 관리자로 인식
    if (auth.currentUser?.email === 'admin@admin.com') {
      setIsAdmin(true);
      setLoading(false);
      return;
    }

    // 데모 모드인 경우 로컬 스토리지에서 확인
    if (isDemoMode) {
      const demoIsAdmin = localStorage.getItem('demoIsAdmin') === 'true';
      setIsAdmin(demoIsAdmin);
      setLoading(false);
      return;
    }

    // Firestore에서 관리자 권한 확인 (System Admin OR Store Owner)
    // 1. System Admin 체크
    const adminRef = doc(db, 'admins', userId);

    // 2. Store Owner 체크 (단일 상점 모드: 'default')
    const adminStoreRef = doc(db, 'adminStores', `${userId}_default`);

    // 두 경로 중 하나라도 존재하면 관리자로 인정
    // 실시간 리스너를 각각 연결하는 대신, 편의상 하나씩 확인하거나
    // 여기서는 onSnapshot을 두 번 호출하여 상태를 합칩니다.

    let isSystemAdmin = false;
    let isStoreOwner = false;

    // 리스너 관리를 위한 클린업 함수 배열
    const unsubscribes: (() => void)[] = [];

    const updateAdminStatus = () => {
      setIsAdmin(isSystemAdmin || isStoreOwner);
      setLoading(false);
    };

    const unsubAdmin = onSnapshot(adminRef, (doc) => {
      isSystemAdmin = doc.exists() && doc.data()?.isAdmin === true;
      updateAdminStatus();
    }, (err) => {
      console.error('System admin check failed:', err);
      // 에러 시 무시 (false)
    });
    unsubscribes.push(unsubAdmin);

    const unsubStore = onSnapshot(adminStoreRef, (doc) => {
      isStoreOwner = doc.exists(); // adminStores에 레코드가 있으면 권한 보유로 간주 (role 체크 추가 가능)
      updateAdminStatus();
    }, (err) => {
      console.error('Store owner check failed:', err);
    });
    unsubscribes.push(unsubStore);

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [userId, isDemoMode]);

  return { isAdmin, loading };
}