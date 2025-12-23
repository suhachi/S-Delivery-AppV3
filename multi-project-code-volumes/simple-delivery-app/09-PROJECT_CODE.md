# simple-delivery-app - Volume 09

Generated: 2025-12-23 19:23:29
Project Path: D:\projectsing\hyun-poong\simple-delivery-app\

- Files in volume: 18
- Approx size: 0.07 MB

---

## File: src\components\common\ImageUpload.tsx

```typescript
import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { uploadMenuImage, validateImageFile } from '../../services/storageService';
import { toast } from 'sonner';

interface ImageUploadProps {
  label?: string;
  currentImageUrl?: string;
  onImageUploaded: (url: string) => void;
  // Optional specific props
  menuId?: string;
  onUpload?: (file: File, onProgress: (progress: number) => void) => Promise<string>;
  aspectRatio?: 'square' | 'wide' | 'standard'; // square=1:1, wide=16:9, standard=4:3
  circle?: boolean; // For profile/logo images
  defaultImage?: string; // Fallback or initial image
}

export default function ImageUpload({
  label = '이미지',
  currentImageUrl,
  onImageUploaded,
  menuId,
  onUpload,
  aspectRatio = 'standard',
  circle = false,
  defaultImage
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentImageUrl || defaultImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAspectRatioClass = () => {
    if (circle) return 'aspect-square rounded-full';
    switch (aspectRatio) {
      case 'square': return 'aspect-square rounded-lg';
      case 'wide': return 'aspect-[16/9] rounded-lg';
      case 'standard': default: return 'aspect-[4/3] rounded-lg';
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 유효성 검사
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    // 미리보기 생성
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // 업로드 실행
    setUploading(true);
    try {
      let downloadURL = '';

      if (onUpload) {
        // 커스텀 업로드 함수 사용
        downloadURL = await onUpload(file, (p) => setProgress(p));
      } else if (menuId) {
        // 기존 메뉴 이미지 업로드 (하위 호환)
        downloadURL = await uploadMenuImage(file, menuId, (p) => setProgress(p));
      } else {
        throw new Error('Upload handler is missing');
      }

      onImageUploaded(downloadURL);
      toast.success('이미지가 업로드되었습니다');
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      toast.error('이미지 업로드에 실패했습니다');
      setPreviewUrl(currentImageUrl || defaultImage);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(undefined);
    onImageUploaded('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      <div className="relative w-full">
        {previewUrl ? (
          <div className={`relative overflow-hidden bg-gray-100 border-2 border-gray-200 ${getAspectRatioClass()}`}>
            <img
              src={previewUrl}
              alt="미리보기"
              className="w-full h-full object-cover"
            />
            {uploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p>{Math.round(progress)}%</p>
                </div>
              </div>
            )}
            {!uploading && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-md transform hover:scale-105"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className={`w-full border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors flex flex-col items-center justify-center text-gray-500 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 ${getAspectRatioClass()}`}
          >
            <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
            <p className="text-sm font-medium">이미지 업로드</p>
            <p className="text-xs mt-1 text-gray-400">JPG, PNG, WebP (최대 5MB)</p>
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}

```

---

## File: src\components\common\NotificationGuide.tsx

```typescript
import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import Button from './Button';

const STORAGE_KEY = 'notification_guide_dismissed';

export default function NotificationGuide() {
  const [show, setShow] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // 브라우저가 알림을 지원하지 않으면 표시하지 않음
    if (!('Notification' in window)) {
      return;
    }

    // 이미 dismiss 했으면 표시하지 않음
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed === 'true') {
      return;
    }

    // 현재 권한 상태 확인
    setPermission(Notification.permission);

    // 권한이 default일 때만 배너 표시
    if (Notification.permission === 'default') {
      setShow(true);
    }
  }, []);

  const handleRequestPermission = async () => {
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        setShow(false);
        localStorage.setItem(STORAGE_KEY, 'true');
      } else if (result === 'denied') {
        setShow(false);
        localStorage.setItem(STORAGE_KEY, 'true');
      }
    } catch (error) {
      console.error('알림 권한 요청 실패:', error);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  if (!show) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg animate-slide-down">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold">주문 알림을 받으시겠습니까?</p>
              <p className="text-sm text-blue-100">주문 상태가 변경되면 실시간으로 알려드립니다</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={handleRequestPermission}
              variant="outline"
              size="sm"
              className="bg-white text-blue-600 hover:bg-blue-50 border-0"
            >
              허용
            </Button>
            <button
              onClick={handleDismiss}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

```

---

## File: src\components\menu\MenuDetailModal.tsx

```typescript
import { useState } from 'react';
import { X, Plus, Minus, ShoppingCart } from 'lucide-react';
import { Menu, MenuOption } from '../../types/menu';
import { useCart } from '../../contexts/CartContext';
import { toast } from 'sonner';
import Button from '../common/Button';
import Badge from '../common/Badge';

interface MenuDetailModalProps {
  menu: Menu;
  onClose: () => void;
}

export default function MenuDetailModal({ menu, onClose }: MenuDetailModalProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<MenuOption[]>([]);

  const toggleOption = (option: MenuOption) => {
    setSelectedOptions(prev => {
      const exists = prev.find(opt => opt.id === option.id);
      if (exists) {
        return prev.filter(opt => opt.id !== option.id);
      } else {
        return [...prev, { ...option, quantity: 1 }];
      }
    });
  };

  const updateOptionQuantity = (optionId: string, delta: number) => {
    setSelectedOptions(prev => {
      return prev.map(opt => {
        if (opt.id === optionId) {
          const newQuantity = (opt.quantity || 1) + delta;
          if (newQuantity < 1) return opt; // Minimum 1
          return { ...opt, quantity: newQuantity };
        }
        return opt;
      });
    });
  };

  const getTotalPrice = () => {
    const optionsPrice = selectedOptions.reduce((sum, opt) => sum + (opt.price * (opt.quantity || 1)), 0);
    return (menu.price + optionsPrice) * quantity;
  };

  const handleAddToCart = () => {
    if (menu.soldout) {
      toast.error('품절된 메뉴입니다');
      return;
    }

    addItem({
      menuId: menu.id,
      name: menu.name,
      price: menu.price,
      quantity,
      options: selectedOptions,
      imageUrl: menu.imageUrl,
    });

    toast.success(`${menu.name}을(를) 장바구니에 담았습니다`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <div className="overflow-y-auto max-h-[90vh]">
          {/* Image */}
          <div className="relative aspect-[16/9] bg-gray-100">
            {menu.imageUrl ? (
              <img
                src={menu.imageUrl}
                alt={menu.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <span className="text-8xl">🍜</span>
              </div>
            )}

            {menu.soldout && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Badge variant="danger" size="lg">
                  품절
                </Badge>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Header */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-2 mb-2">
                {menu.category.map((cat) => (
                  <Badge key={cat} variant="primary">
                    {cat}
                  </Badge>
                ))}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{menu.name}</h2>
              <p className="text-gray-600">{menu.description}</p>
            </div>

            {/* Price */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <span className="text-3xl font-bold text-blue-600">
                {menu.price.toLocaleString()}
              </span>
              <span className="text-lg text-gray-600 ml-2">원</span>
            </div>

            {/* Options */}
            {menu.options && menu.options.length > 0 && (
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">옵션 선택</h3>
                <div className="space-y-2">
                  {menu.options.map((option) => {
                    const selected = selectedOptions.find(opt => opt.id === option.id);
                    return (
                      <div
                        key={option.id}
                        className={`
                          w-full rounded-lg border-2 transition-all overflow-hidden
                          ${selected
                            ? 'border-blue-500 bg-white'
                            : 'border-gray-200 hover:border-gray-300'
                          }
                        `}
                      >
                        <button
                          onClick={() => toggleOption(option)}
                          className="w-full flex items-center justify-between p-4 text-left"
                        >
                          <span className="font-medium text-gray-900">{option.name}</span>
                          <span className={`${selected ? 'text-blue-600' : 'text-gray-900'} font-semibold`}>
                            +{option.price.toLocaleString()}원
                          </span>
                        </button>

                        {selected && option.quantity !== undefined && (
                          <div className="flex items-center justify-between bg-blue-50 p-3 border-t border-blue-100 animate-slide-down">
                            <span className="text-sm text-blue-800 font-medium ml-1">수량</span>
                            <div className="flex items-center bg-white rounded-lg border border-blue-200 shadow-sm">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateOptionQuantity(option.id, -1);
                                }}
                                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:bg-gray-50 rounded-l-lg transition-colors"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-8 text-center text-sm font-bold text-gray-900">
                                {selected.quantity || 1}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateOptionQuantity(option.id, 1);
                                }}
                                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:bg-gray-50 rounded-r-lg transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">수량</h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="text-2xl font-bold text-gray-900 min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Total & Add to Cart */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">총 금액</p>
                <p className="text-2xl font-bold text-blue-600">
                  {getTotalPrice().toLocaleString()}원
                </p>
              </div>
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={menu.soldout}
                className="flex-1"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                장바구니 담기
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## File: src\components\review\ReviewModal.tsx

```typescript
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
```

---

## File: src\components\ui\alert.tsx

```typescript
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";

import { cn } from "./utils";

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive:
          "text-destructive bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
        className,
      )}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };

```

---

## File: src\components\ui\card.tsx

```typescript
import * as React from "react";

import { cn } from "./utils";

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <h4
      data-slot="card-title"
      className={cn("leading-none", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6 [&:last-child]:pb-6", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 pb-6 [.border-t]:pt-6", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};

```

---

## File: src\components\ui\label.tsx

```typescript
"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label@2.1.2";

import { cn } from "./utils";

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Label };

```

---

## File: src\components\ui\sheet.tsx

```typescript
"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog@1.1.6";
import { XIcon } from "lucide-react@0.487.0";

import { cn } from "./utils";

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className,
      )}
      {...props}
    />
  );
}

function SheetContent({
  className,
  children,
  side = "right",
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left";
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
          side === "right" &&
            "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
          side === "left" &&
            "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
          side === "top" &&
            "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto border-b",
          side === "bottom" &&
            "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto border-t",
          className,
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none">
          <XIcon className="size-4" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-foreground font-semibold", className)}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};

```

---

## File: src\components\ui\use-mobile.ts

```typescript
import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined,
  );

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}

```

---

## File: src\contexts\CartContext.tsx

```typescript
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MenuOption } from '../types/menu';

export interface CartItem {
  id: string;
  menuId: string;
  name: string;
  price: number;
  quantity: number;
  options?: MenuOption[];
  imageUrl?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setItems(JSON.parse(storedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addItem = (item: Omit<CartItem, 'id'>) => {
    const id = 'cart-' + Date.now() + '-' + Math.random();
    setItems(prev => [...prev, { ...item, id }]);
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => {
      const optionsPrice = item.options?.reduce((sum, opt) => sum + (opt.price * (opt.quantity || 1)), 0) || 0;
      return total + (item.price + optionsPrice) * item.quantity;
    }, 0);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
```

---

## File: src\data\mockOrders.ts

```typescript
import { Order } from '../types/order';

// This would be replaced with actual Firestore/Supabase data
export const mockOrders: Order[] = [
  {
    id: 'order-1',
    userId: 'user-1',
    items: [
      {
        menuId: '1',
        name: '소고기 쌀국수',
        price: 9500,
        quantity: 2,
        options: [{ name: '면 추가', price: 2000 }],
        imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&q=80',
      },
      {
        menuId: '8',
        name: '베트남 커피',
        price: 4500,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=800&q=80',
      },
    ],
    totalPrice: 29500,
    status: '배달중',
    address: '서울시 강남구 테헤란로 123',
    phone: '010-1234-5678',
    memo: '문 앞에 놔주세요',
    paymentType: '앱결제',
    createdAt: new Date('2024-12-04T12:30:00'),
  },
  {
    id: 'order-2',
    userId: 'user-1',
    items: [
      {
        menuId: '2',
        name: '해물 쌀국수',
        price: 11000,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=800&q=80',
      },
    ],
    totalPrice: 14000,
    status: '완료',
    address: '서울시 강남구 테헤란로 123',
    phone: '010-1234-5678',
    paymentType: '만나서카드',
    createdAt: new Date('2024-12-03T18:20:00'),
  },
  {
    id: 'order-3',
    userId: 'user-1',
    items: [
      {
        menuId: '5',
        name: '월남쌈',
        price: 7000,
        quantity: 2,
        imageUrl: 'https://images.unsplash.com/photo-1559054663-e8fbaa5b6c53?w=800&q=80',
      },
      {
        menuId: '7',
        name: '짜조',
        price: 6000,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&q=80',
      },
    ],
    totalPrice: 23000,
    status: '완료',
    address: '서울시 강남구 테헤란로 123',
    phone: '010-1234-5678',
    paymentType: '만나서현금',
    createdAt: new Date('2024-12-01T19:45:00'),
  },
];

```

---

## File: src\data\mockUsers.ts

```typescript
export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  createdAt: Date;
}

export const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'user@demo.com',
    name: '김민수',
    phone: '010-1234-5678',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'user-2',
    email: 'hong@example.com',
    name: '홍길동',
    phone: '010-2345-6789',
    createdAt: new Date('2024-02-20'),
  },
  {
    id: 'user-3',
    email: 'park@example.com',
    name: '박영희',
    phone: '010-3456-7890',
    createdAt: new Date('2024-03-10'),
  },
  {
    id: 'user-4',
    email: 'lee@example.com',
    name: '이철수',
    phone: '010-4567-8901',
    createdAt: new Date('2024-04-05'),
  },
  {
    id: 'user-5',
    email: 'choi@example.com',
    name: '최수진',
    phone: '010-5678-9012',
    createdAt: new Date('2024-05-12'),
  },
  {
    id: 'user-6',
    email: 'kang@example.com',
    name: '강민지',
    phone: '010-6789-0123',
    createdAt: new Date('2024-06-18'),
  },
  {
    id: 'user-7',
    email: 'yoon@example.com',
    name: '윤서준',
    phone: '010-7890-1234',
    createdAt: new Date('2024-07-22'),
  },
  {
    id: 'user-8',
    email: 'jung@example.com',
    name: '정다은',
    phone: '010-8901-2345',
    createdAt: new Date('2024-08-08'),
  },
];

```

---

## File: src\hooks\useFirebaseAuth.ts

```typescript
import { useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface User {
  id: string;
  email: string;
  displayName?: string;
  phone?: string;
}

// 데모 계정 정보
const DEMO_ACCOUNTS = {
  'user@demo.com': {
    password: 'demo123',
    id: 'demo-user-001',
    email: 'user@demo.com',
    displayName: '데모 사용자',
    isAdmin: false,
  },
  'admin@demo.com': {
    password: 'admin123',
    id: 'demo-admin-001',
    email: 'admin@demo.com',
    displayName: '관리자',
    isAdmin: true,
  },
};

export function useFirebaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 데모 모드 확인
  const isDemoMode = auth.app.options.apiKey === 'demo-api-key';

  useEffect(() => {
    // 데모 모드인 경우 로컬 스토리지에서 사용자 정보 로드
    if (isDemoMode) {
      const demoUser = localStorage.getItem('demoUser');
      if (demoUser) {
        setUser(JSON.parse(demoUser));
      }
      setLoading(false);
      return;
    }

    // Firebase 인증 모드
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Firestore에서 추가 정보(phone 등) 가져오기
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();

        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: userData?.displayName || firebaseUser.displayName || undefined, // Firestore 데이터 우선
          phone: userData?.phone || undefined,
        });

        // Firestore에 사용자 문서 생성 (없으면)
        if (!userDoc.exists()) {
          await ensureUserDocument(firebaseUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isDemoMode]);

  const signup = async (email: string, password: string, displayName?: string, phone?: string) => {
    // 데모 모드
    if (isDemoMode) {
      // 데모 모드에서는 회원가입 시뮬레이션
      const newUser: User = {
        id: `demo-user-${Date.now()}`,
        email,
        displayName: displayName || email.split('@')[0],
        phone: phone || '010-0000-0000',
      };
      setUser(newUser);
      localStorage.setItem('demoUser', JSON.stringify(newUser));
      localStorage.setItem('demoIsAdmin', 'false');
      return;
    }

    // Firebase 모드
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // 프로필 업데이트
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }

      // Firestore에 사용자 문서 생성
      await createUserDocument(userCredential.user, displayName, phone);

      return userCredential.user;
    } catch (error) {
      const errorCode = (error as { code?: string }).code || 'unknown';
      throw new Error(getAuthErrorMessage(errorCode));
    }
  };

  const login = async (email: string, password: string) => {
    // 데모 모드
    if (isDemoMode) {
      const demoAccount = DEMO_ACCOUNTS[email as keyof typeof DEMO_ACCOUNTS];

      if (!demoAccount) {
        throw new Error('존재하지 않는 사용자입니다. 데모 계정을 사용해주세요:\n- user@demo.com / demo123\n- admin@demo.com / admin123');
      }

      if (demoAccount.password !== password) {
        throw new Error('잘못된 비밀번호입니다');
      }

      // 데모 계정 로그인
      const { id, email: demoEmail, displayName, isAdmin } = demoAccount;
      const demoUser: User = { id, email: demoEmail, displayName };

      setUser(demoUser);
      localStorage.setItem('demoUser', JSON.stringify(demoUser));
      localStorage.setItem('demoIsAdmin', String(isAdmin));

      return;
    }

    // Firebase 모드
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      const errorCode = (error as { code?: string }).code || 'unknown';
      throw new Error(getAuthErrorMessage(errorCode));
    }
  };

  const logout = async () => {
    // 데모 모드
    if (isDemoMode) {
      setUser(null);
      localStorage.removeItem('demoUser');
      localStorage.removeItem('demoIsAdmin');
      return;
    }

    // Firebase 모드
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      throw new Error('로그아웃에 실패했습니다');
    }
  };

  return { user, loading, signup, login, logout };
}

// Firestore에 사용자 문서 생성
async function createUserDocument(firebaseUser: FirebaseUser, displayName?: string, phone?: string) {
  const userRef = doc(db, 'users', firebaseUser.uid);

  await setDoc(userRef, {
    email: firebaseUser.email,
    displayName: displayName || firebaseUser.email?.split('@')[0] || '',
    phone: phone || '',
    createdAt: new Date(),
    updatedAt: new Date(),
  }, { merge: true });
}

// 사용자 문서 확인 및 생성
async function ensureUserDocument(firebaseUser: FirebaseUser) {
  const userRef = doc(db, 'users', firebaseUser.uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    await createUserDocument(firebaseUser, firebaseUser.displayName || undefined);
  }
}

// Firebase 에러 메시지 한글화
function getAuthErrorMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    'auth/email-already-in-use': '이미 사용 중인 이메일입니다',
    'auth/invalid-email': '올바른 이메일 형식이 아닙니다',
    'auth/operation-not-allowed': '이메일/비밀번호 로그인이 비활성화되어 있습니다',
    'auth/weak-password': '비밀번호는 최소 6자 이상이어야 합니다',
    'auth/user-disabled': '비활성화된 계정입니다',
    'auth/user-not-found': '존재하지 않는 사용자입니다',
    'auth/wrong-password': '잘못된 비밀번호입니다',
    'auth/too-many-requests': '너무 많은 시도가 있었습니다. 잠시 후 다시 시도해주세요',
    'auth/network-request-failed': '네트워크 오류가 발생했습니다',
  };

  return errorMessages[errorCode] || '인증 오류가 발생했습니다';
}
```

---

## File: src\lib\nicepayClient.ts

```typescript
import { NicepayRequestParams } from '../types/global';

const NICEPAY_SCRIPT_URL = 'https://pay.nicepay.co.kr/v1/js/';

/**
 * NICEPAY JS SDK를 동적으로 로드합니다.
 */
export function loadNicepayScript(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (window.AUTHNICE) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = NICEPAY_SCRIPT_URL;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('NICEPAY Script load failed'));
        document.body.appendChild(script);
    });
}

/**
 * NICEPAY 결제창을 호출합니다.
 * @param params 결제 요청 파라미터
 */
export async function requestNicepayPayment(params: NicepayRequestParams): Promise<void> {
    await loadNicepayScript();

    if (!window.AUTHNICE) {
        throw new Error('NICEPAY SDK SDK not loaded');
    }

    window.AUTHNICE.requestPay({
        ...params,
        method: 'card', // 기본적으로 카드 결제
    });
}

```

---

## File: src\pages\NoticePage.tsx

```typescript
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
```

---

## File: src\pages\OrderDetailPage.tsx

```typescript
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, CreditCard, Clock, Package, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, PAYMENT_TYPE_LABELS, OrderStatus, Order } from '../types/order';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import ReviewModal from '../components/review/ReviewModal';
import { toast } from 'sonner';
import { useStore } from '../contexts/StoreContext';
import { useFirestoreDocument } from '../hooks/useFirestoreDocument';

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { store } = useStore();
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Fetch real order data
  // Path: stores/{storeId}/orders/{orderId}
  // useFirestoreDocument는 이제 서브컬렉션 경로 배열을 지원함
  const collectionPath = store?.id && orderId
    ? ['stores', store.id, 'orders']
    : null;
  const { data: order, loading, error } = useFirestoreDocument<Order>(
    collectionPath,
    orderId || null
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">주문 정보를 불러오는 중...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600 mb-4">
            {error ? '주문 정보를 불러오는데 실패했습니다' : '주문을 찾을 수 없습니다'}
          </p>
          <Button onClick={() => navigate('/orders')}>주문 목록으로</Button>
        </div>
      </div>
    );
  }

  // 헬퍼 함수: Firestore Timestamp 처리를 위한 toDate
  const toDate = (date: any): Date => {
    if (date?.toDate) return date.toDate();
    if (date instanceof Date) return date;
    if (typeof date === 'string') return new Date(date);
    return new Date();
  };

  // 헬퍼 함수: 사용자용 상태 라벨 변환
  const getDisplayStatus = (status: OrderStatus) => {
    switch (status) {
      case '접수': return '접수중';
      case '접수완료': return '접수확인';
      case '조리완료': return '조리 완료';
      case '포장완료': return '포장 완료';
      default: return ORDER_STATUS_LABELS[status];
    }
  };

  const statusColor = ORDER_STATUS_COLORS[order.status as OrderStatus] || ORDER_STATUS_COLORS['접수'];

  const handleReorder = () => {
    // TODO: 장바구니에 담기 로직 구현 필요 (여기서는 메시지만 표시)
    toast.success('이 기능은 준비 중입니다 (재주문)');
    // navigate('/cart');
  };

  const deliverySteps: OrderStatus[] = ['접수', '접수완료', '조리중', '배달중', '완료'];
  const pickupSteps: OrderStatus[] = ['접수', '접수완료', '조리중', '조리완료', '포장완료'];

  const isPickup = order.orderType === '포장주문';
  const statusSteps = isPickup ? pickupSteps : deliverySteps;

  const currentStepIndex = statusSteps.indexOf(order.status as OrderStatus);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/orders')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            주문 목록으로
          </button>
          <h1 className="text-3xl mb-2">
            <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              주문 상세
            </span>
          </h1>
          <p className="text-gray-600">주문번호: {order.id.slice(0, 8)}</p>
        </div>

        <div className="space-y-6">
          {/* Order Status */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${statusColor.bg}`}>
                  <Package className={`w-8 h-8 ${statusColor.text}`} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {getDisplayStatus(order.status as OrderStatus)}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {toDate(order.createdAt).toLocaleString('ko-KR')}
                  </p>
                </div>
              </div>
              <Badge
                variant={
                  order.status === '완료' || order.status === '포장완료' ? 'success' :
                    order.status === '취소' ? 'danger' :
                      order.status === '배달중' || order.status === '조리완료' ? 'secondary' :
                        'primary'
                }
                size="lg"
              >
                {getDisplayStatus(order.status as OrderStatus)}
              </Badge>
            </div>

            {/* Status Progress */}
            {order.status !== '취소' && (
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  {statusSteps.map((step, idx) => (
                    <div key={step} className="flex-1 flex flex-col items-center relative">
                      <div className={`
                        w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mb-2 transition-all relative z-10 shadow-sm
                        ${idx <= currentStepIndex ? 'gradient-primary text-white ring-2 ring-white' : 'bg-gray-100 text-gray-300'}
                      `}>
                        {idx <= currentStepIndex ? (
                          <CheckCircle2 className="w-4 h-4 sm:w-6 sm:h-6" />
                        ) : (
                          <Clock className="w-4 h-4 sm:w-6 sm:h-6" />
                        )}
                      </div>
                      <p className={`text-[10px] sm:text-xs text-center font-medium whitespace-nowrap ${idx <= currentStepIndex ? 'text-gray-900' : 'text-gray-400'}`}>
                        {getDisplayStatus(step)}
                      </p>
                      {idx < statusSteps.length - 1 && (
                        <div className={`absolute h-[2px] w-full top-4 sm:top-5 left-1/2 -z-0 ${idx < currentStepIndex ? 'bg-primary-500' : 'bg-gray-100'}`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Order Items */}
          <Card>
            <h3 className="text-xl font-bold text-gray-900 mb-4">주문 상품</h3>
            <div className="space-y-4">
              {order.items.map((item, idx) => {
                const optionsPrice = item.options?.reduce((sum, opt) => sum + opt.price, 0) || 0;
                return (
                  <div key={idx} className="flex items-start space-x-4 pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                    {item.imageUrl && (
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{item.name}</h4>
                      {item.options && item.options.length > 0 && (
                        <div className="space-y-0.5 mb-2">
                          {item.options.map((opt, optIdx) => (
                            <p key={optIdx} className="text-sm text-gray-600">
                              + {opt.name} (+{opt.price.toLocaleString()}원)
                            </p>
                          ))}
                        </div>
                      )}
                      <p className="text-sm text-gray-600">수량: {item.quantity}개</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        {((item.price + optionsPrice) * item.quantity).toLocaleString()}원
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Delivery Info */}
          <Card>
            <h3 className="text-xl font-bold text-gray-900 mb-4">배달 정보</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">배달 주소</p>
                  <p className="font-medium text-gray-900">{order.address}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">연락처</p>
                  <p className="font-medium text-gray-900">{order.phone}</p>
                </div>
              </div>
              {order.requestMessage && (
                <div className="flex items-start space-x-3">
                  <MessageSquare className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">요청사항</p>
                    <p className="font-medium text-gray-900">{order.requestMessage}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Payment Info */}
          <Card>
            <h3 className="text-xl font-bold text-gray-900 mb-4">결제 정보</h3>
            <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <CreditCard className="w-5 h-5 text-gray-400" />
                <p className="font-medium text-gray-900">
                  {order.paymentType ? PAYMENT_TYPE_LABELS[order.paymentType] : '결제 정보 없음'}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-gray-600">
                <span>상품 금액</span>
                <span>{(order.totalPrice - 3000).toLocaleString()}원</span>
              </div>
              <div className="flex items-center justify-between text-gray-600">
                <span>배달비</span>
                <span>3,000원</span>
              </div>
              <div className="flex items-center justify-between text-xl font-bold pt-3 border-t border-gray-200">
                <span>총 결제 금액</span>
                <span className="text-blue-600">{order.totalPrice.toLocaleString()}원</span>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={handleReorder}>
              재주문하기
            </Button>
            {(order.status === '완료' || order.status === '포장완료') && (
              <Button fullWidth onClick={() => setShowReviewModal(true)}>
                리뷰 작성하기
              </Button>
            )}
          </div>
        </div>
      </div>

      {showReviewModal && (
        <ReviewModal
          orderId={order.id}
          onClose={() => setShowReviewModal(false)}
          onSubmit={async (review) => {
            console.log('Review submitted:', review);
            toast.success('리뷰가 등록되었습니다!');
            // 실제 저장은 ReviewModal 내부에서 처리하거나 여기서 handler를 연결해야 함
            // ReviewModal 구현을 확인해봐야 함.
          }}
        />
      )}
    </div>
  );
}
```

---

## File: src\services\eventService.ts

```typescript
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Event } from '../types/event';

const getEventCollection = (storeId: string) => collection(db, 'stores', storeId, 'events');

/**
 * 이벤트 생성
 */
export async function createEvent(
  storeId: string,
  eventData: Omit<Event, 'id' | 'createdAt'>
): Promise<string> {
  try {
    const docRef = await addDoc(getEventCollection(storeId), {
      title: eventData.title,
      imageUrl: eventData.imageUrl,
      link: eventData.link,
      active: eventData.active,
      startDate: eventData.startDate instanceof Timestamp ? eventData.startDate : Timestamp.fromDate(new Date(eventData.startDate)),
      endDate: eventData.endDate instanceof Timestamp ? eventData.endDate : Timestamp.fromDate(new Date(eventData.endDate)),
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('이벤트 생성 실패:', error);
    throw error;
  }
}

/**
 * 이벤트 수정
 */
export async function updateEvent(
  storeId: string,
  eventId: string,
  eventData: Partial<Omit<Event, 'id' | 'createdAt'>>
): Promise<void> {
  try {
    const eventRef = doc(db, 'stores', storeId, 'events', eventId);
    const updateData: any = {};

    if (eventData.title !== undefined) updateData.title = eventData.title;
    if (eventData.imageUrl !== undefined) updateData.imageUrl = eventData.imageUrl;
    if (eventData.link !== undefined) updateData.link = eventData.link;
    if (eventData.active !== undefined) updateData.active = eventData.active;
    if (eventData.startDate !== undefined) {
      const start = eventData.startDate as any;
      updateData.startDate = start instanceof Timestamp ? start : Timestamp.fromDate(new Date(start));
    }
    if (eventData.endDate !== undefined) {
      const end = eventData.endDate as any;
      updateData.endDate = end instanceof Timestamp ? end : Timestamp.fromDate(new Date(end));
    }

    await updateDoc(eventRef, updateData);
  } catch (error) {
    console.error('이벤트 수정 실패:', error);
    throw error;
  }
}

/**
 * 이벤트 삭제
 */
export async function deleteEvent(
  storeId: string,
  eventId: string
): Promise<void> {
  try {
    const eventRef = doc(db, 'stores', storeId, 'events', eventId);
    await deleteDoc(eventRef);
  } catch (error) {
    console.error('이벤트 삭제 실패:', error);
    throw error;
  }
}

/**
 * 이벤트 활성화 토글
 */
export async function toggleEventActive(
  storeId: string,
  eventId: string,
  active: boolean
): Promise<void> {
  try {
    const eventRef = doc(db, 'stores', storeId, 'events', eventId);
    await updateDoc(eventRef, { active });
  } catch (error) {
    console.error('이벤트 활성화 상태 변경 실패:', error);
    throw error;
  }
}

/**
 * 모든 이벤트 쿼리 (생성일 내림차순)
 */
export function getAllEventsQuery(storeId: string) {
  return query(
    getEventCollection(storeId),
    orderBy('createdAt', 'desc')
  );
}

/**
 * 활성화된 이벤트만 조회
 */
export function getActiveEventsQuery(storeId: string) {
  return query(
    getEventCollection(storeId),
    where('active', '==', true),
    orderBy('startDate', 'asc')
  );
}

```

---

## File: src\services\reviewService.test.ts

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createReview, deleteReview } from './reviewService';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

// Mock dependencies
vi.mock('../lib/firebase', () => ({
    db: {},
}));

vi.mock('firebase/firestore', async () => {
    const actual = await vi.importActual('firebase/firestore');
    return {
        ...actual,
        collection: vi.fn(),
        addDoc: vi.fn(),
        updateDoc: vi.fn(),
        deleteDoc: vi.fn(),
        doc: vi.fn(),
        serverTimestamp: vi.fn(() => 'MOCK_TIMESTAMP'),
        query: vi.fn(),
        where: vi.fn(),
        orderBy: vi.fn(),
        getDocs: vi.fn(),
    };
});

describe('reviewService', () => {
    const mockStoreId = 'store_123';
    const mockOrderId = 'order_abc';
    const mockReviewId = 'review_xyz';
    const mockUserId = 'user_1';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createReview', () => {
        it('should create review and update order status', async () => {
            const mockDocRef = { id: 'new_review_id' };
            (addDoc as any).mockResolvedValue(mockDocRef);
            (collection as any).mockReturnValue('MOCK_COLLECTION_REF');
            (doc as any).mockReturnValue('MOCK_DOC_REF');

            const reviewData = {
                storeId: mockStoreId,
                orderId: mockOrderId,
                userId: mockUserId,
                userName: 'User',
                rating: 5,
                comment: 'Great!',
                images: [],
            };

            const result = await createReview(mockStoreId, reviewData);

            // 1. Review creation
            expect(collection).toHaveBeenCalledWith(expect.anything(), 'stores', mockStoreId, 'reviews');
            expect(addDoc).toHaveBeenCalledWith('MOCK_COLLECTION_REF', expect.objectContaining({
                ...reviewData,
                createdAt: 'MOCK_TIMESTAMP',
            }));

            // 2. Order update (reviewed: true)
            expect(doc).toHaveBeenCalledWith(expect.anything(), 'stores', mockStoreId, 'orders', mockOrderId);
            expect(updateDoc).toHaveBeenCalledWith('MOCK_DOC_REF', expect.objectContaining({
                reviewed: true,
                reviewText: 'Great!',
                reviewedAt: 'MOCK_TIMESTAMP',
            }));

            expect(result).toBe('new_review_id');
        });
    });

    describe('deleteReview', () => {
        it('should delete review and reset order status', async () => {
            (doc as any).mockReturnValue('MOCK_DOC_REF');

            await deleteReview(mockStoreId, mockReviewId, mockOrderId);

            // 1. Review delete
            expect(deleteDoc).toHaveBeenCalledWith('MOCK_DOC_REF');

            // 2. Order update (reviewed: false)
            expect(updateDoc).toHaveBeenCalledWith('MOCK_DOC_REF', expect.objectContaining({
                reviewed: false,
                reviewText: null,
            }));
        });

        it('should handle missing order document gracefully (review deleted, order update skipped)', async () => {
            (doc as any).mockReturnValue('MOCK_DOC_REF');

            // updateDoc throws "No document to update"
            (updateDoc as any).mockRejectedValueOnce(new Error('No document to update'));

            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

            await expect(deleteReview(mockStoreId, mockReviewId, mockOrderId)).resolves.not.toThrow();

            expect(deleteDoc).toHaveBeenCalled(); // Review deleted
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('주문 문서를 찾을 수 없어'), expect.anything());

            consoleSpy.mockRestore();
        });
    });
});

```

---

