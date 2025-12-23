import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../contexts/StoreContext';
import { useAuth } from '../../contexts/AuthContext';
import { useFirestoreCollection } from '../../hooks/useFirestoreCollection';
import { getAllOrdersQuery } from '../../services/orderService';
import { Order } from '../../types/order';
import { toast } from 'sonner';

export default function AdminOrderAlert() {
    const { store } = useStore();
    const { isAdmin } = useAuth();
    const navigate = useNavigate();
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [lastOrderCount, setLastOrderCount] = useState<number>(0);

    // 전체 주문을 구독하여 새 주문 감지
    // 관리자가 아니거나 상점이 없으면 query는 null이 되어 구독하지 않음
    const { data: orders } = useFirestoreCollection<Order>(
        (isAdmin && store?.id) ? getAllOrdersQuery(store.id) : null
    );

    useEffect(() => {
        // Initialize audio with custom file source
        audioRef.current = new Audio('/notification.mp3');
        // Preload to ensure readiness
        audioRef.current.load();
    }, []);

    useEffect(() => {
        if (!orders || !isAdmin) return;

        // 초기 로딩 시에는 알림 울리지 않음
        if (lastOrderCount === 0 && orders.length > 0) {
            setLastOrderCount(orders.length);
            return;
        }

        // 새 주문이 추가된 경우
        if (orders.length > lastOrderCount) {
            const newOrdersCount = orders.length - lastOrderCount;
            const latestOrder = orders[0]; // 정렬이 최신순이라면

            // 알림음 재생 시도
            // 알림음 반복 재생 설정
            if (audioRef.current) {
                audioRef.current.loop = true; // 반복 재생
                audioRef.current.currentTime = 0;

                const playPromise = audioRef.current.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.error('Audio playback failed:', error);
                    });
                }
            }

            // 지속적인 팝업 (확인 버튼 누를 때까지 유지)
            toast.message('새로운 주문이 도착했습니다! 🔔', {
                description: `${latestOrder.items[0].name} 외 ${latestOrder.items.length - 1}건 (${latestOrder.totalPrice.toLocaleString()}원)`,
                duration: Infinity, // 무한 지속
                action: {
                    label: '확인',
                    onClick: () => {
                        // 확인 버튼 클릭 시 소리 끄기 및 페이지 이동
                        if (audioRef.current) {
                            audioRef.current.pause();
                            audioRef.current.currentTime = 0;
                        }
                        navigate('/admin/orders');
                    }
                },
                // 닫기 버튼 등으로 닫혔을 때 소리 끄기 (Sonner API에 따라 동작 다를 수 있음. 안전장치)
                onDismiss: () => {
                    if (audioRef.current) {
                        audioRef.current.pause();
                        audioRef.current.currentTime = 0;
                    }
                },
                onAutoClose: () => { // 혹시나 자동 닫힘 발생 시
                    if (audioRef.current) {
                        audioRef.current.pause();
                        audioRef.current.currentTime = 0;
                    }
                }
            });
        }
        setLastOrderCount(orders.length); // Update count
    }, [orders, lastOrderCount, isAdmin, navigate]);

    if (!isAdmin) return null;

    return null; // UI 없음
}
