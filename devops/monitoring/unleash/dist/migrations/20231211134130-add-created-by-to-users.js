"use strict";
exports.up = function (db, cb) {
    db.runSql(`ALTER TABLE users ADD COLUMN created_by INTEGER`, cb);
};
exports.down = function (db, cb) {
    db.runSql(`ALTER TABLE users DROP COLUMN created_by`, cb);
};
//# sourceMappingURL=20231211134130-add-created-by-to-users.js.map