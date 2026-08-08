'use strict';
exports.up = function (db, cb) {
    db.runSql(`
    ALTER TABLE strategies ADD COLUMN deprecated boolean default false
  `, cb);
};
exports.down = function (db, cb) {
    db.runSql('ALTER TABLE strategies DROP COLUMN deprecated', cb);
};
exports._meta = {
    version: 1,
};
//# sourceMappingURL=20210121115438-add-deprecated-column-to-strategies.js.map