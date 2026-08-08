"use strict";
exports.up = function (db, cb) {
    db.runSql(`ALTER TABLE role_user ADD COLUMN created_by INTEGER`, cb);
};
exports.down = function (db, cb) {
    db.runSql(`ALTER TABLE role_user DROP COLUMN created_by`, cb);
};
//# sourceMappingURL=20231211133008-add-created-by-to-role-user.js.map