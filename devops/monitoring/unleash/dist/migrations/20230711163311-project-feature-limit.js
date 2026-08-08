'use strict';
exports.up = function (db, cb) {
    db.runSql(`
        ALTER TABLE project_settings
            ADD COLUMN IF NOT EXISTS "feature_limit" integer;
        `, cb());
};
exports.down = function (db, cb) {
    db.runSql(`
        ALTER TABLE project_settings DROP COLUMN IF EXISTS "feature_limit";
        `, cb);
};
//# sourceMappingURL=20230711163311-project-feature-limit.js.map