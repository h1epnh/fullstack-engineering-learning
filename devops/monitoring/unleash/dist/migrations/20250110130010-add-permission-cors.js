'use strict';
exports.up = function (db, cb) {
    db.runSql(`
        INSERT INTO permissions (permission, display_name, type) VALUES ('UPDATE_CORS', 'Update CORS settings', 'root');
    `, cb);
};
exports.down = function (db, cb) {
    db.runSql(`
        DELETE FROM permissions WHERE permission IN ('UPDATE_CORS');
    `, cb);
};
//# sourceMappingURL=20250110130010-add-permission-cors.js.map