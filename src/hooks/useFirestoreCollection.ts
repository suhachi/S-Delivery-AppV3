import { useState, useEffect, useRef } from 'react';
import {
  Query,
  onSnapshot,
  DocumentData,
  queryEqual
} from 'firebase/firestore';

interface UseFirestoreCollectionResult<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
}

export function useFirestoreCollection<T extends DocumentData>(
  query: Query | null
): UseFirestoreCollectionResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // 쿼리 객체 참조 안정화 (Deep Compare)
  const queryRef = useRef<Query | null>(query);

  // 렌더링 도중에 ref 업데이트 (useEffect보다 먼저 실행되어야 함)
  if (!queryEqual(queryRef.current, query)) {
    queryRef.current = query;
  }

  // 이제 useEffect는 안정화된 queryRef.current가 변경될 때만 실행됨
  // 즉, 쿼리의 내용이 실제로 바뀌었을 때만 재구독 발생
  useEffect(() => {
    const activeQuery = queryRef.current;

    if (!activeQuery) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const unsubscribe = onSnapshot(
        activeQuery,
        (snapshot) => {
          const items = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as T[];

          setData(items);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error(`Firestore collection error:`, err);
          setError(err as Error);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  }, [queryRef.current]); // query 대신 queryRef.current 사용

  return { data, loading, error };
}
