import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import OrderDetailPage from './OrderDetailPage';
import { useStore } from '../contexts/StoreContext';
import { useFirestoreDocument } from '../hooks/useFirestoreDocument';
import { useParams, useNavigate } from 'react-router-dom';

// Mock dependencies
vi.mock('react-router-dom', () => ({
    useParams: vi.fn(),
    useNavigate: vi.fn(),
}));

vi.mock('../contexts/StoreContext', () => ({
    useStore: vi.fn(),
}));

vi.mock('../hooks/useFirestoreDocument', () => ({
    useFirestoreDocument: vi.fn(),
}));

vi.mock('../components/common/Card', () => ({
    default: ({ children }: any) => <div data-testid="card">{children}</div>,
}));

// Mock lucide icons
vi.mock('lucide-react', () => ({
    ArrowLeft: () => <span>ArrowLeft</span>,
    MapPin: () => <span>MapPin</span>,
    Phone: () => <span>Phone</span>,
    CreditCard: () => <span>CreditCard</span>,
    Clock: () => <span>Clock</span>,
    Package: () => <span>Package</span>,
    CheckCircle2: () => <span>CheckCircle2</span>,
    MessageSquare: () => <span>MessageSquare</span>,
    AlertCircle: () => <span>AlertCircle</span>,
}));

describe('OrderDetailPage', () => {
    const mockNavigate = vi.fn();
    const mockStore = { id: 'store_1' };

    beforeEach(() => {
        vi.clearAllMocks();
        (useNavigate as any).mockReturnValue(mockNavigate);
        (useStore as any).mockReturnValue({ store: mockStore });
        (useParams as any).mockReturnValue({ orderId: 'order_123' });
    });

    it('should render loading state', () => {
        (useFirestoreDocument as any).mockReturnValue({
            data: null,
            loading: true,
            error: null
        });

        render(<OrderDetailPage />);
        expect(screen.getByText('주문 정보를 불러오는 중...')).toBeInTheDocument();
    });

    it('should render error/not found state', () => {
        (useFirestoreDocument as any).mockReturnValue({
            data: null,
            loading: false,
            error: new Error('Failed')
        });

        render(<OrderDetailPage />);
        // Component renders one of these
        expect(screen.getByText('주문 정보를 불러오는데 실패했습니다')).toBeInTheDocument();
    });

    it('should render order details when loaded', () => {
        const mockOrder = {
            id: 'order_123',
            status: '접수',
            totalPrice: 15000,
            items: [
                { name: 'Pizza', price: 15000, quantity: 1, options: [] }
            ],
            createdAt: { toDate: () => new Date('2024-01-01T12:00:00') },
            address: 'Seoul Grid',
            phone: '010-1234-5678',
            paymentType: 'card',
            orderType: '배달'
        };

        (useFirestoreDocument as any).mockReturnValue({
            data: mockOrder,
            loading: false,
            error: null
        });

        render(<OrderDetailPage />);

        expect(screen.getByText('주문 상세')).toBeInTheDocument();
        expect(screen.getByText('주문번호: order_12')).toBeInTheDocument();
        expect(screen.getByText('Pizza')).toBeInTheDocument();
        // Price appears multiple times, check at least one
        expect(screen.getAllByText('15,000원').length).toBeGreaterThan(0);
    });

    it('should navigate back when button clicked', () => {
        (useFirestoreDocument as any).mockReturnValue({
            data: { id: '1', status: '접수', items: [], totalPrice: 0, createdAt: new Date() },
            loading: false,
            error: null
        });

        render(<OrderDetailPage />);

        const backButton = screen.getByText('주문 목록으로');
        fireEvent.click(backButton);

        expect(mockNavigate).toHaveBeenCalledWith('/orders');
    });
});
