"use strict";
exports.up = function (db, cb) {
    db.runSql(`
    ALTER TABLE environments ADD COLUMN enabled BOOLEAN DEFAULT true;
  `, cb);
};
exports.down = function (db, cb) {
    db.runSql(`
    ALTER TABLE environments DROP COLUMN enabled;
  `, cb);
};
exports._meta = {
    version: 1,
};
//# sourceMappingURL=20210908100701-add-enabled-to-environments.js.map