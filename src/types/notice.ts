export interface Notice {
  id: string;
  title: string;
  content: string;
  category: '공지' | '이벤트' | '점검' | '할인';
  pinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const NOTICE_CATEGORIES = ['공지', '이벤트', '점검', '할인'] as const;
export type NoticeCategory = typeof NOTICE_CATEGORIES[number];
