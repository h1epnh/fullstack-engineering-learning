"use strict";
exports.up = function (db, cb) {
    db.runSql(`CREATE INDEX IF NOT EXISTS groups_group_name_idx ON groups(name)`, cb);
};
exports.down = function (db, cb) {
    db.runSql(`DROP INDEX IF EXISTS groups_group_name_idx`, cb);
};
//# sourceMappingURL=20240326122126-add-index-on-group-name.js.map