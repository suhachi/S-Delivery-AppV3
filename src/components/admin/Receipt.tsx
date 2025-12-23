import { Order } from '../../types/order';
import { Store } from '../../types/store';

interface ReceiptProps {
    order: Order | null;
    store: Store | null;
}

export default function Receipt({ order, store }: ReceiptProps) {
    if (!order) return null;

    // 1. 날짜 포맷팅 (YYYY. MM. DD. 오후 h:mm)
    const formatDate = (date: any) => {
        const d = date?.toDate ? date.toDate() : new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0'); // User example uses 12 (no spacing, just number)
        // Actually user example: 25. 12. 10. 오후 01:08
        // Let's match typical Korean format: YYYY. MM. DD. 
        const day = String(d.getDate()).padStart(2, '0');
        const hour = d.getHours();
        const minute = String(d.getMinutes()).padStart(2, '0');
        const ampm = hour >= 12 ? '오후' : '오전';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;

        // User example uses 2-digit year "25". Let's stick to full year or 2-digit as per preference. 
        // User text example: "2025.12.10."
        return `${year}.${month}.${day}. ${ampm} ${displayHour}:${minute}`;
    };

    // 2. 결제방식 매핑
    const getPaymentText = (type: string, isPickup: boolean) => {
        // 배달: 앱결제, 만나서카드, 만나서현금
        // 포장: 앱결제, 방문시결제
        if (type === '만나서카드') return '만나서 카드';
        if (type === '만나서현금') return '만나서 현금';
        if (type === '방문시결제') return '방문 시 결제';
        return '앱 결제'; // Default for '앱결제'
    };

    // 계산 로직
    const itemsPrice = order.items.reduce((total, item) => {
        const optionsPrice = item.options?.reduce((optSum, opt) => optSum + (opt.price * (opt.quantity || 1)), 0) || 0;
        return total + ((item.price + optionsPrice) * item.quantity);
    }, 0);

    const discountAmount = order.discountAmount || 0;
    const deliveryFee = order.totalPrice - itemsPrice + discountAmount;

    return (
        <div id="receipt-container">
            <div className="w-[280px] mx-auto bg-white text-black font-mono text-[12px] leading-snug p-2 pb-8">

                {/* 상점 정보 */}
                <div className="text-center mb-4">
                    <h1 className="text-xl font-bold mb-1">{store?.name || '상점'}</h1>
                    <p className="mb-0.5">{store?.address || ''}</p>
                    <p>Tel: {store?.phone || ''}</p>
                </div>

                {/* 주문 타입 배지 */}
                <div className="text-center mb-2">
                    <span className="inline-block border border-black px-2 py-0.5 font-bold text-sm">
                        [{order.orderType}]
                    </span>
                </div>

                {/* 주문 번호 */}
                <div className="text-center mb-2">
                    <p className="font-bold text-sm">주문번호: {order.id.slice(0, 4).toUpperCase()}</p>
                </div>

                {/* 주문 기본 정보 */}
                <div className="mb-2 space-y-0.5">
                    <div className="flex justify-between">
                        <span>일시</span>
                        <span>{formatDate(order.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>결제</span>
                        <span>{getPaymentText(order.paymentType, order.orderType === '포장주문')}</span>
                    </div>
                </div>

                {/* 고객 정보 */}
                <div className="mb-2 mt-4">
                    <p className="font-bold mb-1">고객 정보</p>
                    {order.orderType === '배달주문' && (
                        <p className="mb-1 break-words">{order.address}</p>
                    )}
                    <p className="mb-1">{order.phone}</p>
                    {/* 포장주문시 이름, 전화번호만 노출인데 이름이 없으므로 전화번호만 노출됨 (배달시엔 주소 포함) */}
                </div>

                {/* 요청 사항 */}
                {order.memo && (
                    <div className="mb-2">
                        <p className="font-bold mb-1">요청사항:</p>
                        <p className="break-words">{order.memo}</p>
                    </div>
                )}

                <div className="border-b border-black my-2"></div>

                {/* 메뉴 헤더 */}
                <div className="flex mb-1 font-bold">
                    <span className="flex-1">메뉴명</span>
                    <span className="w-8 text-center">수량</span>
                    <span className="w-16 text-right">금액</span>
                </div>

                <div className="border-b border-black mb-2"></div>

                {/* 메뉴 리스트 */}
                <div className="mb-2">
                    {order.items.map((item, index) => {
                        const optionsPrice = item.options?.reduce((sum, opt) => sum + (opt.price * (opt.quantity || 1)), 0) || 0;
                        const itemTotal = (item.price + optionsPrice) * item.quantity;
                        // Format: 
                        // Item Name    Qty    Price
                        // - Option            Price
                        //                     Total (aligned right)

                        return (
                            <div key={index} className="mb-2">
                                {/* 메인 메뉴 */}
                                <div className="flex items-start mb-0.5">
                                    <span className="flex-1 break-words pr-1">{item.name}</span>
                                    <span className="w-8 text-center">{item.quantity}</span>
                                    <span className="w-16 text-right">{item.price.toLocaleString()}</span>
                                </div>

                                {/* 옵션 리스트 */}
                                {item.options && item.options.map((opt, optIdx) => (
                                    <div key={optIdx} className="flex text-gray-800 mb-0.5">
                                        <span className="flex-1 break-words pl-2 text-[11px]">- {opt.name}</span>
                                        <span className="w-8 text-center text-[11px]"></span> {/* 옵션 수량 표시는 보통 생략하거나 이름 옆에 */}
                                        <span className="w-16 text-right text-[11px]">+{(opt.price * (opt.quantity || 1)).toLocaleString()}</span>
                                    </div>
                                ))}

                                {/* 항목 소계 (옵션 포함 총액) */}
                                <div className="text-right font-bold mt-1">
                                    {itemTotal.toLocaleString()}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="border-b border-black my-2"></div>

                {/* 금액 집계 */}
                <div className="space-y-1 mb-2">
                    <div className="flex justify-between">
                        <span>주문금액</span>
                        <span>{itemsPrice.toLocaleString()}</span>
                    </div>
                    {deliveryFee > 0 && (
                        <div className="flex justify-between">
                            <span>배달팁</span>
                            <span>+{deliveryFee.toLocaleString()}</span>
                        </div>
                    )}
                    {discountAmount > 0 && (
                        <div className="flex justify-between">
                            <span>할인금액</span>
                            <span>-{discountAmount.toLocaleString()}</span>
                        </div>
                    )}
                </div>

                <div className="border-b border-black my-2"></div>

                {/* 최종 합계 */}
                <div className="flex justify-between text-lg font-bold mb-4">
                    <span>합계</span>
                    <span>{order.totalPrice.toLocaleString()}원</span>
                </div>

                <div className="border-b border-black my-4"></div>

                {/* 푸터 */}
                <div className="text-center">
                    <p className="mb-1 font-bold">* 이용해 주셔서 감사합니다 *</p>
                    <p className="text-[10px]">Powered by CusCom</p>
                </div>

            </div>
        </div>
    );
}
