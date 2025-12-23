import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchUsers } from './userService';
import { getDocs, query, where, collection } from 'firebase/firestore';

// Mock dependencies
vi.mock('../lib/firebase', () => ({
    db: {},
}));

vi.mock('firebase/firestore', async () => {
    const actual = await vi.importActual('firebase/firestore');
    return {
        ...actual,
        collection: vi.fn(),
        query: vi.fn(),
        where: vi.fn(),
        getDocs: vi.fn(),
    };
});

describe('userService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('searchUsers', () => {
        it('should search by phone when input is numeric/hyphen', async () => {
            const mockResult = {
                docs: [
                    { id: 'u1', data: () => ({ name: 'Test', phone: '010-1234-5678' }) }
                ]
            };
            (getDocs as any).mockResolvedValue(mockResult);

            const result = await searchUsers('0101234');

            expect(where).toHaveBeenCalledWith('phone', '>=', '0101234');
            expect(result).toHaveLength(1);
        });

        it('should search by displayName when input is text', async () => {
            const mockResult = {
                docs: [
                    { id: 'u2', data: () => ({ displayName: 'Hong', phone: '010-0000-0000' }) }
                ]
            };
            (getDocs as any).mockResolvedValue(mockResult);

            const result = await searchUsers('Hong');

            expect(where).toHaveBeenCalledWith('displayName', '>=', 'Hong');
            expect(result).toHaveLength(1);
        });
    });
});
