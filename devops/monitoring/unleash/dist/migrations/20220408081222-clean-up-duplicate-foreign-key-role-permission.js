"use strict";
exports.up = function (db, cb) {
    db.runSql(`
        ALTER TABLE role_permission DROP CONSTRAINT fk_role_permission;
    `, cb);
};
exports.down = function (db, cb) {
    cb();
};
//# sourceMappingURL=20220408081222-clean-up-duplicate-foreign-key-role-permission.js.map