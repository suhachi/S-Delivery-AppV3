import { useState, useEffect } from 'react';
import { Package, MapPin, Phone, CreditCard, ChevronDown } from 'lucide-react';
import { Order, OrderStatus, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, PAYMENT_TYPE_LABELS } from '../../types/order';
import { toast } from 'sonner';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { useStore } from '../../contexts/StoreContext';
import { useFirestoreCollection } from '../../hooks/useFirestoreCollection';
import { updateOrderStatus, deleteOrder, getAllOrdersQuery } from '../../services/orderService';
import AdminOrderAlert from '../../components/admin/AdminOrderAlert';
import { getNextStatus } from '../../utils/orderUtils';

// 헬퍼 함수: Firestore Timestamp 처리를 위한 toDate
function toDate(date: any): Date {
  if (date?.toDate) return date.toDate();
  if (date instanceof Date) return date;
  if (typeof date === 'string') return new Date(date);
  return new Date();
}

import Receipt from '../../components/admin/Receipt';

export default function AdminOrderManagement() {
  const { store } = useStore();
  const [filter, setFilter] = useState<OrderStatus | '전체'>('전체');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [printOrder, setPrintOrder] = useState<Order | null>(null);

  // Firestore에서 주문 조회 (삭제되지 않은 주문만)
  const { data: allOrders } = useFirestoreCollection<Order>(
    store?.id ? getAllOrdersQuery(store.id) : null
  );

  const filteredOrders = filter === '전체'
    ? (allOrders || []).filter(order => order.status !== '결제대기')
    : (allOrders || []).filter(order => order.status === filter);

  // 필터 순서 업데이트 (조리완료, 포장완료 추가)
  const filters: (OrderStatus | '전체')[] = ['전체', '접수', '접수완료', '조리중', '조리완료', '배달중', '포장완료', '완료', '취소'];

  // 인쇄를 위한 Effect Hooks (상태 변경 감지 후 실행)
  useEffect(() => {
    if (printOrder) {
      // 1. 현재 타이틀 저장
      const originalTitle = document.title;

      // 2. 파일명 생성을 위한 날짜 포맷팅 (YYYYMMDD_HHmm_OrderID)
      // Firestore Timestamp vs Date 객체 호환 처리
      const createdAt = printOrder.createdAt as any;
      let d = createdAt?.toDate ? createdAt.toDate() : new Date(createdAt);

      // Date 객체가 유효하지 않은 경우 현재 시간으로 대체
      if (isNaN(d.getTime())) {
        d = new Date();
      }

      const dateStr = d.getFullYear() +
        String(d.getMonth() + 1).padStart(2, '0') +
        String(d.getDate()).padStart(2, '0') + '_' +
        String(d.getHours()).padStart(2, '0') +
        String(d.getMinutes()).padStart(2, '0');

      // 안전한 파일명 생성 (특수문자 제거)
      const safeId = (printOrder.id || 'unknown').slice(0, 8).replace(/[^a-zA-Z0-9]/g, '');
      const newTitle = `${dateStr}_${safeId}`;

      document.title = newTitle;
      console.log('Printing with title:', newTitle); // 디버깅용

      // 3. 인쇄 실행
      // 브라우저 인쇄가 끝나면(취소 혹은 출력) 실행될 핸들러
      const handleAfterPrint = () => {
        document.title = originalTitle;
        setPrintOrder(null); // 상태 초기화
        window.removeEventListener('afterprint', handleAfterPrint);
      };

      window.addEventListener('afterprint', handleAfterPrint);

      // 렌더링 확보를 위한 짧은 지연 후 인쇄
      const printTimer = setTimeout(() => {
        window.print();
      }, 500);

      // 컴포넌트 언마운트 시 안전장치
      return () => {
        clearTimeout(printTimer);
        window.removeEventListener('afterprint', handleAfterPrint);
        document.title = originalTitle; // 혹시 모를 상황 대비 복구
      };
    }
  }, [printOrder]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    if (!store?.id) return;
    try {
      await updateOrderStatus(store.id, orderId, newStatus);
      toast.success(`주문 상태가 '${ORDER_STATUS_LABELS[newStatus]}'(으)로 변경되었습니다`);

      // 주문 접수(확인) 시 영수증 자동 출력
      // 2024-12-10: 사용자 요청으로 자동 출력 기능 다시 활성화
      if (newStatus === '접수완료') {
        const targetOrder = allOrders?.find(o => o.id === orderId);
        if (targetOrder) {
          // 인쇄용 상태 업데이트 -> useEffect 트리거
          setPrintOrder(targetOrder);
        }
      }

    } catch (error: any) {
      console.error(error);
      if (error?.code === 'permission-denied') {
        toast.error('주문 상태를 변경할 권한이 없습니다.');
      } else {
        toast.error('주문 상태 변경에 실패했습니다');
      }
    }
  };

  const handleDelete = async (orderId: string) => {
    if (!store?.id) return;
    if (!window.confirm('정말로 이 주문을 삭제하시겠습니까? \n삭제된 주문은 복구할 수 없으며, 고객의 주문 내역에서도 사라집니다.')) return;

    try {
      await deleteOrder(store.id, orderId);
      toast.success('주문이 삭제되었습니다');
    } catch (error) {
      console.error(error);
      toast.error('주문 삭제에 실패했습니다');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar className="print:hidden" />

      {/* 영수증 컴포넌트 (평소엔 숨김, 인쇄 시에만 등장) */}
      <Receipt order={printOrder} store={store} />

      <main className="flex-1 p-8 print:hidden">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl mb-2">
              <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                주문 관리
              </span>
            </h1>
            <p className="text-gray-600">총 {filteredOrders.length}개의 주문</p>
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
                {status === '전체' ? '전체' : ORDER_STATUS_LABELS[status]}
                <span className="ml-2 text-xs opacity-75">
                  ({(allOrders || []).filter(o => status === '전체' || o.status === status).length})
                </span>
              </button>
            ))}
          </div>

          {/* Orders List */}
          <div className="space-y-4">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  isExpanded={expandedOrder === order.id}
                  onToggleExpand={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                  onPrint={() => setPrintOrder(order)}
                />
              ))
            ) : (
              <Card className="text-center py-16">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-xl text-gray-600">주문이 없습니다</p>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

interface OrderCardProps {
  order: Order;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
  onDelete: (orderId: string) => void;
  onPrint: () => void;
}

function OrderCard({ order, isExpanded, onToggleExpand, onStatusChange, onDelete, onPrint }: OrderCardProps) {
  const statusColor = ORDER_STATUS_COLORS[order.status as OrderStatus];
  // getNextStatus 업데이트 (order 객체 전달)
  const nextStatus = getNextStatus(order);
  const [Printer] = useState(() => import('lucide-react').then(mod => mod.Printer)); // Dynamic import or just use lucide-react if already imported

  return (
    <Card padding="none" className="overflow-hidden">
      {/* Header */}
      <div
        className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggleExpand}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${statusColor.bg} flex-shrink-0`}>
              <Package className={`w-7 h-7 ${statusColor.text}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="font-bold text-gray-900">주문 #{order.id.slice(0, 8)}</h3>
                <Badge
                  variant={
                    order.status === '완료' ? 'success' :
                      order.status === '취소' ? 'danger' :
                        order.status === '배달중' ? 'secondary' :
                          'primary'
                  }
                >
                  {ORDER_STATUS_LABELS[order.status as OrderStatus]}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-1">
                {order.items.length}개 상품 · {order.totalPrice.toLocaleString()}원
              </p>
              <p className="text-xs text-gray-500">
                {toDate(order.createdAt).toLocaleString('ko-KR')}
              </p>
            </div>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-6 pb-6 pt-0 border-t border-gray-200 space-y-4 animate-fade-in">
          {/* Order Items */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">주문 상품</h4>
            <div className="space-y-2">
              {order.items.map((item, idx) => {
                const optionsPrice = item.options?.reduce((sum, opt) => sum + (opt.price * (opt.quantity || 1)), 0) || 0;
                return (
                  <div key={idx} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start space-x-3 flex-1">
                      {item.imageUrl && (
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        {item.options && item.options.length > 0 && (
                          <p className="text-xs text-gray-600">
                            {item.options.map(opt => `${opt.name}${(opt.quantity || 1) > 1 ? ` x${opt.quantity}` : ''} (+${(opt.price * (opt.quantity || 1)).toLocaleString()}원)`).join(', ')}
                          </p>
                        )}
                        <p className="text-sm text-gray-600 mt-1">수량: {item.quantity}개</p>
                      </div>
                    </div>
                    <p className="font-semibold text-gray-900 flex-shrink-0 ml-4">
                      {((item.price + optionsPrice) * item.quantity).toLocaleString()}원
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">배달 정보</h4>
              <div className="space-y-2">
                <div className="flex items-start space-x-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{order.address}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-700">{order.phone}</span>
                </div>
                {order.memo && (
                  <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-gray-700">
                    💬 {order.memo}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">결제 정보</h4>
              <div className="flex items-center space-x-2 text-sm">
                <CreditCard className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">{PAYMENT_TYPE_LABELS[order.paymentType]}</span>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">총 결제 금액</p>
                <p className="text-2xl font-bold text-blue-600">{order.totalPrice.toLocaleString()}원</p>
              </div>
            </div>
          </div>

          {/* Status Actions */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                {order.status !== '완료' && order.status !== '취소' && order.status !== '포장완료' && (
                  <>
                    <h4 className="font-semibold text-gray-900 mb-3">주문 상태 변경</h4>
                    <div className="flex gap-2">
                      {nextStatus && (
                        <Button
                          onClick={() => onStatusChange(order.id, nextStatus)}
                        >
                          다음 단계로 ({ORDER_STATUS_LABELS[nextStatus]})
                        </Button>
                      )}

                      <Button
                        variant="danger"
                        onClick={() => {
                          if (window.confirm('주문을 취소하시겠습니까?')) {
                            onStatusChange(order.id, '취소');
                          }
                        }}
                      >
                        취소
                      </Button>
                    </div>
                  </>
                )}
              </div>

              {/* 영수증 인쇄 버튼 (항상 표시 or 특정 상태에서만? 사용자는 그냥 '추가'라고 함) */}
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPrint();
                  }}
                  className="flex items-center gap-2"
                >
                  {/* 아이콘은 상단 import 사용 */}
                  <span>🖨️ 영수증 인쇄</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Delete Button for Completed/Cancelled Orders */}
          {(order.status === '완료' || order.status === '취소' || order.status === '포장완료') && (
            <div className="pt-4 border-t border-gray-200 text-right">
              <Button
                variant="outline"
                onClick={() => onDelete(order.id)}
                className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
              >
                주문 내역 삭제
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}