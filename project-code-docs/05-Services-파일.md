# Services 파일

## src/services/menuService.ts

```typescript
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Menu } from '../types/menu';

const COLLECTION_NAME = 'menus';

// 메뉴 추가
export async function createMenu(menuData: Omit<Menu, 'id' | 'createdAt'>) {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...menuData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('메뉴 추가 실패:', error);
    throw error;
  }
}

// 메뉴 수정
export async function updateMenu(menuId: string, menuData: Partial<Menu>) {
  try {
    const menuRef = doc(db, COLLECTION_NAME, menuId);
    await updateDoc(menuRef, {
      ...menuData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('메뉴 수정 실패:', error);
    throw error;
  }
}

// 메뉴 삭제
export async function deleteMenu(menuId: string) {
  try {
    const menuRef = doc(db, COLLECTION_NAME, menuId);
    await deleteDoc(menuRef);
  } catch (error) {
    console.error('메뉴 삭제 실패:', error);
    throw error;
  }
}

// 품절 상태 변경
export async function toggleMenuSoldout(menuId: string, soldout: boolean) {
  try {
    const menuRef = doc(db, COLLECTION_NAME, menuId);
    await updateDoc(menuRef, {
      soldout,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('품절 상태 변경 실패:', error);
    throw error;
  }
}

// Query 헬퍼 함수들
export function getMenusQuery() {
  return query(
    collection(db, COLLECTION_NAME),
    orderBy('createdAt', 'desc')
  );
}

export function getMenusByCategoryQuery(category: string) {
  return query(
    collection(db, COLLECTION_NAME),
    where('category', 'array-contains', category),
    orderBy('createdAt', 'desc')
  );
}
```

## src/services/orderService.ts

```typescript
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Order, OrderStatus } from '../types/order';

const COLLECTION_NAME = 'orders';

// 주문 생성
export async function createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...orderData,
      status: '접수' as OrderStatus,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('주문 생성 실패:', error);
    throw error;
  }
}

// 주문 상태 변경
export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  try {
    const orderRef = doc(db, COLLECTION_NAME, orderId);
    await updateDoc(orderRef, {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('주문 상태 변경 실패:', error);
    throw error;
  }
}

// 주문 취소
export async function cancelOrder(orderId: string) {
  try {
    const orderRef = doc(db, COLLECTION_NAME, orderId);
    await updateDoc(orderRef, {
      status: '취소' as OrderStatus,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('주문 취소 실패:', error);
    throw error;
  }
}

// Query 헬퍼 함수들
export function getUserOrdersQuery(userId: string) {
  return query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
}

export function getAllOrdersQuery() {
  return query(
    collection(db, COLLECTION_NAME),
    orderBy('createdAt', 'desc')
  );
}

export function getOrdersByStatusQuery(status: OrderStatus) {
  return query(
    collection(db, COLLECTION_NAME),
    where('status', '==', status),
    orderBy('createdAt', 'desc')
  );
}
```

## src/services/couponService.ts

```typescript
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  where,
  orderBy,
  increment
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Coupon } from '../types/coupon';

const COLLECTION_NAME = 'coupons';

// 쿠폰 생성
export async function createCoupon(couponData: Omit<Coupon, 'id' | 'createdAt' | 'usedCount'>) {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...couponData,
      usedCount: 0,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('쿠폰 생성 실패:', error);
    throw error;
  }
}

// 쿠폰 수정
export async function updateCoupon(couponId: string, couponData: Partial<Coupon>) {
  try {
    const couponRef = doc(db, COLLECTION_NAME, couponId);
    await updateDoc(couponRef, {
      ...couponData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('쿠폰 수정 실패:', error);
    throw error;
  }
}

// 쿠폰 삭제
export async function deleteCoupon(couponId: string) {
  try {
    const couponRef = doc(db, COLLECTION_NAME, couponId);
    await deleteDoc(couponRef);
  } catch (error) {
    console.error('쿠폰 삭제 실패:', error);
    throw error;
  }
}

// 쿠폰 활성화/비활성화
export async function toggleCouponActive(couponId: string, isActive: boolean) {
  try {
    const couponRef = doc(db, COLLECTION_NAME, couponId);
    await updateDoc(couponRef, {
      isActive,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('쿠폰 상태 변경 실패:', error);
    throw error;
  }
}

// 쿠폰 사용
export async function useCoupon(couponId: string) {
  try {
    const couponRef = doc(db, COLLECTION_NAME, couponId);
    await updateDoc(couponRef, {
      usedCount: increment(1),
    });
  } catch (error) {
    console.error('쿠폰 사용 처리 실패:', error);
    throw error;
  }
}

// Query 헬퍼 함수들
export function getAllCouponsQuery() {
  return query(
    collection(db, COLLECTION_NAME),
    orderBy('createdAt', 'desc')
  );
}

export function getActiveCouponsQuery() {
  return query(
    collection(db, COLLECTION_NAME),
    where('isActive', '==', true),
    orderBy('createdAt', 'desc')
  );
}
```

## src/services/reviewService.ts

```typescript
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Review, CreateReviewData, UpdateReviewData } from '../types/review';

const REVIEWS_COLLECTION = 'reviews';
const ORDERS_COLLECTION = 'orders';

/**
 * 리뷰 생성
 */
export async function createReview(
  reviewData: CreateReviewData
): Promise<string> {
  try {
    // 1. 리뷰 생성
    const docRef = await addDoc(collection(db, REVIEWS_COLLECTION), {
      ...reviewData,
      createdAt: serverTimestamp(),
    });

    // 2. 주문 문서에 리뷰 정보 미러링
    const orderRef = doc(db, ORDERS_COLLECTION, reviewData.orderId);
    await updateDoc(orderRef, {
      reviewed: true,
      reviewText: reviewData.comment,
      reviewRating: reviewData.rating,
      reviewedAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error('리뷰 생성 실패:', error);
    throw error;
  }
}

/**
 * 리뷰 수정
 */
export async function updateReview(
  reviewId: string,
  reviewData: UpdateReviewData
): Promise<void> {
  try {
    const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
    await updateDoc(reviewRef, {
      ...reviewData,
      updatedAt: serverTimestamp(),
    });

    // 주문 문서 업데이트 로직 (선택적)
    // 여기서는 간단하게 생략하거나 필요 시 추가 구현
  } catch (error) {
    console.error('리뷰 수정 실패:', error);
    throw error;
  }
}

/**
 * 리뷰 삭제
 */
export async function deleteReview(
  reviewId: string,
  orderId: string
): Promise<void> {
  try {
    // 1. 리뷰 삭제
    const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
    await deleteDoc(reviewRef);

    // 2. 주문 문서 리뷰 필드 초기화
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(orderRef, {
      reviewed: false,
      reviewText: null,
      reviewRating: null,
      reviewedAt: null,
    });
  } catch (error) {
    console.error('리뷰 삭제 실패:', error);
    throw error;
  }
}

/**
 * 특정 주문의 리뷰 조회
 */
export async function getReviewByOrder(
  orderId: string,
  userId: string
): Promise<Review | null> {
  try {
    const q = query(
      collection(db, REVIEWS_COLLECTION),
      where('orderId', '==', orderId),
      where('userId', '==', userId)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as Review;
  } catch (error) {
    console.error('리뷰 조회 실패:', error);
    throw error;
  }
}

/**
 * 모든 리뷰 쿼리 (최신순)
 */
export function getAllReviewsQuery() {
  return query(
    collection(db, REVIEWS_COLLECTION),
    orderBy('createdAt', 'desc')
  );
}

/**
 * 특정 평점 이상 리뷰 쿼리
 */
export function getReviewsByRatingQuery(minRating: number) {
  return query(
    collection(db, REVIEWS_COLLECTION),
    where('rating', '>=', minRating),
    orderBy('rating', 'desc'),
    orderBy('createdAt', 'desc')
  );
}
```

## src/services/noticeService.ts

```typescript
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Notice, NoticeCategory } from '../types/notice';

const COLLECTION_NAME = 'notices';

/**
 * 공지사항 생성
 */
export async function createNotice(
  noticeData: Omit<Notice, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...noticeData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('공지사항 생성 실패:', error);
    throw error;
  }
}

/**
 * 공지사항 수정
 */
export async function updateNotice(
  noticeId: string,
  noticeData: Partial<Omit<Notice, 'id' | 'createdAt'>>
): Promise<void> {
  try {
    const noticeRef = doc(db, COLLECTION_NAME, noticeId);
    await updateDoc(noticeRef, {
      ...noticeData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('공지사항 수정 실패:', error);
    throw error;
  }
}

/**
 * 공지사항 삭제
 */
export async function deleteNotice(
  noticeId: string
): Promise<void> {
  try {
    const noticeRef = doc(db, COLLECTION_NAME, noticeId);
    await deleteDoc(noticeRef);
  } catch (error) {
    console.error('공지사항 삭제 실패:', error);
    throw error;
  }
}

/**
 * 공지사항 고정 토글
 */
export async function toggleNoticePinned(
  noticeId: string,
  pinned: boolean
): Promise<void> {
  try {
    const noticeRef = doc(db, COLLECTION_NAME, noticeId);
    await updateDoc(noticeRef, {
      pinned,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('공지사항 고정 상태 변경 실패:', error);
    throw error;
  }
}

/**
 * 모든 공지사항 쿼리 (고정 공지 우선, 최신순)
 */
export function getAllNoticesQuery() {
  return query(
    collection(db, COLLECTION_NAME),
    orderBy('pinned', 'desc'),
    orderBy('createdAt', 'desc')
  );
}

/**
 * 카테고리별 공지사항 쿼리
 */
export function getNoticesByCategoryQuery(category: NoticeCategory) {
  return query(
    collection(db, COLLECTION_NAME),
    where('category', '==', category),
    orderBy('pinned', 'desc'),
    orderBy('createdAt', 'desc')
  );
}

/**
 * 고정된 공지사항만 조회
 */
export function getPinnedNoticesQuery() {
  return query(
    collection(db, COLLECTION_NAME),
    where('pinned', '==', true),
    orderBy('createdAt', 'desc')
  );
}
```

## src/services/eventService.ts

```typescript
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Event } from '../types/event';

const COLLECTION_NAME = 'events';

/**
 * 이벤트 생성
 */
export async function createEvent(
  eventData: Omit<Event, 'id' | 'createdAt'>
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      title: eventData.title,
      imageUrl: eventData.imageUrl,
      link: eventData.link,
      active: eventData.active,
      startDate: Timestamp.fromDate(new Date(eventData.startDate)),
      endDate: Timestamp.fromDate(new Date(eventData.endDate)),
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('이벤트 생성 실패:', error);
    throw error;
  }
}

/**
 * 이벤트 수정
 */
export async function updateEvent(
  eventId: string,
  eventData: Partial<Omit<Event, 'id' | 'createdAt'>>
): Promise<void> {
  try {
    const eventRef = doc(db, COLLECTION_NAME, eventId);
    const updateData: any = {};

    if (eventData.title !== undefined) updateData.title = eventData.title;
    if (eventData.imageUrl !== undefined) updateData.imageUrl = eventData.imageUrl;
    if (eventData.link !== undefined) updateData.link = eventData.link;
    if (eventData.active !== undefined) updateData.active = eventData.active;
    if (eventData.startDate !== undefined) {
      updateData.startDate = Timestamp.fromDate(new Date(eventData.startDate));
    }
    if (eventData.endDate !== undefined) {
      updateData.endDate = Timestamp.fromDate(new Date(eventData.endDate));
    }

    await updateDoc(eventRef, updateData);
  } catch (error) {
    console.error('이벤트 수정 실패:', error);
    throw error;
  }
}

/**
 * 이벤트 삭제
 */
export async function deleteEvent(
  eventId: string
): Promise<void> {
  try {
    const eventRef = doc(db, COLLECTION_NAME, eventId);
    await deleteDoc(eventRef);
  } catch (error) {
    console.error('이벤트 삭제 실패:', error);
    throw error;
  }
}

/**
 * 이벤트 활성화 토글
 */
export async function toggleEventActive(
  eventId: string,
  active: boolean
): Promise<void> {
  try {
    const eventRef = doc(db, COLLECTION_NAME, eventId);
    await updateDoc(eventRef, { active });
  } catch (error) {
    console.error('이벤트 활성화 상태 변경 실패:', error);
    throw error;
  }
}

/**
 * 모든 이벤트 쿼리 (생성일 내림차순)
 */
export function getAllEventsQuery() {
  return query(
    collection(db, COLLECTION_NAME),
    orderBy('createdAt', 'desc')
  );
}

/**
 * 활성화된 이벤트만 조회
 */
export function getActiveEventsQuery() {
  return query(
    collection(db, COLLECTION_NAME),
    where('active', '==', true),
    orderBy('startDate', 'asc')
  );
}
```

## src/services/storageService.ts

```typescript
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  uploadBytesResumable,
  UploadTask
} from 'firebase/storage';
import { storage } from '../lib/firebase';

// 이미지 업로드
export async function uploadImage(
  file: File, 
  path: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  try {
    const storageRef = ref(storage, path);
    
    if (onProgress) {
      // 진행상황을 추적하려면 uploadBytesResumable 사용
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(progress);
          },
          (error) => {
            console.error('이미지 업로드 실패:', error);
            reject(error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          }
        );
      });
    } else {
      // 간단한 업로드
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    }
  } catch (error) {
    console.error('이미지 업로드 실패:', error);
    throw error;
  }
}

// 메뉴 이미지 업로드
export async function uploadMenuImage(
  file: File,
  menuId: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  const path = `menus/${menuId}/${Date.now()}_${file.name}`;
  return uploadImage(file, path, onProgress);
}

// 프로필 이미지 업로드
export async function uploadProfileImage(
  file: File,
  userId: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  const path = `profiles/${userId}/${Date.now()}_${file.name}`;
  return uploadImage(file, path, onProgress);
}

// 이미지 삭제
export async function deleteImage(imageUrl: string): Promise<void> {
  try {
    // URL에서 파일 경로 추출
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error) {
    console.error('이미지 삭제 실패:', error);
    throw error;
  }
}

// 파일 유효성 검사
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: '지원되는 이미지 형식: JPG, PNG, WebP',
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: '이미지 크기는 5MB 이하여야 합니다',
    };
  }

  return { valid: true };
}

// 이미지 리사이즈 (선택적)
export async function resizeImage(
  file: File,
  maxWidth: number = 800,
  maxHeight: number = 800
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // 비율 유지하면서 리사이즈
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('이미지 리사이즈 실패'));
            }
          },
          file.type,
          0.9
        );
      };
      
      img.onerror = () => reject(new Error('이미지 로드 실패'));
    };
    
    reader.onerror = () => reject(new Error('파일 읽기 실패'));
  });
}
```

