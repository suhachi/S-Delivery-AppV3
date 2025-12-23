export interface OrderItem {
  menuId: string;
  name: string;
  price: number;
  quantity: number;
  options?: { name: string; price: number; quantity?: number }[];
  imageUrl?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalPrice: number;
  discountAmount?: number;
  couponId?: string;
  couponName?: string;
  status: OrderStatus;
  address: string;
  phone: string;
  memo?: string;
  paymentType: PaymentType;
  // 결제 관련 필드 추가
  paymentStatus?: '결제대기' | '결제완료' | '결제실패';
  payment?: {
    pg: string;
    tid?: string;
    amount?: number;
    paidAt?: any;
    error?: string;
    code?: string;
  };
  createdAt: Date;
  updatedAt?: Date;
  reviewed?: boolean;
  reviewRating?: number;
  orderType?: '배달주문' | '포장주문'; // 주문 타입 추가
}

export type OrderStatus = '결제대기' | '결제실패' | '접수' | '접수완료' | '조리중' | '조리완료' | '배달중' | '포장완료' | '완료' | '취소';
export type PaymentType = '앱결제' | '만나서카드' | '만나서현금' | '방문시결제';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  '결제대기': '결제 대기',
  '결제실패': '결제 실패',
  '접수': '주문 접수',
  '접수완료': '접수 완료',
  '조리중': '조리 중',
  '조리완료': '조리 완료',
  '배달중': '배달 중',
  '포장완료': '포장 완료',
  '완료': '배달 완료',
  '취소': '주문 취소',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, { bg: string; text: string }> = {
  '결제대기': { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  '결제실패': { bg: 'bg-red-100', text: 'text-red-700' },
  '접수': { bg: 'bg-blue-100', text: 'text-blue-700' },
  '접수완료': { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  '조리중': { bg: 'bg-orange-100', text: 'text-orange-700' },
  '조리완료': { bg: 'bg-amber-100', text: 'text-amber-800' },
  '배달중': { bg: 'bg-purple-100', text: 'text-purple-700' },
  '포장완료': { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  '완료': { bg: 'bg-green-100', text: 'text-green-700' },
  '취소': { bg: 'bg-gray-100', text: 'text-gray-700' },
};

export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  '앱결제': '앱 결제',
  '만나서카드': '만나서 카드 결제',
  '만나서현금': '만나서 현금 결제',
  '방문시결제': '방문 시 결제',
};
