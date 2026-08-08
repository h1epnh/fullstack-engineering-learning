"use strict";
exports.up = function (db, cb) {
    db.runSql(`
    ALTER TABLE environments ADD COLUMN protected BOOLEAN DEFAULT false;
    UPDATE environments SET protected = true WHERE name = ':global:';
  `, cb);
};
exports.down = function (db, cb) {
    db.runSql(`
    ALTER TABLE environments DROP COLUMN protected;
  `, cb);
};
exports._meta = {
    version: 1,
};
//# sourceMappingURL=20210909085651-add-protected-field-to-environments.js.map