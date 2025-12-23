import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createReview, deleteReview } from './reviewService';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

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
        getDocs: vi.fn(),
    };
});

describe('reviewService', () => {
    const mockStoreId = 'store_123';
    const mockOrderId = 'order_abc';
    const mockReviewId = 'review_xyz';
    const mockUserId = 'user_1';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createReview', () => {
        it('should create review and update order status', async () => {
            const mockDocRef = { id: 'new_review_id' };
            (addDoc as any).mockResolvedValue(mockDocRef);
            (collection as any).mockReturnValue('MOCK_COLLECTION_REF');
            (doc as any).mockReturnValue('MOCK_DOC_REF');

            const reviewData = {
                storeId: mockStoreId,
                orderId: mockOrderId,
                userId: mockUserId,
                userName: 'User',
                rating: 5,
                comment: 'Great!',
                images: [],
            };

            const result = await createReview(mockStoreId, reviewData);

            // 1. Review creation
            expect(collection).toHaveBeenCalledWith(expect.anything(), 'stores', mockStoreId, 'reviews');
            expect(addDoc).toHaveBeenCalledWith('MOCK_COLLECTION_REF', expect.objectContaining({
                ...reviewData,
                createdAt: 'MOCK_TIMESTAMP',
            }));

            // 2. Order update (reviewed: true)
            expect(doc).toHaveBeenCalledWith(expect.anything(), 'stores', mockStoreId, 'orders', mockOrderId);
            expect(updateDoc).toHaveBeenCalledWith('MOCK_DOC_REF', expect.objectContaining({
                reviewed: true,
                reviewText: 'Great!',
                reviewedAt: 'MOCK_TIMESTAMP',
            }));

            expect(result).toBe('new_review_id');
        });
    });

    describe('deleteReview', () => {
        it('should delete review and reset order status', async () => {
            (doc as any).mockReturnValue('MOCK_DOC_REF');

            await deleteReview(mockStoreId, mockReviewId, mockOrderId);

            // 1. Review delete
            expect(deleteDoc).toHaveBeenCalledWith('MOCK_DOC_REF');

            // 2. Order update (reviewed: false)
            expect(updateDoc).toHaveBeenCalledWith('MOCK_DOC_REF', expect.objectContaining({
                reviewed: false,
                reviewText: null,
            }));
        });

        it('should handle missing order document gracefully (review deleted, order update skipped)', async () => {
            (doc as any).mockReturnValue('MOCK_DOC_REF');

            // updateDoc throws "No document to update"
            (updateDoc as any).mockRejectedValueOnce(new Error('No document to update'));

            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

            await expect(deleteReview(mockStoreId, mockReviewId, mockOrderId)).resolves.not.toThrow();

            expect(deleteDoc).toHaveBeenCalled(); // Review deleted
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('주문 문서를 찾을 수 없어'), expect.anything());

            consoleSpy.mockRestore();
        });
    });
});
