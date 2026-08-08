'use strict';
exports.up = function (db, callback) {
    db.runSql(`
            ALTER TABLE environments ADD COLUMN required_approvals INTEGER;
        `, callback);
};
exports.down = function (db, callback) {
    db.runSql(`
            ALTER TABLE environments DROP COLUMN IF EXISTS required_approvals;
        `, callback);
};
//# sourceMappingURL=20250325124224-environment-required-approvals.js.map