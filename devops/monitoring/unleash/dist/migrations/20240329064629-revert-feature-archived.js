"use strict";
exports.up = function (db, cb) {
    db.runSql(`
            ALTER TABLE features ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;
            UPDATE features SET archived = (archived_at IS NOT NULL);
        `, cb);
};
exports.down = function (db, cb) {
    db.runSql(`
            ALTER TABLE features DROP COLUMN IF EXISTS archived;
        `, cb);
};
//# sourceMappingURL=20240329064629-revert-feature-archived.js.map