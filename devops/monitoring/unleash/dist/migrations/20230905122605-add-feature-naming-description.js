'use strict';
exports.up = function (db, cb) {
    db.runSql(`
        ALTER TABLE project_settings
            ADD COLUMN IF NOT EXISTS "feature_naming_description" text;
        `, cb());
};
exports.down = function (db, cb) {
    db.runSql(`
        ALTER TABLE project_settings DROP COLUMN IF EXISTS "feature_naming_description";
        `, cb);
};
//# sourceMappingURL=20230905122605-add-feature-naming-description.js.map