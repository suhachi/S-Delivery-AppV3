"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statsDailyV3 = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");
const dateKST_1 = require("../utils/dateKST");
exports.statsDailyV3 = (0, scheduler_1.onSchedule)({
    schedule: "10 0 * * *",
    // Better: "every day 00:10" and set region or use explicit timezone if supported by v2.
    // V2 supports timeZone.
    timeZone: "Asia/Seoul",
    region: "asia-northeast3", // Seoul region
}, async (event) => {
    const db = admin.firestore();
    const { startKST, endKST, dateKey } = (0, dateKST_1.getYesterdayKSTRange)();
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
            const menuStatsMap = new Map();
            for (const doc of ordersSnap.docs) {
                const order = doc.data();
                if (order.status === '결제대기')
                    continue; // exclude pending
                ordersTotal++;
                if (order.status === '취소') {
                    ordersCanceled++;
                }
                else {
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
    }
    catch (error) {
        console.error("[statsDailyV3] Error:", error);
    }
});
// Simple Helper for Batches (Firestore limit 500)
class BatchHandler {
    constructor(db) {
        this.count = 0;
        this.db = db;
        this.batch = db.batch();
    }
    async set(ref, data) {
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
//# sourceMappingURL=statsDailyV3.js.map