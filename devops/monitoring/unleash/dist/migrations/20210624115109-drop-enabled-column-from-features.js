"use strict";
exports.up = function (db, cb) {
    db.runSql(`
        ALTER TABLE features
            DROP COLUMN enabled;
    `, cb);
};
exports.down = function (db, cb) {
    db.runSql(`
        ALTER TABLE features
            ADD COLUMN enabled integer DEFAULT 0;
    `, cb);
};
exports._meta = {
    version: 1,
};
//# sourceMappingURL=20210624115109-drop-enabled-column-from-features.js.map