import { useState } from 'react';
import { Plus, Edit2, Trash2, X, Eye, EyeOff } from 'lucide-react';
import { Menu, MenuOption, CATEGORIES } from '../../types/menu';
import { toast } from 'sonner';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import ImageUpload from '../../components/common/ImageUpload';
import { useStore } from '../../contexts/StoreContext';
import { useFirestoreCollection } from '../../hooks/useFirestoreCollection';
import { createMenu, updateMenu, deleteMenu, toggleMenuSoldout, toggleMenuHidden, getAllMenusQuery } from '../../services/menuService';

export default function AdminMenuManagement() {
  const { store, loading: storeLoading } = useStore();

  // storeId가 있을 때만 쿼리 생성
  const { data: menus, loading, error } = useFirestoreCollection<Menu>(
    store?.id ? getAllMenusQuery(store.id) : null
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);

  if (storeLoading) return null;
  if (!store || !store.id) return <StoreNotFound />;

  if (error) {
    toast.error(`데이터 로드 실패: ${error.message}`);
    console.error(error);
  }

  const handleAddMenu = () => {
    setEditingMenu(null);
    setIsModalOpen(true);
  };

  const handleEditMenu = (menu: Menu) => {
    setEditingMenu(menu);
    setIsModalOpen(true);
  };

  const handleDeleteMenu = async (menuId: string) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await deleteMenu(store.id, menuId);
        toast.success('메뉴가 삭제되었습니다');
      } catch (error) {
        toast.error('메뉴 삭제에 실패했습니다');
      }
    }
  };

  const handleToggleSoldout = async (menuId: string, currentSoldout: boolean) => {
    try {
      await toggleMenuSoldout(store.id, menuId, !currentSoldout);
      toast.success('품절 상태가 변경되었습니다');
    } catch (error) {
      toast.error('품절 상태 변경에 실패했습니다');
    }
  };

  const handleToggleHidden = async (menuId: string, currentHidden: boolean | undefined) => {
    try {
      await toggleMenuHidden(store.id, menuId, !currentHidden);
      toast.success(currentHidden ? '메뉴가 공개되었습니다' : '메뉴가 숨김 처리되었습니다');
    } catch (error) {
      toast.error('숨김 상태 변경에 실패했습니다');
    }
  };

  const handleSaveMenu = async (menuData: Omit<Menu, 'id' | 'createdAt'>) => {
    try {
      if (editingMenu) {
        await updateMenu(store.id, editingMenu.id, menuData);
        toast.success('메뉴가 수정되었습니다');
      } else {
        await createMenu(store.id, menuData);
        toast.success('메뉴가 추가되었습니다');
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error('메뉴 저장에 실패했습니다');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl mb-2">
                <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                  메뉴 관리
                </span>
              </h1>
              <p className="text-gray-600">총 {menus?.length || 0}개의 메뉴</p>
            </div>
            <Button onClick={handleAddMenu}>
              <Plus className="w-5 h-5 mr-2" />
              메뉴 추가
            </Button>
          </div>

          {/* Menu List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menus?.map((menu) => (
              <Card key={menu.id} padding="none" className="overflow-hidden">
                {/* Image */}
                <div className="relative aspect-[4/3] bg-gray-100">
                  {menu.imageUrl ? (
                    <img
                      src={menu.imageUrl}
                      alt={menu.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="text-5xl">🍜</span>
                    </div>
                  )}
                  {menu.soldout && !menu.isHidden && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Badge variant="danger" size="lg">품절</Badge>
                    </div>
                  )}
                  {menu.isHidden && (
                    <div className="absolute inset-0 bg-gray-900/70 flex items-center justify-center backdrop-blur-sm">
                      <Badge variant="secondary" size="lg">숨김 (미노출)</Badge>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {menu.category.slice(0, 2).map((cat) => (
                      <Badge key={cat} variant="primary" size="sm">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{menu.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{menu.description}</p>
                  <p className="text-xl font-bold text-blue-600 mb-4">
                    {menu.price.toLocaleString()}원
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth
                      onClick={() => handleEditMenu(menu)}
                    >
                      <Edit2 className="w-4 h-4 mr-1.5" />
                      수정
                    </Button>
                    <Button
                      variant={menu.isHidden ? 'secondary' : 'ghost'}
                      size="sm"
                      fullWidth
                      onClick={() => handleToggleHidden(menu.id, menu.isHidden)}
                      title={menu.isHidden ? "숨김 해제" : "메뉴 숨기기"}
                    >
                      {menu.isHidden ? (
                        <>
                          <EyeOff className="w-4 h-4 mr-1.5" />
                          숨김 중
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-1.5" />
                          공개 중
                        </>
                      )}
                    </Button>
                    <Button
                      variant={menu.soldout ? 'secondary' : 'ghost'}
                      size="sm"
                      fullWidth
                      onClick={() => handleToggleSoldout(menu.id, menu.soldout)}
                    >
                      {menu.soldout ? '판매 재개' : '품절'}
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteMenu(menu.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>

      {/* Menu Form Modal */}
      {isModalOpen && (
        <MenuFormModal
          menu={editingMenu}
          onSave={handleSaveMenu}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

function StoreNotFound() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-16">
            <p className="text-lg text-gray-600">상점을 찾을 수 없습니다</p>
          </div>
        </div>
      </main>
    </div>
  );
}

interface MenuFormModalProps {
  menu: Menu | null;
  onSave: (menu: Omit<Menu, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

function MenuFormModal({ menu, onSave, onClose }: MenuFormModalProps) {
  const [formData, setFormData] = useState<Partial<Menu>>(
    menu || {
      name: '',
      price: 0,
      category: [],
      description: '',
      imageUrl: '',
      options: [],
      soldout: false,
      isHidden: false, // 기본값 추가
    }
  );

  // 옵션 타입 선택 (옵션1: 수량 있음, 옵션2: 수량 없음)
  const [optionType, setOptionType] = useState<'type1' | 'type2'>('type1');
  const [newOption, setNewOption] = useState<Partial<MenuOption>>({
    name: '',
    price: 0,
    quantity: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || formData.category?.length === 0) {
      toast.error('필수 항목을 모두 입력해주세요');
      return;
    }

    onSave(formData as Omit<Menu, 'id' | 'createdAt'>);
  };

  const toggleCategory = (cat: string) => {
    const categories = formData.category || [];
    if (categories.includes(cat)) {
      setFormData({ ...formData, category: categories.filter(c => c !== cat) });
    } else {
      setFormData({ ...formData, category: [...categories, cat] });
    }
  };

  const addOption = () => {
    if (!newOption.name || !newOption.price) {
      toast.error('옵션명과 가격을 입력해주세요');
      return;
    }

    if (optionType === 'type1' && (!newOption.quantity || newOption.quantity <= 0)) {
      toast.error('옵션 수량을 입력해주세요');
      return;
    }

    const option: MenuOption = {
      id: `option-${Date.now()}`,
      name: newOption.name,
      price: newOption.price,
      ...(optionType === 'type1' ? { quantity: newOption.quantity } : {}),
    };

    setFormData({
      ...formData,
      options: [...(formData.options || []), option],
    });

    setNewOption({ name: '', price: 0, quantity: 0 });
    toast.success('옵션이 추가되었습니다');
  };

  const removeOption = (optionId: string) => {
    setFormData({
      ...formData,
      options: (formData.options || []).filter(opt => opt.id !== optionId),
    });
    toast.success('옵션이 삭제되었습니다');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {menu ? '메뉴 수정' : '메뉴 추가'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="메뉴명"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="가격"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              카테고리 (최소 1개 선택)
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`
                    px-4 py-2 rounded-lg border-2 transition-all
                    ${formData.category?.includes(cat)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }
                  `}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              설명
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              rows={3}
              required
            />
          </div>

          <div className="mb-4">
            <ImageUpload
              menuId={menu ? menu.id : 'new'}
              currentImageUrl={formData.imageUrl}
              onImageUploaded={(url) => setFormData({ ...formData, imageUrl: url })}
            />
          </div>

          <div className="border-t border-gray-200 pt-5 mt-5">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              옵션 관리 (선택)
            </label>

            {/* 옵션 타입 선택 */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">옵션 타입</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOptionType('type1')}
                  className={`
                    flex-1 px-4 py-2 rounded-lg border-2 transition-all text-sm
                    ${optionType === 'type1'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }
                  `}
                >
                  옵션1 (수량 포함)
                </button>
                <button
                  type="button"
                  onClick={() => setOptionType('type2')}
                  className={`
                    flex-1 px-4 py-2 rounded-lg border-2 transition-all text-sm
                    ${optionType === 'type2'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }
                  `}
                >
                  옵션2 (수량 없음)
                </button>
              </div>
            </div>

            {/* 옵션 추가 폼 */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="grid gap-3">
                <Input
                  label="옵션명"
                  value={newOption.name || ''}
                  onChange={(e) => setNewOption({ ...newOption, name: e.target.value })}
                  placeholder="예: 곱빼기, 사리 추가, 매운맛 등"
                />

                <div className={`grid gap-3 ${optionType === 'type1' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  <Input
                    label="가격"
                    type="number"
                    value={newOption.price || 0}
                    onChange={(e) => setNewOption({ ...newOption, price: Number(e.target.value) })}
                    placeholder="0"
                  />

                  {optionType === 'type1' && (
                    <Input
                      label="수량"
                      type="number"
                      value={newOption.quantity || 0}
                      onChange={(e) => setNewOption({ ...newOption, quantity: Number(e.target.value) })}
                      placeholder="0"
                    />
                  )}
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={addOption}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  옵션 추가
                </Button>
              </div>
            </div>

            {/* 옵션 목록 */}
            {formData.options && formData.options.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">등록된 옵션 ({formData.options.length}개)</p>
                <div className="space-y-2">
                  {formData.options.map((opt) => (
                    <div
                      key={opt.id}
                      className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{opt.name}</p>
                        <p className="text-sm text-gray-600">
                          +{opt.price.toLocaleString()}원
                          {opt.quantity !== undefined && ` · 수량: ${opt.quantity}개`}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeOption(opt.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" fullWidth onClick={onClose}>
              취소
            </Button>
            <Button type="submit" fullWidth>
              {menu ? '수정' : '추가'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}