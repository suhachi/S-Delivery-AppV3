import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, UtensilsCrossed, Package, Ticket, Star, Bell, Calendar, Settings, Home, TrendingUp, Users } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';

interface AdminSidebarProps {
  className?: string;
}

export default function AdminSidebar({ className = '' }: AdminSidebarProps) {
  const location = useLocation();
  const { store } = useStore();

  const menuItems = [
    { path: '/admin', icon: <LayoutDashboard className="w-5 h-5" />, label: '대시보드', exact: true },
    { path: '/admin/orders', icon: <Package className="w-5 h-5" />, label: '주문 관리' },
    { path: '/admin/menus', icon: <UtensilsCrossed className="w-5 h-5" />, label: '메뉴 관리' },
    { path: '/admin/coupons', icon: <Ticket className="w-5 h-5" />, label: '쿠폰 관리' },
    { path: '/admin/reviews', icon: <Star className="w-5 h-5" />, label: '리뷰 관리' },
    { path: '/admin/notices', icon: <Bell className="w-5 h-5" />, label: '공지사항 관리' },
    { path: '/admin/events', icon: <Calendar className="w-5 h-5" />, label: '이벤트 관리' },
    { path: '/admin/members', icon: <Users className="w-5 h-5" />, label: '회원 관리' },
    { path: '/admin/stats', icon: <TrendingUp className="w-5 h-5" />, label: '매출 통계' },
    { path: '/admin/store-settings', icon: <Settings className="w-5 h-5" />, label: '상점 설정' },
  ];

  const isActive = (path: string, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className={`w-52 bg-white border-r border-gray-200 min-h-screen flex-shrink-0 ${className}`}>
      <div className="p-4">
        {/* 로고 영역 */}
        {/* 로고 영역 제거됨 */}

        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center space-x-2 px-3 py-2.5 rounded-lg transition-all
                ${isActive(item.path, item.exact)
                  ? 'gradient-primary text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              {item.icon}
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <Link
            to="/"
            className="flex items-center space-x-2 px-3 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
          >
            <Home className="w-5 h-5" />
            <span className="font-medium text-sm">사용자 페이지</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}