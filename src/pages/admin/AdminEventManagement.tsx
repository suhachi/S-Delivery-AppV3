import { useState } from 'react';
import { Plus, Edit2, Trash2, X, Eye, EyeOff } from 'lucide-react';
import { Event } from '../../types/event';
import { toast } from 'sonner';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import { formatDateShort } from '../../utils/formatDate';
import { useStore } from '../../contexts/StoreContext';
import { useFirestoreCollection } from '../../hooks/useFirestoreCollection';
import { createEvent, updateEvent, deleteEvent, toggleEventActive, getAllEventsQuery } from '../../services/eventService';
import { uploadEventImage } from '../../services/storageService';
import ImageUpload from '../../components/common/ImageUpload';

export default function AdminEventManagement() {
  const { store } = useStore();
  const { data: events, loading } = useFirestoreCollection<Event>(
    store?.id ? getAllEventsQuery(store.id) : null
  );

  if (!store || !store.id) return null;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const handleAddEvent = () => {
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await deleteEvent(store.id, eventId);
        toast.success('이벤트가 삭제되었습니다');
      } catch (error) {
        toast.error('이벤트 삭제에 실패했습니다');
      }
    }
  };

  const handleToggleActive = async (eventId: string, currentActive: boolean) => {
    try {
      await toggleEventActive(store.id, eventId, !currentActive);
      toast.success('활성화 상태가 변경되었습니다');
    } catch (error) {
      toast.error('활성화 상태 변경에 실패했습니다');
    }
  };

  const handleSaveEvent = async (eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingEvent) {
        await updateEvent(store.id, editingEvent.id, eventData);
        toast.success('이벤트가 수정되었습니다');
      } else {
        await createEvent(store.id, eventData);
        toast.success('이벤트가 추가되었습니다');
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error('이벤트 저장에 실패했습니다');
    }
  };

  const formatDateForInput = (date: any) => {
    if (!date) return '';
    try {
      // date가 이미 Date 객체가 아닐 수 있음 (Firestore Timestamp)
      const d = date.toDate ? date.toDate() : new Date(date);
      return d.toISOString().split('T')[0];
    } catch (e) {
      return '';
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
                <span className="bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                  이벤트 배너 관리
                </span>
              </h1>
              <p className="text-gray-600">총 {events?.length || 0}개의 이벤트</p>
            </div>
            <Button onClick={handleAddEvent}>
              <Plus className="w-5 h-5 mr-2" />
              이벤트 추가
            </Button>
          </div>

          {/* Event Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events?.map((event) => (
              <Card key={event.id} padding="none" className="overflow-hidden">
                {/* Preview Image */}
                <div className="relative aspect-[16/9] bg-gray-100">
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x450?text=Image+Load+Failed';
                    }}
                  />
                  {!event.active && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Badge variant="danger" size="lg">비활성</Badge>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={event.active ? 'success' : 'gray'} size="sm">
                      {event.active ? '활성' : '비활성'}
                    </Badge>
                    <h3 className="font-semibold text-gray-900 line-clamp-1">
                      {event.title}
                    </h3>
                  </div>

                  <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                    {event.link || '링크 없음'}
                  </p>

                  <p className="text-xs text-gray-500 mb-4">
                    {formatDateShort(event.startDate)} ~ {formatDateShort(event.endDate)}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant={event.active ? 'secondary' : 'outline'}
                      size="sm"
                      fullWidth
                      onClick={() => handleToggleActive(event.id, event.active)}
                    >
                      {event.active ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                      {event.active ? '비활성' : '활성화'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditEvent(event)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteEvent(event.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {(!events || events.length === 0) && (
              <div className="col-span-full text-center py-10 text-gray-500 bg-white rounded-lg shadow-sm border border-gray-100">
                등록된 이벤트가 없습니다.
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Event Form Modal */}
      {isModalOpen && (
        <EventFormModal
          event={editingEvent}
          onSave={handleSaveEvent}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

interface EventFormModalProps {
  event: Event | null;
  onSave: (event: Omit<Event, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

function EventFormModal({ event, onSave, onClose }: EventFormModalProps) {
  const [formData, setFormData] = useState<Partial<Event>>(
    event || {
      title: '',
      imageUrl: '',
      link: '',
      active: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30일 후
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.imageUrl) {
      toast.error('필수 항목을 모두 입력해주세요');
      return;
    }

    onSave(formData as Omit<Event, 'id' | 'createdAt'>);
  };

  const formatDateForInput = (date: any) => {
    if (!date) return '';
    try {
      // date가 Firestore Timestamp일 수도 있고 Date 객체일 수도 있음
      const d = date.toDate ? date.toDate() : new Date(date);
      // 유효한 날짜인지 확인
      if (isNaN(d.getTime())) return '';
      return d.toISOString().split('T')[0];
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {event ? '이벤트 수정' : '이벤트 추가'}
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
            label="이벤트 제목"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div className="mb-4">
            <ImageUpload
              label="이벤트 배너 이미지"
              currentImageUrl={formData.imageUrl}
              onImageUploaded={(url) => setFormData({ ...formData, imageUrl: url })}
              onUpload={(file) => uploadEventImage(file)}
              aspectRatio="wide"
            />
          </div>

          <Input
            label="링크 URL (선택)"
            value={formData.link}
            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            placeholder="/menu 또는 https://example.com"
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                시작일
              </label>
              <input
                type="date"
                value={formatDateForInput(formData.startDate)}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) setFormData({ ...formData, startDate: new Date(val) });
                }}
                className="w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                종료일
              </label>
              <input
                type="date"
                value={formatDateForInput(formData.endDate)}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) setFormData({ ...formData, endDate: new Date(val) });
                }}
                className="w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="active" className="ml-2 text-sm text-gray-700">
              활성화
            </label>
          </div>

          {/* 미리보기 */}
          {formData.imageUrl && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                미리보기
              </label>
              <div className="relative aspect-[16/9] rounded-lg overflow-hidden">
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x450?text=Invalid+URL';
                  }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" fullWidth onClick={onClose}>
              취소
            </Button>
            <Button type="submit" fullWidth>
              {event ? '수정' : '추가'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}