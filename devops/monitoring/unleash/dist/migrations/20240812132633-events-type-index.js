'use strict';
exports.up = function (db, callback) {
    db.runSql(`
        CREATE INDEX idx_events_type ON events (type);
        `, callback);
};
exports.down = function (db, callback) {
    db.runSql(`
        DROP INDEX IF EXISTS idx_events_type;
        `, callback);
};
//# sourceMappingURL=20240812132633-events-type-index.js.map