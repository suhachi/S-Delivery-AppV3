import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { getYesterdayKSTRange } from "../utils/dateKST";

// types (simplified)
interface OrderItem {
    menuId: string;
    name: string;
    price: number;
    quantity: number;
    options?: { price: number; quantity?: number }[];
}
interface Order {
    id: string;
    status: string;
    totalPrice: number;
    items: OrderItem[];
    createdAt: admin.firestore.Timestamp;
}

export const statsDailyV3 = functions.scheduler
    .onSchedule({
        schedule: "10 0 * * *", // Every day at 00:10 (Default timezone is often UTC, but usually configured to project region. We'll assume UTC if not specified, 00:10 UTC is 09:10 KST. Wait, user said 00:10 KST. If region is not set, crontab might be UTC. 
        // Better: "every day 00:10" and set region or use explicit timezone if supported by v2.
        // V2 supports timeZone.
        timeZone: "Asia/Seoul",
        region: "asia-northeast3", // Seoul region
    }, async (event) => {
        const db = admin.firestore();
        const { startKST, endKST, dateKey } = getYesterdayKSTRange();

        console.log(`[statsDailyV3] Starting aggregation for ${dateKey} (KST)`);

        try {
            const storesSnap = await db.collection("stores").get();
            const batchHandler = new BatchHandler(db);

            for (const storeDoc of storesSnap.docs) {
                const storeId = storeDoc.id;

                // Query Orders
                const ordersRef = db.collection("stores").doc(storeId).collection("orders");
                const ordersSnap = await ordersRef
                    .where("createdAt", ">=", startKST)
                    .where("createdAt", "<=", endKST)
                    .get();

                if (ordersSnap.empty) {
                    console.log(`[${storeId}] No orders for ${dateKey}`);
                    continue;
                }

                // Aggregation Logic
                let ordersTotal = 0;
                let ordersPaid = 0;
                let ordersCanceled = 0;
                let grossSales = 0;
                const menuStatsMap = new Map<string, { name: string; qty: number; sales: number }>();

                for (const doc of ordersSnap.docs) {
                    const order = doc.data() as Order;

                    if (order.status === '결제대기') continue; // exclude pending

                    ordersTotal++;

                    if (order.status === '취소') {
                        ordersCanceled++;
                    } else {
                        // Paid/Valid (접수, 배달중, 완료 etc)
                        ordersPaid++;
                        grossSales += (order.totalPrice || 0);

                        // Menu Stats
                        if (order.items) {
                            order.items.forEach(item => {
                                const itemTotalFn = (item.price + (item.options?.reduce((s, o) => s + (o.price * (o.quantity || 1)), 0) || 0)) * item.quantity;
                                const current = menuStatsMap.get(item.menuId) || { name: item.name, qty: 0, sales: 0 };
                                current.qty += item.quantity;
                                current.sales += itemTotalFn;
                                menuStatsMap.set(item.menuId, current);
                            });
                        }
                    }
                }

                const avgOrderValue = ordersPaid > 0 ? Math.round(grossSales / ordersPaid) : 0;
                const cancelRate = (ordersPaid + ordersCanceled) > 0
                    ? parseFloat((ordersCanceled / (ordersPaid + ordersCanceled)).toFixed(4))
                    : 0;

                // Top Menus
                const topMenus = Array.from(menuStatsMap.entries())
                    .map(([menuId, stats]) => ({ menuId, ...stats }))
                    .sort((a, b) => b.qty - a.qty) // Sort by Quantity
                    .slice(0, 5);

                const statsDoc = {
                    dateKey,
                    ordersTotal,
                    ordersPaid,
                    ordersCanceled,
                    grossSales,
                    avgOrderValue,
                    cancelRate,
                    topMenus,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                };

                // Save to subcollection
                const statsRef = db.collection("stores").doc(storeId).collection("stats_daily").doc(dateKey);
                await batchHandler.set(statsRef, statsDoc);

                console.log(`[${storeId}] Stats computed: Paid=${ordersPaid}, Sales=${grossSales}`);
            }

            await batchHandler.commit(); // Final commit
            console.log(`[statsDailyV3] Completed for ${dateKey}`);

        } catch (error) {
            console.error("[statsDailyV3] Error:", error);
        }
    });

// Simple Helper for Batches (Firestore limit 500)
class BatchHandler {
    private batch: admin.firestore.WriteBatch;
    private count = 0;
    private db: admin.firestore.Firestore;

    constructor(db: admin.firestore.Firestore) {
        this.db = db;
        this.batch = db.batch();
    }

    async set(ref: admin.firestore.DocumentReference, data: any) {
        this.batch.set(ref, data, { merge: true });
        this.count++;
        if (this.count >= 490) {
            await this.commit();
        }
    }

    async commit() {
        if (this.count > 0) {
            await this.batch.commit();
            this.batch = this.db.batch();
            this.count = 0;
        }
    }
}
