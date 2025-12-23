# Components - Menu, Review, Notice, Event

## src/components/menu/MenuCard.tsx

```typescript
import { useState } from 'react';
import { Plus, ShoppingCart } from 'lucide-react';
import { Menu } from '../../types/menu';
import { useCart } from '../../contexts/CartContext';
import { toast } from 'sonner';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import MenuDetailModal from './MenuDetailModal';

interface MenuCardProps {
  menu: Menu;
}

export default function MenuCard({ menu }: MenuCardProps) {
  const { addItem } = useCart();
  const [showDetail, setShowDetail] = useState(false);
  
  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (menu.soldout) {
      toast.error('품절된 메뉴입니다');
      return;
    }
    
    if (menu.options && menu.options.length > 0) {
      // 옵션이 있으면 상세 모달 열기
      setShowDetail(true);
    } else {
      // 옵션이 없으면 바로 추가
      addItem({
        menuId: menu.id,
        name: menu.name,
        price: menu.price,
        quantity: 1,
        imageUrl: menu.imageUrl,
      });
      toast.success('장바구니에 추가되었습니다');
    }
  };

  return (
    <>
      <Card
        hover
        padding="none"
        onClick={() => setShowDetail(true)}
        className={`overflow-hidden ${menu.soldout ? 'opacity-60' : ''}`}
      >
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          {menu.imageUrl ? (
            <img
              src={menu.imageUrl}
              alt={menu.name}
              className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span className="text-5xl">🍜</span>
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {menu.category.slice(0, 2).map((cat) => (
              <Badge key={cat} variant="primary" size="sm">
                {cat}
              </Badge>
            ))}
          </div>
          
          {menu.soldout && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="danger" size="lg">
                품절
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
            {menu.name}
          </h3>
          
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {menu.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-blue-600">
                {menu.price.toLocaleString()}
              </span>
              <span className="text-sm text-gray-600 ml-1">원</span>
            </div>
            
            <Button
              size="sm"
              onClick={handleQuickAdd}
              disabled={menu.soldout}
              className="group"
            >
              <ShoppingCart className="w-4 h-4 mr-1.5" />
              담기
            </Button>
          </div>
          
          {menu.options && menu.options.length > 0 && (
            <p className="mt-2 text-xs text-gray-500">
              {menu.options.length}개의 옵션 선택 가능
            </p>
          )}
        </div>
      </Card>

      {showDetail && (
        <MenuDetailModal
          menu={menu}
          onClose={() => setShowDetail(false)}
        />
      )}
    </>
  );
}
```

## src/components/menu/CategoryBar.tsx

```typescript
import { CATEGORIES, Category } from '../../types/menu';

interface CategoryBarProps {
  selected: string;
  onSelect: (category: string) => void;
}

export default function CategoryBar({ selected, onSelect }: CategoryBarProps) {
  const allCategories = ['전체', ...CATEGORIES];
  
  return (
    <div className="sticky top-16 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        {/* 스크롤 힌트를 위한 그라데이션 오버레이 */}
        <div className="relative">
          {/* 오른쪽 그라데이션 (더 많은 항목이 있음을 표시) */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none z-10 md:hidden"></div>
          
          {/* 카테고리 버튼들 */}
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {allCategories.map((category) => (
              <button
                key={category}
                onClick={() => onSelect(category)}
                className={`
                  px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-200 flex-shrink-0
                  ${
                    selected === category
                      ? 'gradient-primary text-white shadow-md scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

## src/components/menu/MenuDetailModal.tsx

(전체 코드는 프로젝트의 `src/components/menu/MenuDetailModal.tsx` 파일 참조)

주요 기능:
- 메뉴 상세 정보 표시
- 옵션 선택
- 수량 조절
- 장바구니 추가

## src/components/review/ReviewModal.tsx

(전체 코드는 프로젝트의 `src/components/review/ReviewModal.tsx` 파일 참조)

주요 기능:
- 별점 선택
- 리뷰 내용 작성
- 리뷰 생성/수정/삭제

## src/components/review/ReviewList.tsx

(전체 코드는 프로젝트의 `src/components/review/ReviewList.tsx` 파일 참조)

주요 기능:
- 리뷰 목록 표시
- 평균 별점 계산
- 별점 분포 표시

## src/components/notice/NoticeList.tsx

(전체 코드는 프로젝트의 `src/components/notice/NoticeList.tsx` 파일 참조)

주요 기능:
- 공지사항 목록 표시
- 고정 공지 우선 표시
- 확장/축소 기능

## src/components/notice/NoticePopup.tsx

(전체 코드는 프로젝트의 `src/components/notice/NoticePopup.tsx` 파일 참조)

주요 기능:
- 고정 공지 팝업 표시
- 오늘 하루 보지 않기 기능

## src/components/event/EventBanner.tsx

(전체 코드는 프로젝트의 `src/components/event/EventBanner.tsx` 파일 참조)

주요 기능:
- 이벤트 배너 슬라이더
- 자동 슬라이드
- 이벤트 클릭 시 링크 이동

## src/components/figma/ImageWithFallback.tsx

```typescript
import React, { useState } from 'react'

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [didError, setDidError] = useState(false)

  const handleError = () => {
    setDidError(true)
  }

  const { src, alt, style, className, ...rest } = props

  return didError ? (
    <div
      className={`inline-block bg-gray-100 text-center align-middle ${className ?? ''}`}
      style={style}
    >
      <div className="flex items-center justify-center w-full h-full">
        <img src={ERROR_IMG_SRC} alt="Error loading image" {...rest} data-original-url={src} />
      </div>
    </div>
  ) : (
    <img src={src} alt={alt} className={className} style={style} {...rest} onError={handleError} />
  )
}
```

