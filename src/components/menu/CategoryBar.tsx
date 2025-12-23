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