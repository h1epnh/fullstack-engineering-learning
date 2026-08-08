'use strict';
exports.up = function (db, cb) {
    db.runSql(`
        ALTER TABLE features ADD COLUMN "impression_data" BOOLEAN DEFAULT FALSE;
        `, cb);
};
exports.down = function (db, cb) {
    db.runSql(`
        ALTER TABLE features DROP COLUMN "impression_data";
        `, cb);
};
//# sourceMappingURL=20220128081242-add-impressiondata-to-features.js.map