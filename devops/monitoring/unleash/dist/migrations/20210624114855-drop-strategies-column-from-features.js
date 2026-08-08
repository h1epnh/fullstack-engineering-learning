"use strict";
exports.up = function (db, cb) {
    db.runSql(`
        ALTER TABLE features
            DROP COLUMN strategies;
    `, cb);
};
exports.down = function (db, cb) {
    db.runSql(`
        ALTER TABLE features
            ADD COLUMN strategies json;
    `, cb);
};
exports._meta = {
    version: 1,
};
//# sourceMappingURL=20210624114855-drop-strategies-column-from-features.js.map