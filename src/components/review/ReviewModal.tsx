import { useState, useEffect, useRef } from 'react';
import { X, Star, Trash2, Camera } from 'lucide-react';
import Button from '../common/Button';
import Card from '../common/Card';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { useStore } from '../../contexts/StoreContext';
import { createReview, updateReview, deleteReview, getReviewByOrder } from '../../services/reviewService';
import { uploadReviewImage, validateImageFile } from '../../services/storageService';
import { Review } from '../../types/review';

interface ReviewModalProps {
  orderId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ReviewModal({ orderId, onClose, onSuccess }: ReviewModalProps) {
  const { user } = useAuth();
  const { store } = useStore();
  const storeId = store?.id;
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 기존 리뷰 확인
  useEffect(() => {
    if (!storeId || !user) return;

    const loadExistingReview = async () => {
      try {
        const review = await getReviewByOrder(storeId, orderId, user.id);
        if (review) {
          setExistingReview(review);
          setRating(review.rating);
          setComment(review.comment);
          if (review.images && review.images.length > 0) {
            setImagePreview(review.images[0]);
          }
        }
      } catch (error) {
        console.error('기존 리뷰 조회 실패:', error);
      }
    };

    loadExistingReview();
  }, [storeId, orderId, user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        toast.error(validation.error);
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!storeId || !user) {
      toast.error('로그인이 필요합니다');
      return;
    }

    if (rating === 0) {
      toast.error('별점을 선택해주세요');
      return;
    }

    if (!comment.trim()) {
      toast.error('리뷰 내용을 입력해주세요');
      return;
    }

    setIsLoading(true);

    try {
      // 이미지 업로드
      let imageUrls = existingReview?.images || [];

      // 새 이미지가 있으면 업로드
      if (imageFile) {
        const url = await uploadReviewImage(imageFile);
        imageUrls = [url]; // 현재는 1장만 지원 (덮어쓰기)
      }

      // 이미지를 삭제했다면 (preview가 null이고 file도 null이면)
      if (!imagePreview && !imageFile) {
        imageUrls = [];
      }

      const reviewData = {
        rating,
        comment: comment.trim(),
        images: imageUrls,
      };

      if (existingReview) {
        // 수정
        await updateReview(storeId, existingReview.id, reviewData);
        toast.success('리뷰가 수정되었습니다');
      } else {
        // 생성
        await createReview(storeId, {
          orderId,
          userId: user.id,
          userDisplayName: user.displayName || user.email || '사용자',
          ...reviewData,
        });
        toast.success('리뷰가 등록되었습니다');
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Review submit error:', error);
      toast.error('리뷰 처리 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!storeId || !existingReview) return;

    if (!window.confirm('리뷰를 삭제하시겠습니까?')) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteReview(storeId, existingReview.id, orderId);
      toast.success('리뷰가 삭제되었습니다');
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error('리뷰 삭제 중 오류가 발생했습니다');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 animate-fade-in">
      <div
        className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            리뷰 작성
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                별점을 선택해주세요
              </label>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-12 h-12 ${star <= (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                        }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-center mt-2 text-gray-600">
                  {rating}점
                </p>
              )}
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                리뷰 내용
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="음식은 어떠셨나요? 솔직한 리뷰를 남겨주세요."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                rows={5}
                maxLength={500}
              />
              <p className="text-sm text-gray-500 mt-1 text-right">
                {comment.length}/500
              </p>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                사진 첨부
              </label>
              <div className="flex gap-3 overflow-x-auto py-2">
                {/* Upload Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-500 hover:text-blue-500"
                >
                  <Camera className="w-6 h-6 mb-1" />
                  <span className="text-xs">사진 추가</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />

                {/* Preview */}
                {imagePreview && (
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 hover:bg-red-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                fullWidth
                onClick={onClose}
              >
                취소
              </Button>
              <Button
                type="submit"
                fullWidth
                isLoading={isLoading}
              >
                리뷰 등록
              </Button>
            </div>

            {/* Delete Button */}
            {existingReview && (
              <div className="mt-4">
                <Button
                  type="button"
                  variant="danger"
                  fullWidth
                  onClick={handleDelete}
                  isLoading={isDeleting}
                >
                  리뷰 삭제
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}