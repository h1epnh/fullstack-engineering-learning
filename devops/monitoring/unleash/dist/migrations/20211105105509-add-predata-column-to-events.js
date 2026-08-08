'use strict';
exports.up = function (db, cb) {
    db.runSql(`ALTER TABLE events ADD COLUMN pre_data jsonb;`, cb);
};
exports.down = function (db, cb) {
    db.runSql(`ALTER TABLE events DROP COLUMN pre_data;`, cb);
};
//# sourceMappingURL=20211105105509-add-predata-column-to-events.js.map