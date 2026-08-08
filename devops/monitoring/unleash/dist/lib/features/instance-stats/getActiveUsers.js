"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFakeGetActiveUsers = exports.createGetActiveUsers = void 0;
const createGetActiveUsers = (db) => async () => {
    const combinedQuery = db
        .select('id as user_id', 'seen_at')
        .from('users')
        .unionAll(db.select('user_id', 'seen_at').from('personal_access_tokens'));
    const result = await db
        .with('Combined', combinedQuery)
        .select({
        last_week: db.raw("COUNT(DISTINCT CASE WHEN seen_at > NOW() - INTERVAL '1 week' THEN user_id END)"),
        last_month: db.raw("COUNT(DISTINCT CASE WHEN seen_at > NOW() - INTERVAL '1 month' THEN user_id END)"),
        last_two_months: db.raw("COUNT(DISTINCT CASE WHEN seen_at > NOW() - INTERVAL '2 months' THEN user_id END)"),
        last_quarter: db.raw("COUNT(DISTINCT CASE WHEN seen_at > NOW() - INTERVAL '3 months' THEN user_id END)"),
    })
        .from('Combined');
    return {
        last7: Number.parseInt(result?.[0]?.last_week || '0', 10),
        last30: Number.parseInt(result?.[0]?.last_month || '0', 10),
        last60: Number.parseInt(result?.[0]?.last_two_months || '0', 10),
        last90: Number.parseInt(result?.[0]?.last_quarter || '0', 10),
    };
};
exports.createGetActiveUsers = createGetActiveUsers;
const createFakeGetActiveUsers = (activeUsers = {
    last7: 0,
    last30: 0,
    last60: 0,
    last90: 0,
}) => () => Promise.resolve(activeUsers);
exports.createFakeGetActiveUsers = createFakeGetActiveUsers;
//# sourceMappingURL=getActiveUsers.js.map