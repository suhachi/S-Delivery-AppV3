import { Link } from 'react-router-dom';
import { Star, ChevronRight, User } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { useFirestoreCollection } from '../../hooks/useFirestoreCollection';
import { getAllReviewsQuery } from '../../services/reviewService';
import { Review } from '../../types/review';
import { formatDate } from '../../utils/formatDate';
import Card from '../common/Card';

export default function ReviewPreview() {
    const { store } = useStore();
    const storeId = store?.id;

    // Fetch reviews (sorted by newest First)
    const { data: reviews, loading } = useFirestoreCollection<Review>(
        storeId ? getAllReviewsQuery(storeId) : null
    );

    // Take only top 5 for preview
    const recentReviews = reviews ? reviews.slice(0, 5) : [];

    if (!storeId || loading) return null;

    if (recentReviews.length === 0) {
        return null; // hide if no reviews
    }

    return (
        <div className="container mx-auto px-4 mt-8 mb-12">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <span className="text-primary-600">💬</span>
                    <span>생생 리뷰 미리보기</span>
                </h2>
                <Link
                    to="/reviews"
                    className="text-sm text-gray-500 hover:text-primary-600 flex items-center gap-1"
                >
                    더보기 <ChevronRight className="w-4 h-4" />
                </Link>
            </div>

            <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 snap-x snap-mandatory">
                {recentReviews.map((review) => (
                    <div key={review.id} className="min-w-[280px] w-[280px] snap-start">
                        <Card
                            className="h-full flex flex-col p-4 bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group overflow-hidden"
                            padding="none"
                        >
                            {/* Image if available */}
                            {review.images && review.images.length > 0 && (
                                <div className="relative w-full h-32 overflow-hidden bg-gray-100">
                                    <img
                                        src={review.images[0]}
                                        alt="Review"
                                        className="w-full h-full object-cover transform transition-all duration-500 group-hover:scale-110 group-hover:brightness-105"
                                    />
                                </div>
                            )}

                            <div className="p-4 flex-1 flex flex-col">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                            <User className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-gray-900 truncate max-w-[100px]">
                                                {review.userDisplayName}
                                            </span>
                                            <div className="flex items-center">
                                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                <span className="text-xs font-bold ml-1">{review.rating}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
                                </div>

                                <div className="flex-1">
                                    <p className="text-sm text-gray-600 line-clamp-3 break-words">
                                        {review.comment}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>
                ))}
            </div>
        </div>
    );
}
