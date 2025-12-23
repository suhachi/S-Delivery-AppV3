import { useState } from 'react';
import { X, Plus, Minus, ShoppingCart } from 'lucide-react';
import { Menu, MenuOption } from '../../types/menu';
import { useCart } from '../../contexts/CartContext';
import { toast } from 'sonner';
import Button from '../common/Button';
import Badge from '../common/Badge';

interface MenuDetailModalProps {
  menu: Menu;
  onClose: () => void;
}

export default function MenuDetailModal({ menu, onClose }: MenuDetailModalProps) {
  // ATOM-122: 숨김 메뉴 접근 차단
  if (menu.isHidden) {
    onClose();
    return null;
  }

  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<MenuOption[]>([]);

  const toggleOption = (option: MenuOption) => {
    setSelectedOptions(prev => {
      const exists = prev.find(opt => opt.id === option.id);
      if (exists) {
        return prev.filter(opt => opt.id !== option.id);
      } else {
        return [...prev, { ...option, quantity: 1 }];
      }
    });
  };

  const updateOptionQuantity = (optionId: string, delta: number) => {
    setSelectedOptions(prev => {
      return prev.map(opt => {
        if (opt.id === optionId) {
          const newQuantity = (opt.quantity || 1) + delta;
          if (newQuantity < 1) return opt; // Minimum 1
          return { ...opt, quantity: newQuantity };
        }
        return opt;
      });
    });
  };

  const getTotalPrice = () => {
    const optionsPrice = selectedOptions.reduce((sum, opt) => sum + (opt.price * (opt.quantity || 1)), 0);
    return (menu.price + optionsPrice) * quantity;
  };

  const handleAddToCart = () => {
    if (menu.soldout) {
      toast.error('품절된 메뉴입니다');
      return;
    }

    addItem({
      menuId: menu.id,
      name: menu.name,
      price: menu.price,
      quantity,
      options: selectedOptions,
      imageUrl: menu.imageUrl,
    });

    toast.success(`${menu.name}을(를) 장바구니에 담았습니다`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <div className="overflow-y-auto max-h-[90vh]">
          {/* Image */}
          <div className="relative aspect-[16/9] bg-gray-100">
            {menu.imageUrl ? (
              <img
                src={menu.imageUrl}
                alt={menu.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <span className="text-8xl">🍜</span>
              </div>
            )}

            {menu.soldout && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Badge variant="danger" size="lg">
                  품절
                </Badge>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Header */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-2 mb-2">
                {menu.category.map((cat) => (
                  <Badge key={cat} variant="primary">
                    {cat}
                  </Badge>
                ))}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{menu.name}</h2>
              <p className="text-gray-600">{menu.description}</p>
            </div>

            {/* Price */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <span className="text-3xl font-bold text-blue-600">
                {menu.price.toLocaleString()}
              </span>
              <span className="text-lg text-gray-600 ml-2">원</span>
            </div>

            {/* Options */}
            {menu.options && menu.options.length > 0 && (
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">옵션 선택</h3>
                <div className="space-y-2">
                  {menu.options.map((option) => {
                    const selected = selectedOptions.find(opt => opt.id === option.id);
                    return (
                      <div
                        key={option.id}
                        className={`
                          w-full rounded-lg border-2 transition-all overflow-hidden
                          ${selected
                            ? 'border-blue-500 bg-white'
                            : 'border-gray-200 hover:border-gray-300'
                          }
                        `}
                      >
                        <button
                          onClick={() => toggleOption(option)}
                          className="w-full flex items-center justify-between p-4 text-left"
                        >
                          <span className="font-medium text-gray-900">{option.name}</span>
                          <span className={`${selected ? 'text-blue-600' : 'text-gray-900'} font-semibold`}>
                            +{option.price.toLocaleString()}원
                          </span>
                        </button>

                        {selected && option.quantity !== undefined && (
                          <div className="flex items-center justify-between bg-blue-50 p-3 border-t border-blue-100 animate-slide-down">
                            <span className="text-sm text-blue-800 font-medium ml-1">수량</span>
                            <div className="flex items-center bg-white rounded-lg border border-blue-200 shadow-sm">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateOptionQuantity(option.id, -1);
                                }}
                                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:bg-gray-50 rounded-l-lg transition-colors"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-8 text-center text-sm font-bold text-gray-900">
                                {selected.quantity || 1}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateOptionQuantity(option.id, 1);
                                }}
                                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:bg-gray-50 rounded-r-lg transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">수량</h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="text-2xl font-bold text-gray-900 min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Total & Add to Cart */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">총 금액</p>
                <p className="text-2xl font-bold text-blue-600">
                  {getTotalPrice().toLocaleString()}원
                </p>
              </div>
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={menu.soldout}
                className="flex-1"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                장바구니 담기
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}