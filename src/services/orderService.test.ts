import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createOrder, updateOrderStatus, cancelOrder, deleteOrder } from './orderService';
import { collection, addDoc, updateDoc, doc, serverTimestamp, deleteDoc } from 'firebase/firestore';

// Mock dependencies
vi.mock('../lib/firebase', () => ({
    db: {},
}));

vi.mock('firebase/firestore', async () => {
    const actual = await vi.importActual('firebase/firestore');
    return {
        ...actual,
        collection: vi.fn(),
        addDoc: vi.fn(),
        updateDoc: vi.fn(),
        deleteDoc: vi.fn(),
        doc: vi.fn(),
        serverTimestamp: vi.fn(() => 'MOCK_TIMESTAMP'),
        query: vi.fn(),
        where: vi.fn(),
        orderBy: vi.fn(),
    };
});

describe('orderService', () => {
    const mockStoreId = 'store_123';
    const mockOrderId = 'order_abc';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createOrder', () => {
        it('should create an order with default status "접수"', async () => {
            const mockDocRef = { id: 'new_order_id' };
            (addDoc as any).mockResolvedValue(mockDocRef);
            (collection as any).mockReturnValue('MOCK_COLLECTION_REF');

            const orderData = {
                userId: 'user_1',
                items: [],
                totalPrice: 10000,
                paymentType: 'card',
                address: 'Seoul',
                phone: '010-0000-0000'
            };

            const result = await createOrder(mockStoreId, orderData as any);

            expect(collection).toHaveBeenCalledWith(expect.anything(), 'stores', mockStoreId, 'orders');
            expect(addDoc).toHaveBeenCalledWith('MOCK_COLLECTION_REF', expect.objectContaining({
                ...orderData,
                status: '접수',
                createdAt: 'MOCK_TIMESTAMP',
                updatedAt: 'MOCK_TIMESTAMP',
            }));
            expect(result).toBe('new_order_id');
        });

        it('should use provided status if given', async () => {
            const mockDocRef = { id: 'new_order_id' };
            (addDoc as any).mockResolvedValue(mockDocRef);

            const orderData = {
                status: '조리중',
                totalPrice: 10000,
            };

            await createOrder(mockStoreId, orderData as any);

            expect(addDoc).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
                status: '조리중',
            }));
        });
    });

    describe('updateOrderStatus', () => {
        it('should update order status and timestamp', async () => {
            (doc as any).mockReturnValue('MOCK_DOC_REF');

            await updateOrderStatus(mockStoreId, mockOrderId, '배달중');

            expect(doc).toHaveBeenCalledWith(expect.anything(), 'stores', mockStoreId, 'orders', mockOrderId);
            expect(updateDoc).toHaveBeenCalledWith('MOCK_DOC_REF', {
                status: '배달중',
                updatedAt: 'MOCK_TIMESTAMP',
            });
        });
    });

    describe('cancelOrder', () => {
        it('should set status to "취소"', async () => {
            (doc as any).mockReturnValue('MOCK_DOC_REF');

            await cancelOrder(mockStoreId, mockOrderId);

            expect(updateDoc).toHaveBeenCalledWith('MOCK_DOC_REF', {
                status: '취소',
                updatedAt: 'MOCK_TIMESTAMP',
            });
        });
    });

    describe('deleteOrder', () => {
        it('should delete the order document', async () => {
            (doc as any).mockReturnValue('MOCK_DOC_REF');
            // deleteOrder 내부의 dynamic import도 결국 mocks를 사용할 것으로 예상됨
            // 하지만 테스트 환경에 따라 모킹 방식이 다를 수 있음.
            // 여기서는 vi.mock이 top-level이므로 dynamic import도 모킹된 버전을 받을 것임.

            await deleteOrder(mockStoreId, mockOrderId);

            expect(deleteDoc).toHaveBeenCalledWith('MOCK_DOC_REF');
        });
    });
});
