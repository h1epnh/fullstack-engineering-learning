'use strict';
exports.up = function (db, cb) {
    db.runSql('ALTER TABLE roles ADD COLUMN IF NOT EXISTS project text', cb);
};
exports.down = function (db, cb) {
    cb();
};
//# sourceMappingURL=20210428103922-patch-role-table.js.map