"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFakeGetProductionChanges = exports.createGetProductionChanges = void 0;
const createGetProductionChanges = (db) => async () => {
    const productionChanges = await db.raw(`SELECT SUM(CASE WHEN seu.day > NOW() - INTERVAL '30 days' THEN seu.updates END) AS last_month,
                         SUM(CASE WHEN seu.day > NOW() - INTERVAL '60 days' THEN seu.updates END) AS last_two_months,
                         SUM(CASE WHEN seu.day > NOW() - INTERVAL '90 days' THEN seu.updates END) AS last_quarter
                  FROM stat_environment_updates seu
                  LEFT JOIN environments e
                    ON e.name = seu.environment
                  WHERE e.type = 'production';`);
    return {
        last30: Number.parseInt(productionChanges.rows[0]?.last_month || '0', 10),
        last60: Number.parseInt(productionChanges.rows[0]?.last_two_months || '0', 10),
        last90: Number.parseInt(productionChanges.rows[0]?.last_quarter || '0', 10),
    };
};
exports.createGetProductionChanges = createGetProductionChanges;
const createFakeGetProductionChanges = (changesInProduction = {
    last30: 0,
    last60: 0,
    last90: 0,
}) => () => Promise.resolve(changesInProduction);
exports.createFakeGetProductionChanges = createFakeGetProductionChanges;
//# sourceMappingURL=getProductionChanges.js.map