"use strict";
exports.up = function (db, cb) {
    db.runSql(`
        ALTER table project_stats
                DROP COLUMN avg_time_to_prod_past_window
  `, cb);
};
exports.down = function (db, cb) {
    db.runSql(`
        ALTER table project_stats
                ADD COLUMN IF NOT EXISTS avg_time_to_prod_past_window INTEGER DEFAULT 0
        `, cb);
};
//# sourceMappingURL=20230316092547-remove-project-stats-column.js.map