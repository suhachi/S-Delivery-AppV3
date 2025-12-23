# Components - Common & Admin

## src/components/common/TopBar.tsx

```typescript
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, LogOut, User, Store, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useState } from 'react';
import { toast } from 'sonner@2.0.3';

export default function TopBar() {
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  const { getTotalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cartItemsCount = getTotalItems();

  const handleLogout = async () => {
    await logout();
    toast.success('로그아웃되었습니다');
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform">
              <span className="text-white text-xl">🍜</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              커스컴배달앱
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink to="/menu" icon={null}>메뉴</NavLink>
            <NavLink to="/cart" icon={<ShoppingCart className="w-4 h-4" />} badge={cartItemsCount}>
              장바구니
            </NavLink>
            <NavLink to="/orders" icon={null}>내 주문</NavLink>
            <NavLink to="/mypage" icon={<User className="w-4 h-4" />}>마이페이지</NavLink>
            {isAdmin && (
              <NavLink to="/admin" icon={<Store className="w-4 h-4" />}>
                관리자
              </NavLink>
            )}
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 rounded-full">
              <User className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-700">{user?.displayName || user?.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">로그아웃</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-gray-200 animate-slide-up">
            <MobileNavLink to="/menu" onClick={() => setMobileMenuOpen(false)}>
              메뉴
            </MobileNavLink>
            <MobileNavLink to="/cart" onClick={() => setMobileMenuOpen(false)} badge={cartItemsCount}>
              장바구니
            </MobileNavLink>
            <MobileNavLink to="/orders" onClick={() => setMobileMenuOpen(false)}>
              내 주문
            </MobileNavLink>
            <MobileNavLink to="/mypage" onClick={() => setMobileMenuOpen(false)}>
              마이페이지
            </MobileNavLink>
            {isAdmin && (
              <MobileNavLink to="/admin" onClick={() => setMobileMenuOpen(false)}>
                관리자
              </MobileNavLink>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

function NavLink({ to, icon, badge, children }: { to: string; icon?: React.ReactNode; badge?: number; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="relative flex items-center space-x-1.5 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
    >
      {icon}
      <span>{children}</span>
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs text-white gradient-primary rounded-full">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  );
}

function MobileNavLink({ to, badge, onClick, children }: { to: string; badge?: number; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="relative flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
    >
      <span>{children}</span>
      {badge !== undefined && badge > 0 && (
        <span className="flex items-center justify-center min-w-[24px] h-6 px-2 text-xs text-white gradient-primary rounded-full">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  );
}
```

## src/components/common/Button.tsx

```typescript
import { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'gradient-primary text-white hover:shadow-lg hover:scale-[1.02] focus:ring-blue-500',
    secondary: 'gradient-secondary text-white hover:shadow-lg hover:scale-[1.02] focus:ring-orange-500',
    outline: 'border-2 border-blue-500 text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    danger: 'bg-red-500 text-white hover:bg-red-600 hover:shadow-lg focus:ring-red-500',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          처리중...
        </>
      ) : (
        children
      )}
    </button>
  );
}
```

## src/components/common/Input.tsx

```typescript
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full px-4 py-2.5 
              ${icon ? 'pl-10' : ''} 
              text-gray-900 bg-white 
              border rounded-lg 
              ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} 
              focus:ring-2 focus:border-transparent 
              transition-all duration-200 
              placeholder:text-gray-400
              disabled:bg-gray-100 disabled:cursor-not-allowed
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-red-600 animate-fade-in">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
```

## src/components/common/Card.tsx

```typescript
import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export default function Card({
  hover = false,
  padding = 'md',
  className = '',
  children,
  ...props
}: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  
  return (
    <div
      className={`
        bg-white rounded-xl border border-gray-200 shadow-sm
        ${hover ? 'card-hover cursor-pointer' : ''}
        ${paddingClasses[padding]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
```

## src/components/common/Badge.tsx

```typescript
import { HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'gray';
  size?: 'sm' | 'md' | 'lg';
}

export default function Badge({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: BadgeProps) {
  const variantClasses = {
    primary: 'bg-blue-100 text-blue-700',
    secondary: 'bg-orange-100 text-orange-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
    gray: 'bg-gray-100 text-gray-700',
  };
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };
  
  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      {...props}
    >
      {children}
    </span>
  );
}
```

## src/components/common/ImageUpload.tsx

(전체 코드는 프로젝트의 `src/components/common/ImageUpload.tsx` 파일 참조)

주요 기능:
- 이미지 파일 선택
- 미리보기
- Firebase Storage 업로드
- 진행률 표시

## src/components/common/NotificationGuide.tsx

(전체 코드는 프로젝트의 `src/components/common/NotificationGuide.tsx` 파일 참조)

주요 기능:
- 알림 권한 요청 배너
- 브라우저 알림 지원 확인

## src/components/admin/AdminSidebar.tsx

```typescript
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, UtensilsCrossed, Package, Ticket, Star, Bell, Calendar, Settings, Home } from 'lucide-react';

export default function AdminSidebar() {
  const location = useLocation();

  const menuItems = [
    { path: '/admin', icon: <LayoutDashboard className="w-5 h-5" />, label: '대시보드', exact: true },
    { path: '/admin/orders', icon: <Package className="w-5 h-5" />, label: '주문 관리' },
    { path: '/admin/menus', icon: <UtensilsCrossed className="w-5 h-5" />, label: '메뉴 관리' },
    { path: '/admin/coupons', icon: <Ticket className="w-5 h-5" />, label: '쿠폰 관리' },
    { path: '/admin/reviews', icon: <Star className="w-5 h-5" />, label: '리뷰 관리' },
    { path: '/admin/notices', icon: <Bell className="w-5 h-5" />, label: '공지사항 관리' },
    { path: '/admin/events', icon: <Calendar className="w-5 h-5" />, label: '이벤트 관리' },
    { path: '/admin/store-settings', icon: <Settings className="w-5 h-5" />, label: '상점 설정' },
  ];

  const isActive = (path: string, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
        {/* 로고 영역 */}
        <div className="mb-8 flex items-center justify-center">
          <h1 className="text-xl font-bold text-gray-800">관리자 페이지</h1>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center space-x-3 px-4 py-3 rounded-lg transition-all
                ${isActive(item.path, item.exact)
                  ? 'gradient-primary text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <Link
            to="/"
            className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
          >
            <Home className="w-5 h-5" />
            <span className="font-medium">사용자 페이지</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
```

