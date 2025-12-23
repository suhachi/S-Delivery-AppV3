import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import AdminOrderManagement from './AdminOrderManagement';
import { useStore } from '../../contexts/StoreContext';
import { useFirestoreCollection } from '../../hooks/useFirestoreCollection';
import { updateOrderStatus, deleteOrder } from '../../services/orderService';

// Mocks
vi.mock('../../contexts/StoreContext', () => ({
    useStore: vi.fn(),
}));

vi.mock('../../hooks/useFirestoreCollection', () => ({
    useFirestoreCollection: vi.fn(),
}));

vi.mock('../../services/orderService', () => ({
    updateOrderStatus: vi.fn(),
    deleteOrder: vi.fn(),
    getAllOrdersQuery: vi.fn(),
}));

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

// Mock child components
vi.mock('../../components/admin/AdminSidebar', () => ({
    default: () => <div data-testid="sidebar">Sidebar</div>,
}));
vi.mock('../../components/admin/Receipt', () => ({
    default: ({ order }: any) => order ? <div data-testid="receipt">Receipt for {order.id}</div> : null,
}));
vi.mock('../../components/admin/AdminOrderAlert', () => ({
    default: () => null,
}));

// Mock Lucide
vi.mock('lucide-react', () => ({
    Package: () => <span>Pkg</span>,
    MapPin: () => <span>Map</span>,
    Phone: () => <span>Phone</span>,
    CreditCard: () => <span>Card</span>,
    ChevronDown: () => <span>Down</span>,
}));

describe('AdminOrderManagement', () => {
    const mockStore = { id: 'store_1', name: 'Test Store' };

    const originalPrint = window.print;
    const originalConfirm = window.confirm;

    beforeEach(() => {
        vi.clearAllMocks();
        (useStore as any).mockReturnValue({ store: mockStore });
        window.print = vi.fn();
        window.confirm = vi.fn(() => true);
    });

    afterEach(() => {
        window.print = originalPrint;
        window.confirm = originalConfirm;
        vi.useRealTimers();
    });

    const mockOrders = [
        {
            id: 'order_1',
            status: '접수',
            totalPrice: 15000,
            items: [{ name: 'Pizza', quantity: 1, price: 15000, options: [] }],
            createdAt: { toDate: () => new Date('2024-01-01T10:00:00') },
            address: 'Seoul',
            orderType: '배달'
        },
        {
            id: 'order_2',
            status: '배달중',
            totalPrice: 20000,
            items: [{ name: 'Burger', quantity: 2, price: 10000, options: [] }],
            createdAt: { toDate: () => new Date('2024-01-01T11:00:00') },
            address: 'Busan',
            orderType: '배달'
        }
    ];

    it('should render empty state', () => {
        (useFirestoreCollection as any).mockReturnValue({ data: [] });
        render(<AdminOrderManagement />);
        expect(screen.getByText('주문이 없습니다')).toBeInTheDocument();
    });

    it('should render orders list', () => {
        (useFirestoreCollection as any).mockReturnValue({ data: mockOrders });
        render(<AdminOrderManagement />);
        expect(screen.getByText('주문 #order_1')).toBeInTheDocument();
    });

    it('should filter orders', async () => {
        (useFirestoreCollection as any).mockReturnValue({ data: mockOrders });
        render(<AdminOrderManagement />);

        expect(screen.getByText('주문 #order_1')).toBeInTheDocument();

        const buttons = screen.getAllByRole('button');
        const deliveryFilter = buttons.find(b => b.innerHTML.includes('배달중')); // innerHTML check for text + span

        expect(deliveryFilter).toBeDefined();
        fireEvent.click(deliveryFilter!);

        await waitFor(() => {
            expect(screen.queryByText('주문 #order_1')).not.toBeInTheDocument();
        });
        expect(screen.getByText('주문 #order_2')).toBeInTheDocument();
    });

    it('should handle status change', async () => {
        (useFirestoreCollection as any).mockReturnValue({ data: mockOrders });
        render(<AdminOrderManagement />);

        fireEvent.click(screen.getByText('주문 #order_1'));

        const nextBtn = await screen.findByRole('button', { name: /다음 단계로/ });
        fireEvent.click(nextBtn);

        expect(updateOrderStatus).toHaveBeenCalledWith(mockStore.id, 'order_1', '접수완료');
    });

    it('should handle print receipt', async () => {
        vi.useFakeTimers();
        (useFirestoreCollection as any).mockReturnValue({ data: mockOrders });
        render(<AdminOrderManagement />);

        fireEvent.click(screen.getByText('주문 #order_1'));
        await screen.findByText('주문 상품');

        const printBtn = screen.getByText('🖨️ 영수증 인쇄').closest('button');
        fireEvent.click(printBtn!);

        expect(await screen.findByTestId('receipt')).toBeInTheDocument();

        act(() => {
            vi.runAllTimers();
        });

        expect(window.print).toHaveBeenCalled();
    });
});
