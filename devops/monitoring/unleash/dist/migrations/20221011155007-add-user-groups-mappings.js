'use strict';
exports.up = function (db, cb) {
    db.runSql(`
            ALTER TABLE groups
                ADD COLUMN IF NOT EXISTS mappings_sso jsonb DEFAULT '[]'::jsonb
        `, cb);
};
exports.down = function (db, cb) {
    db.runSql(`
            ALTER TABLE groups
                DROP COLUMN IF EXISTS mappings_sso;
        `, cb);
};
//# sourceMappingURL=20221011155007-add-user-groups-mappings.js.map