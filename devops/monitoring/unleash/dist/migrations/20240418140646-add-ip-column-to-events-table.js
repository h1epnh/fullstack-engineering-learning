"use strict";
exports.up = function (db, cb) {
    db.runSql(`ALTER TABLE events ADD COLUMN ip TEXT`, cb);
};
exports.down = function (db, cb) {
    db.runSql(`ALTER TABLE events DROP COLUMN ip`, cb);
};
//# sourceMappingURL=20240418140646-add-ip-column-to-events-table.js.map