import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, AlertCircle } from 'lucide-react';
import { useCart, CartItem as CartItemType } from '../contexts/CartContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { toast } from 'sonner';
import { useUpsell } from '../hooks/useUpsell';
import { useStore } from '../contexts/StoreContext';
import CartUpsell from '../components/cart/CartUpsell';
import { Menu } from '../types/menu';

export default function CartPage() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart, addItem } = useCart();
  const { store } = useStore();

  // ATOM-301: Upsell Logic
  const { upsellItems } = useUpsell(store?.id, items);

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('장바구니가 비어 있습니다');
      return;
    }
    navigate('/checkout');
  };

  const handleClearCart = () => {
    if (window.confirm('장바구니를 비우시겠습니까?')) {
      clearCart();
      toast.success('장바구니가 비워졌습니다');
    }
  };

  const handleAddUpsell = (menu: Menu) => {
    addItem({
      menuId: menu.id,
      name: menu.name,
      price: menu.price,
      quantity: 1,
      options: [], // 옵션 없이 기본 추가
      imageUrl: menu.imageUrl,
    });
    toast.success(`${menu.name} 추가됨`);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 gradient-primary rounded-full flex items-center justify-center">
            <ShoppingCart className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl mb-3">
            장바구니가 비어 있습니다
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-8">
            맛있는 메뉴를 장바구니에 담아보세요
          </p>
          <Button size="lg" onClick={() => navigate('/menu')} className="w-full sm:w-auto">
            메뉴 둘러보기
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="container mx-auto px-4">
        {/* Header - 모바일 최적화 */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl mb-2">
              <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                장바구니
              </span>
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              총 {items.length}개의 상품
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearCart}
            className="text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">전체 삭제</span>
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onRemove={removeItem}
                onUpdateQuantity={updateQuantity}
              />
            ))}

            {/* ATOM-302: Upsell Component */}
            <CartUpsell items={upsellItems} onAdd={handleAddUpsell} />
          </div>

          {/* Order Summary - 모바일에서는 하단 고정 */}
          <div className="lg:col-span-1">
            {/* 데스크톱: sticky 카드 */}
            <Card className="hidden lg:block sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">주문 요약</h2>

              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center justify-between text-gray-600">
                  <span>상품 금액</span>
                  <span>{getTotalPrice().toLocaleString()}원</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span>배달비</span>
                  <span>3,000원</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-6 text-xl font-bold">
                <span>총 결제 금액</span>
                <span className="text-blue-600">
                  {(getTotalPrice() + 3000).toLocaleString()}원
                </span>
              </div>

              <Button
                fullWidth
                size="lg"
                onClick={handleCheckout}
                className="group"
              >
                주문하기
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-900">
                  최소 주문 금액은 10,000원입니다
                </p>
              </div>
            </Card>

            {/* 모바일: 하단 고정 바 */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-40">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-600">총 결제 금액</span>
                <span className="text-xl text-blue-600">
                  {(getTotalPrice() + 3000).toLocaleString()}원
                </span>
              </div>
              <Button
                fullWidth
                size="lg"
                onClick={handleCheckout}
                className="group"
              >
                주문하기
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* 모바일: 하단 여백 추가 (고정 바 공간 확보) */}
            <div className="lg:hidden h-32"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CartItemProps {
  item: CartItemType;
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
}

function CartItem({ item, onRemove, onUpdateQuantity }: CartItemProps) {
  const optionsPrice = item.options?.reduce((sum, opt) => sum + (opt.price * (opt.quantity || 1)), 0) || 0;
  const itemTotal = (item.price + optionsPrice) * item.quantity;

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="w-full sm:w-32 h-48 sm:h-32 flex-shrink-0 bg-gray-100">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span className="text-5xl sm:text-3xl">🍜</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 pr-2">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">{item.name}</h3>
              {item.options && item.options.length > 0 && (
                <div className="space-y-0.5">
                  {item.options.map((opt, idx) => (
                    <p key={idx} className="text-xs sm:text-sm text-gray-600">
                      + {opt.name} {(opt.quantity || 1) > 1 ? `x${opt.quantity}` : ''} (+{(opt.price * (opt.quantity || 1)).toLocaleString()}원)
                    </p>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => onRemove(item.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
            >
              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          <div className="mt-auto flex items-center justify-between">
            {/* Quantity Controls */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors"
              >
                <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
              <span className="text-base sm:text-lg font-semibold text-gray-900 min-w-[2rem] text-center">
                {item.quantity}
              </span>
              <button
                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>

            {/* Price */}
            <div className="text-right">
              <p className="text-lg sm:text-xl text-blue-600">
                {itemTotal.toLocaleString()}원
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
