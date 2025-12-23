import { Bell } from 'lucide-react';
import NoticeList from '../components/notice/NoticeList';

export default function NoticePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl">
              <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                공지사항
              </span>
            </h1>
          </div>
          <p className="text-gray-600">
            중요한 소식과 이벤트를 확인하세요
          </p>
        </div>

        {/* Notice List */}
        <NoticeList />
      </div>
    </div>
  );
}