"use strict";
exports.up = function (db, cb) {
    db.runSql(`
        ALTER TABLE role_permission
        DROP COLUMN permission_id;
        `, cb);
};
exports.down = function (db, cb) {
    db.runSql(`
        ALTER TABLE role_permission
        ADD COLUMN permission_id INTEGER;
        `, cb);
};
//# sourceMappingURL=20240116104456-drop-unused-column-permissionid.js.map