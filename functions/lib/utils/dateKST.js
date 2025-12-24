"use strict";
/**
 * KST Date Helpers
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getYesterdayKSTRange = void 0;
function getYesterdayKSTRange() {
    const now = new Date();
    // UTC+9
    const kstOffset = 9 * 60 * 60 * 1000;
    const nowKST = new Date(now.getTime() + kstOffset);
    // Yesterday
    const yesterdayKST = new Date(nowKST);
    yesterdayKST.setDate(yesterdayKST.getDate() - 1);
    const yyyy = yesterdayKST.getFullYear();
    const mm = String(yesterdayKST.getMonth() + 1).padStart(2, '0');
    const dd = String(yesterdayKST.getDate()).padStart(2, '0');
    const dateKey = `${yyyy}-${mm}-${dd}`;
    // KST Start/End
    const startKST = new Date(`${dateKey}T00:00:00+09:00`);
    const endKST = new Date(`${dateKey}T23:59:59.999+09:00`);
    return { startKST, endKST, dateKey };
}
exports.getYesterdayKSTRange = getYesterdayKSTRange;
//# sourceMappingURL=dateKST.js.map