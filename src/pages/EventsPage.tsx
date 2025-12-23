import { Gift } from 'lucide-react';
import EventList from '../components/event/EventList';

export default function EventsPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center">
                            <Gift className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-3xl">
                            <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                                이벤트
                            </span>
                        </h1>
                    </div>
                    <p className="text-gray-600">
                        놓치지 마세요! 현재 진행 중인 다양한 혜택
                    </p>
                </div>

                {/* Event List */}
                <EventList />
            </div>
        </div>
    );
}
