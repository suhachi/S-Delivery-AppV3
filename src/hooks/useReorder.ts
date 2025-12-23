import { useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useCart } from '../contexts/CartContext';
import { Order, OrderItem } from '../types/order';
import { Menu } from '../types/menu';
import { toast } from 'sonner';

type ReorderStatus = 'valid' | 'deleted' | 'hidden' | 'soldout' | 'error';

interface ReorderCheckResult {
    item: OrderItem;
    status: ReorderStatus;
    menuData?: Menu;
    firestoreMenuId?: string;
    reason?: string;
}

export function useReorder() {
    const { addItem, clearCart } = useCart();
    const [reordering, setReordering] = useState(false);

    const handleReorder = async (storeId: string, order: Order) => {
        if (!storeId || !order.items || order.items.length === 0) return;

        if (!window.confirm('장바구니를 비우고 이 주문을 다시 담으시겠습니까?\n(옵션은 초기화되므로 다시 선택해주세요)')) {
            return;
        }

        setReordering(true);
        try {
            const promises = order.items.map(async (item): Promise<ReorderCheckResult> => {
                try {
                    // R2-FIX-04: menuId fallback
                    const menuId = item.menuId ?? (item as any).id;
                    if (!menuId) return { item, status: 'error', reason: 'ID 없음' };

                    const menuRef = doc(db, 'stores', storeId, 'menus', menuId);
                    const menuSnap = await getDoc(menuRef);

                    if (!menuSnap.exists()) {
                        return { item, status: 'deleted', reason: '메뉴 삭제됨' };
                    }

                    const menuData = menuSnap.data() as Menu;

                    if (menuData.isHidden) {
                        return { item, status: 'hidden', reason: '메뉴 숨김 처리됨' };
                    }

                    if (menuData.soldout) {
                        return { item, status: 'soldout', reason: '품절됨' };
                    }

                    return { item, status: 'valid', menuData, firestoreMenuId: menuSnap.id };
                } catch (e) {
                    return { item, status: 'error', reason: '확인 불가' };
                }
            });

            const results = await Promise.all(promises);

            const validItems: ReorderCheckResult[] = [];
            const invalidItems: ReorderCheckResult[] = [];

            results.forEach(res => {
                if (res.status === 'valid') {
                    validItems.push(res);
                } else {
                    invalidItems.push(res);
                }
            });

            if (validItems.length === 0) {
                toast.error('담을 수 있는 메뉴가 없습니다. (전체 품절 또는 삭제됨)');
                return;
            }

            // 2. 장바구니 초기화 및 담기
            clearCart();

            validItems.forEach(({ item, menuData, firestoreMenuId }) => {
                if (!menuData || !firestoreMenuId) return;

                // R2-FIX-02: 옵션 제거 정책 (가장 안전한 방법)
                // 옵션 가격/구조 변경 리스크로 인해 옵션은 제외하고 기본 메뉴만 담음
                addItem({
                    menuId: firestoreMenuId,
                    name: menuData.name,
                    price: menuData.price,
                    quantity: item.quantity,
                    options: [], // 옵션 초기화
                    imageUrl: menuData.imageUrl,
                });
            });

            // 3. 결과 알림 (R2-FIX-04: 상세 통계)
            const soldoutCount = invalidItems.filter(i => i.status === 'soldout').length;
            const hiddenCount = invalidItems.filter(i => i.status === 'hidden').length;
            const deletedCount = invalidItems.filter(i => i.status === 'deleted').length; // error 포함

            if (invalidItems.length > 0) {
                let msg = `${validItems.length}개 메뉴 담기 성공`;
                const excluded = [];
                if (soldoutCount > 0) excluded.push(`품절 ${soldoutCount}`);
                if (hiddenCount > 0) excluded.push(`숨김 ${hiddenCount}`);
                if (deletedCount > 0) excluded.push(`삭제/기타 ${deletedCount}`);

                toast.warning(`${msg} (${excluded.join(', ')} 제외됨)`);
                toast.info('옵션은 초기화되었으니 다시 선택해주세요.');
            } else {
                toast.success('메뉴를 장바구니에 담았습니다! 옵션을 다시 선택해주세요.');
            }

        } catch (error) {
            console.error('Reorder error:', error);
            toast.error('재주문 처리 중 오류가 발생했습니다.');
        } finally {
            setReordering(false);
        }
    };

    return { handleReorder, reordering };
}
