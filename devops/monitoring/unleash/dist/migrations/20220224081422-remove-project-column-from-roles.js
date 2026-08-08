"use strict";
exports.up = function (db, cb) {
    db.runSql('ALTER TABLE roles DROP COLUMN IF EXISTS project', cb);
};
exports.down = function (db, cb) {
    db.runSql('ALTER TABLE roles ADD COLUMN IF NOT EXISTS project text', cb);
};
//# sourceMappingURL=20220224081422-remove-project-column-from-roles.js.map