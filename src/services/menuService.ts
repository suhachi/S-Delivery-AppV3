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

// 컬렉션 참조 헬퍼 (stores/{storeId}/menus)
const getMenuCollection = (storeId: string) => collection(db, 'stores', storeId, 'menus');

// 메뉴 추가
export async function createMenu(storeId: string, menuData: Omit<Menu, 'id' | 'createdAt'>) {
  try {
    const docRef = await addDoc(getMenuCollection(storeId), {
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
export async function updateMenu(storeId: string, menuId: string, menuData: Partial<Menu>) {
  try {
    const menuRef = doc(db, 'stores', storeId, 'menus', menuId);
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
export async function deleteMenu(storeId: string, menuId: string) {
  try {
    const menuRef = doc(db, 'stores', storeId, 'menus', menuId);
    await deleteDoc(menuRef);
  } catch (error) {
    console.error('메뉴 삭제 실패:', error);
    throw error;
  }
}

// 품절 상태 변경
export async function toggleMenuSoldout(storeId: string, menuId: string, soldout: boolean) {
  try {
    const menuRef = doc(db, 'stores', storeId, 'menus', menuId);
    await updateDoc(menuRef, {
      soldout,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('품절 상태 변경 실패:', error);
    throw error;
  }
}

// 숨김 상태 변경
export async function toggleMenuHidden(storeId: string, menuId: string, isHidden: boolean) {
  try {
    const menuRef = doc(db, 'stores', storeId, 'menus', menuId);
    await updateDoc(menuRef, {
      isHidden,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('숨김 상태 변경 실패:', error);
    throw error;
  }
}

// Query 헬퍼 함수들
export function getAllMenusQuery(storeId: string) {
  return query(
    getMenuCollection(storeId),
    orderBy('createdAt', 'desc')
  );
}

export function getMenusByCategoryQuery(storeId: string, category: string) {
  return query(
    getMenuCollection(storeId),
    where('category', 'array-contains', category),
    orderBy('createdAt', 'desc')
  );
}