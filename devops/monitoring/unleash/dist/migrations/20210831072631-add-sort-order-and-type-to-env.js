"use strict";
exports.up = function (db, cb) {
    db.runSql(`
    ALTER TABLE environments ADD COLUMN sort_order integer DEFAULT 9999, ADD COLUMN type text;
  `, cb);
};
exports.down = function (db, cb) {
    db.runSql(`
    ALTER TABLE environments DROP COLUMN sort_order, DROP COLUMN type;
  `, cb);
};
exports._meta = {
    version: 1,
};
//# sourceMappingURL=20210831072631-add-sort-order-and-type-to-env.js.map