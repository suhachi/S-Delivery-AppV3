# Pages 파일

## src/pages/WelcomePage.tsx

```typescript
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../contexts/StoreContext';

/**
 * 인트로 페이지 (Intro / Splash Screen)
 * 앱 실행 시 잠시 로고와 상점 이름을 보여주고 메인 페이지로 이동
 */
export default function WelcomePage() {
  const navigate = useNavigate();
  const { store } = useStore();

  useEffect(() => {
    // 2초 후 메뉴 페이지로 자동 이동
    const timer = setTimeout(() => {
      navigate('/menu');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4 animate-fade-in">
      {/* 로고 또는 대표 이미지 */}
      <div className="w-32 h-32 md:w-40 md:h-40 mb-8 rounded-3xl gradient-primary flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-500">
        <span className="text-6xl md:text-7xl">🍜</span>
      </div>

      {/* 상점 이름 */}
      <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent text-center mb-2">
        {store?.name || 'Simple Delivery'}
      </h1>

      {/* 로딩 인디케이터 (선택) */}
      <div className="mt-8 flex gap-2">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}
```

## src/pages/LoginPage.tsx

(전체 코드는 프로젝트의 `src/pages/LoginPage.tsx` 파일 참조)

주요 기능:
- 이메일/비밀번호 로그인
- 데모 계정 자동 입력 기능
- 폼 유효성 검사
- 에러 처리

## src/pages/SignupPage.tsx

(전체 코드는 프로젝트의 `src/pages/SignupPage.tsx` 파일 참조)

주요 기능:
- 회원가입 폼
- 비밀번호 확인
- 폼 유효성 검사

## src/pages/MenuPage.tsx

(전체 코드는 프로젝트의 `src/pages/MenuPage.tsx` 파일 참조)

주요 기능:
- 메뉴 목록 표시
- 카테고리 필터링
- 검색 기능
- Firestore에서 메뉴 조회

## src/pages/CartPage.tsx

(전체 코드는 프로젝트의 `src/pages/CartPage.tsx` 파일 참조)

주요 기능:
- 장바구니 아이템 표시
- 수량 조절
- 총 금액 계산
- 주문하기 버튼

## src/pages/CheckoutPage.tsx

(전체 코드는 프로젝트의 `src/pages/CheckoutPage.tsx` 파일 참조)

주요 기능:
- 배달/포장 주문 선택
- 배달 정보 입력
- 결제 방법 선택
- 쿠폰 적용
- 주문 생성

## src/pages/OrdersPage.tsx

(전체 코드는 프로젝트의 `src/pages/OrdersPage.tsx` 파일 참조)

주요 기능:
- 주문 목록 표시
- 상태별 필터링
- 리뷰 작성 기능

## src/pages/OrderDetailPage.tsx

(전체 코드는 프로젝트의 `src/pages/OrderDetailPage.tsx` 파일 참조)

주요 기능:
- 주문 상세 정보 표시
- 주문 상태 진행 상황
- 재주문 기능

## src/pages/MyPage.tsx

(전체 코드는 프로젝트의 `src/pages/MyPage.tsx` 파일 참조)

주요 기능:
- 사용자 정보 표시
- 최근 주문 내역
- 쿠폰함
- 알림 설정
- 가게 정보

## src/pages/NoticePage.tsx

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

## src/pages/StoreSetupWizard.tsx

(전체 코드는 프로젝트의 `src/pages/StoreSetupWizard.tsx` 파일 참조)

주요 기능:
- 4단계 마법사 형식
- 상점 기본 정보 입력
- 연락처 정보 입력
- 배달 설정
- 상점 생성

## Admin Pages

### src/pages/admin/AdminDashboard.tsx

(전체 코드는 프로젝트의 `src/pages/admin/AdminDashboard.tsx` 파일 참조)

주요 기능:
- 통계 대시보드
- 최근 주문 목록
- 빠른 통계

### src/pages/admin/AdminMenuManagement.tsx

(전체 코드는 프로젝트의 `src/pages/admin/AdminMenuManagement.tsx` 파일 참조)

주요 기능:
- 메뉴 목록 관리
- 메뉴 추가/수정/삭제
- 품절 상태 변경

### src/pages/admin/AdminOrderManagement.tsx

(전체 코드는 프로젝트의 `src/pages/admin/AdminOrderManagement.tsx` 파일 참조)

주요 기능:
- 주문 목록 관리
- 주문 상태 변경
- 주문 상세 보기

### src/pages/admin/AdminCouponManagement.tsx

(전체 코드는 프로젝트의 `src/pages/admin/AdminCouponManagement.tsx` 파일 참조)

주요 기능:
- 쿠폰 목록 관리
- 쿠폰 생성/수정/삭제
- 쿠폰 활성화/비활성화

### src/pages/admin/AdminReviewManagement.tsx

(전체 코드는 프로젝트의 `src/pages/admin/AdminReviewManagement.tsx` 파일 참조)

주요 기능:
- 리뷰 목록 관리
- 리뷰 승인/거부
- 리뷰 삭제

### src/pages/admin/AdminNoticeManagement.tsx

(전체 코드는 프로젝트의 `src/pages/admin/AdminNoticeManagement.tsx` 파일 참조)

주요 기능:
- 공지사항 목록 관리
- 공지사항 생성/수정/삭제
- 고정 공지 설정

### src/pages/admin/AdminEventManagement.tsx

(전체 코드는 프로젝트의 `src/pages/admin/AdminEventManagement.tsx` 파일 참조)

주요 기능:
- 이벤트 목록 관리
- 이벤트 생성/수정/삭제
- 이벤트 활성화/비활성화

### src/pages/admin/AdminStoreSettings.tsx

(전체 코드는 프로젝트의 `src/pages/admin/AdminStoreSettings.tsx` 파일 참조)

주요 기능:
- 상점 정보 수정
- 브랜딩 설정
- 운영 시간 설정

