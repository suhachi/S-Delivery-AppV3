import { Order } from '../../types/order';
import { DeliverySettings } from '../../types/store';

export interface DeliveryRequestData {
    orderId: string;
    senderName: string; // 상점명
    senderAddress: string;
    senderPhone: string;
    receiverName: string; // 고객명
    receiverAddress: string;
    receiverPhone: string;
    items: string; // "짜장면 1개 외 2건"
    totalPrice: number;
    notes?: string;
    pickupTime?: number; // 조리 시간 (분)
}

export interface DeliveryResponse {
    success: boolean;
    deliveryId?: string; // 대행사 주문번호
    riderName?: string;
    riderPhone?: string;
    estimatedCost?: number; // 배달 대행료
    message?: string;
}

export interface DeliveryProvider {
    createOrder(data: DeliveryRequestData, settings: DeliverySettings): Promise<DeliveryResponse>;
    cancelOrder(deliveryId: string, settings: DeliverySettings): Promise<DeliveryResponse>;
    checkStatus(deliveryId: string, settings: DeliverySettings): Promise<string>;
}
