import { DeliveryProvider, DeliveryRequestData, DeliveryResponse } from './types';
import { DeliverySettings } from '../../types/store';

export class MockDeliveryProvider implements DeliveryProvider {
    async createOrder(data: DeliveryRequestData, settings: DeliverySettings): Promise<DeliveryResponse> {
        console.log('[MockDelivery] Creating Order:', data);
        console.log('[MockDelivery] Using Settings:', settings);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Basic Validation Mock
        if (!settings.apiKey && settings.provider !== 'manual') {
            return { success: false, message: 'API Key가 설정되지 않았습니다.' };
        }

        return {
            success: true,
            deliveryId: `MOCK-${Date.now()}`,
            estimatedCost: 3500,
            message: '배달 대행 요청이 접수되었습니다. (테스트)'
        };
    }

    async cancelOrder(deliveryId: string, settings: DeliverySettings): Promise<DeliveryResponse> {
        console.log('[MockDelivery] Cancelling Order:', deliveryId);
        await new Promise(resolve => setTimeout(resolve, 500));

        return {
            success: true,
            message: '배달 요청이 취소되었습니다.'
        };
    }

    async checkStatus(deliveryId: string, settings: DeliverySettings): Promise<string> {
        return 'PICKUP_PENDING';
    }
}
