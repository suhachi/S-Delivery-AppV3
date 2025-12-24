import { useState } from 'react';
import { Plus, Edit2, Trash2, X, Pin } from 'lucide-react';
import { Notice, NOTICE_CATEGORIES } from '../../types/notice';
import { toast } from 'sonner';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import { formatDateShort } from '../../utils/formatDate';
import { useStore } from '../../contexts/StoreContext';
import { useFirestoreCollection } from '../../hooks/useFirestoreCollection';
import { createNotice, updateNotice, deleteNotice, toggleNoticePinned, getAllNoticesQuery } from '../../services/noticeService';

export default function AdminNoticeManagement() {
  const { store } = useStore();
  if (!store?.id) return null;

  const { data: notices, loading } = useFirestoreCollection<Notice>(
    getAllNoticesQuery(store.id)
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);

  const handleAddNotice = () => {
    setEditingNotice(null);
    setIsModalOpen(true);
  };

  const handleEditNotice = (notice: Notice) => {
    setEditingNotice(notice);
    setIsModalOpen(true);
  };

  const handleDeleteNotice = async (noticeId: string) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await deleteNotice(store.id, noticeId);
        toast.success('공지사항이 삭제되었습니다');
      } catch (error) {
        toast.error('공지사항 삭제에 실패했습니다');
      }
    }
  };

  const handleTogglePin = async (noticeId: string, currentPinned: boolean) => {
    try {
      await toggleNoticePinned(store.id, noticeId, !currentPinned);
      toast.success('고정 상태가 변경되었습니다');
    } catch (error) {
      toast.error('고정 상태 변경에 실패했습니다');
    }
  };

  const handleSaveNotice = async (noticeData: Omit<Notice, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingNotice) {
        await updateNotice(store.id, editingNotice.id, noticeData);
        toast.success('공지사항이 수정되었습니다');
      } else {
        await createNotice(store.id, noticeData);
        toast.success('공지사항이 추가되었습니다');
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error('공지사항 저장에 실패했습니다');
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '공지': return 'primary';
      case '이벤트': return 'secondary';
      case '점검': return 'danger';
      case '할인': return 'success';
      default: return 'default';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl mb-2">
                <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                  공지사항 관리
                </span>
              </h1>
              <p className="text-gray-600">총 {notices?.length || 0}개의 공지사항</p>
            </div>
            <Button onClick={handleAddNotice}>
              <Plus className="w-5 h-5 mr-2" />
              공지사항 추가
            </Button>
          </div>

          {/* Notice List */}
          <div className="space-y-4">
            {notices?.map((notice) => (
              <Card key={notice.id}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {notice.pinned && (
                        <Pin className="w-4 h-4 text-blue-600" />
                      )}
                      <Badge
                        variant={getCategoryColor(notice.category) as any}
                        size="sm"
                      >
                        {notice.category}
                      </Badge>
                      <h3 className="font-semibold text-gray-900">
                        {notice.title}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {notice.content}
                    </p>
                    <p className="text-xs text-gray-500">
                      {notice.createdAt ? formatDateShort(notice.createdAt) : '...'}
                    </p>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant={notice.pinned ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => handleTogglePin(notice.id, notice.pinned)}
                    >
                      <Pin className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditNotice(notice)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteNotice(notice.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {(!notices || notices.length === 0) && (
              <div className="text-center py-10 text-gray-500 bg-white rounded-lg shadow-sm border border-gray-100">
                등록된 공지사항이 없습니다.
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Notice Form Modal */}
      {isModalOpen && (
        <NoticeFormModal
          notice={editingNotice}
          onSave={handleSaveNotice}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

interface NoticeFormModalProps {
  notice: Notice | null;
  onSave: (notice: Omit<Notice, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

function NoticeFormModal({ notice, onSave, onClose }: NoticeFormModalProps) {
  const [formData, setFormData] = useState<Partial<Notice>>(
    notice || {
      title: '',
      content: '',
      category: '공지',
      pinned: false,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.content) {
      toast.error('필수 항목을 모두 입력해주세요');
      return;
    }

    onSave(formData as Omit<Notice, 'id' | 'createdAt' | 'updatedAt'>);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {notice ? '공지사항 수정' : '공지사항 추가'}
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
            label="제목"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              카테고리
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
              className="w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
            >
              {NOTICE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              내용
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              rows={8}
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="pinned"
              checked={formData.pinned}
              onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="pinned" className="ml-2 text-sm text-gray-700">
              상단 고정
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" fullWidth onClick={onClose}>
              취소
            </Button>
            <Button type="submit" fullWidth>
              {notice ? '수정' : '추가'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}