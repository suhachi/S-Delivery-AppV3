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
