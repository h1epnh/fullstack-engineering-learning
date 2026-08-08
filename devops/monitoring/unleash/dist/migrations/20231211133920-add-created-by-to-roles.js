"use strict";
exports.up = function (db, cb) {
    db.runSql(`ALTER TABLE roles ADD COLUMN created_by INTEGER`, cb);
};
exports.down = function (db, cb) {
    db.runSql(`ALTER TABLE roles DROP COLUMN created_by`, cb);
};
//# sourceMappingURL=20231211133920-add-created-by-to-roles.js.map