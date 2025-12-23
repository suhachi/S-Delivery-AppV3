import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Clock, CheckCircle2, XCircle, ChevronRight, Star } from 'lucide-react';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, OrderStatus } from '../types/order';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import ReviewModal from '../components/review/ReviewModal';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../contexts/StoreContext';
import { useFirestoreCollection } from '../hooks/useFirestoreCollection';
import { getUserOrdersQuery } from '../services/orderService';
import { Order } from '../types/order';

// 헬퍼 함수: Firestore Timestamp 처리를 위한 toDate
const toDate = (date: any): Date => {
  if (date?.toDate) return date.toDate();
  if (date instanceof Date) return date;
  if (typeof date === 'string') return new Date(date);
  return new Date();
};

import { useReorder } from '../hooks/useReorder';

export default function OrdersPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { store } = useStore();
  const [filter, setFilter] = useState<OrderStatus | '전체'>('전체');

  // R2-FIX-03: useReorder 훅을 상위로 이동
  const { handleReorder, reordering } = useReorder();

  // Firestore에서 현재 사용자의 주문 조회
  const ordersQuery = (store?.id && user?.id)
    ? getUserOrdersQuery(store.id, user.id)
    : null;

  const { data: allOrders, loading } = useFirestoreCollection<Order>(ordersQuery);

  const filteredOrders = filter === '전체'
    ? (allOrders || []).filter(order => order.status !== '결제대기')
    : (allOrders || []).filter(order => order.status === filter);

  // 헬퍼 함수: 사용자용 상태 라벨 변환
  const getDisplayStatus = (status: OrderStatus) => {
    switch (status) {
      case '접수': return '접수중';
      case '접수완료': return '접수확인';
      default: return ORDER_STATUS_LABELS[status];
    }
  };

  const filters: (OrderStatus | '전체')[] = ['전체', '접수', '접수완료', '조리중', '배달중', '완료', '취소'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">주문 내역을 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl mb-2">
            <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              내 주문
            </span>
          </h1>
          <p className="text-gray-600">주문 내역을 확인하고 관리하세요</p>
        </div>

        {/* Status Filter */}
        <div className="mb-6 flex space-x-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {filters.map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`
                px-4 py-2 rounded-lg whitespace-nowrap transition-all flex-shrink-0
                ${filter === status
                  ? 'gradient-primary text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-500'
                }
              `}
            >
              {status === '전체' ? '전체' : getDisplayStatus(status)}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onClick={() => navigate(`/orders/${order.id}`)}
                getDisplayStatus={getDisplayStatus}
                onReorder={() => store?.id && handleReorder(store.id, order)}
                isReordering={reordering}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-32 h-32 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Package className="w-16 h-16 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              주문 내역이 없습니다
            </h2>
            <p className="text-gray-600 mb-8">
              맛있는 메뉴를 주문해보세요
            </p>
            <Button onClick={() => navigate('/menu')}>
              메뉴 둘러보기
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

interface OrderCardProps {
  order: Order;
  onClick: () => void;
  getDisplayStatus: (s: OrderStatus) => string;
  onReorder: () => void;
  isReordering: boolean;
}

function OrderCard({ order, onClick, getDisplayStatus, onReorder, isReordering }: OrderCardProps) {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const statusColor = ORDER_STATUS_COLORS[order.status as OrderStatus];
  const { store } = useStore(); // useReorder hook removed

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case '접수':
      case '접수완료':
      case '조리중':
        return <Clock className="w-5 h-5" />;
      case '배달중':
        return <Package className="w-5 h-5" />;
      case '완료':
        return <CheckCircle2 className="w-5 h-5" />;
      case '취소':
        return <XCircle className="w-5 h-5" />;
    }
  };

  // 리뷰 작성 가능 여부 (완료 상태만)
  const canReview = order.status === '완료';

  return (
    <>
      <Card>
        {/* 클릭 가능한 메인 영역 */}
        <div onClick={onClick} className="cursor-pointer hover:bg-gray-50 transition-colors p-1 -m-1 rounded-lg">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${statusColor.bg}`}>
                <div className={statusColor.text}>
                  {getStatusIcon(order.status)}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  {toDate(order.createdAt).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <p className="text-xs text-gray-500">주문번호: {order.id.slice(0, 8)}</p>
              </div>
            </div>
            <Badge variant={
              order.status === '완료' ? 'success' :
                order.status === '취소' ? 'danger' :
                  order.status === '배달중' ? 'secondary' :
                    'primary'
            }>
              {getDisplayStatus(order.status)}
            </Badge>
          </div>

          <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {item.imageUrl && (
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">수량: {item.quantity}개</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {((item.price + (item.options?.reduce((sum: number, opt) => sum + (opt.price * (opt.quantity || 1)), 0) || 0)) * item.quantity).toLocaleString()}원
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">총 결제 금액</p>
              <p className="text-2xl font-bold text-blue-600">
                {order.totalPrice.toLocaleString()}원
              </p>
            </div>
            <ChevronRight className="w-6 h-6 text-gray-400" />
          </div>
        </div>

        {/* 하단 버튼 영역 */}
        <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-3">
          {/* 재주문 버튼 */}
          <Button
            variant="secondary"
            fullWidth
            onClick={(e) => {
              e.stopPropagation();
              onReorder();
            }}
            disabled={isReordering}
          >
            <Package className="w-4 h-4 mr-2" />
            {isReordering ? '담는 중...' : '같은 메뉴 담기'}
          </Button>

          {/* 리뷰 버튼 (완료 시) */}
          {canReview && (
            order.reviewed ? (
              <Button
                variant="outline"
                fullWidth
                onClick={(e) => {
                  e.stopPropagation();
                  setShowReviewModal(true);
                }}
              >
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-2" />
                리뷰 수정
              </Button>
            ) : (
              <Button
                variant="outline"
                fullWidth
                onClick={(e) => {
                  e.stopPropagation();
                  setShowReviewModal(true);
                }}
              >
                <Star className="w-4 h-4 mr-2" />
                리뷰 작성
              </Button>
            )
          )}
        </div>
      </Card>

      {/* 리뷰 모달 */}
      {showReviewModal && (
        <ReviewModal
          orderId={order.id}
          onClose={() => setShowReviewModal(false)}
          onSuccess={() => {
            // 주문 목록 새로고침
            window.location.reload();
          }}
        />
      )}
    </>
  );
}