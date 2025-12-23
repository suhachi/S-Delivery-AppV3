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
