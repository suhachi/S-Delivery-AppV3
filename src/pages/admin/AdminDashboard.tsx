import { Package, DollarSign, Clock, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { useFirestoreCollection } from '../../hooks/useFirestoreCollection';
import { getAllOrdersQuery } from '../../services/orderService';
import { getAllMenusQuery } from '../../services/menuService';
import { Order, ORDER_STATUS_LABELS } from '../../types/order';
import { Menu } from '../../types/menu';

import AdminSidebar from '../../components/admin/AdminSidebar';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';

export default function AdminDashboard() {
  const { store } = useStore();

  const { data: orders, loading: ordersLoading } = useFirestoreCollection<Order>(
    store?.id ? getAllOrdersQuery(store.id) : null
  );

  const { data: menus, loading: menusLoading } = useFirestoreCollection<Menu>(
    store?.id ? getAllMenusQuery(store.id) : null
  );

  const isLoading = ordersLoading || menusLoading;

  // Calculate statistics based on real data
  const totalOrders = orders?.length || 0;
  const activeOrders = orders?.filter(o => ['접수', '조리중', '배달중'].includes(o.status)).length || 0;
  const completedOrders = orders?.filter(o => o.status === '완료').length || 0;
  const cancelledOrders = orders?.filter(o => o.status === '취소').length || 0;

  const totalRevenue = orders
    ?.filter(o => o.status === '완료')
    .reduce((sum, o) => sum + o.totalPrice, 0) || 0;

  const todayOrders = orders?.filter(o => {
    const today = new Date();
    const orderDate = new Date(o.createdAt);
    return orderDate.toDateString() === today.toDateString();
  }).length || 0;

  const stats = [
    {
      label: '오늘 주문',
      value: todayOrders,
      icon: <Package className="w-6 h-6" />,
      color: 'blue',
      suffix: '건',
    },
    {
      label: '총 매출',
      value: totalRevenue.toLocaleString(),
      icon: <DollarSign className="w-6 h-6" />,
      color: 'green',
      suffix: '원',
    },
    {
      label: '진행중 주문',
      value: activeOrders,
      icon: <Clock className="w-6 h-6" />,
      color: 'orange',
      suffix: '건',
    },
    {
      label: '완료 주문',
      value: completedOrders,
      icon: <CheckCircle2 className="w-6 h-6" />,
      color: 'purple',
      suffix: '건',
    },
  ];

  const recentOrders = orders?.slice(0, 5) || [];
  const registeredMenusCount = menus?.length || 0;
  const soldoutMenusCount = menus?.filter(m => m.soldout).length || 0;

  // Calculate average order value (avoid division by zero)
  const avgOrderValue = completedOrders > 0
    ? Math.round(totalRevenue / completedOrders)
    : 0;

  // Calculate cancellation rate
  const cancelRate = totalOrders > 0
    ? ((cancelledOrders / totalOrders) * 100).toFixed(1)
    : '0';

  if (!store && !isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <p className="text-gray-500">상점 정보를 불러오는 중...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl mb-2">
              <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                대시보드
              </span>
            </h1>
            <p className="text-gray-600">매장 현황을 한눈에 확인하세요</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, idx) => (
              <StatCard key={idx} {...stat} loading={isLoading} />
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent Orders */}
            <Card className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">최근 주문</h2>
                <Badge variant="primary">{totalOrders}건</Badge>
              </div>

              {isLoading ? (
                <div className="py-8 text-center text-gray-500">로딩 중...</div>
              ) : recentOrders.length > 0 ? (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-1">주문 #{order.id.slice(0, 8)}</p>
                        <p className="text-sm text-gray-600">
                          {order.items.length}개 상품 · {order.totalPrice.toLocaleString()}원
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(order.createdAt).toLocaleString('ko-KR')}
                        </p>
                      </div>
                      <Badge
                        variant={
                          order.status === '완료' ? 'success' :
                            order.status === '취소' ? 'danger' :
                              order.status === '배달중' ? 'secondary' :
                                'primary'
                        }
                      >
                        {ORDER_STATUS_LABELS[order.status]}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500">최근 주문 내역이 없습니다.</div>
              )}
            </Card>

            {/* Quick Stats */}
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-6">빠른 통계</h2>
              <div className="space-y-4">
                <QuickStat
                  label="등록된 메뉴"
                  value={isLoading ? '-' : registeredMenusCount}
                  suffix="개"
                  color="blue"
                />
                <QuickStat
                  label="품절 메뉴"
                  value={isLoading ? '-' : soldoutMenusCount}
                  suffix="개"
                  color="red"
                />
                <QuickStat
                  label="평균 주문 금액"
                  value={isLoading ? '-' : avgOrderValue.toLocaleString()}
                  suffix="원"
                  color="green"
                />
                <QuickStat
                  label="취소율"
                  value={isLoading ? '-' : cancelRate}
                  suffix="%"
                  color="orange"
                />
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

import { StatCardProps, QuickStatProps } from '../../types/dashboard';

// ... (existing imports)

// ... (existing AdminDashboard component)

function StatCard({ label, value, icon, color, suffix, loading }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    purple: 'bg-purple-500',
  }[color];

  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-2">{label}</p>
          <p className="text-3xl font-bold text-gray-900">
            {loading ? '-' : value}
            {!loading && suffix && <span className="text-lg text-gray-600 ml-1">{suffix}</span>}
          </p>
        </div>
        <div className={`w-12 h-12 ${colorClasses} rounded-xl flex items-center justify-center text-white`}>
          {icon}
        </div>
      </div>
      <div className={`absolute bottom-0 left-0 right-0 h-1 ${colorClasses}`} />
    </Card>
  );
}

function QuickStat({ label, value, suffix, color }: QuickStatProps) {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    orange: 'text-orange-600',
    purple: 'text-purple-600',
  }[color];

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <span className="text-sm text-gray-700">{label}</span>
      <span className={`font-bold ${colorClasses}`}>
        {value}{suffix}
      </span>
    </div>
  );
}