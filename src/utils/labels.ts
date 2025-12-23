/**
 * 라벨 및 상수 관리
 */

export const ORDER_STATUS_LABELS = {
  '접수': '주문 접수',
  '조리중': '조리 중',
  '배달중': '배달 중',
  '완료': '배달 완료',
  '취소': '주문 취소',
} as const;

export const PAYMENT_TYPE_LABELS = {
  '앱결제': '앱 결제',
  '만나서카드': '만나서 카드 결제',
  '만나서현금': '만나서 현금 결제',
  '방문시결제': '방문 시 결제',
} as const;

export const CATEGORY_LABELS = [
  '인기메뉴',
  '추천메뉴',
  '기본메뉴',
  '사이드메뉴',
  '음료',
  '주류',
] as const;

export const NOTICE_CATEGORIES = [
  '공지',
  '이벤트',
  '점검',
  '할인',
] as const;

export const COUPON_TYPE_LABELS = {
  'percentage': '할인율',
  'fixed': '할인 금액',
} as const;

export default {
  ORDER_STATUS_LABELS,
  PAYMENT_TYPE_LABELS,
  CATEGORY_LABELS,
  NOTICE_CATEGORIES,
  COUPON_TYPE_LABELS,
};
