'use strict';
exports.up = function (db, callback) {
    db.runSql('ALTER TABLE features ADD archived integer DEFAULT 0;', callback);
};
exports.down = function (db, callback) {
    db.runSql('ALTER TABLE features DROP COLUMN "archived";', callback);
};
//# sourceMappingURL=20141215210141-005-archived-flag-to-features.js.map