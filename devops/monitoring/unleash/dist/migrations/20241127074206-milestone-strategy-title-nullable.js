"use strict";
exports.up = function (db, cb) {
    db.runSql(`
        ALTER TABLE milestone_strategies ALTER COLUMN title DROP NOT NULL;
        `, cb);
};
exports.down = function (db, cb) {
    cb();
};
//# sourceMappingURL=20241127074206-milestone-strategy-title-nullable.js.map