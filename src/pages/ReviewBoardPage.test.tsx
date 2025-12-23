import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ReviewList from '../components/review/ReviewList';
import ReviewBoardPage from './ReviewBoardPage';
import { useStore } from '../contexts/StoreContext';
import { useFirestoreCollection } from '../hooks/useFirestoreCollection';

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
    MessageSquare: () => <span>Msg</span>,
}));

describe('ReviewBoardPage', () => {
    it('should render header', () => {
        render(<ReviewBoardPage />);
        expect(screen.getByText('고객 후기')).toBeInTheDocument();
    });
});

describe('ReviewList', () => {
    const mockStore = { id: 'store_1' };

    beforeEach(() => {
        vi.clearAllMocks();
        (useStore as any).mockReturnValue({ store: mockStore });
        (useFirestoreCollection as any).mockReturnValue({ data: [], loading: false });
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

    it('should render reviews', () => {
        const mockReviews = [
            {
                id: 'review_1',
                rating: 5,
                comment: 'Great!',
                userDisplayName: 'User A',
                createdAt: '2024-01-01',
                images: []
            }
        ];

        (useFirestoreCollection as any).mockReturnValue({
            data: mockReviews,
            loading: false,
        });

        render(<ReviewList />);
        expect(screen.getByText('Great!')).toBeInTheDocument();
        expect(screen.getByText('User A')).toBeInTheDocument();
    });
});
