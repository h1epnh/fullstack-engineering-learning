'use strict';
exports.up = function (db, callback) {
    db.runSql(`
            ALTER TABLE project_environments
                ADD COLUMN IF NOT EXISTS default_strategy jsonb;
        `, callback);
};
exports.down = function (db, callback) {
    db.runSql(`
            ALTER TABLE project_environments
                DROP COLUMN IF EXISTS default_strategy;
        `, callback);
};
//# sourceMappingURL=20230424090942-project-default-strategy-settings.js.map