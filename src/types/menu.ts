export interface MenuOption {
  id: string;
  name: string;
  price: number;
  quantity?: number; // 옵션1용: 수량이 있는 옵션
}

export interface Menu {
  id: string;
  name: string;
  price: number;
  category: string[];
  description: string;
  imageUrl?: string;
  options?: MenuOption[];
  soldout: boolean;
  isHidden?: boolean; // 숨김 상태 (고객 화면 완전 미노출)
  createdAt: Date;
}

export const CATEGORIES = [
  '인기메뉴',
  '추천메뉴',
  '기본메뉴',
  '사이드메뉴',
  '음료',
  '주류',
] as const;

export type Category = typeof CATEGORIES[number];