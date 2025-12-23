import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Menu } from '../types/menu';
import { CartItem } from '../contexts/CartContext';

export function useUpsell(storeId: string | undefined, cartItems: CartItem[]) {
    const [upsellItems, setUpsellItems] = useState<Menu[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!storeId || cartItems.length === 0) {
            setUpsellItems([]);
            return;
        }

        const fetchUpsellItems = async () => {
            setLoading(true);
            try {
                // 간단한 추천 로직:
                // 장바구니에 '음료' 카테고리가 없으면 음료 추천
                // 장바구니에 '사이드' 카테고리가 없으면 사이드 추천
                // (단, 현재 CartItem에는 category 정보가 없어서, 이름 기반이나 별도 확인 필요하지만
                //  MVP에서는 단순히 '사이드', '음료' 카테고리의 인기 메뉴를 가져와서
                //  이미 장바구니에 있는건 제외하고 보여주는 식으로 구현)

                // 1. 추천 후보 카테고리 선정
                const targetCategories = ['사이드', '음료', '디저트'];

                // 2. 해당 카테고리 메뉴 Fetch (각 카테고리별 2~3개씩 or 전체에서 인기순 10개)
                // 여기서는 'isRecommended' 필드가 있다면 좋겠지만, 없으므로 단순 조회
                const menusRef = collection(db, 'stores', storeId, 'menus');
                const q = query(
                    menusRef,
                    where('category', 'array-contains-any', targetCategories),
                    where('soldout', '==', false),
                    where('isHidden', '==', false), // 숨김 메뉴 제외
                    limit(10)
                );

                const snapshot = await getDocs(q);
                const candidates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Menu));

                // 3. 장바구니에 이미 있는 메뉴 제외
                const cartMenuIds = new Set(cartItems.map(item => item.menuId));
                const filtered = candidates.filter(menu => !cartMenuIds.has(menu.id));

                // 4. 최대 5개 랜덤 또는 순서대로 선택
                setUpsellItems(filtered.slice(0, 5));

            } catch (error) {
                console.error('Failed to fetch upsell items:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUpsellItems();
    }, [storeId, cartItems.length]); // cartItems 변경 시 재계산 (최적화 필요 시 length만 체크)

    return { upsellItems, loading };
}
