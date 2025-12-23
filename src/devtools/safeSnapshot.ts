import { Query, onSnapshot, DocumentReference } from 'firebase/firestore';

/**
 * onSnapshot의 안전한 래퍼
 * - 권한 에러 시 조용히 실패
 * - enabled 옵션으로 구독 제어
 * - 에러 시 console.warn으로 로깅
 */
export function onSnapshotSafe<T = any>(
  query: Query<T> | DocumentReference<T>,
  callback: (snapshot: any) => void,
  options?: {
    enabled?: boolean;
    onError?: (error: Error) => void;
  }
) {
  const enabled = options?.enabled !== false;

  if (!enabled) {
    // 구독하지 않고 빈 unsubscribe 함수 반환
    return () => {};
  }

  try {
    return onSnapshot(
      query,
      callback,
      (error) => {
        // 권한 에러는 경고만 출력
        if (error.code === 'permission-denied') {
          console.warn('[safeSnapshot] 권한 없음:', error.message);
        } else {
          console.warn('[safeSnapshot] 에러 발생:', error);
        }

        // 커스텀 에러 핸들러 호출
        if (options?.onError) {
          options.onError(error);
        }
      }
    );
  } catch (error) {
    console.warn('[safeSnapshot] 구독 실패:', error);
    return () => {};
  }
}

export default onSnapshotSafe;
