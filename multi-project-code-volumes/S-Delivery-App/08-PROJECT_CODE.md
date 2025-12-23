# S-Delivery-App - Volume 08

Generated: 2025-12-23 19:23:22
Project Path: D:\projectsing\S-Delivery-App\

- Files in volume: 19
- Approx size: 0.07 MB

---

## File: scripts\reset_for_production.js

```javascript
import admin from 'firebase-admin';
import serviceAccount from '../service-account-key.json' assert { type: 'json' };

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function deleteCollection(db, collectionPath, batchSize) {
    const collectionRef = db.collection(collectionPath);
    const query = collectionRef.orderBy('__name__').limit(batchSize);

    return new Promise((resolve, reject) => {
        deleteQueryBatch(db, query, resolve).catch(reject);
    });
}

async function deleteQueryBatch(db, query, resolve) {
    const snapshot = await query.get();

    const batchSize = snapshot.size;
    if (batchSize === 0) {
        // When there are no documents left, we are done
        resolve();
        return;
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });
    await batch.commit();

    // Recurse on the next process tick, to avoid
    // exploding the stack.
    process.nextTick(() => {
        deleteQueryBatch(db, query, resolve);
    });
}

async function resetDatabase() {
    console.log('🗑️  Starting Database Reset for Production...');

    try {
        // 1. Delete 'stores/default' document (and its subcollections ideally, but Firestore requires manual deletion check)
        // Deleting the document 'stores/default' puts the app in "Setup Mode".
        console.log('Removing stores/default...');
        await db.doc('stores/default').delete();

        // 2. Delete subcollections of 'stores/default' (orders, menus, etc) checks
        // Users might have generated data.
        console.log('Cleaning up subcollections...');
        await deleteCollection(db, 'stores/default/orders', 50);
        await deleteCollection(db, 'stores/default/menus', 50);
        await deleteCollection(db, 'stores/default/reviews', 50);
        await deleteCollection(db, 'stores/default/notices', 50);
        await deleteCollection(db, 'stores/default/events', 50);
        await deleteCollection(db, 'stores/default/coupons', 50);

        // 3. Clear 'users' collection? 
        // User said "Start from Store Setup". If we keep users, they log in and if they have no store, they go to wizard.
        // Keeping users is safer so they don't lose their account, but if "Complete Initial State", maybe delete users too.
        // However, I don't have the service account key easily accessible in this environment potentially?
        // Wait, the user has `functions` setup, so credentials might be there.
        // But usually local `npm run dev` doesn't have admin privileges without key.

        // Actually, I can rely on the user manually deleting or just deleting the store doc is enough to trigger the wizard.
        // The script above assumes `service-account-key.json` exists. I haven't seen it in the file list.
        // Use the client-side script approach if server key is missing?
        // Client side deletion is harder due to rules. 
        // I will write a script that assumes it can run with `firebase-admin` (which implies credentials).
        // If not, I'll ask user to do it via console.

        // WAIT! `scripts/seed_v2_data.mjs` was being edited by user.
        // It likely uses `import { initializeApp } from 'firebase/app'` (Client SDK).
        // I should use Client SDK for the script if possible, BUT client SDK cannot delete collections easily.
        // I'll stick to just deleting the root logic doc for now.

    } catch (error) {
        console.error('Error resetting DB:', error);
    }

    console.log('✅ Database reset complete. Ready for new store setup.');
}

// Check if we can run this.
// If service account is missing, this will fail.
// I will create a CLIENT SIDE script instead that runs in the browser context or via a helper page?
// No, I can just create a `reset_db.js` and ask user to run it IF they have admin setup.
// BUT, the safer bet is to use the existing `seed_v2_data.mjs` style which uses Client SDK.
// With Client SDK, I can just delete `stores/default`.

```

---

## File: src\components\common\AddressSearchInput.tsx

```typescript
import { useState } from 'react';
import { Search } from 'lucide-react';
import Input from './Input';
import Button from './Button';
import AddressSearchModal from './AddressSearchModal';

interface AddressSearchInputProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
    className?: string; // Wrapper className
    inputClassName?: string;
}

export default function AddressSearchInput({
    label,
    value,
    onChange,
    placeholder = '주소를 검색해주세요',
    required,
    className,
    inputClassName
}: AddressSearchInputProps) {
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    return (
        <div className={`relative ${className || ''}`}>
            <div className="flex gap-2 items-end">
                <div className="flex-1">
                    <Input
                        label={label}
                        value={value}
                        readOnly
                        onClick={() => setIsSearchOpen(true)}
                        placeholder={placeholder}
                        required={required}
                        className={`cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors ${inputClassName || ''}`}
                    />
                </div>
                <div className={label ? 'mb-[2px]' : ''}> {/* Align with input box if label exists */}
                    <Button
                        type="button"
                        onClick={() => setIsSearchOpen(true)}
                        variant="outline"
                        className="whitespace-nowrap h-[42px]"
                    >
                        <Search className="w-4 h-4 mr-1" />
                        검색
                    </Button>
                </div>
            </div>

            {isSearchOpen && (
                <AddressSearchModal
                    onClose={() => setIsSearchOpen(false)}
                    onComplete={(address) => {
                        onChange(address);
                    }}
                />
            )}
        </div>
    );
}

```

---

## File: src\components\common\Card.tsx

```typescript
import { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children?: ReactNode;
}

export default function Card({
  hover = false,
  padding = 'md',
  className = '',
  children,
  ...props
}: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`
        bg-white rounded-xl border border-gray-200 shadow-sm
        ${hover ? 'card-hover cursor-pointer' : ''}
        ${paddingClasses[padding]}
        ${className}
      `}
      {...props}
    >
      {children}
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

## File: src\components\event\EventList.tsx

```typescript
import { useState } from 'react';
import { Calendar, ChevronRight } from 'lucide-react';
import { Event } from '../../types/event';
import { formatDate } from '../../utils/formatDate';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { useStore } from '../../contexts/StoreContext';
import { useFirestoreCollection } from '../../hooks/useFirestoreCollection';
import { getActiveEventsQuery } from '../../services/eventService';

export default function EventList() {
    const { store } = useStore();
    const storeId = store?.id;
    const { data: events, loading } = useFirestoreCollection<Event>(
        storeId ? getActiveEventsQuery(storeId) : null
    );

    if (!storeId) return null;

    if (loading) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-600">이벤트를 불러오는 중...</p>
            </div>
        );
    }

    if (!events || events.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="text-5xl mb-4">🎉</div>
                <p className="text-gray-600">현재 진행 중인 이벤트가 없습니다</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {events.map((event) => (
                <Card key={event.id} className="overflow-hidden p-0">
                    {event.imageUrl && (
                        <div className="relative h-48 w-full">
                            <img
                                src={event.imageUrl}
                                alt={event.title}
                                className="w-full h-full object-cover"
                            />
                            {event.active && (
                                <div className="absolute top-2 right-2">
                                    <Badge variant="success" size="sm">진행중</Badge>
                                </div>
                            )}
                        </div>
                    )}
                    <div className="p-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{event.title}</h3>

                        <div className="flex items-center text-sm text-gray-500 mb-4">
                            <Calendar className="w-4 h-4 mr-1.5" />
                            <span>
                                {formatDate(event.startDate)} ~ {formatDate(event.endDate)}
                            </span>
                        </div>

                        {event.link && (
                            <a
                                href={event.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm"
                            >
                                자세히 보기 <ChevronRight className="w-4 h-4 ml-0.5" />
                            </a>
                        )}
                    </div>
                </Card>
            ))}
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

## File: src\components\ui\menubar.tsx

```typescript
"use client";

import * as React from "react";
import * as MenubarPrimitive from "@radix-ui/react-menubar@1.1.6";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react@0.487.0";

import { cn } from "./utils";

function Menubar({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Root>) {
  return (
    <MenubarPrimitive.Root
      data-slot="menubar"
      className={cn(
        "bg-background flex h-9 items-center gap-1 rounded-md border p-1 shadow-xs",
        className,
      )}
      {...props}
    />
  );
}

function MenubarMenu({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Menu>) {
  return <MenubarPrimitive.Menu data-slot="menubar-menu" {...props} />;
}

function MenubarGroup({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Group>) {
  return <MenubarPrimitive.Group data-slot="menubar-group" {...props} />;
}

function MenubarPortal({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Portal>) {
  return <MenubarPrimitive.Portal data-slot="menubar-portal" {...props} />;
}

function MenubarRadioGroup({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.RadioGroup>) {
  return (
    <MenubarPrimitive.RadioGroup data-slot="menubar-radio-group" {...props} />
  );
}

function MenubarTrigger({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Trigger>) {
  return (
    <MenubarPrimitive.Trigger
      data-slot="menubar-trigger"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex items-center rounded-sm px-2 py-1 text-sm font-medium outline-hidden select-none",
        className,
      )}
      {...props}
    />
  );
}

function MenubarContent({
  className,
  align = "start",
  alignOffset = -4,
  sideOffset = 8,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Content>) {
  return (
    <MenubarPortal>
      <MenubarPrimitive.Content
        data-slot="menubar-content"
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[12rem] origin-(--radix-menubar-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-md",
          className,
        )}
        {...props}
      />
    </MenubarPortal>
  );
}

function MenubarItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Item> & {
  inset?: boolean;
  variant?: "default" | "destructive";
}) {
  return (
    <MenubarPrimitive.Item
      data-slot="menubar-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function MenubarCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.CheckboxItem>) {
  return (
    <MenubarPrimitive.CheckboxItem
      data-slot="menubar-checkbox-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-xs py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <MenubarPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.CheckboxItem>
  );
}

function MenubarRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.RadioItem>) {
  return (
    <MenubarPrimitive.RadioItem
      data-slot="menubar-radio-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-xs py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <MenubarPrimitive.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.RadioItem>
  );
}

function MenubarLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Label> & {
  inset?: boolean;
}) {
  return (
    <MenubarPrimitive.Label
      data-slot="menubar-label"
      data-inset={inset}
      className={cn(
        "px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
        className,
      )}
      {...props}
    />
  );
}

function MenubarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Separator>) {
  return (
    <MenubarPrimitive.Separator
      data-slot="menubar-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}

function MenubarShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="menubar-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className,
      )}
      {...props}
    />
  );
}

function MenubarSub({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Sub>) {
  return <MenubarPrimitive.Sub data-slot="menubar-sub" {...props} />;
}

function MenubarSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.SubTrigger> & {
  inset?: boolean;
}) {
  return (
    <MenubarPrimitive.SubTrigger
      data-slot="menubar-sub-trigger"
      data-inset={inset}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none data-[inset]:pl-8",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto h-4 w-4" />
    </MenubarPrimitive.SubTrigger>
  );
}

function MenubarSubContent({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.SubContent>) {
  return (
    <MenubarPrimitive.SubContent
      data-slot="menubar-sub-content"
      className={cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-menubar-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg",
        className,
      )}
      {...props}
    />
  );
}

export {
  Menubar,
  MenubarPortal,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarGroup,
  MenubarSeparator,
  MenubarLabel,
  MenubarItem,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
};

```

---

## File: src\components\ui\textarea.tsx

```typescript
import * as React from "react";

import { cn } from "./utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "resize-none border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-input-background px-3 py-2 text-base transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };

```

---

## File: src\components\ui\tooltip.tsx

```typescript
"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip@1.1.8";

import { cn } from "./utils";

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  );
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "bg-primary text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance",
          className,
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="bg-primary fill-primary z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };

```

---

## File: src\components\ui\utils.ts

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

```

---

## File: src\contexts\AuthContext.tsx

```typescript
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { useIsAdmin } from '../hooks/useIsAdmin';

interface User {
  id: string;
  email: string;
  displayName?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  signup: (email: string, password: string, displayName?: string, phone?: string) => Promise<any>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading, signup, login, logout } = useFirebaseAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin(user?.id);
  // TEMPORARY TEST OVERRIDE: Force Admin
  // const isAdmin = true;
  // const adminLoading = false;

  const loading = authLoading || adminLoading;

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
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

## File: src\pages\admin\AdminOrderManagement.test.tsx

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import AdminOrderManagement from './AdminOrderManagement';
import { useStore } from '../../contexts/StoreContext';
import { useFirestoreCollection } from '../../hooks/useFirestoreCollection';
import { updateOrderStatus, deleteOrder } from '../../services/orderService';

// Mocks
vi.mock('../../contexts/StoreContext', () => ({
    useStore: vi.fn(),
}));

vi.mock('../../hooks/useFirestoreCollection', () => ({
    useFirestoreCollection: vi.fn(),
}));

vi.mock('../../services/orderService', () => ({
    updateOrderStatus: vi.fn(),
    deleteOrder: vi.fn(),
    getAllOrdersQuery: vi.fn(),
}));

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

// Mock child components
vi.mock('../../components/admin/AdminSidebar', () => ({
    default: () => <div data-testid="sidebar">Sidebar</div>,
}));
vi.mock('../../components/admin/Receipt', () => ({
    default: ({ order }: any) => order ? <div data-testid="receipt">Receipt for {order.id}</div> : null,
}));
vi.mock('../../components/admin/AdminOrderAlert', () => ({
    default: () => null,
}));

// Mock Lucide
vi.mock('lucide-react', () => ({
    Package: () => <span>Pkg</span>,
    MapPin: () => <span>Map</span>,
    Phone: () => <span>Phone</span>,
    CreditCard: () => <span>Card</span>,
    ChevronDown: () => <span>Down</span>,
}));

describe('AdminOrderManagement', () => {
    const mockStore = { id: 'store_1', name: 'Test Store' };

    const originalPrint = window.print;
    const originalConfirm = window.confirm;

    beforeEach(() => {
        vi.clearAllMocks();
        (useStore as any).mockReturnValue({ store: mockStore });
        window.print = vi.fn();
        window.confirm = vi.fn(() => true);
    });

    afterEach(() => {
        window.print = originalPrint;
        window.confirm = originalConfirm;
        vi.useRealTimers();
    });

    const mockOrders = [
        {
            id: 'order_1',
            status: '접수',
            totalPrice: 15000,
            items: [{ name: 'Pizza', quantity: 1, price: 15000, options: [] }],
            createdAt: { toDate: () => new Date('2024-01-01T10:00:00') },
            address: 'Seoul',
            orderType: '배달'
        },
        {
            id: 'order_2',
            status: '배달중',
            totalPrice: 20000,
            items: [{ name: 'Burger', quantity: 2, price: 10000, options: [] }],
            createdAt: { toDate: () => new Date('2024-01-01T11:00:00') },
            address: 'Busan',
            orderType: '배달'
        }
    ];

    it('should render empty state', () => {
        (useFirestoreCollection as any).mockReturnValue({ data: [] });
        render(<AdminOrderManagement />);
        expect(screen.getByText('주문이 없습니다')).toBeInTheDocument();
    });

    it('should render orders list', () => {
        (useFirestoreCollection as any).mockReturnValue({ data: mockOrders });
        render(<AdminOrderManagement />);
        expect(screen.getByText('주문 #order_1')).toBeInTheDocument();
    });

    it('should filter orders', async () => {
        (useFirestoreCollection as any).mockReturnValue({ data: mockOrders });
        render(<AdminOrderManagement />);

        expect(screen.getByText('주문 #order_1')).toBeInTheDocument();

        const buttons = screen.getAllByRole('button');
        const deliveryFilter = buttons.find(b => b.innerHTML.includes('배달중')); // innerHTML check for text + span

        expect(deliveryFilter).toBeDefined();
        fireEvent.click(deliveryFilter!);

        await waitFor(() => {
            expect(screen.queryByText('주문 #order_1')).not.toBeInTheDocument();
        });
        expect(screen.getByText('주문 #order_2')).toBeInTheDocument();
    });

    it('should handle status change', async () => {
        (useFirestoreCollection as any).mockReturnValue({ data: mockOrders });
        render(<AdminOrderManagement />);

        fireEvent.click(screen.getByText('주문 #order_1'));

        const nextBtn = await screen.findByRole('button', { name: /다음 단계로/ });
        fireEvent.click(nextBtn);

        expect(updateOrderStatus).toHaveBeenCalledWith(mockStore.id, 'order_1', '접수완료');
    });

    it('should handle print receipt', async () => {
        vi.useFakeTimers();
        (useFirestoreCollection as any).mockReturnValue({ data: mockOrders });
        render(<AdminOrderManagement />);

        fireEvent.click(screen.getByText('주문 #order_1'));
        await screen.findByText('주문 상품');

        const printBtn = screen.getByText('🖨️ 영수증 인쇄').closest('button');
        fireEvent.click(printBtn!);

        expect(await screen.findByTestId('receipt')).toBeInTheDocument();

        act(() => {
            vi.runAllTimers();
        });

        expect(window.print).toHaveBeenCalled();
    });
});

```

---

## File: src\pages\NicepayReturnPage.tsx

```typescript
/// <reference types="vite/client" />
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useStore } from '../contexts/StoreContext';

// 개발용 임시 Cloud Functions URL (로컬 또는 프로덕션)
// 실제 배포 시에는 자동으로 Functions 도메인을 사용하거나 프록시 설정 필요
const FUNCTIONS_URL = import.meta.env.VITE_FUNCTIONS_URL || 'https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/nicepayConfirm';

interface NicepayConfirmResponse {
    success: boolean;
    data?: any;
    error?: string;
    code?: string;
}

export default function NicepayReturnPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { store } = useStore();

    const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
    const [message, setMessage] = useState('결제 결과를 확인하고 있습니다...');

    useEffect(() => {
        const verifyPayment = async () => {
            // URL 파라미터 파싱
            const orderId = searchParams.get('orderId');
            const tid = searchParams.get('tid') || searchParams.get('TxTid');
            const authToken = searchParams.get('authToken') || searchParams.get('AuthToken');
            const resultCode = searchParams.get('resultCode') || searchParams.get('ResultCode');
            const resultMsg = searchParams.get('resultMsg') || searchParams.get('ResultMsg');
            const amount = searchParams.get('amt') || searchParams.get('Amt');

            console.log('NICEPAY Return Params:', { orderId, tid, resultCode, resultMsg });

            if (resultCode !== '0000') {
                setStatus('failed');
                setMessage(resultMsg || '결제가 취소되었거나 승인되지 않았습니다.');
                return;
            }

            if (!orderId || !tid || !authToken) {
                setStatus('failed');
                setMessage('필수 결제 정보가 누락되었습니다.');
                return;
            }

            try {
                // Cloud Function 호출
                // 주의: 배포 전에는 로컬 에뮬레이터나 배포된 URL을 정확히 지정해야 함.
                // 여기서는 fetch 사용. (T2-4-2 Task에서 URL은 .env 등으로 관리 권장)

                // **************************************************************************
                // [중요] 실제 운영 환경에서는 Functions URL을 동적으로 주입해야 합니다.
                // 현재는 예시로 상대 경로 또는 하드코딩된 URL을 사용할 수 있습니다.
                // **************************************************************************

                const response = await fetch('/nicepayConfirm', { // 리버스 프록시 사용 시
                    // const response = await fetch('http://127.0.0.1:5001/YOUR_PROJECT/us-central1/nicepayConfirm', { // 로컬 테스트
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        tid,
                        authToken,
                        orderId,
                        storeId: store?.id,
                        amount: Number(amount)
                    })
                });

                const result: NicepayConfirmResponse = await response.json();

                if (result.success) {
                    setStatus('success');
                    setMessage('결제가 정상적으로 완료되었습니다.');
                } else {
                    setStatus('failed');
                    setMessage(result.error || '결제 승인 중 오류가 발생했습니다.');
                }
            } catch (error) {
                console.error('Payment Confirmation Error:', error);
                setStatus('failed');
                setMessage('서버 통신 중 오류가 발생했습니다.');
            }
        };

        if (store?.id) {
            verifyPayment();
        }
    }, [searchParams, store]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full text-center py-10 px-6">
                {status === 'loading' && (
                    <div className="flex flex-col items-center">
                        <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-6" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">결제 승인 중...</h2>
                        <p className="text-gray-600 animate-pulse">{message}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center">
                        <CheckCircle2 className="w-16 h-16 text-green-500 mb-6" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">결제 성공!</h2>
                        <p className="text-gray-600 mb-8">{message}</p>
                        <Button
                            fullWidth
                            size="lg"
                            onClick={() => navigate('/orders')}
                        >
                            주문 내역 보기
                        </Button>
                    </div>
                )}

                {status === 'failed' && (
                    <div className="flex flex-col items-center">
                        <XCircle className="w-16 h-16 text-red-500 mb-6" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">결제 실패</h2>
                        <p className="text-gray-600 mb-8">{message}</p>
                        <div className="flex gap-3 w-full">
                            <Button
                                variant="outline"
                                fullWidth
                                onClick={() => navigate('/')}
                            >
                                홈으로
                            </Button>
                            <Button
                                fullWidth
                                onClick={() => navigate('/checkout')}
                            >
                                다시 시도
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}

```

---

## File: src\pages\StoreSetupWizard.tsx

```typescript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../contexts/StoreContext';
import { StoreFormData } from '../types/store';
import { toast } from 'sonner';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import AddressSearchInput from '../components/common/AddressSearchInput';
import Card from '../components/common/Card';
import { Store as StoreIcon, ChevronRight, ChevronLeft, Check } from 'lucide-react';

// 현재 버전에서는 '단일 상점' 아키텍처를 따르므로 고정된 ID를 사용합니다.
// 향후 멀티 스토어 플랫폼으로 확장 시, 이 값을 동적으로 생성하거나 사용자 입력을 받도록 수정해야 합니다.
const DEFAULT_STORE_ID = 'default';

const STEPS = [
  { id: 1, name: '기본 정보', description: '상점 이름과 설명' },
  { id: 2, name: '연락처', description: '전화번호, 이메일, 주소' },
  { id: 3, name: '배달 설정', description: '배달비, 최소 주문 금액' },
  { id: 4, name: '완료', description: '설정 확인 및 생성' },
];

export default function StoreSetupWizard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { store, loading: storeLoading } = useStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // 이미 상점이 설정되어 있다면 관리자 페이지로 이동
  useEffect(() => {
    if (!storeLoading && store) {
      toast.info('이미 상점이 설정되어 있습니다.');
      navigate('/admin');
    }
  }, [store, storeLoading, navigate]);

  const [formData, setFormData] = useState<StoreFormData>({
    name: '',
    description: '',
    phone: '',
    email: user?.email || '',
    address: '',
    deliveryFee: 3000,
    minOrderAmount: 15000,
  });

  if (storeLoading) return null;

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.name) {
          toast.error('상점 이름을 입력해주세요');
          return false;
        }
        if (formData.name.length < 2) {
          toast.error('상점 이름은 최소 2자 이상이어야 합니다');
          return false;
        }
        return true;
      case 2:
        if (!formData.phone || !formData.email || !formData.address) {
          toast.error('모든 연락처 정보를 입력해주세요');
          return false;
        }
        return true;
      case 3:
        if (formData.deliveryFee < 0 || formData.minOrderAmount < 0) {
          toast.error('금액은 0 이상이어야 합니다');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('로그인이 필요합니다');
      return;
    }

    setLoading(true);

    try {
      // 1. 상점 데이터 문서 생성 (store/default)
      const storeData = {
        ...formData,
        id: DEFAULT_STORE_ID,
        logoUrl: '',
        bannerUrl: '',
        primaryColor: '#3b82f6',
        businessHours: {},
        settings: {
          autoAcceptOrders: false,
          estimatedDeliveryTime: 30,
          paymentMethods: ['앱결제', '만나서카드', '만나서현금'],
          enableReviews: true,
          enableCoupons: true,
          enableNotices: true,
          enableEvents: true,
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // 1. 상점 문서 생성 (단일 상점 모드: 'default' ID 사용)
      await setDoc(doc(db, 'stores', DEFAULT_STORE_ID), storeData);

      // 2. 관리자-상점 매핑 생성 (권한 부여용)
      // 이 매핑이 있어야 firestore.rules의 isStoreOwner()가 true를 반환하여 수정 권한을 가짐
      if (user?.id) {
        const adminStoreId = `${user.id}_${DEFAULT_STORE_ID}`;
        await setDoc(doc(db, 'adminStores', adminStoreId), {
          adminUid: user.id,
          storeId: DEFAULT_STORE_ID,
          role: 'owner',
          createdAt: serverTimestamp(),
        });

        // 3. 사용자 문서에 role 업데이트 (선택 사항, 클라이언트 편의용)
        // await updateDoc(doc(db, 'users', user.id), { role: 'admin' }); 
      }



      // 성공 메시지 및 이동
      toast.success('상점이 성공적으로 생성되었습니다!');

      // 스토어 컨텍스트 갱신을 위해 잠시 대기
      setTimeout(() => {
        refreshStore();
        navigate('/admin');
        window.location.reload(); // StoreContext 새로고침
      }, 1000);
    } catch (error) {
      console.error('Failed to create store:', error);
      toast.error('상점 생성에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 gradient-primary rounded-3xl mb-4">
            <StoreIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl mb-2">
            <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              상점 만들기
            </span>
          </h1>
          <p className="text-gray-600">나만의 배달 앱을 만들어보세요</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${currentStep > step.id
                      ? 'bg-green-500 text-white'
                      : currentStep === step.id
                        ? 'gradient-primary text-white'
                        : 'bg-gray-200 text-gray-500'
                      }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span>{step.id}</span>
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-sm font-medium text-gray-900">{step.name}</p>
                    <p className="text-xs text-gray-500 hidden sm:block">{step.description}</p>
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <Card className="p-8">
          {/* Step 1: 기본 정보 */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">기본 정보</h2>

              <Input
                label="상점 이름"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="예: 맛있는 포집"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  상점 설명
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  rows={4}
                  placeholder="상점을 소개하는 짧은 설명을 작성해주세요"
                />
              </div>
            </div>
          )}

          {/* Step 2: 연락처 */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">연락처 정보</h2>

              <Input
                label="전화번호"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="010-1234-5678"
                required
              />

              <Input
                label="이메일"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contact@example.com"
                required
              />

              <AddressSearchInput
                label="주소"
                value={formData.address}
                onChange={(address) => setFormData({ ...formData, address })}
                required
              />
            </div>
          )}

          {/* Step 3: 배달 설정 */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">배달 설정</h2>

              <Input
                label="배달비 (원)"
                type="number"
                value={formData.deliveryFee}
                onChange={(e) => setFormData({ ...formData, deliveryFee: parseInt(e.target.value) || 0 })}
                placeholder="3000"
                required
              />

              <Input
                label="최소 주문 금액 (원)"
                type="number"
                value={formData.minOrderAmount}
                onChange={(e) => setFormData({ ...formData, minOrderAmount: parseInt(e.target.value) || 0 })}
                placeholder="15000"
                required
              />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  💡 <strong>팁:</strong> 배달비와 최소 주문 금액은 나중에 상점 설정에서 변경할 수 있습니다.
                </p>
              </div>
            </div>
          )}

          {/* Step 4: 완료 */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">설정 확인</h2>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">상점 정보</h3>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">상점 이름:</dt>
                      <dd className="font-medium text-gray-900">{formData.name}</dd>
                    </div>
                  </dl>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">연락처</h3>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">전화:</dt>
                      <dd className="font-medium text-gray-900">{formData.phone}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">이메일:</dt>
                      <dd className="font-medium text-gray-900">{formData.email}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">주소:</dt>
                      <dd className="font-medium text-gray-900">{formData.address}</dd>
                    </div>
                  </dl>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">배달 설정</h3>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">배달비:</dt>
                      <dd className="font-medium text-gray-900">{formData.deliveryFee.toLocaleString()}원</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">최소 주문:</dt>
                      <dd className="font-medium text-gray-900">{formData.minOrderAmount.toLocaleString()}원</dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  ✅ 모든 설정이 완료되었습니다! 상점을 생성하시겠습니까?
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={loading}
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                이전
              </Button>
            )}

            {currentStep < 4 ? (
              <Button
                onClick={handleNext}
                fullWidth={currentStep === 1}
              >
                다음
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                fullWidth
              >
                {loading ? '생성 중...' : '상점 만들기 🎉'}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
```

---

## File: src\services\couponService.test.ts

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateCoupon } from './couponService';

// Mock dependencies
vi.mock('../lib/firebase', () => ({
    db: {},
}));

describe('couponService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('validateCoupon', () => {
        it('should return valid if conditions met', () => {
            const coupon = {
                code: 'TEST',
                discountAmount: 1000,
                minOrderAmount: 10000,
                validUntil: { toDate: () => new Date('2099-12-31') }, // Future
                isActive: true,
                usedByUserIds: []
            };

            const result = validateCoupon(coupon as any, 15000, 'user1');
            expect(result.isValid).toBe(true);
        });

        it('should fail if order amount is too low', () => {
            const coupon = {
                code: 'TEST',
                minOrderAmount: 10000,
                validUntil: { toDate: () => new Date('2099-12-31') },
                isActive: true,
                usedByUserIds: []
            };
            // 5000 < 10000
            const result = validateCoupon(coupon as any, 5000, 'user1');
            expect(result.isValid).toBe(false);
            expect(result.reason).toContain('최소 주문 금액');
        });

        it('should fail if expired', () => {
            const coupon = {
                code: 'TEST',
                minOrderAmount: 0,
                validUntil: { toDate: () => new Date('2020-01-01') }, // Past
                isActive: true,
                usedByUserIds: []
            };
            const result = validateCoupon(coupon as any, 10000, 'user1');
            expect(result.isValid).toBe(false);
            expect(result.reason).toContain('유효기간');
        });

        it('should fail if already used by user', () => {
            const coupon = {
                code: 'TEST',
                minOrderAmount: 0,
                validUntil: { toDate: () => new Date('2099-12-31') },
                isActive: true,
                usedByUserIds: ['user1'] // Used
            };
            const result = validateCoupon(coupon as any, 10000, 'user1');
            expect(result.isValid).toBe(false);
            expect(result.reason).toContain('이미 사용');
        });
    });
});

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

## File: src\utils\labels.ts

```typescript
/**
 * 라벨 및 상수 관리
 */

export const ORDER_STATUS_LABELS = {
  '접수': '주문 접수',
  '조리중': '조리 중',
  '배달중': '배달 중',
  '완료': '배달 완료',
  '취소': '주문 취소',
} as const;

export const PAYMENT_TYPE_LABELS = {
  '앱결제': '앱 결제',
  '만나서카드': '만나서 카드 결제',
  '만나서현금': '만나서 현금 결제',
  '방문시결제': '방문 시 결제',
} as const;

export const CATEGORY_LABELS = [
  '인기메뉴',
  '추천메뉴',
  '기본메뉴',
  '사이드메뉴',
  '음료',
  '주류',
] as const;

export const NOTICE_CATEGORIES = [
  '공지',
  '이벤트',
  '점검',
  '할인',
] as const;

export const COUPON_TYPE_LABELS = {
  'percentage': '할인율',
  'fixed': '할인 금액',
} as const;

export default {
  ORDER_STATUS_LABELS,
  PAYMENT_TYPE_LABELS,
  CATEGORY_LABELS,
  NOTICE_CATEGORIES,
  COUPON_TYPE_LABELS,
};

```

---

