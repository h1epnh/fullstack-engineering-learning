'use strict';
exports.up = function (db, cb) {
    db.runSql(`
            ALTER TABLE notifications
                DROP COLUMN IF EXISTS created_by;
        `, cb);
};
exports.down = function (db, cb) {
    db.runSql(`
        ALTER TABLE notifications
            ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users (id);
        `, cb);
};
//# sourceMappingURL=20230224093446-drop-createdBy-from-notifications-table.js.map