'use strict';
exports.up = function (db, cb) {
    db.runSql(`ALTER TABLE environments
        DROP COLUMN display_name`, cb);
};
exports.down = function (db, cb) {
    db.runSql(`ALTER TABLE environments
        ADD COLUMN display_name TEXT`, cb);
};
//# sourceMappingURL=20210928065411-remove-displayname-from-environments.js.map