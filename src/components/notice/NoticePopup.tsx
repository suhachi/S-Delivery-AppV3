import { useState, useEffect } from 'react';
import { X, Pin } from 'lucide-react';
import { Notice } from '../../types/notice';
import { useStore } from '../../contexts/StoreContext';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { getNoticesPath } from '../../lib/firestorePaths';
import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';

export default function NoticePopup() {
  const { store } = useStore();
  const storeId = store?.id;
  const [notice, setNotice] = useState<Notice | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!storeId) return;

    const loadPinnedNotice = async () => {
      try {
        // 고정된 공지 중 가장 최근 것 하나만 가져오기
        const q = query(
          collection(db, getNoticesPath(storeId)),
          where('pinned', '==', true),
          orderBy('createdAt', 'desc'),
          limit(1)
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          return;
        }

        const noticeDoc = snapshot.docs[0];
        const noticeData = {
          id: noticeDoc.id,
          ...noticeDoc.data(),
        } as Notice;

        // localStorage 체크: 오늘 본 공지인지 확인
        const today = new Date().toISOString().split('T')[0];
        const storageKey = `notice_popup_${noticeData.id}_${today}`;
        const hasSeenToday = localStorage.getItem(storageKey);

        if (!hasSeenToday) {
          setNotice(noticeData);
          setShow(true);
        }
      } catch (error) {
        console.error('공지사항 팝업 로드 실패:', error);
      }
    };

    loadPinnedNotice();
  }, [storeId]);

  const handleClose = (dontShowToday: boolean = false) => {
    if (dontShowToday && notice) {
      const today = new Date().toISOString().split('T')[0];
      const storageKey = `notice_popup_${notice.id}_${today}`;
      localStorage.setItem(storageKey, 'true');
    }
    setShow(false);
  };

  if (!show || !notice) {
    return null;
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '공지': return 'primary';
      case '이벤트': return 'secondary';
      case '점검': return 'danger';
      case '할인': return 'success';
      default: return 'gray';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
      <div className="relative w-full max-w-lg">
        <Card className="relative">
          {/* Close Button */}
          <button
            onClick={() => handleClose(false)}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          {/* Header */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Pin className="w-5 h-5 text-blue-600" />
              <Badge variant={getCategoryColor(notice.category)}>
                {notice.category}
              </Badge>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 pr-8">
              {notice.title}
            </h2>
          </div>

          {/* Content */}
          <div className="mb-6">
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {notice.content}
            </p>
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              fullWidth
              onClick={() => handleClose(true)}
            >
              오늘 하루 보지 않기
            </Button>
            <Button
              fullWidth
              onClick={() => handleClose(false)}
            >
              확인
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}