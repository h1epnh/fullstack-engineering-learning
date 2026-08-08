'use strict';
exports.up = function (db, callback) {
    db.runSql(`
        ALTER TABLE projects ADD archived_at TIMESTAMP WITH TIME ZONE;
        `, callback);
};
exports.down = function (db, callback) {
    db.runSql(`
        ALTER TABLE projects DROP COLUMN archived_at;
        `, callback);
};
//# sourceMappingURL=20240806140453-add-archived-at-to-projects.js.map