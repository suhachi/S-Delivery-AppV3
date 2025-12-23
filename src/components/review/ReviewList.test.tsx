import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ReviewList from './ReviewList';
import { useStore } from '../../contexts/StoreContext';
import { useFirestoreCollection } from '../../hooks/useFirestoreCollection';

// Mocks
vi.mock('../../contexts/StoreContext', () => ({
    useStore: vi.fn(),
}));

vi.mock('../../hooks/useFirestoreCollection', () => ({
    useFirestoreCollection: vi.fn(),
}));

vi.mock('../../services/reviewService', () => ({
    getAllReviewsQuery: vi.fn(),
}));

vi.mock('../../utils/formatDate', () => ({
    formatDate: (date: any) => '2024-01-01',
}));

// Mock Lucide
vi.mock('lucide-react', () => ({
    Star: ({ className }: any) => <span className={className}>Star</span>,
    User: () => <span>User</span>,
}));

describe('ReviewList', () => {
    const mockStore = { id: 'store_1' };

    beforeEach(() => {
        vi.clearAllMocks();
        (useStore as any).mockReturnValue({ store: mockStore });
        // Default safe return
        (useFirestoreCollection as any).mockReturnValue({ data: [], loading: false });
    });

    it('should render nothing if no store', () => {
        (useStore as any).mockReturnValue({ store: null });
        // Even with null store, hook might be called or component returns early. 
        // If hook is called, it needs return value.
        const { container } = render(<ReviewList />);
        expect(container).toBeEmptyDOMElement();
    });

    it('should render loading state', () => {
        (useFirestoreCollection as any).mockReturnValue({
            data: [],
            loading: true,
        });
        render(<ReviewList />);
        expect(screen.getByText('리뷰를 불러오는 중...')).toBeInTheDocument();
    });

    it('should render empty state', () => {
        (useFirestoreCollection as any).mockReturnValue({
            data: [],
            loading: false,
        });
        render(<ReviewList />);
        expect(screen.getByText('아직 작성된 리뷰가 없습니다')).toBeInTheDocument();
    });

    it('should render reviews and statistics', () => {
        const mockReviews = [
            {
                id: 'review_1',
                rating: 5,
                comment: 'Great!',
                userDisplayName: 'User A',
                createdAt: '2024-01-01',
                images: []
            },
            {
                id: 'review_2',
                rating: 3,
                comment: 'Okay',
                userDisplayName: 'User B',
                createdAt: '2024-01-02',
                images: ['img.jpg']
            }
        ];

        (useFirestoreCollection as any).mockReturnValue({
            data: mockReviews,
            loading: false,
        });

        render(<ReviewList />);

        // Statistics: Avg (5+3)/2 = 4.0
        expect(screen.getByText('4.0')).toBeInTheDocument();
        expect(screen.getByText('총 2개의 리뷰')).toBeInTheDocument();

        // Review content
        expect(screen.getByText('Great!')).toBeInTheDocument();
        expect(screen.getByText('Okay')).toBeInTheDocument();

        // Check "1개" (rating count) appears
        const countElements = screen.getAllByText('1개');
        expect(countElements.length).toBeGreaterThanOrEqual(1);
    });
});
