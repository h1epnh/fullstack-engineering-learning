'use strict';
exports.up = function (db, callback) {
    db.runSql(`
        ALTER TABLE events ADD COLUMN IF NOT EXISTS created_by_user_id INTEGER;
        CREATE INDEX events_created_by_user_id_idx ON events(created_by_user_id);
        `, callback);
};
exports.down = function (db, callback) {
    db.runSql(`
        DROP INDEX IF EXISTS events_created_by_user_id_idx;
        ALTER TABLE events DROP COLUMN IF EXISTS created_by_user_id;
        `, callback);
};
//# sourceMappingURL=20231212094044-event-created-by-user-id.js.map