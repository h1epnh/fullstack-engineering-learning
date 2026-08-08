"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFakeGetLicensedUsers = exports.createGetLicensedUsers = void 0;
const createGetLicensedUsers = (db) => async () => {
    const result = await db('users')
        .countDistinct('email_hash as activeCount')
        .whereNotNull('email_hash')
        .andWhere(function () {
        this.whereNull('deleted_at').orWhere('deleted_at', '>=', db.raw("NOW() - INTERVAL '30 days'"));
    })
        .first();
    return Number(result?.activeCount ?? 0);
};
exports.createGetLicensedUsers = createGetLicensedUsers;
const createFakeGetLicensedUsers = (licencedUsers = 0) => () => Promise.resolve(licencedUsers);
exports.createFakeGetLicensedUsers = createFakeGetLicensedUsers;
//# sourceMappingURL=getLicensedUsers.js.map